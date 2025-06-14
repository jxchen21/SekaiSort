'use client'
import React, { useState } from 'react';

export default function DownloadButton() {
    const [isDownloading, setIsDownloading] = useState(false);
    //const API_BASE_URL =  process.env.NEXT_PUBLIC_API_URL;
    const API_BASE_URL = "https://sekai-sort-server.up.railway.app"
    const downloadZip = async () => {

        setIsDownloading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/download/all`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'processed_images.zip';
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={downloadZip}
            disabled={isDownloading}
            className="download-btn"
        >
            {isDownloading ? 'Downloading...' : 'Download All Images'}
        </button>
    );
}