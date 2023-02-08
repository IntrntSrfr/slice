import { useAtom } from 'jotai'
import React, { useEffect, useRef } from 'react'
import { Crop } from 'react-image-crop'
import { sourceAtom } from '../store'
import styles from './styles/ProfileListItem.module.css'

interface Props {
    name: string
    active: boolean
    rounded: boolean
    crop: Crop
}

const ProfileListItem = (props: Props) => {
    const [source,] = useAtom(sourceAtom)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!source || !canvasRef.current) return;
        let ctx = canvasRef.current.getContext('2d')
        if (!ctx) return;

        let img = source
        ctx.drawImage(
            img, 
            source.width * props.crop.x/ 100, 
            source.height * props.crop.y / 100, 
            source.width * props.crop.width / 100, 
            source.height * props.crop.height / 100, 
            0, 0, canvasRef.current.width, canvasRef.current.height)
    }, [props.crop])

    return (
        <div className={`${styles.profile} ${props.active ? 'active' : ''}`}>
            <div className={styles.profileCrop}>
                <canvas
                    ref={canvasRef}
                    className={`${styles.profileCanvas} ${props.rounded ? 'rounded' : ''}`}
                    height="300"
                    width="300"
                />
            </div>
            <div className={styles.profileInfo}>
                <input type="text" className={styles.profileName} value="name" readOnly/>
            </div>
        </div>
    )
}

//{/* <!--<img v-if="image" :src="image" alt="" :className="{ rounded: rounded }">--> */}

export default ProfileListItem