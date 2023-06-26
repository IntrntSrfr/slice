import { centerCrop, makeAspectCrop, PercentCrop } from "react-image-crop";
import { BlobPair, Profile, SliceFrame } from "../types";
import { applyPalette, GIFEncoder, quantize } from 'gifenc';

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

const combineArrays = (arrays: { data: ImageData, delay: number }[]) => {
    const combined = new Uint8ClampedArray(arrays.reduce((a, b) => a + b.data.data.length, 0));
    let offset = 0;
    arrays.forEach(a => {
        combined.set(a.data.data, offset);
        offset += a.data.data.length;
    });
    return combined;
};

export const generateGifs = async (frames: SliceFrame[], profiles: Profile[], cb?: (cur: number) => void) => {
    return profiles.map((p) => {
            const blob = generateGif(frames, p, cb);
            const name = (p.name || p.id).trim();
            return { blob, name };
        });
};

const generateGif = (frames: SliceFrame[], profile: Profile, cb?: (cur:number)=>void) => {
    // preprocess palette and crop frames to fit profile
    const croppedFrames: { data: ImageData, delay: number }[] = [];
    
    const dims = [0, 0];
    for(let i = 0; i < frames.length; i++){
        const f = frames[i];
        const ctx = new OffscreenCanvas(f.imageData.width, f.imageData.height).getContext('2d');
        if(!ctx) throw new Error('canvas 2D context is not available');
        ctx.putImageData(f.imageData, 0, 0);

        const pc = (profile.crop as PercentCrop);
        const imageData = ctx.getImageData(
            ctx.canvas.width * pc.x / 100,
            ctx.canvas.height * pc.y / 100,
            ctx.canvas.width * pc.width / 100,
            ctx.canvas.height * pc.height / 100,
        );
        croppedFrames.push({ data: imageData, delay: f.delay });
        dims[0] = ctx.canvas.width * pc.width / 100;
        dims[1] = ctx.canvas.height * pc.height / 100;
        cb?.(i+1);
    }

    // FIX ME: if a gif does not support transparency, the first frame will be broken
    // with these settings, because it expects a transparency channel, which ends up 
    // shifting the arrays such that they do not fit properly as they would with 4 channels.
    // If all the other frames are simply patches, it can still work, as they are "transparent".
    // Make sure to check the settings.
    const combined = combineArrays(croppedFrames);
    const palette = quantize(combined, 256, { format: 'rgba4444' });

    // write gif frames
    const gif = GIFEncoder();
    croppedFrames.forEach(f => {
        const index = applyPalette(f.data.data, palette, 'rgba4444');
        gif.writeFrame(index, dims[0], dims[1], { palette: palette, delay: f.delay });
    });

    gif.finish();
    return new Blob([gif.bytesView()], { type: 'image/gif' });
};
