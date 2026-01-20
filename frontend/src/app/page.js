"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  const handleSummon = () => {
    router.push("/select");
  };

  return (
    <section className="hero-container">
      {/* Background Image */}
      <div className="hero-background" aria-hidden="true" />

      {/* Dark Sepia Overlay */}
      <div className="hero-overlay" aria-hidden="true" />

      {/* Mist Effect */}
      <div className="hero-mist" aria-hidden="true" />

      {/* Login Button - Top Right */}
      <a href="#" className="login-link">
        Log in
      </a>

      {/* Main Content */}
      <div className="hero-content">
        {/* Main Title - Stone/Metallic Texture */}
        <h1 className="main-title">
          <span className="title-line">THE</span>
          <span className="title-line title-large">CURATOR'S</span>
          <span className="title-line title-large">GHOST</span>
        </h1>

        {/* Subtitle */}
        <p className="subtitle">
          Art has a voice. Are you listening?
        </p>

        {/* Wax Seal Button */}
        <button
          className="seal-button"
          onClick={handleSummon}
          aria-label="Enter the gallery"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wax-seal.png"
            alt="Summon the Spirits"
            className="seal-image"
          />
        </button>
      </div>

    </section>
  );
}
