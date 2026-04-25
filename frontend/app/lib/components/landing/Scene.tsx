"use client";

import { Html, PerspectiveCamera, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import {
  getScrollPercentage,
  initScrollListener,
} from "../../stores/scrollStore";
import { Model } from "./CoinsModel";
import Lights from "./Ligths";

function lerp(x: number, y: number, a: number) {
  return (1 - a) * x + a * y;
}

function scaleObject(scrollPct: number, start: number, end: number) {
  return Math.max(0, (scrollPct - start) / (end - start));
}

function AnimatedScene() {
  const coinsOpacity = useRef(1);
  const htmlPos = useRef(new Vector3(-9.2, 15, 0));
  const htmlOpacity = useRef(0);
  const [htmlVisible, setHtmlVisible] = useState(false);

  useFrame(() => {
    const sp = getScrollPercentage();

    // Coins opacity: 1 at 0-10%, fade to 0 at 10-20%
    if (sp >= 0 && sp <= 10) {
      coinsOpacity.current = 1;
    } else if (sp > 10 && sp <= 20) {
      coinsOpacity.current = lerp(1, 0, scaleObject(sp, 10, 20));
    } else {
      coinsOpacity.current = 0;
    }

    // HTML position animation 0-25%
    if (sp >= 0 && sp <= 25) {
      const progress = scaleObject(sp, 0, 25);
      htmlPos.current.y = lerp(15, 0, progress);

      if (progress > 0.65) {
        htmlOpacity.current = 1;
      } else {
        htmlOpacity.current = 0;
      }
    }

    setHtmlVisible(htmlOpacity.current > 0.5);
  });

  return (
    <>
      <directionalLight position={[0, 10, 10]} castShadow color="white" />
      <Lights />
      <group>
        <Model opacityRef={coinsOpacity} />
      </group>
      <Html
        position={htmlPos.current}
        style={{ opacity: htmlOpacity.current, pointerEvents: "none" }}
      >
        {htmlVisible && (
          <div className="text-white text-2xl font-bold whitespace-nowrap">
            {/* Add your HTML content here */}
          </div>
        )}
      </Html>
      <Stars
        speed={2}
        fade
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
      />
    </>
  );
}

export default function Scene() {
  useEffect(() => {
    const cleanup = initScrollListener();
    return cleanup;
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-screen z-0">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={75} />

        <AnimatedScene />
      </Canvas>
    </div>
  );
}
