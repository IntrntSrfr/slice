import { atom } from "jotai";
import { Profile } from "./types";

export const sourceAtom = atom<HTMLImageElement | null>(null);
export const profilesAtom = atom<Profile[]>([]);
export const loadingAtom = atom<boolean>(false);
