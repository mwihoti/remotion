import { Sequence } from "remotion";
import { AppConfig } from "./config";
import { HeroScene } from "./scenes/HeroScene";
import { TaglineScene } from "./scenes/TaglineScene";
import { FeatureScene } from "./scenes/FeatureScene";
import { ClosingScene } from "./scenes/ClosingScene";

// Duration constants (at 30fps)
const HERO_DURATION = 120;       // 4s
const TAGLINE_DURATION = 150;    // 5s — enough to reveal all 8 words + hold
const FEATURE_DURATION = 90;     // 3s per feature
const CLOSING_DURATION = 120;    // 4s

export const getTotalDuration = (cfg: AppConfig) =>
  HERO_DURATION + TAGLINE_DURATION + cfg.features.length * FEATURE_DURATION + CLOSING_DURATION;

export interface WalkthroughProps {
  config: AppConfig;
}

export const AppWalkthrough: React.FC<WalkthroughProps> = ({ config }) => {
  const featureCount = config.features.length;
  const taglineStart = HERO_DURATION;
  const featuresStart = taglineStart + TAGLINE_DURATION;
  const closingStart = featuresStart + featureCount * FEATURE_DURATION;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Hero */}
      <Sequence durationInFrames={HERO_DURATION}>
        <HeroScene config={config} />
      </Sequence>

      {/* Tagline word reveal */}
      <Sequence from={taglineStart} durationInFrames={TAGLINE_DURATION}>
        <TaglineScene config={config} />
      </Sequence>

      {/* Feature scenes */}
      {config.features.map((_, i) => (
        <Sequence
          key={i}
          from={featuresStart + i * FEATURE_DURATION}
          durationInFrames={FEATURE_DURATION}
        >
          <FeatureScene config={config} featureIndex={i} />
        </Sequence>
      ))}

      {/* Closing */}
      <Sequence from={closingStart} durationInFrames={CLOSING_DURATION}>
        <ClosingScene config={config} />
      </Sequence>
    </div>
  );
};
