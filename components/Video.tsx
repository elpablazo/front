"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function Video() {
  // Este ref es para acceder al elemento <video> del DOM
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Esta función inicializa el video
  const startVideo = async () => {
    setIsLoading(true);
    if (navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
    setIsLoading(false);
  };

  // Función para cargar los modelos de face-api.js
  const loadModels = async () => {
    // Todo: agregar loader
    setIsLoading(true);
    // Todo: reemplazar por tiny?
    await faceapi.loadFaceRecognitionModel("/models");
    await faceapi.loadTinyFaceDetectorModel("/models");
    await faceapi.loadFaceLandmarkModel("/models");
    await faceapi.loadSsdMobilenetv1Model("/models");
    setIsLoading(false);
  };

  // Cuando el componente se monta, se inicia el video
  useEffect(() => {
    loadModels();
    startVideo();
    startFaceRecognition();
  }, []);

  // Cuando el video se carga, se inicia el reconocimiento facial
  const startFaceRecognition = async () => {
    // Cada segundo se ejecuta la función
    setInterval(async () => {
      if (videoRef.current) {
        // Se detecta la cara
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        console.log(detections);

        const canvas = canvasRef.current;

        // Ajustamos tamaño del canvas
        if (canvas) {
          faceapi.matchDimensions(canvas, {
            width: videoRef.current.clientWidth,
            height: videoRef.current.clientHeight,
          });
        } else {
          return;
        }

        // Si se detecta una cara
        if (detections) {
          const resizedDetections = faceapi.resizeResults(detections, {
            width: videoRef.current.clientWidth,
            height: videoRef.current.clientHeight,
          });

          // Se dibuja el cuadro de la cara
          faceapi.draw.drawDetections(canvas, resizedDetections);
        }
      }
    }, 500);
  };

  return (
    <div className="relative">
      <canvas
        id="canvas"
        className="z-10 absolute top-0 left-0 w-full h-screen"
        ref={canvasRef}
      />
      <video
        ref={videoRef}
        autoPlay
        playsInline={true}
        muted
        style={{ width: "100vw", height: "100vh" }}
      />
    </div>
  );
}
