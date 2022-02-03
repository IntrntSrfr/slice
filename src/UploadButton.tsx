import React, {useRef} from "react";

//import CloudUploadIcon from '@material-ui/icons/CloudUpload';
//import button from '@material-ui/core/Button'
import {onFileSelect} from "./types";

interface Props {
    onSelect: onFileSelect;
}

function UploadButton(props: Props) {
    const inpRef = useRef<HTMLInputElement>(null)
    return (
        <div style={{display:'inline-block'}}>
            <button className={'btn btn-upload'}
                onClick={() => {
                    if (inpRef && inpRef.current) {
                        inpRef.current.click()
                    }
                }}
                //variant={'contained'}
                //color={'primary'}
            >Select image</button>
            <input
                accept={'image/jpeg, image/png'}
                type={'file'}
                ref={inpRef}
                onChange={props.onSelect}
                style={{display: 'none'}}
            />
        </div>
    )
}

export default UploadButton