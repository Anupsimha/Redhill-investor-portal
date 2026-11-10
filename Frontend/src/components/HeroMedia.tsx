import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

interface HeroMediaProps {
  /** Optional architectural video. If absent (or unsuitable for the device), the poster image is used. */
  videoSrc?: string;
  /** High-quality architectural still, also used as the video poster. */
  poster: string;
  alt: string;
}

/**
 * Detects whether the current connection/device is suitable for background video.
 * Skips video for Save-Data users and slow (2g/3g) connections.
 */
function canAutoplayVideo(): boolean {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as any).connection;
  if (conn) {
    if (conn.saveData) return false;
    if (typeof conn.effectiveType === 'string' && /(^|-)2g|3g/.test(conn.effectiveType)) return false;
  }
  return true;
}

/**
 * Cinematic full-bleed hero background.
 * - Muted, looping, playsInline video when a source is configured and the connection allows it.
 * - Falls back to a slow Ken Burns still with restrained scroll parallax.
 * - Respects prefers-reduced-motion (no video, no parallax, no zoom).
 * - Purely decorative: pointer-events disabled so it never blocks interaction.
 */
export default function HeroMedia({ videoSrc, poster, alt }: HeroMediaProps) {
  const reduceMotion = useReducedMotion();
  const [useVideo, setUseVideo] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 900], [0, reduceMotion ? 0 : 140]);

  useEffect(() => {
    setUseVideo(Boolean(videoSrc) && !reduceMotion && canAutoplayVideo());
  }, [videoSrc, reduceMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-redhill-ink" aria-hidden="true">
      <motion.div style={{ y: parallaxY }} className="absolute -inset-x-0 -top-[6%] h-[112%] will-change-transform">
        {useVideo ? (
          <video
            className={`w-full h-full object-cover transition-opacity duration-[1400ms] ${mediaReady ? 'opacity-100' : 'opacity-0'}`}
            src={videoSrc}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setMediaReady(true)}
            onError={() => setUseVideo(false)}
          />
        ) : (
          <img
            src={poster}
            alt={alt}
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setMediaReady(true)}
            className={`w-full h-full object-cover transition-opacity duration-[1400ms] ${mediaReady ? 'opacity-100' : 'opacity-0'} ${reduceMotion ? '' : 'animate-ken-burns'}`}
          />
        )}
      </motion.div>

      {/* Cinematic grading: legible type without heavy colour gradients */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-redhill-ink/90 via-redhill-ink/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-redhill-ink via-redhill-ink/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />
    </div>
  );
}

