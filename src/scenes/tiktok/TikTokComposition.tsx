import { Sequence, AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { TikTokConfig } from "./TikTokConfig";
import { Captions, Watermark } from "./Components";

type TikTokScene = (typeof TikTokConfig.scenes)[number];

export const TikTokComposition: React.FC = () => {
  let currentStart = 0;

  return (
    <AbsoluteFill className="bg-black font-sans overflow-hidden">
      {TikTokConfig.scenes.map((scene) => {
        const sequence = (
          <Sequence key={scene.id} from={currentStart} durationInFrames={scene.duration}>
            <SceneContent scene={scene} />
          </Sequence>
        );
        currentStart += scene.duration;
        return sequence;
      })}
      <Watermark url={TikTokConfig.url} />
    </AbsoluteFill>
  );
};

const SceneContent: React.FC<{ scene: TikTokScene }> = ({ scene }) => {
  const frame = useCurrentFrame();

  if (scene.id === "hook" || scene.id === "cta") {
    return (
      <AbsoluteFill className="flex items-center justify-center">
        <Img src={staticFile("cto.png")} className="absolute inset-0 object-cover w-full h-full opacity-60" />
        {scene.id === "cta" && (
          <div className="absolute inset-0 flex items-center justify-center scale-90 opacity-30 mt-40">
            <Img src={staticFile("app_home.png")} className="rounded-3xl border-4 border-[#FF6B2B] shadow-2xl" />
          </div>
        )}
        <div className="z-10 text-center">
          <Captions text={scene.text} />
        </div>
        {scene.id === "hook" && (
          <div className="absolute top-1/4 text-8xl animate-bounce">🔥</div>
        )}
      </AbsoluteFill>
    );
  }

  if (scene.id === "problem") {
    const crackFrame = 120; // 4s
    const opacity = interpolate(frame, [crackFrame, crackFrame + 10], [1, 0]);
    return (
      <AbsoluteFill className="flex flex-col items-center justify-center bg-gray-900 p-10">
        <div className="text-orange-500 text-center text-4xl mb-10 opacity-70">
          [ Sad Fitness App: 0 Day Streak ]
        </div>
        <div style={{ opacity }}>
          <Captions text={scene.text} />
        </div>
        {frame > crackFrame && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-white text-9xl">💥</div>
          </div>
        )}
      </AbsoluteFill>
    );
  }

  if (scene.id === "reveal" || scene.id === "proof" || scene.id === "community" || scene.id === "wallet") {
    const list = Array.isArray(scene.text) ? scene.text : [scene.text];

    // Select image based on scene
    let screenshot = "app_checkin.png";
    if (scene.id === "proof") {
      // Switch between achievements and specific badge halfway through
      screenshot = frame < scene.duration / 2 ? "app_achievements.png" : "app_badge.png";
    }
    if (scene.id === "community") screenshot = "app_community.png";
    if (scene.id === "wallet") screenshot = "app_checkin.png";

    // Ken Burns effect for the screenshot
    const scale = interpolate(frame, [0, scene.duration], [1, 1.1]);

    return (
      <AbsoluteFill className="flex flex-col items-center justify-center p-10 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="border-[10px] border-[#39FF14] rounded-[50px] w-4/5 h-3/5 mb-10 flex flex-col items-center justify-center bg-black overflow-hidden shadow-[0_0_50px_#39FF14] relative">
          <Img
            src={staticFile(screenshot)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `scale(${scale})` }}
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent opacity-80" />

          {scene.id === "reveal" && <div className="absolute top-10 text-6xl drop-shadow-lg">⛏️</div>}
          {scene.id === "proof" && <div className="absolute top-10 text-6xl drop-shadow-lg">🛡️</div>}
          {scene.id === "community" && <div className="absolute top-10 text-6xl drop-shadow-lg">🌍</div>}
          {scene.id === "wallet" && <div className="absolute top-10 text-6xl drop-shadow-lg">💳</div>}
        </div>
        <div className="space-y-4 z-10">
          {list.map((t: string, i: number) => (
            <div key={i} className="text-white text-4xl font-black text-center uppercase tracking-tighter" style={{
              color: i === 0 ? "#FF6B2B" : "white",
              textShadow: "0 4px 10px rgba(0,0,0,0.8)",
              opacity: interpolate(frame, [i * 20, i * 20 + 10], [0, 1], { extrapolateRight: "clamp" })
            }}>
              {t}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  return null;
};
