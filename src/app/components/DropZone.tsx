// components/DropZone.tsx
import React from 'react';
import { Accept, useDropzone } from 'react-dropzone';

interface DropZoneProps {
  onDrop: (acceptedFiles: File[]) => void; // Function to handle the dropped file
  accept: Accept
  maxFiles: number; // Max number of files to accept
  multiple?: boolean; // Allow multiple files or not
  label: string; // Label for the dropzone
  className?: string; // Additional CSS classes
}

const DropZone: React.FC<DropZoneProps> = ({
  onDrop,
  accept,
  maxFiles,
  multiple,
  label,
  className = ''
}) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept,
    onDrop,
    maxFiles,
    multiple,
  });

  return (
    <div className={`dropzone-container ${className}`} {...getRootProps()}>
      <input {...getInputProps()} />
      <div className="dropzone-content border-2 border-spacing-4 p-4 border-dashed">
        <p className="text-center text-sm text-gray-300">{label}</p>
        <p className="text-center text-xs text-gray-300">
          Drag & drop a file here or click to select
        </p>
      </div>
    </div>
  );
};

export default DropZone;
