// src/components/ARProblemViewer.js
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

const ARProblemViewer = ({ position, category }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    containerRef.current.appendChild(renderer.domElement);
    containerRef.current.appendChild(ARButton.createButton(renderer));

    // Add AR markers based on problem category
    const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: getCategoryColor(category),
      opacity: 0.7,
      transparent: true,
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    // Position marker based on geolocation
    if (position) {
      marker.position.set(
        position.lng - camera.position.x,
        0,
        -(position.lat - camera.position.z)
      );
    }

    scene.add(marker);

    // Add information panel
    const panelGeometry = new THREE.PlaneGeometry(0.5, 0.3);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    drawInfoPanel(ctx, category);
    const texture = new THREE.CanvasTexture(canvas);
    const panelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(
      marker.position.x,
      marker.position.y + 0.3,
      marker.position.z
    );
    scene.add(panel);

    // Animation loop
    const animate = () => {
      renderer.setAnimationLoop(() => {
        marker.rotation.y += 0.01;
        renderer.render(scene, camera);
      });
    };

    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [position, category]);

  return <div ref={containerRef} className="ar-container w-full h-full" />;
};

// Helper functions
const getCategoryColor = (category) => {
  const colors = {
    waste: 0xff0000,
    air_pollution: 0x00ff00,
    water_pollution: 0x0000ff,
    noise_pollution: 0xffff00,
    default: 0xcccccc,
  };
  return colors[category] || colors.default;
};

const drawInfoPanel = (ctx, category) => {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.fillText(category.replace("_", " ").toUpperCase(), 20, 70);
};

export default ARProblemViewer;
