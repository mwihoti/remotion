import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AppConfig } from "../config";

export const ClosingScene: React.FC<{ config: AppConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });

  const websiteOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowOpacity = interpolate(frame, [0, 30], [0, 0.2], {
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
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: config.accentColor,
          opacity: glowOpacity,
          filter: "blur(140px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* App name */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: config.accentColor,
          transform: `scale(${scale})`,
          marginBottom: 20,
          letterSpacing: -1,
        }}
      >
        {config.appName}
      </div>

      {/* Closing line */}
      <div
        style={{
          fontSize: 26,
          color: config.textColor,
          opacity: 0.8,
          textAlign: "center",
          maxWidth: 600,
          marginBottom: 32,
        }}
      >
        {config.closingLine}
      </div>

      {/* Website */}
      <div
        style={{
          fontSize: 20,
          color: config.accentColor,
          opacity: websiteOpacity,
          fontWeight: 600,
          letterSpacing: 1,
          borderBottom: `2px solid ${config.accentColor}`,
          paddingBottom: 4,
        }}
      >
        {config.website}
      </div>
    </div>
  );
};
