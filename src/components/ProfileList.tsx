import { ChangeEvent, useState } from "react"
import Button from "./Button"
import Checkbox from "./Checkbox"
import ProfileListItem from "./ProfileListItem"
import styles from './styles/ProfileList.module.css'
import { useAtom } from 'jotai'
import { profilesAtom, sourceAtom } from "../store"
import { centerCropImage, generateBlobs } from "../utils/utils"
import JSZip from "jszip"
import { v4 } from "uuid"
import { saveAs } from "file-saver"

const ProfileList = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom)
    const [source,] = useAtom(sourceAtom)
    const [rounded, setRounded] = useState(false)
    const [smallPreviews, setSmallPreviews] = useState(false)

    const toggleRound = () => {
        setRounded(!rounded)
    }

    const toggleSmallPreviews = () => {
        setSmallPreviews(!smallPreviews)
    }

    const activeProfile = () => {
        return profiles.find(p => p.active)
    }

    const addProfile = () => {
        let ap = activeProfile()
        if (!ap) return;

        let fc = ap.crop
        let p = [...profiles]
        let newProfile = { id: v4(), name: 'New profile', crop: fc, active: true }
        p.forEach(prof => prof.active = false);
        setProfiles([newProfile, ...p]);
    }

    const removeProfile = (id: string) => {
        if (profiles.length <= 1) return;
        let profs = [...profiles]
        // add some check if profile is active
        // if deleting active profile, move active profile to nearest?

        profs = profs.filter(p => p.id !== id)
        setProfiles(profs)
    }

    const resetProfiles = () => {
        if (!source || profiles.length <= 1) return;
        let crop = centerCropImage(source)
        setProfiles([{ id: v4(), name: 'New profile', crop: crop, active: true }]);
    }

    const onRename = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        let profs = [...profiles]
        profs.forEach(p => {
            if (p.id === id) {
                p.name = e.target.value
            }
        })
        setProfiles(profs)
    }

    const setActiveProfile = (id: string) => {
        let p = [...profiles]
        p.forEach((prof) => {
            prof.active = prof.id === id
        });
        setProfiles(p);
    }

    const exportProfiles = async () => {
        const zip = new JSZip()
        if (!source) return;

        let crops = await generateBlobs(source, profiles)
        let nameMap = new Map<string, number>()
        crops.forEach(c => {
            let fileName = c.name
            let n = nameMap.get(c.name)
            if (n) fileName += `_${n}`
            nameMap.set(c.name, (n || 0) + 1)
            zip.file(`${fileName}.png`, c.blob)
        })

        let content = await zip.generateAsync({ type: 'blob' })
        saveAs(content, 'profiles.zip')
    }

    return (
        <div className={styles.profileList}>
            {source &&
                <div className={styles.profileListInner}>
                    <h2>Profiles</h2>
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
                        <Button text="Add profile" variant="blue" onClick={addProfile} />
                        <Button text="Reset profiles" variant="blue" onClick={resetProfiles} />
                        <Button text="Export profiles" variant="green" onClick={exportProfiles} />
                    </div>
                </div>
            }
        </div>
    )
}

export default ProfileList