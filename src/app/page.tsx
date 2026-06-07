"use client";

import { ChangeEvent, useMemo, useState } from "react";
import Image from "next/image";
import { defaultVideoPlan, normalizeVideoPlan, VideoPlan, VideoPlanSlide } from "../lib/video-plan";

const starterImages = Array.from(new Set(defaultVideoPlan.slides.map((slide) => slide.image)));

const imageSrc = (image: string) => `/${image.split("/").map(encodeURIComponent).join("/")}`;

export default function CreatorDashboard() {
  const [plan, setPlan] = useState<VideoPlan>(defaultVideoPlan);
  const [description, setDescription] = useState(
    "A Web3 fitness and habit app where users check in daily, earn tokens, unlock achievement NFTs, and stay accountable with a community.",
  );
  const [availableImages, setAvailableImages] = useState(starterImages);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState("Ready");
  const [renderUrl, setRenderUrl] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const activeSlide = plan.slides[0];

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
    setPlan((current) => ({
      ...current,
      slides: [
        ...current.slides,
        {
          image,
          caption: "New scene",
          voiceover: "",
          duration: 90,
        },
      ],
    }));
  };

  const removeSlide = (index: number) => {
    setPlan((current) => ({
      ...current,
      slides: current.slides.filter((_, slideIndex) => slideIndex !== index),
    }));
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
      return { ...current, slides };
    });
  };

  const uploadImages = async () => {
    if (!selectedFiles?.length) {
      setStatus("Choose image files first");
      return;
    }

    setIsBusy(true);
    setStatus("Uploading images");
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append("images", file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { images?: string[]; error?: string };

      if (!response.ok || !data.images) {
        throw new Error(data.error ?? "Upload failed");
      }

      setAvailableImages((current) => Array.from(new Set([...current, ...data.images!])));
      setPlan((current) => ({
        ...current,
        slides: [
          ...current.slides,
          ...data.images!.map((image) => ({
            image,
            caption: image
              .split("/")
              .pop()!
              .replace(/\.[^.]+$/, "")
              .replace(/[-_]/g, " "),
            voiceover: "",
            duration: 90,
          })),
        ],
      }));
      setStatus(`Uploaded ${data.images.length} image${data.images.length === 1 ? "" : "s"}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
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
          images: availableImages,
        }),
      });
      const data = (await response.json()) as { plan?: VideoPlan; usedAi?: boolean; error?: string };

      if (!response.ok || !data.plan) {
        throw new Error(data.error ?? "Generation failed");
      }

      setPlan(normalizeVideoPlan(data.plan));
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
              <span>{totalSeconds}s</span>
            </div>

            <div className="field-grid">
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
                Product Brief
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
              </label>
            </div>

            <div className="action-row">
              <label className="file-control">
                Images
                <input type="file" accept="image/*" multiple onChange={onFileChange} />
              </label>
              <button type="button" onClick={uploadImages} disabled={isBusy}>
                Upload
              </button>
              <button type="button" onClick={generatePlan} disabled={isBusy}>
                Generate Script
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
              {plan.slides.map((slide, index) => (
                <article className="scene-row" key={`${slide.image}-${index}`}>
                  <Image
                    className="scene-thumb"
                    src={imageSrc(slide.image)}
                    alt=""
                    width={96}
                    height={132}
                    unoptimized
                  />
                  <div className="scene-fields">
                    <div className="inline-fields">
                      <label>
                        Image
                        <select value={slide.image} onChange={(event) => updateSlide(index, { image: event.target.value })}>
                          {availableImages.map((image) => (
                            <option value={image} key={image}>
                              {image}
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
            <div className="phone-preview" style={{ backgroundColor: plan.colors.background }}>
              {activeSlide ? (
                <>
                  <Image className="preview-bg" src={imageSrc(activeSlide.image)} alt="" fill unoptimized />
                  <div className="preview-top">
                    <span>{plan.title}</span>
                    <span style={{ color: plan.colors.accent }}>{plan.slides.length} scenes</span>
                  </div>
                  <div className="preview-shot" style={{ borderColor: plan.colors.accent }}>
                    <Image className="preview-image" src={imageSrc(activeSlide.image)} alt="" fill unoptimized />
                  </div>
                  <div className="preview-caption" style={{ backgroundColor: plan.colors.accent }}>
                    {activeSlide.caption}
                  </div>
                </>
              ) : null}
            </div>

            <div className="script-panel">
              <h2>Script</h2>
              <p className="hook-line">{plan.hook}</p>
              <ol>
                {plan.slides.map((slide, index) => (
                  <li key={`${slide.caption}-${index}`}>{slide.voiceover || slide.caption}</li>
                ))}
              </ol>
              <p className="cta-line">{plan.cta}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
