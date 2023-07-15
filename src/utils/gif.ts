import { PercentCrop } from "react-image-crop";
import { BlobPair, Profile, SliceFrame } from "../types";
import { applyPalette, Format, GIFEncoder, quantize } from 'gifenc';
import { ParsedFrame, ParsedGif } from "gifuct-js";
import { cropCanvas } from "./crop";

/**
 * Expands gifs with frames that may only be smaller patches
 * to full individual frames.
 * @param gif gif info
 * @param frames gif frames
 * @returns
 */
export const expandFrames = (gif: ParsedGif, frames: ParsedFrame[]) => {
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
    }
    return fullFrames;
};

const generateImage = async (img: HTMLImageElement, crop: PercentCrop): Promise<Blob | null> => {
    try {
        const canvas = cropCanvas(img, crop);
        return await new Promise(res => canvas.toBlob(res));
    } catch (error) {
        return null;
    }
};

export const generateImages = async (img: HTMLImageElement, profiles: Profile[]): Promise<BlobPair[]> => {
    return await Promise.all(
        profiles.map(async (p) => {
            const blob = await generateImage(img, p.crop);
            const name = (p.name || p.id).trim();
            return { blob, name };
        })
    );
};

const generateGifPalette = (frames: { data: ImageData, delay: number }[], format: Format) => {
    const combined = new Uint8ClampedArray(frames.length * frames[0].data.data.length);
    frames.forEach((a, i) => {
        combined.set(a.data.data, a.data.data.length*i);
    });
    return quantize(combined, 256, { format , oneBitAlpha: true });
};

export const generateGifs = async (frames: SliceFrame[], profiles: Profile[], transparent: boolean, cb?: (cur: number) => void) => {
    return profiles.map((p) => {
        const blob = generateGif(frames, p,  transparent, cb);
        const name = (p.name || p.id).trim();
        return { blob, name };
    });
};

const generateGif = (frames: SliceFrame[], profile: Profile, transparent: boolean, cb?: (cur: number) => void) => {
    // preprocess palette and crop frames to fit profile
    const croppedFrames: { data: ImageData, delay: number }[] = [];
    const dims = [0, 0];
    frames.forEach((f,i) => {
        const ctx = new OffscreenCanvas(f.imageData.width, f.imageData.height).getContext('2d');
        if (!ctx) throw new Error('canvas 2D context is not available');
        (ctx as OffscreenCanvasRenderingContext2D).putImageData(f.imageData, 0, 0);

        const pc = (profile.crop as PercentCrop);
        const imageData= (ctx as OffscreenCanvasRenderingContext2D).getImageData(
            ctx.canvas.width * pc.x / 100,
            ctx.canvas.height * pc.y / 100,
            ctx.canvas.width * pc.width / 100,
            ctx.canvas.height * pc.height / 100,
        );
        croppedFrames.push({ data: imageData, delay: f.delay });
        dims[0] = ctx.canvas.width * pc.width / 100;
        dims[1] = ctx.canvas.height * pc.height / 100;
        cb?.(i + 1);
    });

    // generate palette
    const format: Format = transparent ? 'rgba4444' : 'rgb565';
    const palette = generateGifPalette(croppedFrames, format);

    // write gif frames
    const gif = GIFEncoder();
    croppedFrames.forEach(f => {
        const index = applyPalette(f.data.data, palette, format);
        gif.writeFrame(index, dims[0], dims[1], { palette, delay: f.delay, transparent, dispose: -1 });
    });

    gif.finish();
    return new Blob([gif.bytesView()], { type: 'image/gif' });
};
