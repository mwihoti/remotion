import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AppConfig } from "../config";

// Reveals each word in the tagline one by one, then holds them all
export const TaglineScene: React.FC<{ config: AppConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = config.tagline.split(" · ");
  const FRAMES_PER_WORD = 12; // how fast each word appears

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: config.bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Nunito', 'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle gradient glow behind */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 400,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${config.accentColor}, #1db8a8)`,
          opacity: interpolate(frame, [0, 40], [0, 0.08], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          filter: "blur(80px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Label */}
      <div
        style={{
          color: config.accentColor,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: interpolate(frame, [0, 20], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          marginBottom: 48,
        }}
      >
        What drives us
      </div>

      {/* Words grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "16px 24px",
          maxWidth: 900,
          padding: "0 60px",
        }}
      >
        {words.map((word, i) => {
          const startFrame = i * FRAMES_PER_WORD;

          const wordOpacity = interpolate(frame - startFrame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const wordY = interpolate(frame - startFrame, [0, 12], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const wordScale = spring({
            frame: frame - startFrame,
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          return (
            <div
              key={word}
              style={{
                opacity: wordOpacity,
                transform: `translateY(${wordY}px) scale(${wordScale})`,
                fontSize: 34,
                fontWeight: 800,
                color: i % 2 === 0 ? config.textColor : config.accentColor,
                letterSpacing: 0.5,
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
    </div>
  );
};
