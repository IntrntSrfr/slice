import { SliceFrame } from "@/types";
import { applyPalette, Format, GIFEncoder, quantize } from 'gifenc';
import { cropCanvas, drawCircleMask } from "@/utils/crop";
import ExportWorker from './exportWorker?worker';
import JSZip from "jszip";
import { BlobPair, Profile, GifExportProgress, GifExportInit, generateGifOptions, generateImageOptions, generateGifsOptions } from "./types";

export const mediaTypeExtension = (mediaType: string) => {
    switch (mediaType) {
        case 'image/jpeg':
            return '.jpg';
        case 'image/png':
            return '.png';
        case 'image/gif':
            return '.gif';
        default:
            return '';
    }
};

export const generateZipFile = async (blobs: BlobPair[], type: string) => {
    const zip = new JSZip();
    const nameMap = new Map<string, number>();
    blobs.forEach(b => {
        if (b.blob == null) return; // consider adding error message :)
        let fileName = b.name;
        const n = nameMap.get(b.name);
        if (n) fileName += `_${n}`;
        nameMap.set(b.name, (n || 0) + 1);
        zip.file(`${fileName}${mediaTypeExtension(type)}`, b.blob);
    });
    
    return await zip.generateAsync({ type: 'blob' });
};

export const generateImages = async (img: HTMLImageElement, profiles: Profile[], options?: generateImageOptions): Promise<BlobPair[]> => {
    return await Promise.all(
        profiles.map(async (p) => {
            const blob = await generateImage(img, p, options);
            const name = (p.name || p.id).trim();
            return { blob, name };
        })
    );
};

const generateImage = async (
    img: HTMLImageElement, 
    profile: Profile, 
    options: generateImageOptions = {circularCrop:false, transparent: false}
): Promise<Blob | null> => {
    if(!profile.crop) return null;
    try {
        let canvas = cropCanvas(img, profile.crop);
        if(options.circularCrop)
            canvas = drawCircleMask(canvas, options.transparent) as HTMLCanvasElement;
        return await new Promise(res => canvas.toBlob(res));
    } catch (error) {
        return null;
    }
};

export const generateGifs = async (frames: SliceFrame[], profiles: Profile[], options?: generateGifsOptions): Promise<BlobPair[]> => {
    return new Promise((res, rej) => {
        const exportWorker = new ExportWorker();
        let acc = 0;
        exportWorker.onmessage = (e: MessageEvent<GifExportProgress>) => {
            if (e.data.evt === 'finished') {
                exportWorker.terminate();
                res(e.data.blobs as BlobPair[]);
            } else if (e.data.evt === 'progress') {
                acc++;
                options?.onProgress?.(acc, e.data.total);
            }
        };
        exportWorker.onerror = (err) => {
            exportWorker.terminate();
            rej(err.message);
        };
        const tf: SliceFrame[] = frames.map(f => ({ delay: f.delay, dims: f.dims, imageData: f.imageData }));
        exportWorker.postMessage({ frames: tf, profiles: profiles, options: {...options, onProgress: undefined} } as GifExportInit);
    });
};

export const generateGif = (
    frames: SliceFrame[], 
    profile: Profile, 
    options: generateGifOptions = {circularCrop:false, transparent:false}
) => {
    // preprocess palette and crop frames to fit profile
    const { crop } = profile;
    if(!crop) return null;
    
    const croppedFrames: { data: ImageData, delay: number }[] = [];
    const dims = [0, 0];
    frames.forEach((f,i) => {
        const canvas = new OffscreenCanvas(f.imageData.width, f.imageData.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('canvas 2D context is not available');
        (ctx as OffscreenCanvasRenderingContext2D).putImageData(f.imageData, 0, 0);

        let dstCanvas = new OffscreenCanvas(canvas.width * crop.width / 100, canvas.height * crop.height / 100);
        let dstCtx = dstCanvas.getContext('2d');
        if (!dstCtx) throw new Error('canvas 2D context is not available');
        dstCtx.drawImage(canvas,
            canvas.width * crop.x / 100,
            canvas.height * crop.y / 100,
            canvas.width * crop.width / 100,
            canvas.height * crop.height / 100,
            0, 0, dstCanvas.width, dstCanvas.height,
        );
            
        if (options.circularCrop) {
            dstCanvas = drawCircleMask(dstCanvas, options.transparent) as OffscreenCanvas;
            dstCtx = dstCanvas.getContext('2d');
            if (!dstCtx) throw new Error('canvas 2D context is not available');
        } 
        
        const imageData = (dstCtx as OffscreenCanvasRenderingContext2D).getImageData(0,0,dstCanvas.width, dstCanvas.height);
        croppedFrames.push({ data: imageData, delay: f.delay });
        dims[0] = canvas.width * crop.width / 100;
        dims[1] = canvas.height * crop.height / 100;
        options.onProgress?.(i+1);
    });

    // generate palette
    const format: Format = options.transparent ? 'rgba4444' : 'rgb565';
    const palette = generateGifPalette(croppedFrames, format);

    // write gif frames
    const gif = GIFEncoder();
    croppedFrames.forEach(f => {
        const index = applyPalette(f.data.data, palette, format);
        gif.writeFrame(index, dims[0], dims[1], { palette, delay: f.delay, transparent: options.transparent, dispose: -1 });
    });

    gif.finish();
    return new Blob([gif.bytesView()], { type: 'image/gif' });
};

const generateGifPalette = (frames: { data: ImageData, delay: number }[], format: Format) => {
    const combined = new Uint8ClampedArray(frames.length * frames[0].data.data.length);
    frames.forEach((a, i) => {
        combined.set(a.data.data, a.data.data.length*i);
    });
    return quantize(combined, 256, { format , oneBitAlpha: true });
};
