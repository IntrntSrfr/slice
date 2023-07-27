import { atom } from "jotai";
import { v4 } from "uuid";
import { PercentCrop } from "react-image-crop";
import { Profile } from "@/features/profiles/types";

const defaultProfile = (): Profile => ({ id: v4(), name: 'New profile', active: true });

export const profilesAtom = atom<Profile[]>([defaultProfile()]);

type Action = 
    | {type: 'add'}
    | {type: 'remove', id: string}
    | {type: 'reset', crop?: PercentCrop}
    | {type: 'rename', id: string, name: string}
    | {type: 'set_active', id: string}
    | {type: 'set_crop', id: string, crop: PercentCrop}

export const profilesReducer = (profiles: Profile[], action: Action): Profile[] => {
    switch(action.type){
        case "add":{
            const ap = profiles.find(p => p.active);
            if (!ap) return profiles;
            const newProfile: Profile = { id: v4(), name: 'New profile', crop: ap.crop, active: true };
            return [newProfile].concat(profiles.map(p => ({...p, active: false})));
        }
        case "remove":{
            const newProfs = profiles.filter(p => p.id !== action.id);
            const deletedProf = profiles.find(p => p.id === action.id);
            if(deletedProf?.active){
                const index = profiles.findIndex(p => p.id === action.id);
                const newActiveIndex = index === newProfs.length ? index - 1 : index;
                newProfs[newActiveIndex].active = true;
            }
            return newProfs;
        }
        case "reset":{
            return [{...defaultProfile(), crop: action.crop}];
        }
        case "rename":{
            return profiles.map(p => p.id === action.id 
                ? {...p, name: action.name}
                : p
            );
        }
        case "set_active":{
            return profiles.map(p => p.id === action.id 
                ? {...p, active: true} 
                : {...p, active: false}
            );
        }
        case "set_crop":{
            return profiles.map(p => p.id === action.id 
                ? {...p, crop: action.crop}
                : p
            );
        }
        default: 
            return profiles;
    }
};
