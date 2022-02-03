import React, {useRef, useState} from "react";

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

import logo from './assets/slice_small.png'

function App() {
    let [src, setSrc] = useState<string | ArrayBuffer>();
    let [selected, setSelected] = useState(0);
    let [counter, setCounter] = useState(1);

    // profiles in form of [{id, selected crop, active, name}]
    let [profiles, setProfiles] = useState<ProfileData[]>([]);

    const [crop, setCrop] = useState<Crop>({unit: '%', width: 30, aspect: 1});
    const imgRef = useRef<HTMLImageElement | null>(null);

    const onSelectFile: onFileSelect = (e) => {
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
                name: 'Profile 1',
                crop: {unit: '%', width: 30, aspect: 1},
                active: true
            }]);
            setCounter(1);

        }
    }

    const addProfile: addProfile = () => {
        let fc = profiles[selected].crop

        let p = [...profiles]
        let newProfile = {id: uuidv4(), name: `Profile ${counter + 1}`, crop: fc, active: true}
        p.forEach(prof => prof.active = false);
        setProfiles([newProfile, ...p]);
        setCounter(counter + 1)
        setSelected(0)
    }

    const resetProfiles: resetProfiles = () => {
        setCounter(1);
        setProfiles([{id: uuidv4(), name: 'Profile 1', crop: crop, active: true}]);
        setSelected(0);
    }

    const setSelectedProfile: setSelectedProfile = (id: string) => {
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

    const setProfileName: setProfileName = (e, id) => {

        let profs = [...profiles]
        profs.forEach(p => {
            if (p.id === id) {
                p.name = e.target.value
            }
        })
        setProfiles(profs)
    }

    const removeProfile: removeProfile = (id: string) => {
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

    function updateCrop(crop: Crop) {
        console.log(crop)
        setCrop(crop)
        let p = [...profiles];
        if (!p[selected]) return
        p[selected].crop = crop;
        setProfiles(p);
    }

    return (
        <div className={'main'}>
            <div className={'crop-container'}>
                <ReactCrop
                    minHeight={25}
                    minWidth={25}
                    src={(src as string)}
                    crop={crop}
                    //onChange={(c: Crop) => setCrop(c)}
                    onChange={updateCrop}
                    ruleOfThirds
                    circularCrop={true}
                    onImageLoaded={(img) => {
                        imgRef.current = img;
                    }}
                    onComplete={updateCrop}
                />
            </div>
            <div className={'control-panel'}>
                <div className={'header'}>
                    <UploadButton
                        onSelect={onSelectFile}
                    />
                    <img src={logo} alt={'logo'}/>
                </div>
                <ProfileManager
                    src={src as string}
                    imgRef={imgRef}
                    profiles={profiles}
                    removeProfile={removeProfile}
                    newProfile={addProfile}
                    resetProfiles={resetProfiles}
                    setSelectedProfile={setSelectedProfile}
                    setProfileName={setProfileName}
                />
                <div className={"footer"}>
                    <div className={"btn-group"}>
                        <a  className={'btn btn-small'} href={'https://paypal.me/intrntsrfr'} target={'_blank'} rel="noreferrer">Donate</a>
                        <a  className={'btn btn-small'} href={'https://github.com/intrntsrfr/slice'} target={'_blank'} rel="noreferrer">Github</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App