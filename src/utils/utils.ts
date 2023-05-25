import { centerCrop, makeAspectCrop, PercentCrop } from "react-image-crop";
import { Profile } from "../types";

export const centerCropImage = (img: HTMLImageElement): PercentCrop =>  {
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
    )
    return crop
}

export const generateBlob = async (img: HTMLImageElement, crop: PercentCrop): Promise<Blob|null> =>  {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    if(!ctx) throw new Error('Canvas 2D context is not available.');

    ctx.canvas.width = img.width * crop.width / 100
    ctx.canvas.height = img.height * crop.height / 100

    ctx.drawImage(
        img, 
        img.width * crop.x / 100, 
        img.height * crop.y / 100, 
        img.width * crop.width / 100, 
        img.height * crop.height / 100, 
        0, 0, ctx.canvas.width, ctx.canvas.height)
    return await new Promise(res => canvas.toBlob(res))
}

interface blobPair {
    blob: Blob | null,
    name: string
}

export const generateBlobs = async (img: HTMLImageElement, profiles: Profile[]): Promise<blobPair[]> => {
    return await Promise.all(
        profiles.map(async(p) => {
            let blob = await generateBlob(img, p.crop)
            let name = (p.name || p.id).trim()
            return {blob: blob, name: name}
        })
    )
}
