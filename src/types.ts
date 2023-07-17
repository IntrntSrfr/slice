import { PercentCrop } from "react-image-crop";

export type Profile = {
    id: string
    name: string
    active: boolean
    crop?: PercentCrop
}

export type SliceFrame = {
    canvas?: OffscreenCanvas
    imageData: ImageData
    delay: number
    dims: { width: number; height: number; top: number; left: number }
}

export type BlobPair = {
    blob: Blob | null
    name: string
}

export type GifExportInit = {
    frames: SliceFrame[], 
    profiles: Profile[],
    transparent: boolean,
}

export type GifExportProgress = {
    evt: 'progress' | 'finished',
    progress: number,
    total: number,
    blobs?: BlobPair[]
}
