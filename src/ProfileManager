import Profile from './Profile'
import {Button, ButtonGroup} from "@material-ui/core";
import {useState} from "react";

function ProfileManager(props) {
    const [round, setRound] = useState(true);

    function generateDownload() {


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
                    console.log("export lol")
                }}>Export profiles</Button>
            </ButtonGroup>
            <div className={'profiles'}>
                <div className={'profiles-inner'}>
                    {props.profiles.map(v => (
                        <Profile
                            key={v.id}
                            profile={v}
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