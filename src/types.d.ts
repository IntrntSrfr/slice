import { Crop } from "react-image-crop";

type Profile = {
    id: string
    name: string
    active: boolean
    crop: Partial<Omit<Crop>>
}

type SliceFrame = {
    canvas: HTMLCanvasElement
    delay: number
    dims: { width: number; height: number; top: number; left: number }
}