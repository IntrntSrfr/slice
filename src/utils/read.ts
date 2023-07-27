import { SliceFrame } from "../types";
import { ParsedFrame, ParsedGif } from "gifuct-js";

type ProgressCallback = (current: number, total: number) => void;
type readFileOptions = {
    onProgress?: ProgressCallback;
}

export const readFile = (file: File, type: 'DataURL' | 'ArrayBuffer', options?: readFileOptions): Promise<string | ArrayBuffer | null> => {
    return new Promise<ArrayBuffer | string | null>((res, rej) => {
        const fr = new FileReader();
        fr.onprogress = (ev) => {
            if(ev.lengthComputable)
                options?.onProgress?.(ev.loaded, ev.total);
        };
        fr.onload = () => { res(fr.result); };
        fr.onerror = () => { rej(fr.error); };
        switch(type){
            case "DataURL":
                fr.readAsDataURL(file);
                break;
            case "ArrayBuffer":
                fr.readAsArrayBuffer(file); 
                break;
        }
    });
};

/**
 * Expands gifs with frames that may only be smaller patches
 * to full individual frames.
 * @param gif gif info
 * @param frames gif frames
 * @returns
 */
export const expandFrames = (gif: ParsedGif, frames: ParsedFrame[], cb?: (cur: number, total: number) => void) => {
    const fullFrames: SliceFrame[] = [];
    let lastImageData: ImageData | null = null;
    const canvas = new OffscreenCanvas(gif.lsd.width, gif.lsd.height);
    const ctx = canvas.getContext('2d', {willReadFrequently: true}) as OffscreenCanvasRenderingContext2D | null;
    if (!ctx) throw new Error('canvas 2D context not available');

    for(let i = 0; i < frames.length; i++) {
        const f = frames[i];

        // prepare patch canvas
        const patchCanvas = new OffscreenCanvas(f.dims.width, f.dims.height);
        const patchCtx = patchCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null;
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
        const finalCtx = finalCanvas.getContext('2d', {willReadFrequently: true}) as OffscreenCanvasRenderingContext2D | null;
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
        
        cb?.(i+1, frames.length);
    }
    return fullFrames;
};
