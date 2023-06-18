import { ChangeEvent, RefObject, useEffect, useRef } from 'react';
import { Crop } from 'react-image-crop';
import { useAtom } from 'jotai';
import { framesAtom, mediaTypeAtom, sourceAtom } from '../store';
import AppButton from './AppButton';
import styles from './styles/ProfileListItem.module.css';


interface DeleteProps {
    onlyProfile: boolean,
    onDelete: () => void
}

const DeleteButton = (props: DeleteProps) => {
    if (props.onlyProfile) return null;
    return (
        <AppButton text='Delete' variant={'red'} filled onClick={props.onDelete} />
    );
};

interface Props {
    id: string,
    name: string
    active: boolean
    rounded: boolean
    smallPreviews: boolean
    crop: Crop,
    onlyProfile: boolean,
    onRename: (e: ChangeEvent<HTMLInputElement>) => void,
    onSelect: () => void,
    onDelete: () => void
}

const ProfileListItem = (props: Props) => {
    const [source,] = useAtom(sourceAtom);
    const [frames,] = useAtom(framesAtom);
    const [mediaType,] = useAtom(mediaTypeAtom);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRefSmall = useRef<HTMLCanvasElement>(null);
    const canvasRefSmaller = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!props.crop) return;
        const drawCanvas = (canvas: RefObject<HTMLCanvasElement>, src: HTMLImageElement | HTMLCanvasElement) => {
            if ((source == null) || (canvas.current == null)) return;
            const ctx = canvas.current.getContext('2d');
            if (ctx == null) return;

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(
                src,
                src.width * props.crop.x / 100,
                src.height * props.crop.y / 100,
                src.width * props.crop.width / 100,
                src.height * props.crop.height / 100,
                0, 0, ctx.canvas.width, ctx.canvas.height);
        };

        let currentFrameIndex = 0;
        let timeoutId: string | number | NodeJS.Timeout | null | undefined = null;
        const advanceFrame = () => {
            if (!frames) return;

            drawCanvas(canvasRef, frames[currentFrameIndex].canvas);
            currentFrameIndex = (currentFrameIndex + 1) % frames.length;
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                advanceFrame();
                if (props.smallPreviews)
                    updateSmallPreviews();
            }, frames[currentFrameIndex].delay);
        };

        const updateSmallPreviews = () => {
            [canvasRefSmall, canvasRefSmaller].forEach(c => {
                if (!canvasRef.current || !c.current) return;
                const ctx = c.current.getContext('2d');
                if (!ctx) return;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(canvasRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);
            });
        };

        if (mediaType === 'image/gif' && frames)
            advanceFrame();
        else if ((mediaType === 'image/jpeg' || mediaType === 'image/png') && source) {
            drawCanvas(canvasRef, source);
        }

        if (props.smallPreviews) {
            updateSmallPreviews();
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [props.crop, props.smallPreviews, source, frames, mediaType]);

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
                <AppButton text={props.active ? 'Selected' : 'Select'} variant={'blue'} filled={props.active} onClick={props.onSelect} />
                <DeleteButton onDelete={props.onDelete} onlyProfile={props.onlyProfile} />
            </div>
        </div>
    );
};

export default ProfileListItem;
