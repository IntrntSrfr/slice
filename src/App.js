import React, {useRef, useState} from "react";

import ReactCrop from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';

import {v4 as uuidv4} from "uuid";

import UploadButton from "./UploadButton";
import ProfileManager from "./ProfileManager";

function App() {
    let [src, setSrc] = useState(null);
    let [selected, setSelected] = useState(0);
    //let [counter, setCounter] = useState(0);

    // profiles in form of [{id, selected crop, active, name}]
    let [profiles, setProfiles] = useState([]);

    const [crop, setCrop] = useState({unit: '%', width: 30, aspect: 1});
    const imgRef = useRef(null);

    function onSelectFile(e) {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () =>
                setSrc(reader.result)
            );
            reader.readAsDataURL(e.target.files[0]);
            setSelected(0);
            setProfiles([{
                id: uuidv4(),
                name: Math.round(Math.random() * 100),
                crop: {unit: '%', width: 30, aspect: 1},
                active: true
            }]);
            //setCounter(counter+1)
        }
    }

    function addProfile() {
        if (src) {
            let fc = profiles[profiles.length - 1].crop

            let p = [...profiles]
            p.forEach(prof => prof.active = false);
            setProfiles(p.concat({id: uuidv4(), name: Math.round(Math.random() * 100), crop: fc, active: true}));
            //console.log(profiles)
            //setCounter(counter+1)
            //setSelectedProfile(profiles.length)
            setSelected(profiles.length)
            //setActive(profiles.length)
        }
    }

    function resetProfiles() {
        if (src) {
            //setCounter(0);
            setProfiles([{id: uuidv4(), name: Math.round(Math.random() * 100), crop: crop, active: true}]);
            setSelected(0);
        }
    }

    function setSelectedProfile(id) {
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

    function setProfileName(id, e) {
        /*
        profiles.map(p => {
            if (p.id === id){
                p.name=e.target.value;
            }
        })
        */
        console.log(id)
        console.log(e.target.value)
    }

    function removeProfile(id) {
        console.log(id)
        if (profiles.length > 1) {
            setProfiles(profiles.filter(p => p.id !== id))
        }
    }

    function exportZip() {
        console.log(profiles)
        console.log('use this to export all crops in a zip folder')
    }

    function updateCrop(crop) {
        setCrop(crop)
        let p = [...profiles];
        p[selected].crop = crop;
        setProfiles(p);
    }

    return (
        <div>
            <div className={'pop-container'}>
                <UploadButton
                    onSelect={onSelectFile}
                />
            </div>
            {
                //imgRef.current &&
                <div className={'crop-container'}>
                    <ReactCrop
                        src={src}
                        crop={crop}
                        //onChange={c => setCrop(c)}
                        onChange={updateCrop}
                        ruleOfThirds
                        onImageLoaded={(img) => {
                            imgRef.current = img;
                            console.log(1200 / img.width)
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
                />
            }

        </div>
    )
}

export default App