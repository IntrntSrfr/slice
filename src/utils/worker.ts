import { GifExportProgress, GifExportInit } from "../types";
import { generateGifs } from "./utils";

onmessage = async (e: MessageEvent<GifExportInit>) => {
    const totalFrames = e.data.frames.length * e.data.profiles.length;
    const blobs = await generateGifs(e.data.frames, e.data.profiles, e.data.transparent, (cur: number) => {
        self.postMessage({evt: 'progress', progress: cur, total: totalFrames} as GifExportProgress);
    });
    self.postMessage({evt: 'finished', progress: totalFrames, total: totalFrames, blobs: blobs} as GifExportProgress );
};
