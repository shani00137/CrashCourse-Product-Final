import { useRef, useEffect, useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  ImagePlus,
  Superscript,
  Subscript,
  Sigma,
  Loader2,
  Trash2,
  X
} from "lucide-react";
import { deleteQuestionImage, uploadQuestionImage } from "../../../services/questionService";
import { normalizeFileUrls } from "../../../utils/html";

/**
 * Symbol groups shown in the symbol picker. Grouped by what medical authors
 * reach for most often: maths operators, Greek letters, superscript/subscript
 * digits, units, and clinical punctuation.
 */
const SYMBOL_GROUPS = [
  {
    label: "Maths",
    symbols: [
      "+", "−", "×", "÷", "±", "≠", "≈", "≤", "≥", "∞",
      "√", "∛", "∑", "∏", "∫", "∂", "Δ", "·", "∴", "∝"
    ]
  },
  {
    label: "Greek",
    symbols: [
      "α", "β", "γ", "δ", "μ", "π", "σ", "ω", "Ω",
      "θ", "λ", "κ", "Δ", "Σ", "Φ", "Ψ", "χ", "τ", "φ"
    ]
  },
  {
    label: "Super / Sub",
    symbols: [
      "⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "⁺", "⁻",
      "₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉", "₊", "₋"
    ]
  },
  {
    label: "Units",
    symbols: [
      "°", "%", "‰", "µ", "μ", "Ω", "Å", "′", "″", "g", "mg", "kg", "mL", "L", "mm", "cm", "kg/m²", "m³"
    ]
  },
  {
    label: "Medical",
    symbols: [
      "±", "→", "←", "↑", "↓", "↔", "⇒", "∵", "∴", "≠",
      "†", "‡", "§", "¶", "℮", "≈", "∅", "∈", "⊂", "⊃"
    ]
  }
];

const IMAGE_WIDTHS = [
  { label: "Tiny", value: "80px" },
  { label: "Small", value: "160px" },
  { label: "Medium", value: "280px" },
  { label: "Large", value: "420px" },
  { label: "Full", value: "100%" }
];

const IMAGE_ALIGNS = [
  { label: "Inline", value: "inline" },
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" }
];

