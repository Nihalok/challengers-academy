import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function ThreeSpike() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Intersection Observer to pause rendering when out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // 2. Renderer with Pixel Ratio Cap
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // CAP PIXEL RATIO
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Optimized Geometry (Spike/Shard)
    const geometry = new THREE.IcosahedronGeometry(2, 0); // Low poly for performance
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xf97316, 
      flatShading: true,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });
    const spike = new THREE.Mesh(geometry, material);
    scene.add(spike);

    // 4. Lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // 5. Optimized Render Loop
    const animate = () => {
      if (isVisibleRef.current) {
        spike.rotation.x += 0.005;
        spike.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
      frameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 6. Cleanup & Disposal
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      // DISPOSE RESOURCES
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative touch-pan-y" 
      style={{ minHeight: '300px' }}
      aria-label="3D animated spike visualization"
    />
  );
}
