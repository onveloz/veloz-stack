"use client";

import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Animated hero background — @paper-design/shaders-react's MeshGradient
 * with the Veloz palette. Black base, warm shadow, orange spots.
 * A subtle darkening overlay keeps text legible on top.
 */
export function HeroShader({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <MeshGradient
        colors={["#0f0f0f", "#1f1005", "#FF4D00", "#E64500", "#4a1a00"]}
        distortion={0.85}
        swirl={0.65}
        grainMixer={0.2}
        grainOverlay={0.15}
        speed={0.3}
        style={{ width: "100%", height: "100%" }}
      />
      {/* Bottom fade into page bg so content below isn't visually orphaned */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,15,15,0.3) 0%, rgba(15,15,15,0.55) 50%, rgba(15,15,15,1) 100%)",
        }}
      />
    </div>
  );
}
