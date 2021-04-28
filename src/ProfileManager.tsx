import Profile from './Profile'
import {Button, ButtonGroup} from "@material-ui/core";
import React, {useState} from "react";
import {newProfile, ProfileData, removeProfile, resetProfiles, setProfileName, setSelectedProfile} from "./types";
import FileSaver from "file-saver";

interface Props {
    newProfile: newProfile;
    resetProfiles: resetProfiles;

    setSelectedProfile: setSelectedProfile;
    setProfileName: setProfileName
    removeProfile: removeProfile

    profiles: ProfileData[];
    imgRef: React.RefObject<HTMLImageElement>
}

export const ProfileManager: React.FC<Props> = (props) => {
    const [round, setRound] = useState(true);

    function downloadImages() {

        props.profiles.forEach(prof =>{
            if(!prof.reference || !prof.reference.current){
                return
            }
            //console.log(prof.reference?.current)
            let canvas = prof.reference.current

            canvas.toBlob((blob)=> {
                if(!blob){
                    return
                }
                FileSaver.saveAs(blob, `${prof.name}.png`)
            }, 'image/png', 0)
        })
        /*

        console.log(zip.files)

        zip.generateAsync({type:'blob'})
            .then((content)=>{
                FileSaver.saveAs(content, 'pictures.zip')
            })
*/




    }

    return (
        <div className={'profile-manager'}>
            <ButtonGroup variant={'contained'} color={'primary'} aria-label={'outlined primary button group'}>
                <Button onClick={props.newProfile}>Add profile</Button>
                <Button onClick={props.resetProfiles}>Reset profiles</Button>
                <Button onClick={() => {
                    setRound(!round)
                }}>Toggle square preview</Button>
                <Button onClick={() => {
                    downloadImages()
                }}>Export profiles</Button>
            </ButtonGroup>
            <div className={'profiles'}>
                <div className={'profiles-inner'}>
                    {props.profiles.map(prof => (
                        <Profile
                            key={prof.id}
                            profile={prof}
                            setProfileName={props.setProfileName}
                            removeProfile={props.removeProfile}
                            setSelectedProfile={props.setSelectedProfile}
                            imgRef={props.imgRef}
                            round={round}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ProfileManager