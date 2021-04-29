import React, {useRef} from "react";


//import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Button from '@material-ui/core/Button'
import {onFileSelect} from "./types";

interface Props {
    onSelect: onFileSelect;
}

function UploadButton(props: Props) {
    const inpRef = useRef<HTMLInputElement>(null)
    return (
        <div style={{display:'inline-block'}}>
            <Button
                onClick={() => {
                    if (inpRef && inpRef.current) {
                        inpRef.current.click()
                    }
                }}
                variant={'contained'}
                color={'primary'}
                //startIcon={<CloudUploadIcon/>}
            >
                Select image
            </Button>
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