import { useAtom } from "jotai";
import { useRef, ChangeEvent } from "react";
import { defaultProfile, framesAtom, gifAtom, mediaTypeAtom, overlayAtom, profilesAtom, sourceAtom } from "../store";

import AppButton from "./AppButton";
import { ParsedFrame, decompressFrames, parseGIF } from "gifuct-js";
import { SliceFrame } from "../types";
import AppProgressBar from "./AppProgressBar";

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

    const arrToCanvas = (arr: Uint8ClampedArray, h: number, w: number) => {
        const fakeCanvas = new OffscreenCanvas(w, h);
        const fakeCtx = fakeCanvas.getContext('2d');
        if (!fakeCtx) return null;
        const imageData = new ImageData(arr, w, h);
        fakeCtx.putImageData(imageData, 0, 0);
        return fakeCanvas;
    };

    /**
     * Expands gifs with frames that may only be smaller patches
     * to full individual frames.
     * @param frames 
     * @returns 
     */
    const expandFrames = (frames: ParsedFrame[]) => {
        const fullFrames: SliceFrame[] = [];
        let currentCanvas: OffscreenCanvas | null = null;
        frames.forEach(f => {
            if (!currentCanvas) {
                currentCanvas = arrToCanvas(f.patch, f.dims.height, f.dims.width);
                if (!currentCanvas) return;
                const imageData = new ImageData(f.patch, f.dims.height, f.dims.width);
                fullFrames.push({ canvas: currentCanvas, imageData: imageData, delay: f.delay, dims: f.dims });
                return;
            }

            if (f.disposalType === 1) {
                // create brand new canvas, draw the previous
                // canvas over it, then draw the new patch.
                // there's probably a better way to do this tbh :)
                const newCanvas = new OffscreenCanvas(currentCanvas.width, currentCanvas.height);
                const newCtx = newCanvas.getContext('2d');
                if (!newCtx) return null;
                newCtx.drawImage(currentCanvas, 0, 0);

                const nc = arrToCanvas(f.patch, f.dims.height, f.dims.width);
                if (!nc) return;
                newCtx.drawImage(nc, f.dims.left, f.dims.top);
                const imageData = newCtx.getImageData(0, 0, newCtx.canvas.width, newCtx.canvas.height);
                fullFrames.push({ canvas: newCanvas, imageData: imageData, delay: f.delay, dims: f.dims });
                currentCanvas = newCanvas;
            }
        });

        return fullFrames;
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
                setFrames(expandFrames(frames));
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