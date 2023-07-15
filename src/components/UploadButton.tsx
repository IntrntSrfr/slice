import { useAtom } from "jotai";
import { useRef, ChangeEvent } from "react";
import { defaultProfile, framesAtom, gifAtom, mediaTypeAtom, overlayAtom, profilesAtom, sourceAtom } from "../store";

import AppButton from "./AppButton";
import { decompressFrames, parseGIF } from "gifuct-js";
import AppProgressBar from "./AppProgressBar";
import { expandFrames } from "../utils/gif";

function UploadButton() {
    const [, setSource] = useAtom(sourceAtom);
    const [, setGif] = useAtom(gifAtom);
    const [, setMediaType] = useAtom(mediaTypeAtom);
    const [, setFrames] = useAtom(framesAtom);
    const [, setProfiles] = useAtom(profilesAtom);
    const [, setOverlay] = useAtom(overlayAtom);
    const inpRef = useRef<HTMLInputElement>(null);

    const clickUpload = () => {
        if (!inpRef?.current) return;
        inpRef.current.click();
    };

    const readFile = async (fr: FileReader, f: File, t: 'DataURL' | 'ArrayBuffer') => {
        return await new Promise<ArrayBuffer | string | null>((res, rej) => {
            fr.onprogress = (ev) => {
                if(ev.lengthComputable)
                    updateOverlay(ev.loaded, ev.total);
            };
            fr.onload = () => { res(fr.result); };
            fr.onerror = () => { rej(fr.error); };
            if (t === 'DataURL')
                fr.readAsDataURL(f);
            else if (t === 'ArrayBuffer')
                fr.readAsArrayBuffer(f); 
        });
    };

    const resetSources = () => {
        setSource(null);
        setGif(null);
        setFrames(null);
    };

    const updateOverlay = (cur: number, max: number) => {
        setOverlay({ content: <AppProgressBar text="Loading" current={cur} max={max}/> });
    };

    const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const inp = e.target as HTMLInputElement;
        if (!inp.files?.length) return;
        
        resetSources();
        setProfiles([defaultProfile()]);
        const fileType = inp.files[0].type;
        setMediaType(fileType);
        updateOverlay(0, 10);
        
        const readerDataURL = new FileReader();
        const readerArrayBuffer = new FileReader();
        try {
            const resDataURL = await readFile(readerDataURL, inp.files[0], 'DataURL');
            const img = new Image();
            img.src = resDataURL as string;
            setSource(img);
            if (fileType === 'image/gif') {
                const resArrayBuffer = await readFile(readerArrayBuffer, inp.files[0], 'ArrayBuffer');
                const buf = resArrayBuffer as ArrayBuffer;
                const gif = parseGIF(buf);
                const frames = decompressFrames(gif, true);
                setGif(gif);
                setFrames(expandFrames(gif, frames));
            }
        } catch (err: unknown) {
            console.log(err);
        } finally {
            setOverlay({ content: null });
        }
    };

    return (
        <div>
            <AppButton text="Upload image" variant="green" style={{ width: '100%' }} onClick={clickUpload} />
            <input
                ref={inpRef}
                type={'file'}
                accept={'image/jpeg, image/png, image/gif'}
                onChange={uploadImage}
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default UploadButton;
