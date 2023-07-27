import { useEffect, useRef, useState } from "react";

import styles from './styles/ProfileList.module.css';
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import ProfileListItem from "./ProfileListItem";
import ProgressBar from "@/components/ProgressBar";

import { useReducerAtom } from 'jotai/utils';
import { profilesAtom, profilesReducer } from "@/store/profiles";
import { overlayAtom, overlayReducer } from "@/store/overlay";
import { mediaAtom, mediaReducer } from "@/store/media";
import { settingsAtom, settingsReducer } from "@/store/settings";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackwardStep, faCog, faFileExport, faForwardStep, faPause, faPlay, faPlus, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { centerCropImage } from "@/utils/crop";
import { generateImages, generateGifs, generateZipFile } from "./export";
import { BlobPair } from "./types";
import saveAs from "file-saver";

const ProfileList = () => {
    const [profiles, dispatchProfiles] = useReducerAtom(profilesAtom, profilesReducer);
    const [, dispatchOverlay] = useReducerAtom(overlayAtom, overlayReducer );
    const [media,] = useReducerAtom(mediaAtom, mediaReducer);
    const [settings, dispatchSettings] = useReducerAtom(settingsAtom, settingsReducer);
    
    const [roundedPreview, setRoundedPreview] = useState(false);
    const [roundedCrop, setRoundedCrop] = useState(false);
    const [smallPreviews, setSmallPreviews] = useState(true);
    const [transparent, setTransparent] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [frameIndex, setFrameIndex] = useState(-1);

    const profileListRef = useRef<HTMLDivElement>(null);

    const toggleRoundPreview = () => setRoundedPreview(o => !o);
    const toggleRoundCrop = () => setRoundedCrop(o => !o);
    const toggleSmallPreviews = () => setSmallPreviews(o => !o);
    const toggleTransparent = () => setTransparent(o => !o);
    const toggleShowSettings = () => setShowSettings(o => !o);

    useEffect(() => {
        if (!roundedCrop && transparent && media.mediaType !== 'image/gif')
            setTransparent(false);
    }, [roundedCrop, transparent, media.mediaType]);

    /**
     * adds new profile and scrolls to top of profile list
     * 
     * @returns 
     */
    const handleAddProfile = () => {
        dispatchProfiles({type: 'add'});
        if (!profileListRef.current) return;
        profileListRef.current.scrollTo({top:0, behavior:'smooth'});
    };

    /**
     * removes a profile based on an ID. If the removed profile was
     * active, it sets the closest profile as active.
     * 
     * @param id item ID
     * @returns 
     */
    const removeProfile = (id: string) => {
        if (profiles.length <= 1) return;
        dispatchProfiles({type: 'remove', id});
    };

    /**
     * resets the profile list back to one single profile
     * with a center crop.
     * 
     * @returns 
     */
    const resetProfiles = () => {
        if (!media.source || profiles.length <= 1) return;
        const ok = confirm('Resetting will remove all your current profiles. Are you sure?');
        if(!ok) return;
        const crop = centerCropImage(media.source);
        dispatchProfiles({type: 'reset', crop});
    };


    const handleFrameChange = (direction: 'next' | 'previous') => {
        const frameLength = media.frames?.length;
        if(!frameLength) return;
        switch(direction){
            case "next":
                setFrameIndex(prev => (((prev + 1) % frameLength) + frameLength) % frameLength);
                break;
            case "previous":
                setFrameIndex(prev => (((prev - 1) % frameLength) + frameLength) % frameLength);
                break;
        }
    };
    
    useEffect(() => {
        const frameLength = media.frames?.length;
        if(!frameLength || settings.performanceMode) return;

        let timeoutId: string | number | NodeJS.Timeout | undefined = undefined;
        const advanceFrame = (index: number) => {
            if(!media.frames || media.mediaType !== 'image/gif' || isPaused) return;
            setFrameIndex(index);
            timeoutId = setTimeout(() => advanceFrame((index + 1) % frameLength), media.frames[index].delay);
        };
        
        advanceFrame(frameIndex < 0 ? 0 : frameIndex);
        return () => clearTimeout(timeoutId);
    }, [media, settings.performanceMode, isPaused, frameIndex]);
    
    const currentImage = () => {
        if(media.frames && frameIndex >= 0 && frameIndex < media.frames.length) 
            return media.frames[frameIndex].canvas || null;
        else if ((media.mediaType === 'image/jpeg' || media.mediaType === 'image/png') && media.source) 
            return media.source;
        return null;
    };

    const updateOverlay = (cur: number, max: number) => {
        dispatchOverlay({type: 'set', content: <ProgressBar text="Exporting" current={cur} max={max} /> });
    };

    const exportProfiles = async () => {
        try {
            let blobs: BlobPair[] | null = null;
            if (media.mediaType === 'image/jpeg' || media.mediaType === 'image/png') {
                if(!media.source) throw new Error('source must be available');
                blobs = await generateImages(media.source, profiles, {
                    circularCrop: roundedCrop, 
                    transparent,
                });
            } else if (media.mediaType === 'image/gif') {
                if(!media.frames?.length) throw new Error('frames cannot be null or be empty');
                updateOverlay(0, 10);
                blobs = await generateGifs(media.frames, profiles, {
                    circularCrop: roundedCrop,
                    transparent,
                    onProgress: (cur, max) => updateOverlay(cur, max)
                });
            } else throw new Error('no compatible filetype found');
            if(!blobs) throw new Error('no files could be generated');
            const zipped = await generateZipFile(blobs, media.mediaType);
            saveAs(zipped, 'profiles.zip');
        } catch (error) {
            console.error(error, 'could not generate files');
        } finally {
            dispatchOverlay({type: 'set', content: null});
        }
    };

    if (!media.source || media.isLoading) return (
        <div className={styles.profileList}></div>
    );
    
    return (
        <div className={styles.profileList}>
            <div className={styles.profileListInner}>
                <Header onAdd={handleAddProfile} onReset={resetProfiles} />
                <div ref={profileListRef} className={styles.profiles}>
                    {profiles.map((p, i) => (
                        p.crop ? 
                        <ProfileListItem key={i}
                            profile={p}
                            image={currentImage()}
                            rounded={roundedPreview}
                            smallPreviews={smallPreviews}
                            onlyProfile={profiles.length <= 1}
                            onRename={(e) => dispatchProfiles({type:'rename', id: p.id, name: e.target.value})}
                            onSelect={() => dispatchProfiles({type: 'set_active', id: p.id})}
                            onDelete={() => removeProfile(p.id)} />
                        : null
                    ))}
                </div>
                {
                    media.mediaType === 'image/gif' &&
                    <MediaButtons
                        isPaused={isPaused}
                        canPlay={!settings.performanceMode}
                        onNext={() => handleFrameChange('next')}
                        onTogglePlay={() => setIsPaused(prev => !prev)}
                        onPrev={() => handleFrameChange('previous')}
                    />
                }
                <div className={`${styles.settings} ${showSettings?styles.active:''}`}>
                    <div className={styles.settingsSection}>
                        <h4 className={styles.settingsSectionTitle}>Previews</h4>
                        <div className={styles.settingsSectionBody}>
                            <Checkbox checked={roundedPreview} label="Circular previews" onChange={toggleRoundPreview} />
                            <Checkbox checked={smallPreviews} label="Mini previews" onChange={toggleSmallPreviews} />
                            <Checkbox checked={settings.performanceMode} label="Performance mode" onChange={() => dispatchSettings({type:'setPerformanceMode', value: !settings.performanceMode})} />
                        </div>
                    </div>
                    <div className={styles.settingsSection}>
                        <h4 className={styles.settingsSectionTitle}>Export</h4>
                        <div className={styles.settingsSectionBody}>
                            <Checkbox checked={roundedCrop} label="Circular crops" onChange={toggleRoundCrop} />
                            <Checkbox checked={transparent} label="Transparency" onChange={toggleTransparent} disabled={!roundedCrop && media.mediaType !== 'image/gif'} />
                        </div>
                    </div>
                </div>
                <div className={`btn-grp`}>
                    {/* 
 */}
                    <Button variant="blue" filled={showSettings} onClick={() => toggleShowSettings()} >
                        <FontAwesomeIcon icon={faCog}/>Settings 
                    </Button>
                    <Button variant="green" onClick={exportProfiles} >
                        <FontAwesomeIcon icon={faFileExport}/>Export 
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileList;
/* 
const SettingsPanel = () => {
    const [settings, dispatchSettings] = useReducerAtom(settingsAtom, settingsReducer);

    return (
        <div>
        </div>
    );
};
 */
interface MediaButtonsProps {
    isPaused: boolean;
    canPlay: boolean;
    onTogglePlay: () => void;
    onPrev: () => void;
    onNext: () => void;
}

const MediaButtons = (props: MediaButtonsProps) => {
    return (
        <div className="flex rows" style={{justifyContent: 'center', marginBottom: '0.5em'}}>
            <Button variant="blue" onClick={props.onPrev} >
                <FontAwesomeIcon icon={faBackwardStep} />
            </Button>
            {
                props.canPlay &&
                <Button variant="blue" onClick={props.onTogglePlay} >
                    <FontAwesomeIcon icon={props.isPaused ? faPlay : faPause} />
                </Button>
            }
            <Button variant="blue" onClick={props.onNext} >
                <FontAwesomeIcon icon={faForwardStep} />
            </Button>
        </div>
    );
};

interface HeaderProps {
    onAdd: () => void;
    onReset: () => void;
} 

const Header = ({onAdd, onReset}: HeaderProps) => {
    return (
        <div className={styles.listHeader}>
            <h2>Profiles</h2>
            <div className="flex rows" style={{justifyContent: 'center'}}>
                <Button variant="blue" onClick={onAdd} >
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
                <Button variant="red" onClick={onReset} >
                    <FontAwesomeIcon icon={faRotateLeft} />
                </Button>
            </div>
        </div>
    );
};
