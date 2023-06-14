import { centerCrop, makeAspectCrop, PercentCrop } from "react-image-crop";
import { Profile, SliceFrame } from "../types";
import { applyPalette, GIFEncoder, quantize } from 'gifenc';
import JSZip from "jszip";
import saveAs from "file-saver";

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

const cropCanvas = (src: HTMLImageElement | HTMLCanvasElement, crop: PercentCrop) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx == null) throw new Error('Canvas 2D context is not available.');

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

export const generateBlob = async (img: HTMLImageElement, crop: PercentCrop): Promise<Blob | null> => {
    try {
        const canvas = cropCanvas(img, crop);
        return await new Promise(res => canvas.toBlob(res));
    } catch (error) {
        return null;
    }
};

interface blobPair {
    blob: Blob | null
    name: string
}

export const generateBlobs = async (img: HTMLImageElement, profiles: Profile[]): Promise<blobPair[]> => {
    return await Promise.all(
        profiles.map(async (p) => {
            //let blob: Blob;
            //i
            const blob = await generateBlob(img, p.crop);
            const name = (p.name || p.id).trim();
            return { blob, name };
        })
    );
};

const combineArrays = (arrays: ImageData[]) => {
    const combined = new Uint8ClampedArray(arrays.reduce((a, b) => a+b.data.length, 0));
    let offset = 0;
    arrays.forEach(a => {
        combined.set(a.data, offset);
        offset += a.data.length;
    });
    return combined;
};

const saveData = (blob: Blob, fileName: string) => {
    const a = document.createElement("a");
    a.style.display = 'none';
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};

/* 
const generateGifPalette = (frames: SliceFrame[]) => {

    frames.forEach(f => {
        const ctx = f.canvas.getContext('2d');
        if(!ctx) return;
        const pc = (p.crop as PercentCrop);
        const imageData = ctx.getImageData(
            ctx.canvas.width * pc.x / 100,
            ctx.canvas.height * pc.y / 100,
            ctx.canvas.width * pc.width / 100,
            ctx.canvas.height * pc.height / 100,
        );
        dims[0] = ctx.canvas.width * pc.width / 100;
        dims[1] = ctx.canvas.height * pc.height / 100;
        croppedFrames.push(imageData);
    });
    //console.log(croppedFrames);
    const combined = combineArrays(croppedFrames);
    //console.log(combined);
    const palette = quantize(combined, 256, {format: 'rgba4444'});
}
*/

export const generateGif = async (frames: SliceFrame[], profiles: Profile[]) => {
    profiles.forEach(p => {
        const gif = GIFEncoder();
        const croppedFrames: ImageData[] = [];
        const dims = [0, 0];
        
        frames.forEach(f => {
            const ctx = f.canvas.getContext('2d');
            if(!ctx) return;
            const pc = (p.crop as PercentCrop);
            const imageData = ctx.getImageData(
                ctx.canvas.width * pc.x / 100,
                ctx.canvas.height * pc.y / 100,
                ctx.canvas.width * pc.width / 100,
                ctx.canvas.height * pc.height / 100,
            );
            croppedFrames.push(imageData);
            dims[0] = ctx.canvas.width * pc.width / 100;
            dims[1] = ctx.canvas.height * pc.height / 100;
        });
        //console.log(croppedFrames);
        const combined = combineArrays(croppedFrames);
        //console.log(combined);
        const palette = quantize(combined, 256, {format: 'rgba4444'});
        //console.log(palette);

        croppedFrames.forEach(f => {
            const index = applyPalette(f.data, palette, 'rgba4444');
            gif.writeFrame(index, dims[0], dims[1], {palette: palette, delay: });
        });

        gif.finish();
        console.log(gif);

        const blob = new Blob([gif.bytesView()], {type: 'image/gif'});
        console.log(blob);

        saveData(blob, "lol.gif");
        
        console.log(URL.createObjectURL(blob));
        console.log('completed profile');
    });
    console.log('complete');

    /* 
    return new Promise<string>((res, rej) => {
        res("i am generated gif :)");
    });
     */
};


/* 
export const exportProfiles = async (blobs: blobPair[], mediaType: string) => {
    const zip = new JSZip();
    const nameMap = new Map<string, number>();
    blobs.forEach(b => {
        if (b.blob == null) return;
        let fileName = b.name;
        const n = nameMap.get(b.name);
        if (n) fileName += `_${n}`;
        nameMap.set(b.name, (n || 0) + 1);
        zip.file(`${fileName}${mediaTypeExtension(mediaType)}`, b.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'profiles.zip');
} 
 */
/* 
export const exportProfiles = async (src: HTMLImageElement, profiles: Profile[]) => {
    const zip = new JSZip();
    const crops = await generateBlobs(src, profiles);
    const nameMap = new Map<string, number>();
    crops.forEach(c => {
        if (c.blob == null) return;
        let fileName = c.name;
        const n = nameMap.get(c.name);
        if (n) fileName += `_${n}`;
        nameMap.set(c.name, (n || 0) + 1);
        zip.file(`${fileName}.png`, c.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'profiles.zip');
}
 */