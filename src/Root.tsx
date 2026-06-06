import "./index.css";
import { Composition } from "remotion";
import { AppWalkthrough, getTotalDuration } from "./Composition";
import { fitTribeConfig } from "./configs/fittribe";
import { TikTokComposition } from "./scenes/tiktok/TikTokComposition";
import { TikTokConfig } from "./scenes/tiktok/TikTokConfig";
import { ImageVideoComposition, getImageVideoDuration } from "./scenes/images/ImageVideoComposition";

// To make a video for a different app, swap the config here.
const activeConfig = fitTribeConfig;

export const RemotionRoot: React.FC = () => {
  const duration = getTotalDuration(activeConfig);

  return (
    <>
      <Composition
        id="AppWalkthrough"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={AppWalkthrough as any}
        durationInFrames={duration}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ config: activeConfig }}
      />
      <Composition
        id="TikTokVideo"
        component={TikTokComposition}
        durationInFrames={TikTokConfig.scenes.reduce((acc, scene) => acc + scene.duration, 0)}
        fps={30}
        width={720}
        height={1280}
      />
      <Composition
        id="ImageVideo"
        component={ImageVideoComposition}
        durationInFrames={getImageVideoDuration()}
        fps={30}
        width={720}
        height={1280}
      />
    </>
  );
};
