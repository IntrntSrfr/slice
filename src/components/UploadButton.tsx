import { useAtom } from "jotai";
import { useRef, ChangeEvent } from "react";
import { loadingAtom, profilesAtom, sourceAtom } from "../store";
import { v4 } from "uuid";

import Button from "./Button";

function UploadButton() {
    const [, setSource] = useAtom(sourceAtom)
    const [, setProfiles] = useAtom(profilesAtom)
    const [, setLoading] = useAtom(loadingAtom)
    const inpRef = useRef<HTMLInputElement>(null)

    const clickUpload = () => {
        if (!inpRef?.current) return;
        inpRef.current.click()
    }

    const uploadImage = (e: ChangeEvent<HTMLInputElement>) => {
        let inp = e.target as HTMLInputElement
        if (!inp.files?.length) return;
        setLoading(true)

        let reader = new FileReader()
        reader.onload = () => {
            if (reader.result) {
                let img = new Image()
                img.src = reader.result as string
                setSource(img)
            }
        }
        reader.readAsDataURL(inp.files[0])
        setProfiles([{
            id: v4(),
            name: 'New profile',
            crop: { unit: '%', width: 50 },
            active: true
        }]);
    }

    return (
        <div>
            <Button text="Upload image" variant="green" style={{ width: '100%' }} onClick={clickUpload} />
            <input
                ref={inpRef}
                type={'file'}
                accept={'image/jpeg, image/png'}
                onChange={uploadImage}
                style={{ display: 'none' }}
            />
        </div>
    )
}

export default UploadButton