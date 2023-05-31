import { useAtom } from 'jotai';
import { useRef, type ChangeEvent } from 'react';
import { framesAtom, gifAtom, loadingAtom, profilesAtom, sourceAtom } from '../store';
import { v4 } from 'uuid';
import { ParsedFrame, decompressFrames, parseGIF } from 'gifuct-js';

import Button from './Button';

function UploadButton () {
  const [, setSource] = useAtom(sourceAtom);
  const [, setGif] = useAtom(gifAtom);
  const [, setFrames] = useAtom(framesAtom);
  const [, setProfiles] = useAtom(profilesAtom);
  const [, setLoading] = useAtom(loadingAtom);
  const inpRef = useRef<HTMLInputElement>(null);

  const clickUpload = () => {
    if ((inpRef?.current) == null) return;
    inpRef.current.click();
  };

  const readFile = async (fr: FileReader, f: File, t: 'DataURL' | 'ArrayBuffer') => {
    return await new Promise<ArrayBuffer | string | null>((res, rej) => {
      fr.onload = () => { res(fr.result); };
      fr.onerror = () => { rej(fr.error); };
      if (t === 'DataURL') { fr.readAsDataURL(f); } else if (t === 'ArrayBuffer') { fr.readAsArrayBuffer(f); }
    });
  };

  const expandFrames = (frames: ParsedFrame[], width: number) => {
    frames.forEach(f => {
        console.log(f.transparentIndex);
        //const newData = new Uint8ClampedArray(f.patch.length + f.patch.length/3);
        
    });
    return;
  };

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const inp = e.target as HTMLInputElement;
    if (!inp.files?.length) return;
    setLoading(true);

    const readerDataURL = new FileReader();
    const readerArrayBuffer = new FileReader();
    try {
      const resDataURL = await readFile(readerDataURL, inp.files[0], 'DataURL');
      const img = new Image();
      img.src = resDataURL as string;
      setSource(img);

      if (inp.files[0].type === 'image/gif') {
        const resArrayBuffer = await readFile(readerArrayBuffer, inp.files[0], 'ArrayBuffer');
        const buf = resArrayBuffer as ArrayBuffer;
        const gif = parseGIF(buf);
        const frames = decompressFrames(gif, true);
        setGif(gif);
        expandFrames(frames, gif.lsd.width);
        setFrames(frames);
      }
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
                accept={'image/jpeg, image/png, image/gif'}
                onChange={uploadImage}
                style={{ display: 'none' }}
            />
        </div>
  );
}

export default UploadButton;
