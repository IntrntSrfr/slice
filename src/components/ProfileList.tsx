import { ChangeEvent, useState } from "react";
import Button from "./Button";
import Checkbox from "./Checkbox";
import ProfileListItem from "./ProfileListItem";
import styles from './styles/ProfileList.module.css';
import { useAtom } from 'jotai';
import { profilesAtom, sourceAtom } from "../store";
import { centerCropImage, generateBlobs } from "../utils/utils";
import JSZip from "jszip";
import { v4 } from "uuid";
import { saveAs } from "file-saver";

const ProfileList = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom);
    const [source,] = useAtom(sourceAtom);
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

    const exportProfiles = async () => {
        const zip = new JSZip();
        if (!source) return;

        const crops = await generateBlobs(source, profiles);
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
    };

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