import { ParsedGif } from "gifuct-js";
import { atom } from "jotai";
import { SliceFrame } from "../types";

interface Media {
    source: HTMLImageElement | null;
    mediaType: string;
    gif: ParsedGif | null;
    frames: SliceFrame[] | null;
    isLoading: boolean
}

const initialState: Media = {
    source: null, 
    mediaType: '', 
    gif: null, 
    frames: null,
    isLoading: false,
};

export const mediaAtom = atom<Media>(initialState);

type Action = 
    | {type: 'setSource', source: HTMLImageElement | null}
    | {type: 'setMediaType', mediaType: string}
    | {type: 'setGif', gif: ParsedGif | null}
    | {type: 'setFrames', frames: SliceFrame[] | null}
    | {type: 'setLoading', isLoading: boolean}
    | {type: 'reset'}

export const mediaReducer = (media: Media, action: Action) => {
    switch(action.type) {
        case "setSource":{
            return {...media, source: action.source};
        }
        case "setMediaType":{
            return {...media, mediaType: action.mediaType};
        }
        case "setGif":{
            return {...media, gif: action.gif};
        }
        case "setFrames":{
            return {...media, frames: action.frames};
        }
        case "setLoading":{
            return {...media, isLoading: action.isLoading};
        }
        case "reset": {
            return initialState;
        }
        default: 
            return media;
    }
};
