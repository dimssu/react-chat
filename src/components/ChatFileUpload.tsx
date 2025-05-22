import { useState, useRef } from 'react';
import styles from './ChatFileUpload.module.css';

interface ChatFileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  styling?: {
    widgetColor?: string;
    textColor?: string;
  };
}

export const ChatFileUpload = ({
  onFileUpload,
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
  maxFileSizeMB = 5,
  styling = {},
}: ChatFileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxFileSizeMB}MB limit`);
      return false;
    }
    
    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedFileTypes.includes(fileExtension)) {
      setError(`File type not supported. Allowed types: ${allowedFileTypes.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;
    
    setIsUploading(true);
    try {
      await onFileUpload(file);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.fileUploadContainer}>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${isUploading ? styles.uploading : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          accept={allowedFileTypes.join(',')}
        />
        
        {isUploading ? (
          <div className={styles.uploadingIndicator}>
            <div className={styles.spinner} style={{ borderTopColor: styling.widgetColor || '#4f46e5' }}></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={styling.widgetColor || '#4f46e5'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Drop file here or click to upload</span>
            <span className={styles.fileInfo}>
              Max size: {maxFileSizeMB}MB | {allowedFileTypes.join(', ')}
            </span>
          </>
        )}
      </div>
      
      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
    </div>
  );
}; 