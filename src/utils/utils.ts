import { centerCrop, makeAspectCrop, PercentCrop } from "react-image-crop";
import { BlobPair, Profile, SliceFrame } from "../types";
import { applyPalette, Format, GIFEncoder, quantize } from 'gifenc';

export const centerCropImage = (img: HTMLImageElement): PercentCrop => {
    const { naturalWidth: width, naturalHeight: height } = img;
    const crop = centerCrop(
        makeAspectCrop({
            unit: '%',
            width: 25,
        },
            1,
            width,
            height
        ),
        width,
        height
    );
    return crop;
};

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

const cropCanvas = (src: HTMLImageElement | HTMLCanvasElement, crop: PercentCrop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2D context is not available');

    ctx.canvas.width = src.width * crop.width / 100;
    ctx.canvas.height = src.height * crop.height / 100;
    ctx.drawImage(
        src,
        src.width * crop.x / 100,
        src.height * crop.y / 100,
        src.width * crop.width / 100,
        src.height * crop.height / 100,
        0, 0, ctx.canvas.width, ctx.canvas.height);
    return canvas;
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
