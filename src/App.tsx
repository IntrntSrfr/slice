import { SyntheticEvent } from "react";

import './App.css';
import Overlay from "./components/Overlay";
import Sidebar, { SidebarHeader } from "./components/Sidebar";
import Dropzone from "./components/Dropzone";
import ProgressBar from "./components/ProgressBar";
import UploadButton from "./components/UploadButton";
import ProfileList from "./features/profiles/ProfileList";

import { centerCropImage } from "./utils/crop";
import { expandFrames, readFile } from "./utils/read";

import { useReducerAtom } from 'jotai/utils';
import { profilesAtom, profilesReducer } from "./store/profiles";
import { overlayAtom, overlayReducer } from "./store/overlay";
import { mediaAtom, mediaReducer } from "./store/media";

import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';
import { parseGIF, decompressFrames } from "gifuct-js";

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
    
    const resetSources = () => {
        dispatchMedia({type: 'reset'});
        dispatchProfiles({type: 'reset'});
    };

    const updateOverlay = (cur: number, max: number, label?: string) => {
        dispatchOverlay({type: 'set', content: <ProgressBar text={`Loading ${label}`} current={cur} max={max}/> });
    };

    const uploadImage = async (file: File) => {
        resetSources();
        const fileType = file.type;
        updateOverlay(0, 10, 'image');
        dispatchMedia({type: 'setMediaType', mediaType: fileType});
        dispatchMedia({type: 'setLoading', isLoading: true});
        
        try {
            const resDataURL = await readFile(file, 'DataURL', {onProgress: (c, t) => updateOverlay(c, t, 'image')});
            const img = new Image();
            img.src = resDataURL as string;
            dispatchMedia({type: 'setSource', source: img});
            if (fileType === 'image/gif') {
                updateOverlay(0, 10, 'frames');
                const resArrayBuffer = await readFile(file, 'ArrayBuffer', {onProgress: (c, t) => updateOverlay(c,t, 'data')}) as ArrayBuffer;
                const gif = parseGIF(resArrayBuffer);
                const frames = decompressFrames(gif, true);
                dispatchMedia({type: 'setGif', gif});
                dispatchMedia({type: 'setFrames', frames: expandFrames(gif, frames, (c, t) => updateOverlay(c,t, 'frames'))});
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
