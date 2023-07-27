import { GifExportProgress, GifExportInit, BlobPair } from "./types";
import { generateGif } from "./export";

onmessage = async (e: MessageEvent<GifExportInit>) => {
    const totalFrames = e.data.frames.length * e.data.profiles.length;

    const onProgress = (cur: number) => {
        self.postMessage({evt: 'progress', progress: cur, total: totalFrames} as GifExportProgress);
    };

    const blobs: BlobPair[] = [];
    for (const profile of e.data.profiles) {
        const blob = generateGif(e.data.frames, profile, {...e.data.options, onProgress});
        const name = (profile.name || profile.id).trim(); 
        blobs.push({blob, name});
    }
    self.postMessage({evt: 'finished', progress: totalFrames, total: totalFrames, blobs: blobs} as GifExportProgress );
};
