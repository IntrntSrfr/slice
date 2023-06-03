import { useAtom } from "jotai";
import { useRef, ChangeEvent } from "react";
import { loadingAtom, profilesAtom, sourceAtom } from "../store";
import { v4 } from "uuid";

import Button from "./Button";

function UploadButton() {
    const [, setSource] = useAtom(sourceAtom);
    const [, setProfiles] = useAtom(profilesAtom);
    const [, setLoading] = useAtom(loadingAtom);
    const inpRef = useRef<HTMLInputElement>(null);

    const clickUpload = () => {
        if (!inpRef?.current) return;
        inpRef.current.click();
    };

    const readFile = async (fr: FileReader, f: File) => {
        return await new Promise<ArrayBuffer | string | null>((res, rej) => {
          fr.onload = () => { res(fr.result); };
          fr.onerror = () => { rej(fr.error); };
          fr.readAsDataURL(f);
        });
      };
    
      const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
        const inp = e.target as HTMLInputElement;
        if (!inp.files?.length) return;
        setLoading(true);
    
        const readerDataURL = new FileReader();
        try {
          const resDataURL = await readFile(readerDataURL, inp.files[0]);
          const img = new Image();
          img.src = resDataURL as string;
          setSource(img);
        } catch (err: unknown) {
          console.log(err);
          return;
        }
    
        setProfiles([{
            id: v4(),
            name: 'New profile',
            crop: { unit: '%', width: 50 },
            active: true
        }]);
    };

    return (
        <div>
            <Button text="Upload image" variant="green" style={{ width: '100%' }} onClick={clickUpload} />
            <input
                ref={inpRef}
                type={'file'}
                accept={'image/jpeg, image/png'}
                onChange={uploadImage}
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default UploadButton;