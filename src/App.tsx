import { SyntheticEvent, useEffect, useRef } from "react";

import './App.css';
import Overlay from "./components/Overlay";
import Sidebar from "./components/Sidebar";
import Dropzone from "./components/Dropzone";
import AppProgressBar from "./components/AppProgressBar";

import { centerCropImage } from "./utils/crop";
import { expandFrames } from "./utils/gif";
import { defaultProfile, framesAtom, gifAtom, mediaTypeAtom, overlayAtom, profilesAtom, sourceAtom } from "./store";

import { useAtom } from "jotai";
import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';
import { parseGIF, decompressFrames } from "gifuct-js";

const App = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom);
    const [source, setSource] = useAtom(sourceAtom);
    const [overlay, setOverlay] = useAtom(overlayAtom);
    const [, setGif] = useAtom(gifAtom);
    const [, setMediaType] = useAtom(mediaTypeAtom);
    const [, setFrames] = useAtom(framesAtom);
    
    const containerRef = useRef<HTMLDivElement>(null);

    const activeProfile = () => {
        return profiles.find(p => p.active);
    };

    const updateCrop = (_crop: Partial<Crop>, percentCrop: PercentCrop) => {
        if (!percentCrop.height || !percentCrop.width) return;
        const ap = activeProfile();
        if (!ap) return;
        setProfiles(profiles.map(p => p.id === ap.id 
            ? {...p, crop: percentCrop}
            : p
        ));
    };

    const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
        const crop = centerCropImage(e.currentTarget);
        updateCrop({}, crop);
    };

    useEffect(() => {
        if(!containerRef.current) return;
        const refCopy = containerRef.current;

        const weed = (f: DragEvent) => {
            f.preventDefault();
            console.log(f);
        };

        refCopy.addEventListener('drop', weed);
        return () => refCopy?.removeEventListener('drop', weed);
    }, []);

    const readFile = async (fr: FileReader, f: File, t: 'DataURL' | 'ArrayBuffer') => {
        return await new Promise<ArrayBuffer | string | null>((res, rej) => {
            fr.onprogress = (ev) => {
                if(ev.lengthComputable){
                    updateOverlay(ev.loaded, ev.total, t === 'DataURL' ? 'media' : 'frames');
                    console.log(JSON.stringify(ev));
                }
            };
            fr.onload = () => { res(fr.result); };
            fr.onerror = () => { rej(fr.error); };
            if (t === 'DataURL')
                fr.readAsDataURL(f);
            else if (t === 'ArrayBuffer')
                fr.readAsArrayBuffer(f); 
        });
    };

    const resetSources = () => {
        setSource(null);
        setGif(null);
        setFrames(null);
        setProfiles([defaultProfile()]);
        setMediaType('');
    };

    const updateOverlay = (cur: number, max: number, label: 'media' | 'frames') => {
        setOverlay({ content: <AppProgressBar text={`Loading ${label}`} current={cur} max={max}/> });
    };

    const uploadImage = async (file: File) => {
        resetSources();
        const fileType = file.type;
        setMediaType(fileType);
        updateOverlay(0, 10, 'media');
        
        const readerDataURL = new FileReader();
        const readerArrayBuffer = new FileReader();
        try {
            const resDataURL = await readFile(readerDataURL, file, 'DataURL');
            const img = new Image();
            img.src = resDataURL as string;
            setSource(img);
            if (fileType === 'image/gif') {
                updateOverlay(0, 10, 'frames');
                const resArrayBuffer = await readFile(readerArrayBuffer, file, 'ArrayBuffer');
                const buf = resArrayBuffer as ArrayBuffer;
                const gif = parseGIF(buf);
                const frames = decompressFrames(gif, true);
                setGif(gif);
                setFrames(expandFrames(gif, frames));
            }
        } catch (err: unknown) {
            console.log(err);
        } finally {
            setOverlay({ content: null });
        }
    };

    return (
        <>
            <Overlay active={!!overlay.content}>
                {overlay.content}
            </Overlay>
            <Dropzone onUpload={uploadImage}/>
            <div className="crop-container">
                {
                    source &&
                    <ReactCrop
                        aspect={1}
                        minHeight={32}
                        minWidth={32}
                        crop={activeProfile()?.crop}
                        onChange={updateCrop}
                        ruleOfThirds
                        circularCrop
                        style={{ maxHeight: 'inherit', userSelect: 'none' }}
                    >
                        <img src={source.src} onLoad={onImageLoad} />
                    </ReactCrop>
                }
            </div>
            <Sidebar onUpload={uploadImage}/>
        </>
    );
};

export default App;
