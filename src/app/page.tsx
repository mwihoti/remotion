"use client";

/* eslint-disable @remotion/warn-native-media-tag */

import { ChangeEvent, useMemo, useState } from "react";
import { Player } from "@remotion/player";
import {
  defaultVideoPlan,
  getVideoFormat,
  getVideoPlanDuration,
  normalizeVideoPlan,
  videoFormats,
  VideoPlan,
  VideoPlanSlide,
} from "../lib/video-plan";
import { ImageVideoComposition } from "../scenes/images/ImageVideoComposition";

const sampleImages = [
  "app_home.png",
  "app_checkin.png",
  "app_progress.png",
  "app_achievements.png",
  "app_community.png",
  "app_badge.png",
];

const imageSrc = (image: string) =>
  image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://")
    ? image
    : `/${image.split("/").map(encodeURIComponent).join("/")}`;

const imageLabel = (image: string, index?: number) =>
  image.startsWith("data:")
    ? `Uploaded image${typeof index === "number" ? ` ${index + 1}` : ""}`
    : image;

const captionFromFileName = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });

const ctaHref = (url: string) => {
  if (!url.trim()) return "#";
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
};

export default function CreatorDashboard() {
  const [plan, setPlan] = useState<VideoPlan>(defaultVideoPlan);
  const [description, setDescription] = useState("");
  const [availableImages, setAvailableImages] = useState(sampleImages);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState("Ready");
  const [renderUrl, setRenderUrl] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const activeSlide = plan.slides[activeSceneIndex] ?? plan.slides[0];

  const totalSeconds = useMemo(
    () => Math.round(plan.slides.reduce((total, slide) => total + slide.duration, 120) / 30),
    [plan.slides],
  );

  const updatePlan = (patch: Partial<VideoPlan>) => {
    setPlan((current) => normalizeVideoPlan({ ...current, ...patch }));
  };

  const updateColor = (key: keyof VideoPlan["colors"], value: string) => {
    setPlan((current) => ({
      ...current,
      colors: {
        ...current.colors,
        [key]: value,
      },
    }));
  };

  const updateFormat = (formatId: string) => {
    const format = getVideoFormat(formatId);
    updatePlan({ format });
    setStatus(`Format set to ${format.label}`);
  };

  const updateSlide = (index: number, patch: Partial<VideoPlanSlide>) => {
    setPlan((current) => ({
      ...current,
      slides: current.slides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide,
      ),
    }));
  };

  const addSlide = () => {
    const image = availableImages[0] ?? "app_home.png";
    setPlan((current) => {
      setActiveSceneIndex(current.slides.length);
      return {
        ...current,
        slides: [
          ...current.slides,
          {
            image,
            caption: "New scene",
            voiceover: "Describe what this scene should say.",
            duration: 90,
          },
        ],
      };
    });
    setStatus("Added a new editable scene");
  };

  const removeSlide = (index: number) => {
    setPlan((current) => {
      const slides = current.slides.filter((_, slideIndex) => slideIndex !== index);
      setActiveSceneIndex((active) => Math.min(active, slides.length - 1));
      return {
        ...current,
        slides,
      };
    });
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    setPlan((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.slides.length) {
        return current;
      }

      const slides = [...current.slides];
      const [slide] = slides.splice(index, 1);
      slides.splice(nextIndex, 0, slide);
      setActiveSceneIndex(nextIndex);
      return { ...current, slides };
    });
  };

  const uploadImages = async () => {
    if (!selectedFiles?.length) {
      setStatus("Choose image files first");
      return;
    }

    setIsBusy(true);
    setStatus("Adding images to this project");

    try {
      const files = Array.from(selectedFiles);
      const uploadedImages = await Promise.all(
        files.map(async (file) => ({
          image: await readFileAsDataUrl(file),
          caption: captionFromFileName(file.name),
        })),
      );

      setAvailableImages((current) =>
        Array.from(new Set([...current, ...uploadedImages.map((upload) => upload.image)])),
      );
      setPlan((current) => {
        setActiveSceneIndex(current.slides.length);
        return {
          ...current,
          slides: [
            ...current.slides,
            ...uploadedImages.map(({ image, caption }) => ({
              image,
              caption,
              voiceover: `${caption} introduces a key visual in the video.`,
              duration: 90,
            })),
          ],
        };
      });
      setStatus(`Added ${uploadedImages.length} image${uploadedImages.length === 1 ? "" : "s"}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not add images");
    } finally {
      setIsBusy(false);
    }
  };

  const generatePlan = async () => {
    setIsBusy(true);
    setStatus("Generating script");
    setRenderUrl("");

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          plan,
          images: plan.slides.map((slide) => slide.image).filter(Boolean),
        }),
      });
      const data = (await response.json()) as { plan?: VideoPlan; usedAi?: boolean; error?: string };

      if (!response.ok || !data.plan) {
        throw new Error(data.error ?? "Generation failed");
      }

      setPlan(normalizeVideoPlan(data.plan));
      setActiveSceneIndex(0);
      setStatus(data.usedAi ? "Generated with OpenRouter" : "Generated locally");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsBusy(false);
    }
  };

  const renderVideo = async () => {
    setIsBusy(true);
    setStatus("Rendering MP4");
    setRenderUrl("");

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json()) as { url?: string; error?: string; detail?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.detail ?? data.error ?? "Render failed");
      }

      setRenderUrl(data.url);
      setStatus("Render complete");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Render failed");
    } finally {
      setIsBusy(false);
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  return (
    <main className="creator-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Creator Dashboard</p>
            <h1>Image Video Studio</h1>
          </div>
          <div className="status-pill">{status}</div>
        </header>

        <div className="layout-grid">
          <section className="editor-panel">
            <div className="panel-header">
              <h2>Project</h2>
              <span>
                {plan.format.width}x{plan.format.height} · {totalSeconds}s
              </span>
            </div>

            <div className="field-grid">
              <label className="wide">
                Format
                <select value={plan.format.id} onChange={(event) => updateFormat(event.target.value)}>
                  {videoFormats.map((format) => (
                    <option value={format.id} key={format.id}>
                      {format.label} · {format.width}x{format.height}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Title
                <input value={plan.title} onChange={(event) => updatePlan({ title: event.target.value })} />
              </label>
              <label>
                CTA
                <input value={plan.cta} onChange={(event) => updatePlan({ cta: event.target.value })} />
              </label>
              <label className="wide">
                Subtitle
                <input value={plan.subtitle} onChange={(event) => updatePlan({ subtitle: event.target.value })} />
              </label>
              <label>
                URL
                <input value={plan.url} onChange={(event) => updatePlan({ url: event.target.value })} />
              </label>
              <label>
                Accent
                <input
                  type="color"
                  value={plan.colors.accent}
                  onChange={(event) => updateColor("accent", event.target.value)}
                />
              </label>
              <label className="wide">
                Video Prompt
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Example: Create a 30-second product video for a budgeting app for freelancers. Tone: confident, clear, modern."
                  rows={4}
                />
              </label>
            </div>

            <div className="action-row">
              <label className="file-control">
                Images
                <input type="file" accept="image/*" multiple onChange={onFileChange} />
              </label>
              <button type="button" onClick={uploadImages} disabled={isBusy}>
                Add Images
              </button>
              <button type="button" onClick={generatePlan} disabled={isBusy}>
                Generate Script From Prompt
              </button>
              <button type="button" className="primary-button" onClick={renderVideo} disabled={isBusy}>
                Export MP4
              </button>
            </div>

            {renderUrl ? (
              <a className="download-link" href={renderUrl} download>
                Download rendered video
              </a>
            ) : null}

            <div className="panel-header">
              <h2>Scenes</h2>
              <button type="button" onClick={addSlide} disabled={isBusy}>
                Add Scene
              </button>
            </div>

            <div className="scene-list">
              {plan.slides.length === 0 ? (
                <div className="empty-state">
                  Write a prompt and generate a script, or add images to create scenes.
                </div>
              ) : null}
              {plan.slides.map((slide, index) => (
                <article
                  className={`scene-row ${index === activeSceneIndex ? "active-scene" : ""}`}
                  key={`${slide.image}-${index}`}
                >
                  <button
                    type="button"
                    className="thumb-button"
                    onClick={() => {
                      setActiveSceneIndex(index);
                      setStatus(`Editing scene ${index + 1}`);
                    }}
                  >
                    {slide.image ? (
                      <img className="scene-thumb" src={imageSrc(slide.image)} alt="" />
                    ) : (
                      <span className="scene-thumb placeholder-thumb">Text</span>
                    )}
                  </button>
                  <div className="scene-fields">
                    <div className="inline-fields">
                      <label>
                        Image
                        <select value={slide.image} onChange={(event) => updateSlide(index, { image: event.target.value })}>
                          <option value="">Text scene</option>
                          {availableImages.map((image, imageIndex) => (
                            <option value={image} key={image}>
                              {imageLabel(image, imageIndex)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Frames
                        <input
                          type="number"
                          min={60}
                          step={15}
                          value={slide.duration}
                          onChange={(event) => updateSlide(index, { duration: Number(event.target.value) })}
                        />
                      </label>
                    </div>
                    <label>
                      Caption
                      <input value={slide.caption} onChange={(event) => updateSlide(index, { caption: event.target.value })} />
                    </label>
                    <label>
                      Voiceover
                      <textarea
                        value={slide.voiceover ?? ""}
                        onChange={(event) => updateSlide(index, { voiceover: event.target.value })}
                        rows={2}
                      />
                    </label>
                    <div className="scene-actions">
                      <button type="button" onClick={() => moveSlide(index, -1)} disabled={isBusy || index === 0}>
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSlide(index, 1)}
                        disabled={isBusy || index === plan.slides.length - 1}
                      >
                        Down
                      </button>
                      <button type="button" onClick={() => removeSlide(index)} disabled={isBusy || plan.slides.length <= 1}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="preview-panel">
            <div
              className="player-wrap"
              style={{
                aspectRatio: `${plan.format.width} / ${plan.format.height}`,
              }}
            >
              <Player
                component={ImageVideoComposition}
                inputProps={{ plan }}
                durationInFrames={getVideoPlanDuration(plan)}
                fps={30}
                compositionWidth={plan.format.width}
                compositionHeight={plan.format.height}
                controls
                loop
                className="remotion-player"
              />
            </div>

            <div className="script-panel">
              <div className="panel-header">
                <h2>Current Scene</h2>
                <span>
                  {plan.slides.length === 0 ? "0/0" : `${activeSceneIndex + 1}/${plan.slides.length}`}
                </span>
              </div>
              {activeSlide ? (
                <div className="current-scene">
                  {activeSlide.image ? (
                    <img src={imageSrc(activeSlide.image)} alt="" />
                  ) : (
                    <div className="current-placeholder">Text</div>
                  )}
                  <div>
                    <strong>{activeSlide.caption}</strong>
                    <p>{activeSlide.voiceover || "No voiceover yet."}</p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">No scenes yet.</div>
              )}
              <h2>Script</h2>
              <p className="hook-line">{plan.hook}</p>
              <ol>
                {plan.slides.map((slide, index) => (
                  <li key={`${slide.caption}-${index}`}>{slide.voiceover || slide.caption}</li>
                ))}
              </ol>
              <a className="cta-link" href={ctaHref(plan.url)} target="_blank" rel="noreferrer">
                {plan.cta}
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
