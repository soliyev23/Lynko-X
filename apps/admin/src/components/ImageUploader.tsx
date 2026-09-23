"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { UploadIcon, XIcon } from "@/components/icons";

/**
 * Rasm yuklash komponenti: fayl tanlanadi -> serverga yuklanadi ->
 * URL ro'yxatga qo'shiladi. `single` rejimida yangi rasm eskisini almashtiradi.
 */
export function ImageUploader({
  images,
  onChange,
  single = false,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  single?: boolean;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadImage(file));
      }
      onChange(single ? urls.slice(-1) : [...images, ...urls]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative group">
            <img
              src={url}
              alt=""
              className="w-24 h-24 rounded-xl object-cover border border-gray-200 bg-gray-50"
            />
            <button
              type="button"
              onClick={() => onChange(images.filter((u) => u !== url))}
              className="absolute -top-2 -right-2 bg-white border border-gray-300 text-gray-500 hover:text-error-500 hover:border-error-300 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
              aria-label={t("delete")}
            >
              <XIcon size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 hover:text-primary-600 text-gray-400 flex flex-col items-center justify-center gap-1.5 text-xs font-medium transition disabled:opacity-50"
        >
          <UploadIcon size={20} />
          {busy ? t("uploading") : t("upload")}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={!single}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-sm text-error-600 mt-2">{error}</p>}
    </div>
  );
}
