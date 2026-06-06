import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AppConfig } from "../config";

interface Props {
  config: AppConfig;
  featureIndex: number;
}

export const FeatureScene: React.FC<Props> = ({ config, featureIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const feature = config.features[featureIndex];

  const iconScale = spring({ frame, fps, config: { damping: 10, stiffness: 90 } });

  const titleOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [10, 30], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const descOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const descY = interpolate(frame, [25, 45], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [30, 60], [0, 120], {
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
      }}
    >
      {/* Feature number badge */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          color: config.accentColor,
          fontSize: 14,
          fontWeight: 600,
          opacity: 0.5,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Feature {featureIndex + 1} / {config.features.length}
      </div>

      {/* Icon */}
      <div
        style={{
          fontSize: 80,
          transform: `scale(${iconScale})`,
          marginBottom: 32,
        }}
      >
        {feature.icon}
      </div>

      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          backgroundColor: config.accentColor,
          borderRadius: 2,
          marginBottom: 32,
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: config.textColor,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 20,
          maxWidth: 800,
        }}
      >
        {feature.title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 22,
          color: config.textColor,
          opacity: descOpacity * 0.65,
          transform: `translateY(${descY}px)`,
          textAlign: "center",
          maxWidth: 600,
          lineHeight: 1.6,
        }}
      >
        {feature.description}
      </div>
    </div>
  );
};
