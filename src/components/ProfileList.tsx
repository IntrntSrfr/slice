import Button from "./Button"
import Checkbox from "./Checkbox"
import ProfileListItem from "./ProfileListItem"
import {useAtom} from 'jotai'
import { profilesAtom, sourceAtom } from "../store"
import { useState } from "react"
import styles from './styles/ProfileList.module.css'
import { v4 } from "uuid"

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

    // <div className={styles.profileListInner}> v-if="!imageStore.loading && imageStore.image"
    
    return (
        <div className={styles.profileList}>
            {source && 
            <div className={styles.profileListInner}>
                <h2>Profiles</h2>
                <div className={styles.profiles}>
                    {profiles.map((p, i) => (
                        <ProfileListItem key={i} active={p.active} crop={p.crop} name={p.name} rounded/>
                    ))}
                </div>
                <div className="btn-grp fill-last fill-first">
                    <Checkbox checked={rounded} label={"Round preview"} onChange={toggleRound}/>
                    <Button text="Add profile"  variant="blue" onClick={addProfile}/>
                    <Button text="Reset profiles" variant="blue" />
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