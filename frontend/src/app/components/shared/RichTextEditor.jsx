import { useRef, useEffect, useCallback } from "react";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, ImagePlus } from "lucide-react";

export function RichTextEditor({ value, onChange, placeholder, className = "" }) {
  const ref = useRef(null);
  const lastHtmlRef = useRef("");

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

  const btnClass = "p-1 rounded hover:bg-gray-200 text-[#718096] hover:text-[#1A202C] transition";

  return (
    <div className={`border border-[rgba(0,0,0,0.12)] rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("bold"); }} className={btnClass} title="Bold (Ctrl+B)">
          <Bold size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("italic"); }} className={btnClass} title="Italic (Ctrl+I)">
          <Italic size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("underline"); }} className={btnClass} title="Underline (Ctrl+U)">
          <UnderlineIcon size={13} />
        </button>
        <span className="w-px h-4 bg-gray-200 mx-0.5" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} className={btnClass} title="Bullet list">
          <List size={13} />
        </button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }} className={btnClass} title="Numbered list">
          <ListOrdered size={13} />
        </button>
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
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] max-h-[200px] overflow-y-auto px-3 py-2 text-xs text-[#1A202C] leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        data-placeholder={placeholder || "Type here..."}
        style={{ wordBreak: "break-word" }}
      />
    </div>
  );
}
