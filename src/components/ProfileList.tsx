import { useEffect, useRef, useState } from "react";

import styles from './styles/ProfileList.module.css';
import AppButton from "./AppButton";
import Checkbox from "./Checkbox";
import ProfileListItem from "./ProfileListItem";
import AppProgressBar from "./AppProgressBar";

import ExportWorker from '../workers/generateGif?worker';
import { generateImages } from "../utils/gif";
import { centerCropImage, mediaTypeExtension } from "../utils/crop";
import { BlobPair, GifExportInit, GifExportProgress, Profile, SliceFrame } from "../types";

import { useReducerAtom } from 'jotai/utils';
import { profilesAtom, profilesReducer } from "../store/profiles";
import { overlayAtom, overlayReducer } from "../store/overlay";
import { mediaAtom, mediaReducer } from "../store/media";

import JSZip from "jszip";
import saveAs from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackwardStep, faCog, faFileExport, faForwardStep, faPause, faPlay, faPlus, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { settingsAtom, settingsReducer } from "../store/settings";

const ProfileList = () => {
    const [profiles, dispatchProfiles] = useReducerAtom(profilesAtom, profilesReducer);
    const [, dispatchOverlay] = useReducerAtom(overlayAtom, overlayReducer );
    const [media,] = useReducerAtom(mediaAtom, mediaReducer);
    const [settings, dispatchSettings] = useReducerAtom(settingsAtom, settingsReducer);
    
    const [rounded, setRounded] = useState(false);
    const [smallPreviews, setSmallPreviews] = useState(false);
    const [transparent, setTransparent] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [showSettings, setShowSettings] = useState(false);

    const profileListRef = useRef<HTMLDivElement>(null);

    const toggleRound = () => setRounded(o => !o);
    const toggleSmallPreviews = () => setSmallPreviews(o => !o);
    const toggleTransparent = () => setTransparent(o => !o);
    const toggleShowSettings = () => setShowSettings(o => !o);

    /**
     * adds new profile and scrolls to top of profile list
     * 
     * @returns 
     */
    const handleAddProfile = () => {
        dispatchProfiles({type: 'add'});
        if (!profileListRef.current) return;
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
        dispatchProfiles({type: 'remove', id});
    };

    /**
     * resets the profile list back to one single profile
     * with a center crop.
     * 
     * @returns 
     */
    const resetProfiles = () => {
        if (!media.source || profiles.length <= 1) return;
        const ok = confirm('Resetting will remove all your current profiles. Are you sure?');
        if(!ok) return;
        const crop = centerCropImage(media.source);
        dispatchProfiles({type: 'reset', crop});
    };

    const [frameIndex, setFrameIndex] = useState(-1);

    const handleFrameChange = (direction: 'next' | 'previous') => {
        const frameLength = media.frames?.length;
        if(!frameLength) return;
        switch(direction){
            case "next":
                setFrameIndex(prev => (((prev + 1) % frameLength) + frameLength) % frameLength);
                break;
            case "previous":
                setFrameIndex(prev => (((prev - 1) % frameLength) + frameLength) % frameLength);
                break;
        }
    };
    
    useEffect(() => {
        const frameLength = media.frames?.length;
        if(!frameLength || settings.performanceMode) return;

        let timeoutId: string | number | NodeJS.Timeout | undefined = undefined;
        const advanceFrame = (index: number) => {
            if(!media.frames || media.mediaType !== 'image/gif' || isPaused) return;
            setFrameIndex(index);
            timeoutId = setTimeout(() => advanceFrame((index + 1) % frameLength), media.frames[index].delay);
        };
        
        advanceFrame(frameIndex < 0 ? 0 : frameIndex);
        return () => clearTimeout(timeoutId);
    }, [media, settings.performanceMode, isPaused, frameIndex]);
    
    const currentImage = () => {
        if(media.frames && frameIndex >= 0 && frameIndex < media.frames.length) 
            return media.frames[frameIndex].canvas || null;
        else if ((media.mediaType === 'image/jpeg' || media.mediaType === 'image/png') && media.source) 
            return media.source;
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
        if (!media.source || !profiles.length) throw new Error("no source or profiles");

        if (media.mediaType === 'image/jpeg' || media.mediaType === 'image/png') 
            return await generateImages(media.source, profiles);
         else if (media.mediaType === 'image/gif' && media.frames) 
            return await generateGifs(media.frames, profiles);
         else 
            throw new Error("no compatible filetype found");
    };

    const updateOverlay = (cur: number, max: number) => {
        dispatchOverlay({type: 'set', content: <AppProgressBar text="Exporting" current={cur} max={max} /> });
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
            zip.file(`${fileName}${mediaTypeExtension(media.mediaType)}`, b.blob);
        });
        
        return await zip.generateAsync({ type: 'blob' });
    };

    const exportProfiles = async () => {
        if (media.mediaType === 'image/gif')
            updateOverlay(0, 10);
        try {
            const blobs = await generateFiles();
            const zipped = await generateZipFile(blobs);
            saveAs(zipped, 'profiles.zip');
        } catch (error) {
            console.error(error, 'could not generate files');
        } finally {
            dispatchOverlay({type: 'set', content: null});
        }
    };

    if (!media.source || media.isLoading) return <div className={styles.profileList}></div>;
    
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
                            onRename={(e) => dispatchProfiles({type:'rename', id: p.id, name: e.target.value})}
                            onSelect={() => dispatchProfiles({type: 'set_active', id: p.id})}
                            onDelete={() => removeProfile(p.id)} />
                        : null
                    ))}
                </div>
                {
                    media.mediaType === 'image/gif' &&
                    <MediaButtons
                        isPaused={isPaused}
                        canPlay={!settings.performanceMode}
                        onNext={() => handleFrameChange('next')}
                        onTogglePlay={() => setIsPaused(prev => !prev)}
                        onPrev={() => handleFrameChange('previous')}
                    />
                }
                <div className={`${styles.settings} ${showSettings?styles.active:''}`}>
                    <div className={styles.settingsSection}>
                        <h4 className={styles.settingsSectionTitle}>Previews</h4>
                        <div className={styles.settingsSectionBody}>
                            <Checkbox checked={rounded} label="Circular previews" onChange={toggleRound} />
                            <Checkbox checked={smallPreviews} label="Mini previews" onChange={toggleSmallPreviews} />
                            <Checkbox checked={settings.performanceMode} label="Performance" onChange={() => dispatchSettings({type:'setPerformanceMode', value: !settings.performanceMode})} />
                        </div>
                    </div>
                    <div className={styles.settingsSection}>
                        <h4 className={styles.settingsSectionTitle}>Export</h4>
                        <div className={styles.settingsSectionBody}>
                            <Checkbox checked={rounded} label="Circular crops" onChange={toggleRound} />
                            {
                                media.mediaType === 'image/gif' &&
                                <Checkbox checked={transparent} label="Transparency" onChange={toggleTransparent} />
                            } 
                        </div>
                    </div>
                </div>
                <div className={`btn-grp`}>
                    {/* 
 */}
                    <AppButton variant="blue" filled={showSettings} onClick={() => toggleShowSettings()} >
                        <FontAwesomeIcon icon={faCog}/>Settings 
                    </AppButton>
                    <AppButton variant="green" onClick={exportProfiles} >
                        <FontAwesomeIcon icon={faFileExport}/>Export 
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default ProfileList;

const SettingsPanel = () => {
    const [settings, dispatchSettings] = useReducerAtom(settingsAtom, settingsReducer);

    return (
        <div>
        </div>
    );
};

interface MediaButtonsProps {
    isPaused: boolean;
    canPlay: boolean;
    onTogglePlay: () => void;
    onPrev: () => void;
    onNext: () => void;
}

const MediaButtons = (props: MediaButtonsProps) => {
    return (
        <div className="flex rows" style={{justifyContent: 'center'}}>
            <AppButton variant="blue" onClick={props.onPrev} >
                <FontAwesomeIcon icon={faBackwardStep} />
            </AppButton>
            {
                props.canPlay &&
                <AppButton variant="blue" onClick={props.onTogglePlay} >
                    <FontAwesomeIcon icon={props.isPaused ? faPlay : faPause} />
                </AppButton>
            }
            <AppButton variant="blue" onClick={props.onNext} >
                <FontAwesomeIcon icon={faForwardStep} />
            </AppButton>
        </div>
    );
};

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