function buildImageHtml(src, width, align, alt) {
  const safeSrc = String(src || "").replace(/"/g, "%22");
  const safeAlt = String(alt || "question image").replace(/"/g, "&quot;");
  let layout;
  if (align === "center") layout = "display:block;margin:8px auto;";
  else if (align === "left") layout = "float:left;margin:4px 12px 4px 0;";
  else if (align === "right") layout = "float:right;margin:4px 0 4px 12px;";
  else layout = "display:inline-block;vertical-align:middle;margin:0 4px;";
  const sizing = `width:${width};max-width:100%;height:auto;`;
  return `<img src="${safeSrc}" alt="${safeAlt}" data-align="${align}" data-width="${width}" style="${sizing}${layout}" />`;
}

const btnClass = "p-1 rounded hover:bg-gray-200 text-[#718096] hover:text-[#1A202C] transition";
const btnActiveClass = "p-1 rounded bg-gray-200 text-[#C41E3A] transition";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className = "",
  minHeight = "min-h-[60px]",
  maxHeight = "max-h-[200px]",
  showSymbols = true,
  allowImages = true
}) {
  const ref = useRef(null);
  const lastHtmlRef = useRef("");
  const fileInputRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [symbolsOpen, setSymbolsOpen] = useState(false);
  const [symbolGroup, setSymbolGroup] = useState(0);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageTarget, setImageTarget] = useState(null);
  const [imageWidth, setImageWidth] = useState("280px");
  const [imageAlign, setImageAlign] = useState("inline");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!ref.current) return;
    const normalized = normalizeFileUrls(value || "");
    if (ref.current.innerHTML !== normalized) {
      ref.current.innerHTML = normalized;
      lastHtmlRef.current = normalized;
      if (normalized !== (value || "")) onChange?.(normalized);
    }
  }, []);

  const emitChange = useCallback(() => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    if (html !== lastHtmlRef.current) {
      lastHtmlRef.current = html;
      onChange?.(html);
    }
  }, [onChange]);

  const exec = (cmd, val) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val ?? null);
    emitChange();
  };

  /** Inserts a symbol at the caret so typing continues right after it. */
  const insertSymbol = (symbol) => {
    ref.current?.focus();
    document.execCommand("insertText", false, symbol);
    emitChange();
  };

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount && ref.current?.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !ref.current) return;
    const saved = savedRangeRef.current;
    if (saved && ref.current.contains(saved.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(saved);
    } else {
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    ref.current.focus();
  }, []);

  const openForFile = useCallback((file) => {
    if (!allowImages || !file || !file.type.startsWith("image/")) return;
    saveSelection();
    setImageFile(file);
    setImageTarget(null);
    setImageWidth("280px");
    setImageAlign("inline");
    setImageError("");
    setSymbolsOpen(false);
    setImageOpen(true);
  }, [allowImages, saveSelection]);

  const openForImage = useCallback((img) => {
    saveSelection();
    setImageFile(null);
    setImageTarget(img);
    setImageWidth(img?.getAttribute("data-width") || "280px");
    setImageAlign(img?.getAttribute("data-align") || "inline");
    setImageError("");
    setSymbolsOpen(false);
    setImageOpen(true);
  }, [saveSelection]);

  const applyImage = useCallback(async () => {
    setImageError("");
    if (imageTarget) {
      const src = normalizeFileUrls(imageTarget.getAttribute("src"));
      const alt = imageTarget.getAttribute("alt");
      imageTarget.outerHTML = buildImageHtml(src, imageWidth, imageAlign, alt);
      emitChange();
    } else if (imageFile) {
      setImageBusy(true);
      try {
        const result = await uploadQuestionImage(imageFile);
        const path = typeof result === "string" ? result : result?.url;
        if (!path) throw new Error("Upload did not return a file path.");
        const normalized = normalizeFileUrls(path);
        const src = normalized.startsWith("/") ? normalized : `/${normalized}`;
        restoreSelection();
        document.execCommand("insertHTML", false, buildImageHtml(src, imageWidth, imageAlign, imageFile.name));
        emitChange();
      } catch (e) {
        setImageError(e instanceof Error && e.message ? e.message : "Image upload failed.");
        return;
      } finally {
        setImageBusy(false);
      }
    }
    setImageOpen(false);
    setImageFile(null);
    setImageTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [imageTarget, imageFile, imageWidth, imageAlign, emitChange, restoreSelection]);

  const removeImage = useCallback(async () => {
    if (!imageTarget) {
      setImageOpen(false);
      return;
    }
    const src = normalizeFileUrls(imageTarget.getAttribute("src") || "");
    const isManagedImage = src.includes("/api/Files/questions/images/") || src.includes("questions/images/");
    setImageError("");
    setImageBusy(true);
    try {
      if (isManagedImage) {
        const stillUsed = Array.from(ref.current?.querySelectorAll("img") || []).some(
          (img) => img !== imageTarget && normalizeFileUrls(img.getAttribute("src") || "") === src
        );
        if (!stillUsed) await deleteQuestionImage(src);
      }
      if (imageTarget.parentNode) imageTarget.parentNode.removeChild(imageTarget);
      emitChange();
      setImageOpen(false);
      setImageTarget(null);
      setImageFile(null);
    } catch (e) {
      setImageError(e instanceof Error && e.message ? e.message : "Image removal failed.");
    } finally {
      setImageBusy(false);
    }
  }, [imageTarget, emitChange]);

  const handleEditorClick = (e) => {
    if (!allowImages) return;
    const img = e.target?.closest?.("img");
    if (img && ref.current?.contains(img)) {
      e.preventDefault();
      openForImage(img);
    }
  };

  const handlePaste = (e) => {
    if (!allowImages) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) openForFile(blob);
        return;
      }
    }
  };

  const handleDrop = (e) => {
    if (!allowImages) return;
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        openForFile(file);
        return;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "b" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); exec("bold"); }
    if (e.key === "i" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); exec("italic"); }
    if (e.key === "u" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); exec("underline"); }
  };

  return (
    <div className={`border border-[rgba(0,0,0,0.12)] rounded-lg overflow-visible relative ${className}`}>
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1 border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC] rounded-t-lg">
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("bold"); }} className={btnClass} title="Bold (Ctrl+B)">
          <Bold size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("italic"); }} className={btnClass} title="Italic (Ctrl+I)">
          <Italic size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("underline"); }} className={btnClass} title="Underline (Ctrl+U)">
          <UnderlineIcon size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("strikeThrough"); }} className={btnClass} title="Strikethrough">
          <Strikethrough size={13} />
        </button>
        <span className="w-px h-4 bg-gray-200 mx-0.5" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("superscript"); }} className={btnClass} title="Superscript (x²)">
          <Superscript size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("subscript"); }} className={btnClass} title="Subscript (H₂O)">
          <Subscript size={13} />
        </button>
        <span className="w-px h-4 bg-gray-200 mx-0.5" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} className={btnClass} title="Bullet list">
          <List size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }} className={btnClass} title="Numbered list">
          <ListOrdered size={13} />
        </button>
        {showSymbols && (
          <>
            <span className="w-px h-4 bg-gray-200 mx-0.5" />
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setImageOpen(false); setSymbolsOpen(o => !o); }}
              className={symbolsOpen ? btnActiveClass : btnClass}
              title="Math & medical symbols"
            >
              <Sigma size={13} />
            </button>
          </>
        )}
        {allowImages && (
          <>
            <span className="w-px h-4 bg-gray-200 mx-0.5" />
            <label className={btnClass} title="Insert image (resize and align before inserting)" onMouseDown={saveSelection}>
              <ImagePlus size={13} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) openForFile(file);
                  e.target.value = "";
                }}
              />
            </label>
          </>
        )}
      </div>

      {imageOpen && (
        <div className="absolute z-40 mt-1 w-72 bg-white rounded-lg border border-[rgba(0,0,0,0.12)] shadow-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#718096]">
              {imageTarget ? "Image settings" : "Insert image"}
            </span>
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setImageOpen(false); setImageFile(null); setImageTarget(null); }}
              className="text-gray-400 hover:text-gray-600 transition"
              title="Close"
            >
              <X size={13} />
            </button>
          </div>
          {imageFile && (
            <p className="text-[10px] text-[#718096] mb-2 truncate" title={imageFile.name}>{imageFile.name}</p>
          )}
          <p className="text-[10px] font-semibold text-[#A0AEC0] mb-1">Width</p>
          <div className="grid grid-cols-5 gap-1 mb-2">
            {IMAGE_WIDTHS.map((w) => (
              <button
                key={w.value}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => setImageWidth(w.value)}
                className={`py-1 rounded text-[10px] font-semibold transition ${
                  imageWidth === w.value ? "bg-[#C41E3A] text-white" : "bg-[#F7FAFC] text-[#718096] hover:bg-gray-100"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] font-semibold text-[#A0AEC0] mb-1">Align with text</p>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {IMAGE_ALIGNS.map((a) => (
              <button
                key={a.value}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => setImageAlign(a.value)}
                className={`py-1 rounded text-[10px] font-semibold transition ${
                  imageAlign === a.value ? "bg-[#C41E3A] text-white" : "bg-[#F7FAFC] text-[#718096] hover:bg-gray-100"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          {imageError && <p className="text-[10px] text-red-600 mb-2">{imageError}</p>}
          <div className="flex items-center gap-2">
            {imageTarget && (
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={removeImage}
                disabled={imageBusy}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-[#C41E3A] hover:bg-[#FFF0F2] disabled:opacity-60"
                title="Remove image and delete it from storage"
              >
                <Trash2 size={11} />
                Remove
              </button>
            )}
            <div className="flex justify-end gap-2 ml-auto">
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => { setImageOpen(false); setImageFile(null); setImageTarget(null); }}
                className="px-2 py-1 rounded text-[11px] font-semibold text-[#718096] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={applyImage}
                disabled={imageBusy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#C41E3A] text-white disabled:opacity-60"
              >
                {imageBusy && <Loader2 size={11} className="animate-spin" />}
                {imageTarget ? "Apply" : "Insert"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSymbols && symbolsOpen && (
        <div className="absolute z-30 mt-1 w-72 bg-white rounded-lg border border-[rgba(0,0,0,0.12)] shadow-xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(0,0,0,0.06)]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#718096]">Symbols</span>
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => setSymbolsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition"
              title="Close symbols"
            >
              <X size={13} />
            </button>
          </div>
          <div className="flex gap-1 px-2 pt-2 flex-wrap">
            {SYMBOL_GROUPS.map((group, i) => (
              <button
                key={group.label}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => setSymbolGroup(i)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                  symbolGroup === i ? "bg-[#C41E3A] text-white" : "bg-[#F7FAFC] text-[#718096] hover:bg-gray-100"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-10 gap-0.5 p-2">
            {SYMBOL_GROUPS[symbolGroup].symbols.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => insertSymbol(symbol)}
                title={`Insert ${symbol}`}
                className="h-7 rounded text-xs text-[#1A202C] hover:bg-[#FFF0F2] hover:text-[#C41E3A] transition"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onClick={handleEditorClick}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className={`${minHeight} ${maxHeight} overflow-y-auto px-3 py-2 text-xs text-[#1A202C] leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400`}
        data-placeholder={placeholder || "Type here..."}
        style={{ wordBreak: "break-word" }}
      />
    </div>
  );
}
