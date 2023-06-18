import { atom } from "jotai";
import { SliceFrame, Profile } from "./types";
import { ParsedGif } from "gifuct-js";
import { v4 } from "uuid";


export const sourceAtom = atom<HTMLImageElement | null>(null);
export const gifAtom = atom<ParsedGif | null>(null);
export const mediaTypeAtom = atom<string>('');
export const framesAtom = atom<SliceFrame[] | null>(null);

export const defaultProfile = (): Profile => {
    return { id: v4(), name: 'New profile', crop: null, active: true };
};

export const profilesAtom = atom<Profile[]>([]);

type Overlay = {
    isVisible: boolean
    content?: React.ReactNode
}

export const overlayAtom = atom<Overlay>({isVisible: false, content: null});
