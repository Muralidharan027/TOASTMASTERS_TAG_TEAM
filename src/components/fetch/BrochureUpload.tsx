import React, { useRef, useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Sparkles, PenLine, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface BrochureUploadProps {
  onFileSelected: (file: File, previewUrl: string) => void;
  onManualEntry: () => void;
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export const BrochureUpload: React.FC<BrochureUploadProps> = ({
  onFileSelected,
  onManualEntry,
  hasApiKey,
  onOpenSettings,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; file: File } | null>(null);

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Unsupported file type. Please upload a JPG, PNG, or WEBP image.');
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError('Image is too large. Please upload an image smaller than 10 MB.');
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview({ url, file });
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    e.target.value = '';
  };

  const handleExtract = () => {
    if (preview) onFileSelected(preview.file, preview.url);
  };

  const handleReplace = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setError(null);
  };

  // ── Preview State ────────────────────────────────────────────────────────────
  if (preview) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Uploaded Brochure
          </p>
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 max-h-[420px]">
            <img
              src={preview.url}
              alt="Meeting brochure preview"
              className="w-full object-contain max-h-[420px]"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate font-medium">
            {preview.file.name} &nbsp;·&nbsp; {(preview.file.size / 1024).toFixed(0)} KB
          </p>
        </div>

        {!hasApiKey && (
          <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-300 mb-2">
              ✦ Gemini API key required
            </p>
            <p className="text-xs text-violet-700 dark:text-violet-400 mb-3">
              Add your Gemini API key in Settings to extract details from this brochure.
            </p>
            <Button size="sm" variant="outline" onClick={onOpenSettings}>
              Open Settings
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleReplace}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Replace Image
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleExtract}
            disabled={!hasApiKey}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="flex-1 bg-violet-600 hover:bg-violet-700 border-violet-600 disabled:opacity-50"
          >
            Extract Details
          </Button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onManualEntry}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
          >
            Enter details manually instead
          </button>
        </div>
      </div>
    );
  }

  // ── Upload State ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 p-10 rounded-3xl border-2 border-dashed
          transition-all duration-200 cursor-pointer group
          ${dragOver
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-violet-400 hover:bg-violet-50/40 dark:hover:bg-violet-950/20'
          }
        `}
      >
        <div
          className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
            ${dragOver
              ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 group-hover:text-violet-500'
            }
          `}
        >
          {dragOver ? (
            <ImageIcon className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>

        <div className="text-center">
          <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
            {dragOver ? 'Drop your brochure here' : 'Upload Brochure'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Drag & drop an image here, or click to browse
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
            JPG · PNG · WEBP · Max 10 MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
          <X className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* No API Key notice */}
      {!hasApiKey && (
        <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
          <p className="text-xs font-semibold text-violet-800 dark:text-violet-300 mb-1.5">
            ✦ Gemini API key needed
          </p>
          <p className="text-xs text-violet-700 dark:text-violet-400 mb-3">
            Add your free Gemini API key in Settings to use Fetch.
          </p>
          <Button size="sm" variant="outline" onClick={onOpenSettings}>
            Add API Key in Settings
          </Button>
        </div>
      )}

      {/* Manual fallback */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs text-slate-400 font-semibold">OR</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <button
        type="button"
        onClick={onManualEntry}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <PenLine className="w-4 h-4" />
        Enter Details Manually
      </button>
    </div>
  );
};
