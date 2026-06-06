import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ImageVideoConfig, ImageVideoSlide } from "./ImageVideoConfig";

export const getImageVideoDuration = () =>
  ImageVideoConfig.slides.reduce((total, slide) => total + slide.duration, 0) + 120;

export const ImageVideoComposition: React.FC = () => {
  let startFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: ImageVideoConfig.colors.background }}>
      {ImageVideoConfig.slides.map((slide, index) => {
        const from = startFrame;
        startFrame += slide.duration;

        return (
          <Sequence key={`${slide.image}-${index}`} from={from} durationInFrames={slide.duration}>
            <ImageSlide slide={slide} index={index} total={ImageVideoConfig.slides.length} />
          </Sequence>
        );
      })}

      <Sequence from={startFrame} durationInFrames={120}>
        <FinalSlide />
      </Sequence>
    </AbsoluteFill>
  );
};

const ImageSlide: React.FC<{ slide: ImageVideoSlide; index: number; total: number }> = ({
  slide,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accent = index % 2 === 0 ? ImageVideoConfig.colors.accent : ImageVideoConfig.colors.orange;

  const imageScale = interpolate(frame, [0, slide.duration], [1.04, 1.14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const imageOpacity = interpolate(
    frame,
    [0, 12, slide.duration - 14, slide.duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const captionY = interpolate(frame, [8, 28], [42, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const captionOpacity = interpolate(frame, [8, 28, slide.duration - 18, slide.duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeScale = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <Img
        src={staticFile(slide.image)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: slide.position ?? "center",
          opacity: imageOpacity * 0.28,
          transform: `scale(${imageScale})`,
          filter: "blur(16px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,7,10,0.78) 0%, rgba(5,7,10,0.2) 42%, rgba(5,7,10,0.9) 100%)",
        }}
      />

      <div
        style={{
          width: 520,
          height: 840,
          borderRadius: 42,
          overflow: "hidden",
          border: `8px solid ${accent}`,
          boxShadow: `0 0 48px ${accent}55`,
          backgroundColor: ImageVideoConfig.colors.surface,
          opacity: imageOpacity,
          transform: `scale(${interpolate(frame, [0, 25], [0.92, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
        }}
      >
        <Img
          src={staticFile(slide.image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: slide.position ?? "center",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 70,
          left: 54,
          right: 54,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: ImageVideoConfig.colors.text,
          opacity: captionOpacity,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 800 }}>{ImageVideoConfig.title}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: accent }}>
          {index + 1}/{total}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 92,
          transform: `translateY(${captionY}px)`,
          opacity: captionOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "16px 28px",
            borderRadius: 999,
            backgroundColor: accent,
            color: ImageVideoConfig.colors.background,
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1.05,
            transform: `scale(${badgeScale})`,
            textTransform: "uppercase",
          }}
        >
          {slide.caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FinalSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 13, stiffness: 90 } });
  const opacity = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ImageVideoConfig.colors.background,
        color: ImageVideoConfig.colors.text,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: 56,
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          backgroundColor: ImageVideoConfig.colors.accent,
          opacity: 0.16,
          filter: "blur(120px)",
        }}
      />

      <div style={{ opacity, transform: `scale(${scale})` }}>
        <div
          style={{
            color: ImageVideoConfig.colors.accent,
            fontSize: 64,
            fontWeight: 950,
            marginBottom: 20,
            lineHeight: 1,
          }}
        >
          {ImageVideoConfig.title}
        </div>
        <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 42 }}>
          {ImageVideoConfig.subtitle}
        </div>
        <div
          style={{
            display: "inline-block",
            borderBottom: `4px solid ${ImageVideoConfig.colors.orange}`,
            color: ImageVideoConfig.colors.orange,
            fontSize: 30,
            fontWeight: 900,
            paddingBottom: 8,
          }}
        >
          {ImageVideoConfig.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
