import { useState } from "react";
import { X, Upload, FileImage, Cpu, ImagePlus } from "lucide-react";

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function UploadCard({
  previewUrl,
  selectedFile,
  loading,
  onSelectFile,
  onClearFile,
  onStartScreening,
  error,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const hasImage = !!previewUrl;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Gradient border glow */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-teal-500/10" />
      <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-500" />

      <div className="p-6">
        {/* Drop zone / preview */}
        <div
          className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
            hasImage
              ? "border border-slate-200"
              : `border-2 border-dashed p-8 text-center ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/80 shadow-[inset_0_0_30px_rgba(59,130,246,0.08)]"
                    : "border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50/30"
                }`
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            if (!hasImage) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            onSelectFile(e.dataTransfer.files?.[0]);
          }}
        >
          {hasImage ? (
            <div className="group relative" style={{ animation: "uc-previewIn 350ms ease-out" }}>
              <img
                src={previewUrl}
                alt="Selected fundus preview"
                className="max-h-[300px] w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {/* Overlay info bar */}
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 rounded-b-xl bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-3 pt-8">
                <FileImage className="h-4 w-4 shrink-0 text-white/80" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{selectedFile?.name}</p>
                  <p className="text-xs text-white/60">{formatSize(selectedFile?.size)}</p>
                </div>
                <span className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  Ready
                </span>
              </div>
              {onClearFile && !loading && (
                <button
                  type="button"
                  onClick={onClearFile}
                  className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-red-500/80"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <>
              {/* AI watermark background icon */}
              <Cpu className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 rotate-12 text-blue-100/40" />

              <div
                className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/20"
                style={{ animation: "uc-float 3s ease-in-out infinite" }}
              >
                {isDragging ? (
                  <ImagePlus className="h-7 w-7" />
                ) : (
                  <Upload className="h-7 w-7" />
                )}
              </div>

              <p className="mt-5 text-base font-bold text-slate-800">
                {isDragging ? "Release to Start AI Analysis" : "Drop your fundus image here"}
              </p>
              <p className="mt-1.5 text-sm text-slate-500">
                {isDragging ? "We'll begin processing immediately" : "Supports JPG & PNG retinal images"}
              </p>

              <label className="group mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:brightness-110">
                <Upload className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                Select Image
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={(e) => onSelectFile(e.target.files?.[0])}
                />
              </label>
            </>
          )}
        </div>

        {/* Start screening button */}
        <button
          type="button"
          onClick={onStartScreening}
          disabled={!selectedFile || loading}
          className="uc-ripple mt-5 relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300 disabled:shadow-none active:scale-[0.99]"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Analyzing...
            </>
          ) : (
            <>
              <Cpu className="h-4 w-4" />
              Start AI Screening
            </>
          )}
        </button>

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>

      <style>
        {`@keyframes uc-previewIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes uc-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }`}
      </style>
    </div>
  );
}

export default UploadCard;
