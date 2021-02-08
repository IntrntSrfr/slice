import {useRef} from "react";


//import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Button from '@material-ui/core/Button'

function UploadButton(props){
    const inpRef = useRef(null)
    return(
        <div>
            <Button
                onClick={()=>{inpRef.current.click()}}
                variant={'contained'}
                color={'primary'}
                //startIcon={<CloudUploadIcon/>}
            >
                Select image
            </Button>
            <input
                type={'file'}
                ref={inpRef}
                onChange={props.onSelect}
                style={{display:'none'}}
            />
        </div>
    )
}

export default UploadButton