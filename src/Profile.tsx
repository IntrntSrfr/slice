import React, {useEffect, useRef} from "react";

import Button from './Button'
import {ProfileData, removeProfile, setProfileName, setSelectedProfile} from "./types";


/*

type Props= {
    profile:ProfileData,
    round:boolean

    setSelectedProfile: MouseEventHandler
    removeProfile: MouseEventHandler
    setProfileName: ChangeEventHandler

    imgRef: MutableRefObject<HTMLImageElement>
}
*/

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
    //let completeCrop = props.profile.crop;
    let imgRef = props.imgRef;

    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    //let [name, setName] = useState(('Profile '+id))

    useEffect(() => {
        if (!props.profile.crop || !previewCanvasRef.current || !imgRef.current) {
            return;
        }
        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = props.profile.crop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return
        }
        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width! * pixelRatio;
        canvas.height = crop.height! * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

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

    /*

        function getClassName() {
            return props.profile.active ? "profile active" : "profile";
        }
    */

    function getStyle() {
        return {
            height: '160px',
            borderRadius: props.round ? '50%' : '2px',
            display: 'flex',
            transition: '0.1s'
        }
    }

    function generateDownload() {

        if (!previewCanvasRef) return

        let canvas = previewCanvasRef.current;


        return new Promise((resolve, reject) => {
            if (!canvas) return
            canvas.toBlob(blob => {
                resolve(blob)
            }, 'image/png', 1)
        })
        /*
                canvas.toBlob(blob => {
                    const url = window.URL.createObjectURL(blob);


                    const anchor = document.createElement('a');
                    anchor.download = `${props.profile.name}.png`;
                    anchor.href = URL.createObjectURL(blob);
                    anchor.click();

                    window.URL.revokeObjectURL(url);
                }, "image/png", 1);
                */
    }


    return (
        <div className={`profile ${props.profile.active ? 'active' : ''}`}>
            <div onClick={()=>props.setSelectedProfile(id)}>
                <canvas
                    ref={previewCanvasRef}
                    style={getStyle()}
                />
            </div>
            <div className={'profile-footer'}>
                <div className={'profile-name'}>
                    Profile: <input type={'text'} value={props.profile.name}
                                    onChange={(e) => props.setProfileName(e, id)}/>
                </div>
                <Button styles={'profile-remove-button'} text={'X'} onClick={() => props.removeProfile(id)}/>
                {/*
                <button className={'profile-remove-button'} onClick={props.removeProfile.bind(this, id)}>X</button>
*/}
            </div>
        </div>
    )
}

export default Profile