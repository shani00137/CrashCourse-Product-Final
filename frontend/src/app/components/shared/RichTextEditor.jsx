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
  X
} from "lucide-react";

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

const btnClass = "p-1 rounded hover:bg-gray-200 text-[#718096] hover:text-[#1A202C] transition";
const btnActiveClass = "p-1 rounded bg-gray-200 text-[#C41E3A] transition";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className = "",
  minHeight = "min-h-[60px]",
  maxHeight = "max-h-[200px]",
  showSymbols = true
}) {
  const ref = useRef(null);
  const lastHtmlRef = useRef("");
  const [symbolsOpen, setSymbolsOpen] = useState(false);
  const [symbolGroup, setSymbolGroup] = useState(0);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
      lastHtmlRef.current = value || "";
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

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          ref.current?.focus();
          document.execCommand("insertImage", false, dataUrl);
          emitChange();
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  };

  const handleDrop = (e) => {
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          ref.current?.focus();
          document.execCommand("insertImage", false, dataUrl);
          emitChange();
        };
        reader.readAsDataURL(file);
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
              onClick={() => setSymbolsOpen(o => !o)}
              className={symbolsOpen ? btnActiveClass : btnClass}
              title="Math & medical symbols"
            >
              <Sigma size={13} />
            </button>
          </>
        )}
        <span className="w-px h-4 bg-gray-200 mx-0.5" />
        <label className={btnClass} title="Insert image">
          <ImagePlus size={13} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                ref.current?.focus();
                document.execCommand("insertImage", false, reader.result);
                emitChange();
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

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
