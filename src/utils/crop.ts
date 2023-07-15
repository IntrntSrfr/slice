import { centerCrop, makeAspectCrop, PercentCrop } from "react-image-crop";

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

export const cropCanvas = (src: HTMLImageElement | HTMLCanvasElement, crop: PercentCrop) => {
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
