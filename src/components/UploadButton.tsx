import { useAtom } from "jotai";
import { useRef, ChangeEvent } from "react";
import { defaultProfile, framesAtom, gifAtom, mediaTypeAtom, overlayAtom, profilesAtom, sourceAtom } from "../store";

import AppButton from "./AppButton";
import { ParsedFrame, ParsedGif, decompressFrames, parseGIF } from "gifuct-js";
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

    /**
     * Expands gifs with frames that may only be smaller patches
     * to full individual frames.
     * @param frames 
     * @returns 
     */
    const expandFrames = (gif: ParsedGif, frames: ParsedFrame[]) => {
        const fullFrames: SliceFrame[] = [];
        let lastImageData: ImageData | null = null;
        const canvas = new OffscreenCanvas(gif.lsd.width, gif.lsd.height);
        const ctx = canvas.getContext('2d', {willReadFrequently: true});
        if (!ctx) throw new Error('canvas 2D context not available');

        for(let i = 0; i < frames.length; i++) {
            const f = frames[i];

            // prepare patch canvas
            const patchCanvas = new OffscreenCanvas(f.dims.width, f.dims.height);
            const patchCtx = patchCanvas.getContext('2d');
            if (!patchCtx) throw new Error('canvas 2D context not available');

            // set patch data
            patchCtx.clearRect(0, 0, f.dims.width, f.dims.height);
            const patchData = patchCtx.createImageData(f.dims.width, f.dims.height);
            patchData.data.set(f.patch);
            patchCtx.putImageData(patchData, 0, 0);
            
            // draw patch onto existing canvas and extract data
            ctx.drawImage(patchCanvas, f.dims.left, f.dims.top);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // fully copy the current canvas and push it to the results
            const finalCanvas = new OffscreenCanvas(gif.lsd.width, gif.lsd.height);
            const finalCtx = finalCanvas.getContext('2d', {willReadFrequently: true});
            if (!finalCtx) throw new Error('canvas 2D context not available');
            finalCtx.putImageData(imageData, 0, 0);
            fullFrames.push({canvas: finalCanvas, imageData: imageData, delay: f.delay, dims: f.dims});

            // dispose of the frame
            // for 0 and 1, do nothing
            if (f.disposalType === 2 )
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            else if (f.disposalType === 3 && lastImageData)
                ctx.putImageData(lastImageData, 0, 0);
            lastImageData = imageData;
        }
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
