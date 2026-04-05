import React, {useState, useCallback, useRef, useEffect} from 'react'
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS, REDIRECT_DELAY_MS} from "../lib/constants";

interface AuthContext {
    isSignedIn: boolean;
}

interface UploadProps {
    onComplete?: (data: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [progress, setProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const {isSignedIn} = useOutletContext<AuthContext>();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const processFile = useCallback((selectedFile: File) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

        if (!validTypes.includes(selectedFile.type) || selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setFile(null);
            setProgress(0);
            setUploadError("Invalid file type or size.");
            return;
        }

        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setFile(selectedFile);
        setProgress(0);
        setUploadError(null);

        const reader = new FileReader();

        reader.onerror = () => {
            setUploadError("Failed to read the file.");
            setFile(null);
            setProgress(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

        reader.onloadend = () => {
            if (reader.error) return; // handled by onerror
            const base64Data = reader.result as string;

            let currentProgress = 0;
            intervalRef.current = setInterval(() => {
                currentProgress += PROGRESS_INCREMENT;
                if (currentProgress >= 100) {
                    currentProgress = 100;
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    timeoutRef.current = setTimeout(() => {
                        if (onComplete) onComplete(base64Data);
                    }, REDIRECT_DELAY_MS);
                }
                setProgress(currentProgress);
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(selectedFile);
    }, [onComplete]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (isSignedIn) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging': ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />
                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon  size={20}/>
                        </div>
                        <p>
                            {isSignedIn ? (
                                "Click to upload or just drag and drop"
                            ) : ("Sign in or sign up with Puter to upload")}
                        </p>
                        <p className="help"> Maximum file size 50 MB.</p>
                        {uploadError && <p className="error" style={{color: 'red', marginTop: 10}}>{uploadError}</p>}
                    </div>
                </div>
            ) : (
                <div className="upload-status">

                    <div className="status-content">
                        <div className="status-icon">
                            {
                                progress === 100 ? (
                                    <CheckCircle2 className="check" />
                                ) : (
                                    <ImageIcon className="image" />
                                )}
                        </div>
                        <h3>{file.name}</h3>
                        <div className="progress">
                            <div className="bar" style={{width:`${progress}%`}}/>
                            <p className="status-text">
                                {progress < 100 ? "Analyzing floor plan..." : "Upload complete!"}
                            </p>
                            {uploadError && <p className="error" style={{color: 'red'}}>{uploadError}</p>}
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
export default Upload
