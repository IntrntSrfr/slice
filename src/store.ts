import { atom } from "jotai";
import { SliceFrame, Profile } from "./types";
import { ParsedGif } from "gifuct-js";
import { v4 } from "uuid";
import {ReactNode} from "react";

export const sourceAtom = atom<HTMLImageElement | null>(null);
export const gifAtom = atom<ParsedGif | null>(null);
export const mediaTypeAtom = atom<string>('');
export const framesAtom = atom<SliceFrame[] | null>(null);

export const defaultProfile = (): Profile => {
    return { id: v4(), name: 'New profile', active: true };
};

export const profilesAtom = atom<Profile[]>([]);

type Overlay = {
    content?: ReactNode
}

export const overlayAtom = atom<Overlay>({content: null});
