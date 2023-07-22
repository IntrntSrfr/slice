import { useEffect, useRef, useState } from "react";
import AppButton from "./AppButton";
import Checkbox from "./Checkbox";
import ProfileListItem from "./ProfileListItem";
import styles from './styles/ProfileList.module.css';
import { useAtom } from 'jotai';
import { framesAtom, mediaTypeAtom, overlayAtom, profilesAtom, sourceAtom } from "../store";
import { generateImages } from "../utils/gif";
import { v4 } from "uuid";
import JSZip from "jszip";
import saveAs from "file-saver";
import AppProgressBar from "./AppProgressBar";
import { BlobPair, GifExportInit, GifExportProgress, Profile, SliceFrame } from "../types";
import ExportWorker from '../workers/generateGif?worker';
import { centerCropImage, mediaTypeExtension } from "../utils/crop";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faPlus, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

const ProfileList = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom);
    const [source,] = useAtom(sourceAtom);
    const [frames,] = useAtom(framesAtom);
    const [mediaType,] = useAtom(mediaTypeAtom);
    const [, setOverlay] = useAtom(overlayAtom);
    
    const [rounded, setRounded] = useState(false);
    const [smallPreviews, setSmallPreviews] = useState(false);
    const [transparent, setTransparent] = useState(false);

    const profileListRef = useRef<HTMLDivElement>(null);

    const toggleRound = () => setRounded(o => !o);
    const toggleSmallPreviews = () => setSmallPreviews(o => !o);
    const toggleTransparent = () => setTransparent(o => !o);

    const activeProfile = () => {
        return profiles.find(p => p.active);
    };

    const addProfile = () => {
        const ap = activeProfile();
        if (!ap) return;
        const newProfile: Profile = { id: v4(), name: 'New profile', crop: ap.crop, active: true };
        setProfiles([newProfile].concat(profiles.map(p => ({...p, active: false}))));
    };

    /**
     * adds new profile and scrolls to top of profile list
     * 
     * @returns 
     */
    const handleAddProfile = () => {
        addProfile();
        const ap = activeProfile();
        if (!ap || !profileListRef.current) return;
        profileListRef.current.scrollTo({top:0, behavior:'smooth'});
    };

    /**
     * removes a profile based on an ID. If the removed profile was
     * active, it sets the closest profile as active.
     * 
     * @param id item ID
     * @returns 
     */
    const removeProfile = (id: string) => {
        if (profiles.length <= 1) return;
        const newProfs = profiles.filter(p => p.id !== id);
        const deletedProf = profiles.find(p => p.id === id);
        if(deletedProf?.active){
            const index = profiles.findIndex(p => p.id === id);
            const newActiveIndex = index === newProfs.length ? index - 1 : index;
            newProfs[newActiveIndex].active = true;
        }
        setProfiles(newProfs);
    };

    /**
     * resets the profile list back to one single profile
     * with a center crop.
     * 
     * @returns 
     */
    const resetProfiles = () => {
        if (!source || profiles.length <= 1) return;
        const ok = confirm('Resetting will remove all your current profiles. Are you sure?');
        if(!ok) return;
        const crop = centerCropImage(source);
        setProfiles([{ id: v4(), name: 'New profile', crop: crop, active: true }]);
    };

    const onRename = (id: string, newName: string) => {
        setProfiles(profiles.map(p => p.id === id 
            ? {...p, name: newName}
            : p
        ));
    };

    const setActiveProfile = (id: string) => {
        setProfiles(profiles.map(p => p.id === id 
            ? {...p, active: true} 
            : {...p, active: false}
        ));
    };

    const [frameIndex, setFrameIndex] = useState<number>(-1);
    useEffect(() => {
        let timeoutId: string | number | NodeJS.Timeout | undefined = undefined;
        const advanceFrame = (index: number) => {
            if(!frames?.length || mediaType !== 'image/gif') return;
            setFrameIndex(index);
            timeoutId = setTimeout(() => advanceFrame((index + 1) % frames.length), frames[index].delay);
        };
        if (frames?.length) advanceFrame(0);
        return () => clearTimeout(timeoutId);
    }, [frames, mediaType]);
    
    const currentImage = () => {
        if(frames && frameIndex >= 0) 
            return frames[frameIndex].canvas || null;
        else if ((mediaType === 'image/jpeg' || mediaType === 'image/png') && source) 
            return source;
        return null;
    };

    const generateGifs = async (frames: SliceFrame[], profiles: Profile[]): Promise<BlobPair[]> => {
        return new Promise((res, rej) => {
            const exportWorker = new ExportWorker();
            let acc = 0;
            exportWorker.onmessage = (e: MessageEvent<GifExportProgress>) => {
                if (e.data.evt === 'finished') {
                    exportWorker.terminate();
                    res(e.data.blobs as BlobPair[]);
                } else if (e.data.evt === 'progress') {
                    acc++;
                    updateOverlay(acc, e.data.total);
                }
            };
            exportWorker.onerror = () => {
                exportWorker.terminate();
                rej();
            };
            const tf: SliceFrame[] = frames.map(f => ({ delay: f.delay, dims: f.dims, imageData: f.imageData }));
            exportWorker.postMessage({ frames: tf, profiles: profiles, transparent } as GifExportInit);
        });
    };

    const generateFiles = async (): Promise<BlobPair[]> => {
        if (!source || !profiles.length) throw new Error("no source or profiles");
        if (mediaType === 'image/jpeg' || mediaType === 'image/png') 
            return await generateImages(source, profiles);
         else if (mediaType === 'image/gif' && frames) 
            return await generateGifs(frames, profiles);
         else 
            throw new Error("no compatible filetype found");
    };

    const updateOverlay = (cur: number, max: number) => {
        setOverlay({ content: <AppProgressBar text="Exporting" current={cur} max={max} /> });
    };

    const generateZipFile = async (blobs: BlobPair[]) => {
        const zip = new JSZip();
        const nameMap = new Map<string, number>();
        blobs.forEach(b => {
            if (b.blob == null) return; // consider adding error message :)
            let fileName = b.name;
            const n = nameMap.get(b.name);
            if (n) fileName += `_${n}`;
            nameMap.set(b.name, (n || 0) + 1);
            zip.file(`${fileName}${mediaTypeExtension(mediaType)}`, b.blob);
        });
        
        return await zip.generateAsync({ type: 'blob' });
    };

    const exportProfiles = async () => {
        if (mediaType === 'image/gif')
            updateOverlay(0, 10);
        try {
            const blobs = await generateFiles();
            const zipped = await generateZipFile(blobs);
            saveAs(zipped, 'profiles.zip');
        } catch (error) {
            console.error(error, 'could not generate files');
        } finally {
            setOverlay({ content: null });
        }
    };

    if (!source) return <div className={styles.profileList}></div>;
    
    return (
        <div className={styles.profileList}>
            <div className={styles.profileListInner}>
                <Header onAdd={handleAddProfile} onReset={resetProfiles} />
                <div ref={profileListRef} className={styles.profiles}>
                    {profiles.map((p, i) => (
                        p.crop ? 
                        <ProfileListItem key={i}
                            profile={p}
                            image={currentImage()}
                            rounded={rounded}
                            smallPreviews={smallPreviews}
                            onlyProfile={profiles.length <= 1}
                            onRename={(e) => onRename(p.id, e.target.value)}
                            onSelect={() => setActiveProfile(p.id)}
                            onDelete={() => removeProfile(p.id)} />
                        : null
                    ))}
                </div>
                <div className={`btn-grp ${mediaType === 'image/gif' ? '' : 'fill-last'}`}>
                    <Checkbox checked={rounded} label="Round preview" onChange={toggleRound} />
                    <Checkbox checked={smallPreviews} label="Small previews" onChange={toggleSmallPreviews} />
                    {
                        mediaType === 'image/gif' &&
                        <Checkbox checked={transparent} label="Transparency" onChange={toggleTransparent} />
                    } 
                    <AppButton variant="green" onClick={exportProfiles} >
                        <FontAwesomeIcon icon={faFileExport}/>Export profiles 
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default ProfileList;

interface HeaderProps {
    onAdd: () => void;
    onReset: () => void;
} 

const Header = ({onAdd, onReset}: HeaderProps) => {
    return (
        <div className={styles.listHeader}>
            <h2>Profiles</h2>
            <div className="flex rows" style={{justifyContent: 'center'}}>
                <AppButton variant="blue" onClick={onAdd} >
                    <FontAwesomeIcon icon={faPlus} />
                </AppButton>
                <AppButton variant="red" onClick={onReset} >
                    <FontAwesomeIcon icon={faRotateLeft} />
                </AppButton>
            </div>
        </div>
    );
};
