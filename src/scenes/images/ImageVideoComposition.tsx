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
import { VideoPlan, VideoPlanSlide, getVideoPlanDuration, normalizeVideoPlan } from "../../lib/video-plan";
import { ImageVideoConfig } from "./ImageVideoConfig";

export const getImageVideoDuration = (plan = ImageVideoConfig) => getVideoPlanDuration(plan);

const mediaSource = (image: string) =>
  image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://")
    ? image
    : staticFile(image);

export const ImageVideoComposition: React.FC<{ plan?: Partial<VideoPlan> }> = ({ plan }) => {
  const activePlan = normalizeVideoPlan(plan ?? ImageVideoConfig);
  let startFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: activePlan.colors.background }}>
      {activePlan.slides.map((slide, index) => {
        const from = startFrame;
        startFrame += slide.duration;

        return (
          <Sequence key={`${slide.image}-${index}`} from={from} durationInFrames={slide.duration}>
            <ImageSlide slide={slide} index={index} total={activePlan.slides.length} plan={activePlan} />
          </Sequence>
        );
      })}

      <Sequence from={startFrame} durationInFrames={120}>
        <FinalSlide plan={activePlan} />
      </Sequence>
    </AbsoluteFill>
  );
};

const ImageSlide: React.FC<{ slide: VideoPlanSlide; index: number; total: number; plan: VideoPlan }> = ({
  slide,
  index,
  total,
  plan,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isLandscape = width > height;
  const shortSide = Math.min(width, height);
  const mediaWidth = isLandscape ? width * 0.48 : Math.min(width * 0.72, shortSide * 0.78);
  const mediaHeight = isLandscape ? height * 0.7 : height * 0.66;
  const captionFontSize = Math.max(30, Math.min(54, shortSide * 0.06));
  const headerFontSize = Math.max(18, Math.min(28, shortSide * 0.035));
  const accent = index % 2 === 0 ? plan.colors.accent : plan.colors.orange;
  const hasImage = Boolean(slide.image);

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
        flexDirection: isLandscape ? "row" : "column",
        gap: isLandscape ? width * 0.05 : 0,
        padding: isLandscape ? `${height * 0.1}px ${width * 0.06}px` : 0,
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {hasImage ? (
        <Img
          src={mediaSource(slide.image)}
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
      ) : null}

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
          width: mediaWidth,
          height: mediaHeight,
          maxWidth: isLandscape ? width * 0.5 : width * 0.82,
          maxHeight: isLandscape ? height * 0.74 : height * 0.7,
          borderRadius: Math.max(18, shortSide * 0.04),
          overflow: "hidden",
          border: `${Math.max(5, shortSide * 0.01)}px solid ${accent}`,
          boxShadow: `0 0 48px ${accent}55`,
          backgroundColor: plan.colors.surface,
          opacity: imageOpacity,
          transform: `scale(${interpolate(frame, [0, 25], [0.92, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })})`,
        }}
      >
        {hasImage ? (
          <Img
            src={mediaSource(slide.image)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: slide.position ?? "center",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: shortSide * 0.06,
              background: `linear-gradient(145deg, ${plan.colors.surface}, ${plan.colors.background})`,
              color: plan.colors.text,
              textAlign: "center",
              fontSize: Math.max(34, Math.min(72, shortSide * 0.075)),
              fontWeight: 950,
              lineHeight: 1.05,
            }}
          >
            {slide.caption}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: 70,
          left: isLandscape ? width * 0.055 : shortSide * 0.05,
          right: isLandscape ? width * 0.055 : shortSide * 0.05,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: plan.colors.text,
          opacity: captionOpacity,
        }}
      >
        <div style={{ fontSize: headerFontSize, fontWeight: 800 }}>{plan.title}</div>
        <div style={{ fontSize: headerFontSize * 0.75, fontWeight: 700, color: accent }}>
          {index + 1}/{total}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: isLandscape ? width * 0.58 : shortSide * 0.055,
          right: isLandscape ? width * 0.06 : shortSide * 0.055,
          top: isLandscape ? height * 0.42 : undefined,
          bottom: isLandscape ? undefined : height * 0.07,
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
            color: plan.colors.background,
            fontSize: captionFontSize,
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

const FinalSlide: React.FC<{ plan: VideoPlan }> = ({ plan }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const shortSide = Math.min(width, height);
  const titleSize = Math.max(48, Math.min(88, shortSide * 0.085));
  const subtitleSize = Math.max(26, Math.min(44, shortSide * 0.045));
  const urlSize = Math.max(22, Math.min(34, shortSide * 0.035));
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
        backgroundColor: plan.colors.background,
        color: plan.colors.text,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: 56,
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: shortSide * 0.86,
          height: shortSide * 0.86,
          borderRadius: "50%",
          backgroundColor: plan.colors.accent,
          opacity: 0.16,
          filter: "blur(120px)",
        }}
      />

      <div style={{ opacity, transform: `scale(${scale})` }}>
        <div
          style={{
            color: plan.colors.accent,
            fontSize: titleSize,
            fontWeight: 950,
            marginBottom: 20,
            lineHeight: 1,
          }}
        >
          {plan.title}
        </div>
        <div style={{ fontSize: subtitleSize, fontWeight: 800, lineHeight: 1.2, marginBottom: 42 }}>
          {plan.subtitle}
        </div>
        <div
          style={{
            display: "inline-block",
            borderBottom: `4px solid ${plan.colors.orange}`,
            color: plan.colors.orange,
            fontSize: urlSize,
            fontWeight: 900,
            paddingBottom: 8,
          }}
        >
          {plan.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
