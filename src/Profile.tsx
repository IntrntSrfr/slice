import React, {useEffect, useRef} from "react";

import {ProfileData, removeProfile, setProfileName, setSelectedProfile} from "./types";
import ProfileFooter from "./ProfileFooter";


interface Props {
    profile: ProfileData;
    round: boolean;
    setSelectedProfile: setSelectedProfile;
    setProfileName: setProfileName;
    removeProfile: removeProfile

    imgRef: React.RefObject<HTMLImageElement>
}

function Profile(props: Props) {
    let id = props.profile.id;
    let imgRef = props.imgRef;

    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    props.profile.reference = previewCanvasRef

    useEffect(() => {
        if (!props.profile.crop || !previewCanvasRef.current || !imgRef.current) {
            return;
        }
        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = props.profile.crop;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return
        }

        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width! * pixelRatio;
        canvas.height = crop.height! * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        ctx.drawImage(
            image,
            crop.x! * scaleX,
            crop.y! * scaleY,
            crop.width! * scaleX,
            crop.height! * scaleY,
            0,
            0,
            crop.width!,
            crop.height!
        );
    }, [imgRef, props.profile.crop]);


    function getStyle() {
        return {
            height: '160px',
            width: '160px',
            borderRadius: props.round ? '50%' : '2px',
            display: 'flex',
            transition: '0.1s'
        }
    }

    return (
        <div className={`profile ${props.profile.active ? 'active' : ''}`}>
            <div onClick={() => props.setSelectedProfile(id)}>
                <canvas
                    ref={previewCanvasRef}
                    style={getStyle()}
                />
            </div>
            <ProfileFooter id={id} name={props.profile.name} setProfileName={props.setProfileName} removeProfile={props.removeProfile}/>
        </div>
    )
}

export default Profile