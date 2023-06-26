import { Crop } from "react-image-crop";

type Profile = {
    id: string
    name: string
    active: boolean
    crop: Partial<Omit<Crop>>
}

type SliceFrame = {
    canvas?: OffscreenCanvas
    imageData: ImageData
    delay: number
    dims: { width: number; height: number; top: number; left: number }
}

type BlobPair = {
    blob: Blob | null
    name: string
}

type GifExportInit = {
    frames: SliceFrame[], 
    profiles: Profile[],
}

type GifExportProgress = {
    evt: 'progress' | 'finished',
    progress:number,
    blobs?: BlobPair[]
}