import { ChangeEvent, useState } from "react";
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

const ProfileList = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom);
    const [source,] = useAtom(sourceAtom);
    const [frames,] = useAtom(framesAtom);
    const [mediaType,] = useAtom(mediaTypeAtom);
    const [rounded, setRounded] = useState(false);
    const [smallPreviews, setSmallPreviews] = useState(false);
    const [, setOverlay] = useAtom(overlayAtom);
    const [transparent, setTransparent] = useState(false);

    const toggleRound = () => setRounded(o => !o);
    const toggleSmallPreviews = () => setSmallPreviews(o => !o);
    const toggleTransparent = () => setTransparent(o => !o);

    const activeProfile = () => {
        return profiles.find(p => p.active);
    };

    const addProfile = () => {
        const ap = activeProfile();
        if (!ap) return;
        const fc = ap.crop;
        const p = [...profiles];
        const newProfile = { id: v4(), name: 'New profile', crop: fc, active: true };
        p.forEach(prof => prof.active = false);
        setProfiles([newProfile, ...p]);
    };

    const removeProfile = (id: string) => {
        if (profiles.length <= 1) return;
        let profs = [...profiles];
        // add some check if profile is active
        // if deleting active profile, move active profile to nearest?

        profs = profs.filter(p => p.id !== id);
        setProfiles(profs);
    };

    const resetProfiles = () => {
        if (!source || profiles.length <= 1) return;
        const crop = centerCropImage(source);
        setProfiles([{ id: v4(), name: 'New profile', crop: crop, active: true }]);
    };

    const onRename = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        const profs = [...profiles];
        profs.forEach(p => {
            if (p.id === id) 
                p.name = e.target.value;
        });
        setProfiles(profs);
    };

    const setActiveProfile = (id: string) => {
        const p = [...profiles];
        p.forEach((prof) => {
            prof.active = prof.id === id;
        });
        setProfiles(p);
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
            if (b.blob == null) return;
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

    return (
        <div className={styles.profileList}>
            {source &&
                <div className={styles.profileListInner}>
                    <div className={styles.listHeader}>
                        <h2>Profiles</h2>
                        <div className="flex rows">
                            <AppButton text="Add" variant="blue" onClick={addProfile} />
                            <AppButton text="Reset" variant="red" onClick={resetProfiles} />
                        </div>
                    </div>
                    <div className={styles.profiles}>
                        {profiles.map((p, i) => (
                            <ProfileListItem key={i}
                                id={p.id}
                                active={p.active}
                                crop={p.crop}
                                name={p.name}
                                rounded={rounded}
                                smallPreviews={smallPreviews}
                                onlyProfile={profiles.length <= 1}
                                onRename={(e) => onRename(e, p.id)}
                                onSelect={() => setActiveProfile(p.id)}
                                onDelete={() => removeProfile(p.id)} />
                        ))}
                    </div>
                    <div className={`btn-grp ${mediaType === 'image/gif' ? '' : 'fill-last'}`}>
                        <Checkbox checked={rounded} label="Round preview" onChange={toggleRound} />
                        <Checkbox checked={smallPreviews} label="Small previews" onChange={toggleSmallPreviews} />
                        {
                            mediaType === 'image/gif' &&
                            <Checkbox checked={transparent} label="Transparency" onChange={toggleTransparent} />
                        } 
                        <AppButton text="Export profiles" variant="green" onClick={exportProfiles} />
                    </div>
                </div>
            }
        </div>
    );
};

export default ProfileList;
