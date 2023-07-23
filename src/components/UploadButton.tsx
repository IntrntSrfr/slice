import { useRef, ChangeEvent } from "react";

import AppButton from "./AppButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";

interface Props {
    onUpload: (file: File) => void
}

function UploadButton({onUpload}: Props) {
    const inpRef = useRef<HTMLInputElement>(null);

    const clickUpload = () => {
        if (!inpRef?.current) return;
        inpRef.current.click();
    };

    const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const inp = e.target as HTMLInputElement;
        if (!inp.files?.length) return;
        onUpload(inp.files[0]);
    };

    return (
        <div>
            <AppButton variant="green" style={{ width: '100%' }} onClick={clickUpload} >
                <FontAwesomeIcon icon={faArrowUpFromBracket} />Upload image
            </AppButton>
            <input
                ref={inpRef}
                type={'file'}
                accept={'image/jpeg, image/png, image/gif'}
                onChange={handleUpload}
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default UploadButton;
