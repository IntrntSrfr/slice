import Profile from './Profile'
//import {Button, ButtonGroup} from "@material-ui/core";
import React, {useState} from "react";
import {newProfile, ProfileData, removeProfile, resetProfiles, setProfileName, setSelectedProfile} from "./types";
import FileSaver from "file-saver";

interface Props {
    newProfile: newProfile;
    resetProfiles: resetProfiles;

    setSelectedProfile: setSelectedProfile;
    setProfileName: setProfileName;
    removeProfile: removeProfile;

    profiles: ProfileData[];
    imgRef: React.RefObject<HTMLImageElement>;
    src: string;
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
    }

    return (
        <div className={'profile-manager'}>
            <div className={'profile-manager-title'}>
                Profiles
            </div>
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
            { props.src &&
            <div className={'controls'}>
                <div className={'btn-group'}>
                    <button className={'btn btn-control'} onClick={props.newProfile}>Add profile</button>
                    <button className={'btn btn-control'} onClick={props.resetProfiles}>Reset profiles</button>
                    <button
                        className={'btn btn-control'}
                        onClick={() => {
                            setRound(!round)
                    }}>{round ? 'Square' : 'Round'} preview
                    </button>
                    <button
                        className={'btn btn-control'}
                        onClick={() => {
                            downloadImages()
                    }}>Export profiles
                    </button>
                </div>
            </div>
            }
        </div>
    )
}

export default ProfileManager