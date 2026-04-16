import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

export interface WebCameraHandle {
  capture: () => Promise<string | null>; // returns base64 jpeg
}

interface Props {
  onError?: (msg: string) => void;
}

export const WebCamera = forwardRef<WebCameraHandle, Props>(({ onError }, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    const startCamera = (facingMode: string) =>
      navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });

    startCamera("environment")
      .catch(() => startCamera("user"))
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => {
        onError?.(err.message ?? "Camera not available");
      });

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    capture: () =>
      new Promise((resolve) => {
        const video = videoRef.current;
        if (!video || !video.videoWidth) { resolve(null); return; }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")!.drawImage(video, 0, 0);

        // Stop stream so browser camera light turns off immediately
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(dataUrl.split(",")[1]);
      }),
  }));

  return React.createElement("video", {
    ref: videoRef,
    autoPlay: true,
    playsInline: true,
    muted: true,
    style: {
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
  });
});
