import { type ChangeEvent, type RefObject, useEffect, useRef } from 'react';
import { type Crop } from 'react-image-crop';
import { useAtom } from 'jotai';
import { framesAtom, gifAtom, sourceAtom } from '../store';
import Button from './Button';
import styles from './styles/ProfileListItem.module.css';


interface Props {
    id: string
    name: string
    active: boolean
    rounded: boolean
    smallPreviews: boolean
    crop: Crop
    onRename: (e: ChangeEvent<HTMLInputElement>) => void
    onSelect: () => void
    onDelete: () => void
}

const ProfileListItem = (props: Props) => {
    const [source] = useAtom(sourceAtom);
    const [gif] = useAtom(gifAtom);
    const [frames] = useAtom(framesAtom);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRefSmall = useRef<HTMLCanvasElement>(null);
    const canvasRefSmaller = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const drawCanvas = (canvas: RefObject<HTMLCanvasElement>, src: HTMLImageElement | Uint8ClampedArray, mediaType: 'gif' | 'image') => {
            if ((source == null) || (canvas.current == null)) return;
            const ctx = canvas.current.getContext('2d');
            if (ctx == null) return;
            //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


            if (mediaType === 'image') {
                const imgSrc = src as HTMLImageElement;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(
                    imgSrc,
                    imgSrc.width * props.crop.x / 100,
                    imgSrc.height * props.crop.y / 100,
                    imgSrc.width * props.crop.width / 100,
                    imgSrc.height * props.crop.height / 100,
                    0, 0, ctx.canvas.width, ctx.canvas.height);
            } else if (mediaType === 'gif') {
                if (!gif) return;
                const fakeCanvas = document.createElement('canvas');
                fakeCanvas.width = gif.lsd.width;
                fakeCanvas.height = gif.lsd.height;
                const fakeCtx = fakeCanvas.getContext('2d');
                if (!fakeCtx) return;
                const imageData = new ImageData(src as Uint8ClampedArray, gif.lsd.width, gif.lsd.height);
                fakeCtx.putImageData(imageData, 0, 0);
                //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(
                    fakeCanvas,
                    fakeCanvas.width * props.crop.x / 100,
                    fakeCanvas.height * props.crop.y / 100,
                    fakeCanvas.width * props.crop.width / 100,
                    fakeCanvas.height * props.crop.height / 100,
                    0, 0, ctx.canvas.width, ctx.canvas.height
                );
            }
        };

        let currentFrameIndex = 0;
        let timeoutId: string | number | NodeJS.Timeout | null | undefined = null;
        const advanceFrame = () => {
            if (!frames) return;
            drawCanvas(canvasRef, frames[currentFrameIndex].patch, 'gif');
            currentFrameIndex = (currentFrameIndex + 1) % frames.length;
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(advanceFrame, frames[currentFrameIndex].delay);
        };

        if (frames) {
            advanceFrame();
        }
        else if (source)
            drawCanvas(canvasRef, source, 'image');

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [props.crop, props.smallPreviews, frames, source, gif]);

    return (
        <div className={`${styles.profile} ${props.active ? styles.active : ''}`}>
            <div className={styles.profileMain}>
                <div className={styles.profileCrop}>
                    <canvas
                        ref={canvasRef}
                        className={`${styles.profileCanvas} ${props.rounded ? styles.rounded : ''}`}
                        height="256"
                        width="256"
                    />
                    <div className={styles.miniPreviews} style={{ display: props.smallPreviews ? 'flex' : 'none' }}>
                        <canvas
                            ref={canvasRefSmall}
                            className={`${styles.profileCanvasSmall} ${props.rounded ? styles.rounded : ''}`}
                            height="96"
                            width="96"
                        />
                        <canvas
                            ref={canvasRefSmaller}
                            className={`${styles.profileCanvasSmaller} ${props.rounded ? styles.rounded : ''}`}
                            height="64"
                            width="64"
                        />
                    </div>
                </div>
                <div className={styles.profileName}>
                    <input type="text" value={props.name} onChange={props.onRename} />
                </div>
            </div>
            <div className={styles.profileInfo}>
                <Button text={props.active ? 'Selected' : 'Select'} variant={'blue'} filled onClick={props.onSelect} />
                <Button text='Delete' variant={'red'} filled onClick={props.onDelete} />
            </div>
        </div>
    );
};

export default ProfileListItem;
