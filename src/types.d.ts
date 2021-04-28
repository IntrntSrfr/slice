import {Crop} from "react-image-crop";
import {ChangeEvent} from "react";

interface ProfileData {
    id: string
    name: string | number
    crop: Crop
    active: boolean
}

type addProfile = () => void;
type newProfile = () => void;
type removeProfile = (id: string) => void;
type setProfileName = (e: ChangeEvent<HTMLInputElement>, id: string) => void;
type setSelectedProfile = (id: string) => void;
type resetProfiles = () => void;
type onFileSelect = (e: ChangeEvent<HTMLInputElement>) => void