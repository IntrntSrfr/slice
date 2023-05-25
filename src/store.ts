import { atom } from "jotai";
import { Profile } from "./types";
import { ParsedGif } from "gifuct-js";

export const sourceAtom = atom<HTMLImageElement | null>(null)
export const gifAtom = atom<ParsedGif | null>(null)
export const profilesAtom = atom<Profile[]>([])
export const loadingAtom = atom<boolean>(false)
