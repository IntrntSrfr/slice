import { SliceFrame } from "@/types";
import { PercentCrop } from "react-image-crop";

export type BlobPair = {
    blob: Blob | null
    name: string
}

export type Profile = {
    id: string
    name: string
    active: boolean
    crop?: PercentCrop
}

type generateOptions = {
    transparent: boolean;
    circularCrop: boolean;
}

export type generateImageOptions = 
    & generateOptions
    & { transparent: boolean }

export type generateGifsOptions = 
    & generateOptions
    & { onProgress?: (current: number, total: number) => void }

export type generateGifOptions = 
    & generateOptions
    & { onProgress?: (current: number) => void }

export type GifExportInit = {
    frames: SliceFrame[], 
    profiles: Profile[],
    options: generateGifOptions
}

export type GifExportProgress = {
    evt: 'progress' | 'finished',
    progress: number,
    total: number,
    blobs?: BlobPair[]
}
