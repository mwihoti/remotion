import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface Props {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}

export const FadeSlideUp: React.FC<Props> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
