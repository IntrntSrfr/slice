import React from 'react'
import Button from "./Button";
import {removeProfile, setProfileName} from "./types";

interface Props {
    name: string
    id: string
    setProfileName: setProfileName
    removeProfile: removeProfile
}


function ProfileFooter(props: Props) {
    return (
        <div className={'profile-footer'}>
            <div className={'profile-name'}>
                Profile: &nbsp;
                <input
                    type={'text'}
                    value={props.name}
                    onChange={(e) => props.setProfileName(e, props.id)}/>
            </div>
            <Button styles={'profile-remove-button'} text={'X'} onClick={() => props.removeProfile(props.id)}/>
            {
                /*
                <button className={'profile-remove-button'} onClick={props.removeProfile.bind(this, id)}>X</button>
                */
            }
        </div>

    )

}

export default ProfileFooter