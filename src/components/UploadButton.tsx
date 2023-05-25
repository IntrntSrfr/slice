import { useAtom } from "jotai";
import { useRef, ChangeEvent } from "react";
import { gifAtom, loadingAtom, profilesAtom, sourceAtom } from "../store";
import { v4 } from "uuid";
import { parseGIF } from 'gifuct-js'

import Button from "./Button";

function UploadButton() {
    const [, setSource] = useAtom(sourceAtom)
    const [, setGif] = useAtom(gifAtom)
    const [, setProfiles] = useAtom(profilesAtom)
    const [, setLoading] = useAtom(loadingAtom)
    const inpRef = useRef<HTMLInputElement>(null)

    const clickUpload = () => {
        if (!inpRef?.current) return;
        inpRef.current.click()
    }

    const readFile = (fr: FileReader, f: File, t: 'DataURL' | 'ArrayBuffer') => {
        return new Promise<ArrayBuffer | string | null>((res, rej) => {
            fr.onload = () => res(fr.result)
            fr.onerror = () => rej(fr.error)
            if(t === 'DataURL')
                fr.readAsDataURL(f)
            else if (t === 'ArrayBuffer')
                fr.readAsArrayBuffer(f)
        })
    }

    const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
        let inp = e.target as HTMLInputElement
        if (!inp.files?.length) return;
        setLoading(true)

        const readerDataURL = new FileReader()
        const readerArrayBuffer = new FileReader()
        try {
            let resDataURL = await readFile(readerDataURL, inp.files[0], 'DataURL')
            let img = new Image()
            img.src = resDataURL as string
            setSource(img)
            
            if(inp.files[0].type === 'image/gif'){
                let resArrayBuffer = await readFile(readerArrayBuffer, inp.files[0], 'ArrayBuffer')
                let buf = resArrayBuffer as ArrayBuffer
                let gif = parseGIF(buf)
                setGif(gif)
            }
        } catch (err: any) {
            console.log(err);
            return
        }

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
                accept={'image/jpeg, image/png, image/gif'}
                onChange={uploadImage}
                style={{ display: 'none' }}
            />
        </div>
    )
}

export default UploadButton