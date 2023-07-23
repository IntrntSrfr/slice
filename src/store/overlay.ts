import { atom } from "jotai";
import { ReactNode } from "react";

export const overlayAtom = atom<ReactNode>(null);

type Action = 
    | {type: 'set', content: ReactNode}

export const overlayReducer = (content: ReactNode, action: Action) => {
    switch(action.type){
        case 'set': {
            return action.content;
        }
        default: 
            return content;
    }
};
