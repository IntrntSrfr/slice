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
                <input
                    type={'text'}
                    value={props.name}
                    onChange={(e) => props.setProfileName(e, props.id)}/>
            </div>
            <Button styles={'btn btn-red'} text={'Delete profile'} onClick={() => props.removeProfile(props.id)}/>
        </div>

    )

}

export default ProfileFooter