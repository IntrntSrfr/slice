import { SyntheticEvent } from "react";

import './App.css';
import Overlay from "./components/Overlay";
import Sidebar, { SidebarHeader } from "./components/Sidebar";
import Dropzone from "./components/Dropzone";
import ProgressBar from "./components/ProgressBar";

import { centerCropImage } from "./utils/crop";
import { expandFrames } from "./utils/gif";

import { useReducerAtom } from 'jotai/utils';
import { profilesAtom, profilesReducer } from "./store/profiles";
import { overlayAtom, overlayReducer } from "./store/overlay";
import { mediaAtom, mediaReducer } from "./store/media";

import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';
import { parseGIF, decompressFrames } from "gifuct-js";
import ProfileList from "./features/profiles/ProfileList";
import UploadButton from "./components/UploadButton";

const App = () => {
    const [profiles, dispatchProfiles] = useReducerAtom(profilesAtom, profilesReducer);
    const [overlay, dispatchOverlay] = useReducerAtom(overlayAtom, overlayReducer );
    const [media, dispatchMedia] = useReducerAtom(mediaAtom, mediaReducer);
    
    const activeProfile = () => {
        return profiles.find(p => p.active);
    };

    const updateCrop = (_crop: Partial<Crop>, percentCrop: PercentCrop) => {
        if (!percentCrop.height || !percentCrop.width) return;
        const ap = activeProfile();
        if (!ap) return;
        dispatchProfiles({type: 'set_crop', id: ap.id, crop: percentCrop});
    };

    const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
        const crop = centerCropImage(e.currentTarget);
        updateCrop({}, crop);
    };
    
    type ProgressCallback = (current: number, total: number) => void;
    const readFile = (file: File, type: 'DataURL' | 'ArrayBuffer', onProgress?: ProgressCallback): Promise<string | ArrayBuffer | null> => {
        return new Promise<ArrayBuffer | string | null>((res, rej) => {
            const fr = new FileReader();
            fr.onprogress = (ev) => {
                if(ev.lengthComputable)
                    onProgress?.(ev.loaded, ev.total);
            };
            fr.onload = () => { res(fr.result); };
            fr.onerror = () => { rej(fr.error); };
            switch(type){
                case "DataURL":
                    fr.readAsDataURL(file);
                    break;
                case "ArrayBuffer":
                    fr.readAsArrayBuffer(file); 
                    break;
            }
        });
    };
    
    const resetSources = () => {
        dispatchMedia({type: 'reset'});
        dispatchProfiles({type: 'reset'});
    };

    const updateOverlay = (cur: number, max: number, label?: 'media' | 'frames') => {
        dispatchOverlay({type: 'set', content: <ProgressBar text={`Loading ${label}`} current={cur} max={max}/> });
    };

    const uploadImage = async (file: File) => {
        resetSources();
        const fileType = file.type;
        updateOverlay(0, 10, 'media');
        dispatchMedia({type: 'setMediaType', mediaType: fileType});
        dispatchMedia({type: 'setLoading', isLoading: true});
        
        try {
            const resDataURL = await readFile(file, 'DataURL', (cur, max) => dispatchOverlay({type: 'set', content: <ProgressBar text={`Loading image`} current={cur} max={max}/> }));
            const img = new Image();
            img.src = resDataURL as string;
            dispatchMedia({type: 'setSource', source: img});
            if (fileType === 'image/gif') {
                updateOverlay(0, 10, 'frames');
                const resArrayBuffer = await readFile(file, 'ArrayBuffer', (cur, max) => dispatchOverlay({type: 'set', content: <ProgressBar text={`Loading frames`} current={cur} max={max}/> }));
                const buf = resArrayBuffer as ArrayBuffer;
                const gif = parseGIF(buf);
                const frames = decompressFrames(gif, true);
                dispatchMedia({type: 'setGif', gif});
                dispatchMedia({type: 'setFrames', frames: expandFrames(gif, frames)});
            }
        } catch (err: unknown) {
            console.log(err);
        } finally {
            dispatchMedia({type: 'setLoading', isLoading: false});
            dispatchOverlay({type: 'set', content: null});
        }
    };
    
    return (
        <>
            <Overlay active={!!overlay}>
                {overlay}
            </Overlay>
            {
                !media.isLoading && 
                <Dropzone onUpload={uploadImage}/>
            }
            <div className="crop-container">
                {
                    media.source && !media.isLoading &&
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
                        <img src={media.source.src} onLoad={onImageLoad} />
                    </ReactCrop>
                }
            </div>
            <Sidebar>
                <SidebarHeader>
                    <UploadButton onUpload={uploadImage}/>
                </SidebarHeader>
                <ProfileList/>
            </Sidebar>
        </>
    );
};

export default App;
