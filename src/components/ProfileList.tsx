import { ChangeEvent, useState } from "react";
import Button from "./Button";
import Checkbox from "./Checkbox";
import ProfileListItem from "./ProfileListItem";
import styles from './styles/ProfileList.module.css';
import { useAtom } from 'jotai';
import { framesAtom, mediaTypeAtom, profilesAtom, sourceAtom } from "../store";
import { centerCropImage, generateGif } from "../utils/utils";
import { v4 } from "uuid";
import { Profile, SliceFrame } from "../types";
import JSZip from "jszip";
import saveAs from "file-saver";

const ProfileList = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom);
    const [source,] = useAtom(sourceAtom);
    const [frames,] = useAtom(framesAtom);
    const [mediaType,] = useAtom(mediaTypeAtom);
    const [rounded, setRounded] = useState(false);
    const [smallPreviews, setSmallPreviews] = useState(false);

    const toggleRound = () => {
        setRounded(!rounded);
    };

    const toggleSmallPreviews = () => {
        setSmallPreviews(!smallPreviews);
    };

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
            if (p.id === id) {
                p.name = e.target.value;
            }
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
/* 
    const exportImages = async (src: HTMLImageElement, profiles: Profile[]) => {
        const zip = new JSZip();
        const crops = await generateBlobs(src, profiles);
        const nameMap = new Map<string, number>();
        crops.forEach(c => {
            if (c.blob == null) return;
            let fileName = c.name;
            const n = nameMap.get(c.name);
            if (n) fileName += `_${n}`;
            nameMap.set(c.name, (n || 0) + 1);
            zip.file(`${fileName}.png`, c.blob);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'profiles.zip');
    }; */

    const exportImages = async (src: HTMLImageElement, profiles: Profile[]) => {
        if(!src) return;
        await 
    }

    const exportGifs = async (frames: SliceFrame[], profiles: Profile[]) => {
        if(!frames) return;
        await generateGif(frames, profiles);
    };

    const exportProfiles = async () => {
        if(!source || !profiles.length) return;
        if(mediaType === 'image/jpeg' || mediaType === 'image/png'){
            await exportImages(source, profiles);
        } else if(mediaType === 'image/gif' && frames) {
            await exportGifs(frames, profiles);
        } else {
            console.log("could not export");
        }
    };

    const mediaTypeExtension = (mediaType: string) => {
        switch (mediaType) {
            case 'image/jpeg':
                return '.jpg'
            case 'image/png':
                return '.png'
            case 'image/gif':
                return '.gif'
            default:
                return ''
        }
    }
    
    const exportProfiles = async (blobs: blobPair[], mediaType: string) => {
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

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'profiles.zip');
    } 

    return (
        <div className={styles.profileList}>
            {source &&
                <div className={styles.profileListInner}>
                    <div className={styles.listHeader}>
                        <h2>Profiles</h2>
                        <div className="flex rows">
                            <Button text="Add" variant="blue" onClick={addProfile} />
                            <Button text="Reset" variant="red" onClick={resetProfiles} />
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
                    <div className="btn-grp fill-last">
                        <Checkbox checked={rounded} label={"Round preview"} onChange={toggleRound} />
                        <Checkbox checked={smallPreviews} label={"Small previews"} onChange={toggleSmallPreviews} />
                        <Button text="Export profiles" variant="green" onClick={exportProfiles} />
                    </div>
                </div>
            }
        </div>
    );
};

export default ProfileList;