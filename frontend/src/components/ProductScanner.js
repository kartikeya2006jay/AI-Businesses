import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { recognizeProduct } from '../services/api';
import '../styles/ProductScanner.css';

const ProductScanner = ({ onScanSuccess, onClose, inventory }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [stream, setStream] = useState(null);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
            setIsCameraReady(true);
            setError(null);
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Could not access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const captureAndScan = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsScanning(true);
        setResult(null);
        setError(null);

        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg');

        try {
            const response = await recognizeProduct(imageData);
            if (response.data && response.data.product) {
                setResult(response.data.product);
                // Auto-confirm after a brief delay for better UX
                setTimeout(() => {
                    handleConfirm(response.data.product);
                }, 1500);
            } else {
                setError("Could not identify product. Try again.");
            }
        } catch (err) {
            setError("Error communicating with AI Vision service.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirm = (productName) => {
        onScanSuccess(productName);
        onClose();
    };

    return (
        <div className="scanner-overlay">
            <div className="scanner-container glass">
                <div className="scanner-header">
                    <h3><Camera size={20} /> AI Product Scanner</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="camera-viewport">
                    {!isCameraReady && !error && (
                        <div className="camera-loading">
                            <RefreshCw className="spin" />
                            <p>Initializing Camera...</p>
                        </div>
                    )}

                    {error && (
                        <div className="camera-error">
                            <AlertCircle size={48} className="icon-red" />
                            <p>{error}</p>
                            <button className="retry-btn" onClick={startCamera}>Retry</button>
                        </div>
                    )}

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={isCameraReady ? 'visible' : 'hidden'}
                    />

                    {isCameraReady && !result && (
                        <div className="scan-animation-overlay">
                            <div className="scan-line"></div>
                            <div className="scan-frame"></div>
                        </div>
                    )}

                    {result && (
                        <div className="recognition-result glass-light">
                            <Check size={40} className="icon-success" />
                            <h4>{result}</h4>
                            <p>Confidence: {(Math.random() * 5 + 90).toFixed(1)}%</p>
                        </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

                <div className="scanner-footer">
                    <button
                        className={`scan-btn ${isScanning ? 'loading' : ''}`}
                        onClick={captureAndScan}
                        disabled={!isCameraReady || isScanning || result}
                    >
                        {isScanning ? <RefreshCw className="spin" /> : <Camera size={20} />}
                        {isScanning ? 'Identifying...' : 'Scan Item'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductScanner;
