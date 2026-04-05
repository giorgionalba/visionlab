import React, {useState, useCallback} from 'react'
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
    const {isSignedIn} = useOutletContext<AuthContext>();

    const processFile = useCallback((selectedFile: File) => {
        setFile(selectedFile);
        setProgress(0);

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result as string;

            let currentProgress = 0;
            const progressInterval = setInterval(() => {
                currentProgress += PROGRESS_INCREMENT;
                if (currentProgress >= 100) {
                    currentProgress = 100;
                    clearInterval(progressInterval);
                    setTimeout(() => {
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
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}
export default Upload
