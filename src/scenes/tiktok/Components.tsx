import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Captions: React.FC<{ text: string | string[]; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const textString = Array.isArray(text) ? text.join(" ") : text;
  const words = textString.split(" ");
  
  return (
    <div className="flex flex-wrap justify-center px-10 gap-x-2 gap-y-1">
      {words.map((word, i) => {
        const wordDelay = delay + i * 5;
        const opacity = interpolate(frame, [wordDelay, wordDelay + 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const scale = spring({
          frame: frame - wordDelay,
          fps,
          config: { damping: 10, stiffness: 100 },
        });

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `scale(${scale})`,
              display: "inline-block",
              color: "white",
              fontSize: "4rem",
              fontWeight: "900",
              textShadow: "0 0 10px rgba(0,0,0,0.5)",
              WebkitTextStroke: "1px black",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const Watermark: React.FC<{ url: string }> = ({ url }) => {
  return (
    <>
      <div className="absolute bottom-10 left-10 text-white font-bold text-2xl opacity-50">
        DAILIY HABIT HUB
      </div>
      <div className="absolute bottom-10 right-10 text-white font-bold text-2xl opacity-50">
        {url}
      </div>
    </>
  );
};
