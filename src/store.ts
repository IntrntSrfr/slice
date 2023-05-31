import { atom } from 'jotai';
import { type Profile } from './types';
import { ParsedGif, type ParsedFrame } from 'gifuct-js';

export const sourceAtom = atom<HTMLImageElement | null>(null);
export const gifAtom = atom<ParsedGif | null>(null);
export const framesAtom = atom<ParsedFrame[] | null>(null);
export const profilesAtom = atom<Profile[]>([]);
export const loadingAtom = atom<boolean>(false);
