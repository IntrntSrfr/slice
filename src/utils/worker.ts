import { GifExportProgress, GifExportInit } from "../types";
import { generateGifs } from "./utils";

onmessage = async (e: MessageEvent<GifExportInit>) => {
    const blobs = await generateGifs(e.data.frames, e.data.profiles, (cur: number) => {
        self.postMessage({evt: 'progress', progress: cur} as GifExportProgress);
    });
    self.postMessage({evt: 'finished', progress: 100, blobs: blobs} as GifExportProgress );
};
