import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  X, ArrowRight, ArrowLeft, Upload, Film, Sparkles, 
  Check, Loader2, Trash2, GripVertical, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useBulkUpload, type EpisodeSegment, type FunnelStep } from "@/hooks/useBulkUpload";
import { VideoDropzone } from "@/components/studio/VideoDropzone";

interface BulkUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENRES = [
  "Drama", "Comedy", "Romance", "Thriller", "Mystery",
  "Fashion", "Lifestyle", "Documentary", "Action", "Sci-Fi",
];

const STEPS: { key: FunnelStep; label: string }[] = [
  { key: "series", label: "Serie" },
  { key: "upload", label: "Upload" },
  { key: "segments", label: "Episoden" },
  { key: "review", label: "Fertig" },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BulkUploadWizard({ isOpen, onClose }: BulkUploadWizardProps) {
  const navigate = useNavigate();
  const bulk = useBulkUpload();

  if (!isOpen) return null;

  const currentStepIdx = STEPS.findIndex(s => s.key === bulk.step);

  const canProceed = (): boolean => {
    switch (bulk.step) {
      case "series": return bulk.seriesTitle.trim().length > 0;
      case "upload": return !!bulk.videoAssetId;
      case "segments": return bulk.segments.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    const idx = STEPS.findIndex(s => s.key === bulk.step);
    if (idx < STEPS.length - 1) {
      bulk.setStep(STEPS[idx + 1].key);
    }
  };

  const handleBack = () => {
    const idx = STEPS.findIndex(s => s.key === bulk.step);
    if (idx > 0) {
      bulk.setStep(STEPS[idx - 1].key);
    }
  };

  const handleFinish = async () => {
    const seriesId = await bulk.createSeriesWithEpisodes();
    if (seriesId) {
      bulk.reset();
      onClose();
      navigate(`/studio/series/${seriesId}`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Wizard */}
      <div className={cn(
        "fixed inset-x-2 inset-y-2 z-50 mx-auto sm:inset-x-4 sm:inset-y-4",
        "max-w-2xl max-h-[calc(100dvh-1rem)]",
        "bg-card rounded-2xl border border-border",
        "shadow-2xl overflow-hidden flex flex-col"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gold">Bulk Upload</h2>
            <p className="text-xs text-muted-foreground">Ein Video → Viele Episoden</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className={cn(
                  "flex items-center gap-1.5",
                )}>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                    i < currentStepIdx ? "bg-gold text-background" :
                    i === currentStepIdx ? "bg-gold text-background" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i < currentStepIdx ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-xs hidden sm:block",
                    i === currentStepIdx ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-px mx-2",
                    i < currentStepIdx ? "bg-green-500" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6">
          {bulk.step === "series" && (
            <SeriesStep
              title={bulk.seriesTitle}
              genre={bulk.seriesGenre}
              description={bulk.seriesDescription}
              onChange={bulk.setSeriesInfo}
            />
          )}

          {bulk.step === "upload" && (
            <UploadStep
              videoFile={bulk.videoFile}
              uploading={bulk.uploading}
              uploadProgress={bulk.uploadProgress}
              isProcessing={bulk.isProcessing}
              videoAssetId={bulk.videoAssetId}
              videoDuration={bulk.videoDuration}
              segmentCount={bulk.segments.length}
              onFileSelect={bulk.handleVideoSelect}
              onStartUpload={bulk.startUpload}
            />
          )}

          {bulk.step === "segments" && (
            <SegmentsStep
              segments={bulk.segments}
              videoDuration={bulk.videoDuration}
              onUpdateSegment={bulk.updateSegment}
              onDeleteSegment={bulk.deleteSegment}
              onGenerateDescription={bulk.generateDescription}
              onGenerateAllDescriptions={bulk.generateAllDescriptions}
            />
          )}

          {bulk.step === "review" && (
            <ReviewStep
              seriesTitle={bulk.seriesTitle}
              seriesGenre={bulk.seriesGenre}
              segments={bulk.segments}
              videoDuration={bulk.videoDuration}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-3 shrink-0 bg-card">
          {currentStepIdx > 0 && (
            <Button variant="outline" onClick={handleBack} disabled={bulk.isCreating}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zurück
            </Button>
          )}
          <div className="flex-1" />
          
          {bulk.step === "upload" && !bulk.videoAssetId && bulk.videoFile && !bulk.uploading && (
            <Button onClick={bulk.startUpload}>
              <Upload className="w-4 h-4 mr-1" />
              Upload starten
            </Button>
          )}

          {bulk.step !== "review" && bulk.step !== "upload" && (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Weiter
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {bulk.step === "upload" && bulk.videoAssetId && (
            <Button onClick={handleNext}>
              Weiter zu Episoden
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {bulk.step === "review" && (
            <Button onClick={handleFinish} disabled={bulk.isCreating}>
              {bulk.isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Erstelle...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Serie erstellen
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Step Components ──────────────────────────────────────────────── */

function SeriesStep({ title, genre, description, onChange }: {
  title: string;
  genre: string;
  description: string;
  onChange: (title: string, genre: string, desc: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-3">
          <Film className="w-7 h-7 text-gold" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Serie benennen</h3>
        <p className="text-sm text-muted-foreground mt-1">Gib deiner Serie einen Namen. Alles andere ist optional.</p>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground block mb-2">Titel *</label>
        <Input
          value={title}
          onChange={(e) => onChange(e.target.value, genre, description)}
          placeholder="z.B. Behind the Scenes – Fashion Week"
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground block mb-2">Genre</label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange(title, genre === g ? "" : g, description)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors",
                genre === g ? "bg-gold text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground block mb-2">Beschreibung</label>
        <Textarea
          value={description}
          onChange={(e) => onChange(title, genre, e.target.value)}
          placeholder="Optional: Worum geht es?"
          rows={3}
        />
      </div>
    </div>
  );
}

function UploadStep({ videoFile, uploading, uploadProgress, isProcessing, videoAssetId, videoDuration, segmentCount, onFileSelect, onStartUpload }: {
  videoFile: File | null;
  uploading: boolean;
  uploadProgress: number;
  isProcessing: boolean;
  videoAssetId: string | null;
  videoDuration: number;
  segmentCount: number;
  onFileSelect: (file: File) => void;
  onStartUpload: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-7 h-7 text-gold" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Video hochladen</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Lade ein langes Video hoch. Wir teilen es automatisch in ~2 Minuten Episoden.
        </p>
      </div>

      <VideoDropzone
        onFileSelect={onFileSelect}
        uploadProgress={uploadProgress}
        isUploading={uploading}
        uploadedUrl={videoAssetId ? "uploaded" : null}
      />

      {/* Duration & segment info */}
      {videoDuration > 0 && (
        <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatTime(videoDuration)} Gesamtdauer
              </p>
              <p className="text-xs text-muted-foreground">
                → {segmentCount} Episoden werden erstellt
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing status */}
      {isProcessing && (
        <div className="rounded-xl bg-gold/5 border border-gold/20 p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-gold animate-spin" />
          <div>
            <p className="text-sm font-medium text-foreground">Video wird verarbeitet…</p>
            <p className="text-xs text-muted-foreground">Du kannst bereits weiter machen.</p>
          </div>
        </div>
      )}

      {videoAssetId && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <p className="text-sm font-medium text-foreground">Video erfolgreich hochgeladen!</p>
        </div>
      )}
    </div>
  );
}

function SegmentsStep({ segments, videoDuration, onUpdateSegment, onDeleteSegment, onGenerateDescription, onGenerateAllDescriptions }: {
  segments: EpisodeSegment[];
  videoDuration: number;
  onUpdateSegment: (index: number, updates: Partial<EpisodeSegment>) => void;
  onDeleteSegment: (index: number) => void;
  onGenerateDescription: (index: number) => void;
  onGenerateAllDescriptions: () => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{segments.length} Episoden</h3>
          <p className="text-xs text-muted-foreground">Titel & Beschreibungen anpassen, Episoden löschen.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onGenerateAllDescriptions}>
          <Sparkles className="w-4 h-4 mr-1" />
          Alle beschreiben
        </Button>
      </div>

      {/* Timeline visualization */}
      <div className="rounded-xl bg-muted/20 border border-border/50 p-3">
        <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
          {segments.map((seg, i) => {
            const width = ((seg.endTime - seg.startTime) / videoDuration) * 100;
            return (
              <div
                key={seg.index}
                className={cn(
                  "h-full rounded-sm cursor-pointer transition-opacity hover:opacity-80",
                  i % 2 === 0 ? "bg-gold" : "bg-gold/60",
                  expandedIdx === seg.index && "ring-2 ring-foreground"
                )}
                style={{ width: `${width}%` }}
                onClick={() => setExpandedIdx(expandedIdx === seg.index ? null : seg.index)}
                title={`Episode ${seg.index}: ${formatTime(seg.startTime)} – ${formatTime(seg.endTime)}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">0:00</span>
          <span className="text-[10px] text-muted-foreground">{formatTime(videoDuration)}</span>
        </div>
      </div>

      {/* Episode list */}
      <div className="space-y-2">
        {segments.map((seg) => (
          <div
            key={seg.index}
            className={cn(
              "rounded-xl border transition-colors",
              expandedIdx === seg.index
                ? "border-gold/40 bg-card"
                : "border-border/30 bg-card/50"
            )}
          >
            {/* Collapsed row */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              onClick={() => setExpandedIdx(expandedIdx === seg.index ? null : seg.index)}
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {seg.index}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{seg.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(seg.startTime)} – {formatTime(seg.endTime)}
                  {" · "}
                  {formatTime(seg.endTime - seg.startTime)}
                </p>
              </div>
              {seg.description && (
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Hat Beschreibung" />
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => { e.stopPropagation(); onDeleteSegment(seg.index); }}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Expanded editor */}
            {expandedIdx === seg.index && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
                <Input
                  value={seg.title}
                  onChange={(e) => onUpdateSegment(seg.index, { title: e.target.value })}
                  placeholder="Episoden-Titel"
                />
                <div className="relative">
                  <Textarea
                    value={seg.description}
                    onChange={(e) => onUpdateSegment(seg.index, { description: e.target.value })}
                    placeholder="Beschreibung (optional)"
                    rows={2}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 text-xs"
                    onClick={() => onGenerateDescription(seg.index)}
                    disabled={seg.isGeneratingDescription}
                  >
                    {seg.isGeneratingDescription ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                    )}
                    AI
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ seriesTitle, seriesGenre, segments, videoDuration }: {
  seriesTitle: string;
  seriesGenre: string;
  segments: EpisodeSegment[];
  videoDuration: number;
}) {
  const withDesc = segments.filter(s => s.description).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
          <Check className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Alles bereit!</h3>
        <p className="text-sm text-muted-foreground mt-1">Überprüfe deine Serie und erstelle sie.</p>
      </div>

      <div className="rounded-xl border border-border/50 divide-y divide-border/30">
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Serie</span>
          <span className="text-sm font-medium text-foreground">{seriesTitle}</span>
        </div>
        {seriesGenre && (
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Genre</span>
            <span className="text-sm font-medium text-foreground">{seriesGenre}</span>
          </div>
        )}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Gesamtdauer</span>
          <span className="text-sm font-medium text-foreground">{formatTime(videoDuration)}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Episoden</span>
          <span className="text-sm font-medium text-foreground">{segments.length}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Mit Beschreibung</span>
          <span className="text-sm font-medium text-foreground">{withDesc} / {segments.length}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Alle Episoden werden als Entwurf erstellt. Du kannst sie danach einzeln veröffentlichen.
      </p>
    </div>
  );
}
