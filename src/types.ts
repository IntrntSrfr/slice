export type SliceFrame = {
    canvas?: OffscreenCanvas
    imageData: ImageData
    delay: number
    dims: { width: number; height: number; top: number; left: number }
}
