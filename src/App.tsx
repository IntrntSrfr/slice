import React, {ChangeEvent, useRef, useState} from "react";

import ReactCrop, {Crop} from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';

import {v4 as uuidv4} from "uuid";

import UploadButton from "./UploadButton";
import ProfileManager from "./ProfileManager";
import {
    addProfile,
    onFileSelect,
    ProfileData,
    removeProfile,
    resetProfiles,
    setProfileName,
    setSelectedProfile
} from "./types";
function App() {
    let [src, setSrc] = useState<string | ArrayBuffer>();
    let [selected, setSelected] = useState(0);
    let [counter, setCounter] = useState(1);

    // profiles in form of [{id, selected crop, active, name}]
    let [profiles, setProfiles] = useState<ProfileData[]>([]);

    const [crop, setCrop] = useState<Crop>({unit: '%', width: 30, aspect: 1});
    const imgRef = useRef<HTMLImageElement | null>(null);

    const onSelectFile:onFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                    if (reader.result) {
                        setSrc(reader.result)
                    }
                }
            );
            reader.readAsDataURL(e.target.files[0]);
            setSelected(0);
            setProfiles([{
                id: uuidv4(),
                name: 1,
                crop: {unit: '%', width: 30, aspect: 1},
                active: true
            }]);
            setCounter(1)
        }
    }

    const addProfile:addProfile= () =>  {
        let fc = profiles[selected].crop

        let p = [...profiles]
        p.forEach(prof => prof.active = false);
        setProfiles(p.concat({id: uuidv4(), name: counter + 1, crop: fc, active: true}));
        setCounter(counter + 1)
        setSelected(profiles.length)
    }

    const resetProfiles:resetProfiles = () => {
        setCounter(1);
        setProfiles([{id: uuidv4(), name: 1, crop: crop, active: true}]);
        setSelected(0);
    }

    const setSelectedProfile:setSelectedProfile = (id: string) => {
        let p = [...profiles]
        p.forEach((prof, i) => {
            if (prof.id === id) {
                setSelected(i);
                setCrop(prof.crop);
                prof.active = true;
            } else {
                prof.active = false;
            }
        });
        setProfiles(p);
    }

    const setProfileName:setProfileName = (e, id) => {

        let profs = [...profiles]
        profs.forEach(p => {
            if (p.id === id) {
                p.name = e.target.value
            }
        })
        setProfiles(profs)
    }

    const removeProfile:removeProfile = (id: string) =>{
        if (profiles.length > 1) {

            let foundIndex = profiles.findIndex(p => p.id === id)

            setProfiles(profiles.filter(p => p.id !== id))

            setSelected(foundIndex === 0 ? 0 : foundIndex - 1)


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

    function updateCrop(crop: Crop)  {
        setCrop(crop)
        let p = [...profiles];
        if (!p[selected]) return
        p[selected].crop = crop;
        setProfiles(p);
    }

    return (
        <div id={'main'}>
            <div className={'header-container'}>
                <UploadButton
                    onSelect={onSelectFile}
                />
            </div>
            {
                //imgRef.current &&
                <div className={'crop-container'}>
                    <ReactCrop
                        src={(src as string)}
                        crop={crop}
                        onChange={(c: Crop) => setCrop(c)}
                        //onChange={updateCrop}
                        ruleOfThirds
                        onImageLoaded={(img) => {
                            imgRef.current = img;
                        }}
                        onComplete={updateCrop}
                    />
                </div>
            }
            {
                src &&
                <ProfileManager
                    imgRef={imgRef}
                    profiles={profiles}
                    removeProfile={removeProfile}
                    newProfile={addProfile}
                    resetProfiles={resetProfiles}
                    setSelectedProfile={setSelectedProfile}
                    setProfileName={setProfileName}
                />
            }
        </div>
    )
}

export default App