import { SyntheticEvent } from "react";

import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';

import Overlay from "./components/Overlay";
import Sidebar from "./components/Sidebar";

import './App.css';
import { loadingAtom, profilesAtom, sourceAtom } from "./store";
import { useAtom } from "jotai";
import { centerCropImage } from "./utils/utils";

const App = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom);
    const [source,] = useAtom(sourceAtom);
    const [loading,] = useAtom(loadingAtom);

    const activeProfile = () => {
        return profiles.find(p => p.active);
    };

    function updateCrop(_crop: Partial<Crop>, percentCrop: PercentCrop) {
        if (!percentCrop.height || !percentCrop.width) return;
        const p = [...profiles];
        const active = p.find(p => p.active);
        if (!active) return;
        active.crop = percentCrop;
        setProfiles(p);
    }

    function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
        const crop = centerCropImage(e.currentTarget);
        updateCrop({}, crop);
    }

    return (
        <>
            <Overlay active={loading} />
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
                        style={{ maxHeight: 'inherit' }}
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