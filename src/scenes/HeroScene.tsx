import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { FadeSlideUp } from "../components/AnimatedText";
import { AppConfig } from "../config";

export const HeroScene: React.FC<{ config: AppConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });

  const glowOpacity = interpolate(frame, [30, 60], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: config.bgColor,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Glow background blob */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: config.accentColor,
          opacity: glowOpacity * 0.15,
          filter: "blur(120px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* App name */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          fontSize: 80,
          fontWeight: 800,
          color: config.accentColor,
          letterSpacing: -2,
          marginBottom: 16,
        }}
      >
        {config.appName}
      </div>

      {/* Tagline */}
      <FadeSlideUp delay={15}>
        <div
          style={{
            fontSize: 28,
            color: config.textColor,
            opacity: 0.85,
            textAlign: "center",
            maxWidth: 700,
            marginBottom: 12,
          }}
        >
          {config.tagline}
        </div>
      </FadeSlideUp>

      {/* Subtitle */}
      <FadeSlideUp delay={25}>
        <div
          style={{
            fontSize: 18,
            color: config.accentColor,
            opacity: 0.7,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 40,
          }}
        >
          {config.heroSubtitle}
        </div>
      </FadeSlideUp>

      {/* CTA button */}
      <FadeSlideUp delay={40}>
        <div
          style={{
            padding: "14px 36px",
            backgroundColor: config.accentColor,
            color: config.bgColor,
            fontSize: 18,
            fontWeight: 700,
            borderRadius: 50,
            letterSpacing: 0.5,
          }}
        >
          {config.ctaText}
        </div>
      </FadeSlideUp>
    </div>
  );
};
