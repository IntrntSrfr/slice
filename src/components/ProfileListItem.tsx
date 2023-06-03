import { ChangeEvent, RefObject, useEffect, useRef } from 'react';
import { Crop } from 'react-image-crop';
import { useAtom } from 'jotai';
import { sourceAtom } from '../store';
import Button from './Button';
import styles from './styles/ProfileListItem.module.css';

interface Props {
  id: string,
  name: string
  active: boolean
  rounded: boolean
  smallPreviews: boolean
  crop: Crop,
  onRename: (e: ChangeEvent<HTMLInputElement>) => void,
  onSelect: () => void,
  onDelete: () => void
}

const ProfileListItem = (props: Props) => {
  const [source,] = useAtom(sourceAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefSmall = useRef<HTMLCanvasElement>(null);
  const canvasRefSmaller = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCanvas(canvasRef);
    if(props.smallPreviews)
      [canvasRefSmall, canvasRefSmaller].forEach(c => drawCanvas(c));
  }, [props.crop, props.smallPreviews]);
  
  const drawCanvas = (canvas: RefObject<HTMLCanvasElement>) => {
    if (!source || !canvas.current) return;
    const ctx = canvas.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width);
    ctx.drawImage(
      source,
      source.width * props.crop.x / 100,
      source.height * props.crop.y / 100,
      source.width * props.crop.width / 100,
      source.height * props.crop.height / 100,
      0, 0, ctx.canvas.width, ctx.canvas.height);
  };
  
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
