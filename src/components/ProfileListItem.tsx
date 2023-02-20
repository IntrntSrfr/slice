import { ChangeEvent, useEffect, useRef } from 'react'
import { Crop } from 'react-image-crop'
import { useAtom } from 'jotai'
import { sourceAtom } from '../store'
import Button from './Button'
import styles from './styles/ProfileListItem.module.css'

interface Props {
    id: string,
    name: string
    active: boolean
    rounded: boolean
    crop: Crop,
    onRename: (e: ChangeEvent<HTMLInputElement>) => void,
    onSelect: () => void,
    onDelete: () => void
}

const ProfileListItem = (props: Props) => {
    const [source,] = useAtom(sourceAtom)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!source || !canvasRef.current) return;
        let ctx = canvasRef.current.getContext('2d')
        if (!ctx) return;

        let img = source
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.width)
        ctx.drawImage(
            img,
            source.width * props.crop.x / 100,
            source.height * props.crop.y / 100,
            source.width * props.crop.width / 100,
            source.height * props.crop.height / 100,
            0, 0, ctx.canvas.width, ctx.canvas.height)
    }, [props.crop])

    return (
        <div className={`${styles.profile} ${props.active ? styles.active : ''}`}>
            <div className={styles.profileCrop}>
                <canvas
                    ref={canvasRef}
                    className={`${styles.profileCanvas} ${props.rounded ? styles.rounded : ''}`}
                    height="300"
                    width="300"
                />
                <input type="text" className={styles.profileName} value={props.name} onChange={props.onRename} />
            </div>
            <div className={styles.profileInfo}>
                <Button text='Select' variant={'blue'} onClick={props.onSelect} />
                <Button text='Delete' variant={'red'} onClick={props.onDelete} />
            </div>
        </div>
    )
}

export default ProfileListItem