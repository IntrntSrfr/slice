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

export const cropCanvas = (src: HTMLImageElement | HTMLCanvasElement, crop: PercentCrop): HTMLCanvasElement => {
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

export const drawCircleMask = (src: HTMLCanvasElement | OffscreenCanvas, transparency: boolean): HTMLCanvasElement | OffscreenCanvas => {
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    if (src instanceof OffscreenCanvas) {
        canvas = new OffscreenCanvas(src.width, src.height);
        ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    } else {
        canvas = document.createElement('canvas');
        canvas.width = src.width;
        canvas.height = src.height;
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }
  
    if (!transparency) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, src.width, src.height);
    }

    ctx.beginPath();
    const radius = Math.min(src.width, src.height) / 2;
    ctx.arc(src.width / 2, src.height / 2, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(src, 0, 0);
    return canvas;
};
