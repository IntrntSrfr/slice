import { SyntheticEvent } from "react";

import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';

import Overlay from "./components/Overlay";
import Sidebar from "./components/Sidebar";

import './App.css';
import { overlayAtom, profilesAtom, sourceAtom } from "./store";
import { useAtom } from "jotai";
import { centerCropImage } from "./utils/crop";

const App = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom);
    const [source,] = useAtom(sourceAtom);
    const [overlay,] = useAtom(overlayAtom);

    const activeProfile = () => {
        return profiles.find(p => p.active);
    };

    function updateCrop(_crop: Partial<Crop>, percentCrop: PercentCrop) {
        if (!percentCrop.height || !percentCrop.width) return;
        const ap = activeProfile();
        if (!ap) return;
        setProfiles(profiles.map(p => p.id === ap.id 
            ? {...p, crop: percentCrop}
            : p
        ));
    }

    function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
        const crop = centerCropImage(e.currentTarget);
        updateCrop({}, crop);
    }

    return (
        <>
            <Overlay active={!!overlay.content}>
                {overlay.content}
            </Overlay>
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
            <Sidebar />
        </>
    );
};

export default App;
