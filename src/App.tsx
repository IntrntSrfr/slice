import { SyntheticEvent } from "react";

import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';

import Overlay from "./components/Overlay";
import Sidebar from "./components/Sidebar";

import './App.css'
import { loadingAtom, profilesAtom, sourceAtom } from "./store";
import { useAtom } from "jotai";
import { centerCropImage } from "./utils/utils";

const App = () => {
    const [profiles, setProfiles] = useAtom(profilesAtom)
    //const [crop, setCrop] = useState<Crop | undefined>(undefined);

    const activeProfile = () => {
        return profiles.find(p => p.active)
    }


    const setActiveProfile = (id: string) => {
        let p = [...profiles]
        p.forEach((prof) => {
            if (prof.id === id) {
                //setCrop(prof.crop);
                prof.active = true;
            } else {
                prof.active = false;
            }
        });
        setProfiles(p);
    }

    const removeProfile = (id: string) => {
        if (profiles.length > 1) {

            let foundIndex = profiles.findIndex(p => p.id === id)

            setProfiles(profiles.filter(p => p.id !== id))

            //setSelected(foundIndex === 0 ? 0 : foundIndex - 1)


            //setSelectedProfile(profiles[foundIndex===0?0:foundIndex-1].id)
            /*

                        let p = [...profiles]
                        p.forEach(prof => {
                            prof.active = prof.id === id;
                        });

            */

            // just fix this shit lol
            // this needs to make it so that when a profile is deleted, it will
            // automatically select the profile to the left of it, or the leftmost one if
            // theres no profiles to the left of it
            /*
                        setProfiles(p.filter(p => p.id !== id))
                        setSelected(foundIndex === 0 ? 0 : foundIndex-1)
                        */
        }
    }

    function updateCrop(_crop: Partial<Crop>, percentCrop: PercentCrop) {
        let p = [...profiles];
        let active = p.find(p => p.active)
        if (!active) return;
        active.crop = percentCrop
        setProfiles(p);
    }

    function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
        const crop = centerCropImage(e.currentTarget)
        updateCrop({}, crop)
        setLoading(false)
    }

    const [source, setSource] = useAtom(sourceAtom)
    const [loading, setLoading] = useAtom(loadingAtom)

    return (
        <>
            <Overlay active={loading}/>
            <div className="crop-container">
                {source &&
                    <ReactCrop
                        aspect={1}
                        minHeight={64}
                        minWidth={64}
                        crop={activeProfile()?.crop}
                        onChange={updateCrop}
                        ruleOfThirds
                        circularCrop
                        style={{maxHeight: 'inherit'}}
                        >
                            <img src={source.src} onLoad={onImageLoad} />
                    </ReactCrop>
                }
            </div>
            <Sidebar />
        </>
    )
}

export default App