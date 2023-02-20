import Button from "./Button"
import Checkbox from "./Checkbox"
import ProfileListItem from "./ProfileListItem"
import {useAtom} from 'jotai'
import { profilesAtom, sourceAtom } from "../store"
import { ChangeEvent, useState } from "react"
import styles from './styles/ProfileList.module.css'
import { v4 } from "uuid"
import { centerCropImage } from "../utils/utils"

const ProfileList = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom)
    const [source, ] = useAtom(sourceAtom)
    const [rounded, setRounded] = useState(false)

    const toggleRound = () => {
        setRounded(!rounded)
    }

    const activeProfile = () => {
        return profiles.find(p => p.active)
    }

    const addProfile = () => {
        let ap = activeProfile()
        if (!ap) return;
        
        let fc = ap.crop
        let p = [...profiles]
        let newProfile = {id: v4(), name: 'New profile', crop: fc, active: true}
        p.forEach(prof => prof.active = false);
        setProfiles([newProfile, ...p]);
    }

    const resetProfiles = () => {
        if(!source || profiles.length <= 1) return;
        let crop = centerCropImage(source)
        setProfiles([{ id: v4(), name: 'New profile', crop: crop, active: true }]);
    }

    // <div className={styles.profileListInner}> v-if="!imageStore.loading && imageStore.image"

    const onRename = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        let profs = [...profiles]
        profs.forEach(p => {
            if (p.id === id) {
                p.name = e.target.value
            }
        })
        setProfiles(profs)
    }
    
    return (
        <div className={styles.profileList}>
            {source && 
            <div className={styles.profileListInner}>
                <h2>Profiles</h2>
                <div className={styles.profiles}>
                    {profiles.map((p, i) => (
                        <ProfileListItem key={i} id={p.id} active={p.active} crop={p.crop} name={p.name} rounded={rounded} onRename={(e) => onRename(e, p.id)}/>
                    ))}
                </div>
                <div className="btn-grp fill-last fill-first">
                    <Checkbox checked={rounded} label={"Round preview"} onChange={toggleRound}/>
                    <Button text="Add profile"  variant="blue" onClick={addProfile}/>
                    <Button text="Reset profiles" variant="blue" onClick={resetProfiles}/>
                    <Button text="Export profiles" variant="green" />
                </div>
            </div>
            }
        </div>
    )
}


//<Checkbox className="blue" label="Round preview" checked="profileStore.rounded"
//@click="profileStore.toggleRounded" />

//@click="profileStore.setActive(p.id)"
//@rename="s => profileStore.updateName(p.id, s)" />

export default ProfileList