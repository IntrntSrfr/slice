import { ChangeEvent, RefObject, useEffect, useRef } from 'react';
import AppButton from './AppButton';
import styles from './styles/ProfileListItem.module.css';
import { Profile } from '../types';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface Props {
    profile: Profile;
    image: HTMLImageElement | OffscreenCanvas | null;
    rounded: boolean;
    smallPreviews: boolean;
    onlyProfile: boolean;
    onRename: (e: ChangeEvent<HTMLInputElement>) => void;
    onSelect: () => void;
    onDelete: () => void;
}

const ProfileListItem = (props: Props) => {
    const {name, active, crop} = props.profile;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRefSmall = useRef<HTMLCanvasElement>(null);
    const canvasRefSmaller = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!crop) return;
        const drawCanvas = (canvas: RefObject<HTMLCanvasElement>, src: HTMLImageElement | OffscreenCanvas | null) => {
            if ((src == null) || (canvas.current == null)) return;
            const ctx = canvas.current.getContext('2d');
            if (ctx == null) return;

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(
                src,
                src.width * crop.x / 100,
                src.height * crop.y / 100,
                src.width * crop.width / 100,
                src.height * crop.height / 100,
                0, 0, ctx.canvas.width, ctx.canvas.height);
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

        drawCanvas(canvasRef, props.image);
        if (props.smallPreviews) 
            updateSmallPreviews();
    }, [crop, props.image, props.smallPreviews]);

    return (
        <div className={`${styles.profile} ${active ? styles.active : ''}`}>
            <div onClick={props.onSelect}>
                <div className={styles.profileCrop}  >
                    <canvas
                        ref={canvasRef}
                        className={`${styles.profileCanvas} ${props.rounded ? styles.rounded : ''}`}
                        height="256"
                        width="256"
                    />
                    <SmallPreviews 
                        show={props.smallPreviews} 
                        rounded={props.rounded} 
                        smallPreview={canvasRefSmall} 
                        smallerPreview={canvasRefSmaller} 
                    />
                </div>
                <div className={styles.profileFooter}>
                    <div className={styles.profileCheckbox} >
                        <input type="checkbox" checked={active} readOnly/>
                    </div>
                    <div className={styles.profileName}>
                        <input type="text" value={name} onChange={props.onRename} />
                    </div>
                </div>
            </div>
            <DeleteButton onDelete={props.onDelete} show={!props.onlyProfile}/>
        </div>
    );
};

export default ProfileListItem;

interface SmallPreviewsProps {
    show: boolean;
    rounded: boolean;
    smallPreview: RefObject<HTMLCanvasElement>;
    smallerPreview: RefObject<HTMLCanvasElement>;
}

const SmallPreviews = (props: SmallPreviewsProps) => {
    if (!props.show) return null;
    return (
        <div className={styles.miniPreviews} >
            <canvas
                ref={props.smallPreview}
                className={`${styles.profileCanvasSmall} ${props.rounded ? styles.rounded : ''}`}
                height="96"
                width="96"
            />
            <canvas
                ref={props.smallerPreview}
                className={`${styles.profileCanvasSmaller} ${props.rounded ? styles.rounded : ''}`}
                height="64"
                width="64"
            />
        </div>
    );
};

interface DeleteProps {
    onDelete: () => void;
    show: boolean
}

const DeleteButton = ({onDelete, show}: DeleteProps) => {
    return (
        <AppButton variant={'red'} filled onClick={onDelete} className={`${styles.deleteBtn} ${show?styles.active:''}`} >
            <FontAwesomeIcon icon={faTrash} /> 
        </AppButton>
    );
};
