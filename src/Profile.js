import React, {useEffect, useRef} from "react";

function Profile(props){
    let id = props.profile.id;
    //let completeCrop = props.profile.crop;
    let imgRef = props.imgRef;

    const previewCanvasRef = useRef(null);
    //let [name, setName] = useState(('Profile '+id))

    useEffect(()=>{
        if (!props.profile.crop || !previewCanvasRef.current || !imgRef.current) {
            return;
        }
        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = props.profile.crop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext("2d");
        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );
    }, [imgRef, props.profile.crop]);

    function getClassName(){
        return props.profile.active ? "profile active" : "profile";
    }

    function getStyle(){
        return {
            height:'160px',
            borderRadius:props.round?'50%':'5px',
        }
    }

    function generateDownload(){
        let canvas = previewCanvasRef.current;

        canvas.toBlob(blob=>{
            const url = window.URL.createObjectURL(blob);

            const anchor = document.createElement('a');
            anchor.download = `${props.profile.name}.png`;
            anchor.href = URL.createObjectURL(blob);
            anchor.click();

            window.URL.revokeObjectURL(url);
        }, "image/png", 1);
    }

    return(
        <div className={getClassName()} >
            <div>
                <canvas
                    onClick={props.setSelectedProfile.bind(this, id)}
                    ref={previewCanvasRef}
                    style={getStyle()}
                />
            </div>
            <div className={"profile-footer"}>
                Profile: {props.profile.name}
                {/*<input type={'text'} onChange={e=>props.setProfileName.bind(this, id, e.target.value)}/>*/}
                {/*Profile {props.i}*/}
                {/*<button onClick={generateDownload}>dl</button>*/}
                <button className={'profile-remove-button'} onClick={props.removeProfile.bind(this, id)}>X</button>
            </div>
        </div>
    )
}

export default Profile