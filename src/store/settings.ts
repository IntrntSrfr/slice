import { atom } from "jotai";

interface Settings {
    performanceMode: boolean;
    exportTransparency: boolean;
    previewsRound: boolean;
    previewsMini: boolean;
}

const initialState: Settings = {
    performanceMode: false,
    exportTransparency: false,
    previewsRound: false,
    previewsMini: false,
};

export const settingsAtom = atom<Settings>(initialState);

type Action = 
    | {type: 'setPerformanceMode', value: boolean}
    | {type: 'setExportTransparency', value: boolean}
    | {type: 'setPreviewsRound', value: boolean}
    | {type: 'setPreviewsMini', value: boolean}

export const settingsReducer = (settings: Settings, action: Action): Settings => {
    switch(action.type) {
        case 'setPerformanceMode':
            return {...settings, performanceMode: action.value};
        case "setExportTransparency":
            return {...settings, exportTransparency: action.value};
        case "setPreviewsRound":
            return {...settings, previewsRound: action.value};
        case "setPreviewsMini":
            return {...settings, previewsMini: action.value};
        default: 
            return settings;
    }
};
