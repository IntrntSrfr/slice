import { useAtom } from "jotai";
import { useRef, ChangeEvent } from "react";
import { framesAtom, gifAtom, loadingAtom, mediaTypeAtom, profilesAtom, sourceAtom } from "../store";
import { v4 } from "uuid";

import Button from "./Button";
import { ParsedFrame, decompressFrames, parseGIF } from "gifuct-js";
import { SliceFrame } from "../types";

function UploadButton() {
    const [, setSource] = useAtom(sourceAtom);
    const [, setGif] = useAtom(gifAtom);
    const [, setMediaType] = useAtom(mediaTypeAtom);
    const [, setFrames] = useAtom(framesAtom);
    const [, setLoading] = useAtom(loadingAtom);
    const inpRef = useRef<HTMLInputElement>(null);

    const clickUpload = () => {
        if (!inpRef?.current) return;
        inpRef.current.click();
    };

    const readFile = async (fr: FileReader, f: File, t: 'DataURL' | 'ArrayBuffer') => {
        return await new Promise<ArrayBuffer | string | null>((res, rej) => {
            fr.onload = () => { res(fr.result); };
            fr.onerror = () => { rej(fr.error); };
            if (t === 'DataURL') { fr.readAsDataURL(f); } else if (t === 'ArrayBuffer') { fr.readAsArrayBuffer(f); }
        });
    };

    const resetSources = () => {
        setSource(null);
        setGif(null);
        setFrames(null);
    };

    const arrToCanvas = (arr: Uint8ClampedArray, h: number, w:number ) => {
        const fakeCanvas = document.createElement('canvas');
        fakeCanvas.height = h;
        fakeCanvas.width = w;
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
        let currentCanvas: HTMLCanvasElement | null = null;
        frames.forEach(f => {
            if(!currentCanvas) {
                currentCanvas = arrToCanvas(f.patch, f.dims.height, f.dims.width);
                if(!currentCanvas) return;
                fullFrames.push({canvas: currentCanvas, delay: f.delay, dims: f.dims});
                return;
            }

            if(f.disposalType === 1) {
                // create brand new canvas, draw the previous
                // canvas over it, then draw the new patch.
                // there's probably a better way to do this tbh :)
                const newCanvas = document.createElement('canvas');
                newCanvas.height = currentCanvas.height;
                newCanvas.width = currentCanvas.width;
                const newCtx = newCanvas.getContext('2d');
                if (!newCtx) return null;
                newCtx.drawImage(currentCanvas, 0,0);

                const nc = arrToCanvas(f.patch, f.dims.height, f.dims.width);
                if(!nc) return;
                newCtx.drawImage(nc, f.dims.left, f.dims.top);
                fullFrames.push({canvas: newCanvas, delay: f.delay, dims: f.dims});
                currentCanvas = newCanvas;
            }
        });

        return fullFrames;
    };

    const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const inp = e.target as HTMLInputElement;
        if (!inp.files?.length) return;
        setLoading(true);
        resetSources();

        const readerDataURL = new FileReader();
        const readerArrayBuffer = new FileReader();
        try {
            const resDataURL = await readFile(readerDataURL, inp.files[0], 'DataURL');
            const img = new Image();
            img.src = resDataURL as string;
            setSource(img);
            setMediaType(inp.files[0].type);
            if(inp.files[0].type === 'image/gif'){
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
            setLoading(false);
        }
    };

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
    );
}

export default UploadButton;