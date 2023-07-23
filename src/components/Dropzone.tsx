import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
    onUpload: (file: File) => void
}

const Dropzone = ({onUpload}: Props) => {
    const [dragCounter, setDragCounter] = useState(0);
  
    const onDrop = (acceptedFiles: File[]) => {
      if(!acceptedFiles.length) return;
      onUpload(acceptedFiles[0]);
      setDragCounter(0); // Reset the counter on drop
    };
  
    const { getRootProps, getInputProps } = useDropzone({ 
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/gif': []
        },
        maxFiles: 1,
    });
  
    useEffect(() => {
      const handleDragIn = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.items && e.dataTransfer.items.length > 0)
          setDragCounter((prev) => prev + 1);
      };
  
      const handleDragOut = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter((prev) => (prev > 0 ? prev - 1 : 0));
      };
  
      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(0); // Reset the counter on drop
      };
  
      window.addEventListener('dragenter', handleDragIn);
      window.addEventListener('dragleave', handleDragOut);
      window.addEventListener('drop', handleDrop);
      return () => {
        window.removeEventListener('dragenter', handleDragIn);
        window.removeEventListener('dragleave', handleDragOut);
        window.removeEventListener('drop', handleDrop);
      };
    }, []);
  
    return (
      <div
        {...getRootProps()}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: dragCounter > 0 ? 'flex' : 'none', 
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999, 
        }}
      >
        <input {...getInputProps()} />
        <p>Drop your image or GIF here</p>
      </div>
    );
};

export default Dropzone;
