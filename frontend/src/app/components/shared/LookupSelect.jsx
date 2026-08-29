import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export function LookupSelect({
  options,
  value,
  onChange,
  label,
  placeholder = "Select...",
  allLabel = "All",
  className = "",
  disabled = false,
  required = false
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = options.find((o) => o.id === value);
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  const pick = (id) => {
    onChange?.(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={ref}>
      {label && <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        title={selected ? selected.label : allLabel}
        className={`h-9 px-3 rounded-lg border bg-white text-sm flex items-center justify-between gap-2 min-w-44 transition ${disabled ? "opacity-60 cursor-not-allowed" : open ? "border-[#0E7C7B] ring-1 ring-[#0E7C7B]" : "border-[rgba(0,0,0,0.12)] hover:border-[#0E7C7B]"} ${required ? "border-red-300" : ""}`}
      >
        <span className={`truncate ${selected ? "text-[#1A202C]" : "text-[#718096]"}`}>{selected ? selected.label : allLabel}</span>
        <ChevronDown size={13} className={`text-[#718096] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-64 bg-white rounded-lg border border-[rgba(0,0,0,0.12)] shadow-xl">
          <div className="p-2 border-b border-[rgba(0,0,0,0.06)]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                    setQuery("");
                  }
                }}
                placeholder={placeholder}
                className="h-8 w-full pl-8 pr-7 rounded-md border border-[rgba(0,0,0,0.12)] text-sm focus:outline-none focus:border-[#0E7C7B]"
              />
              {query && <button onClick={() => setQuery("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>}
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            <button
              onClick={() => pick(null)}
              className={`w-full text-left px-3 py-1.5 text-sm transition ${value === null ? "bg-teal-50 text-[#0E7C7B] font-medium" : "text-[#1A202C] hover:bg-[#F7FAFC]"}`}
            >
              {allLabel}
            </button>
            {filtered.length === 0 && q && <p className="px-3 py-2 text-xs text-gray-400">No matches for "{query}"</p>}
            {filtered.map((o) => (
              <button
                key={o.id}
                onClick={() => pick(o.id)}
                title={o.label}
                className={`w-full text-left px-3 py-1.5 text-sm truncate transition ${value === o.id ? "bg-teal-50 text-[#0E7C7B] font-medium" : "text-[#1A202C] hover:bg-[#F7FAFC]"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ApplicationStatusSelect({ statuses, ...props }) {
  const options = (statuses ?? []).map((s) => ({ id: s.applicationStatusId, label: s.statusName }));
  return <LookupSelect options={options} {...props} />;
}

export function ServiceSelect({ services, ...props }) {
  const options = (services ?? []).map((s) => ({ id: s.serviceId, label: s.serviceName }));
  return <LookupSelect options={options} {...props} />;
}

export function LookupMultiSelect({
  options = [],
  value = [],
  onChange,
  label,
  placeholder = "Select...",
  allLabel = "None",
  className = "",
  disabled = false,
  required = false
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = options.filter((o) => value.includes(o.id));
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  const toggle = (id) => {
    const next = value.includes(id) ? value.filter((v) => v !== id) : [...value, id];
    onChange?.(next);
  };

  return (
    <div className={`flex flex-col gap-1 relative ${className}`} ref={ref}>
      {label && <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`h-10 px-3 rounded-lg border bg-white text-sm flex items-center justify-between gap-2 transition ${disabled ? "opacity-60 cursor-not-allowed" : open ? "border-[#0E7C7B] ring-1 ring-[#0E7C7B]" : "border-[rgba(0,0,0,0.12)] hover:border-[#0E7C7B]"}`}
      >
        <span className={`truncate ${selected.length ? "text-[#1A202C]" : "text-[#718096]"}`}>
          {selected.length ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown size={13} className={`text-[#718096] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-72 bg-white rounded-lg border border-[rgba(0,0,0,0.12)] shadow-xl top-full left-0">
          <div className="p-2 border-b border-[rgba(0,0,0,0.06)]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setQuery(""); } }}
                placeholder="Search…"
                className="h-8 w-full pl-8 pr-7 rounded-md border border-[rgba(0,0,0,0.12)] text-sm focus:outline-none focus:border-[#0E7C7B]"
              />
              {query && <button onClick={() => setQuery("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"><X size={12} /></button>}
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            <button
              onClick={() => onChange?.([])}
              className={`w-full text-left px-3 py-1.5 text-sm transition ${value.length === 0 ? "bg-teal-50 text-[#0E7C7B] font-medium" : "text-[#1A202C] hover:bg-[#F7FAFC]"}`}
            >
              {allLabel}
            </button>
            {filtered.length === 0 && q && <p className="px-3 py-2 text-xs text-gray-400">No matches for "{query}"</p>}
            {filtered.map((o) => (
              <label key={o.id} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm cursor-pointer hover:bg-[#F7FAFC] transition">
                <input type="checkbox" checked={value.includes(o.id)} onChange={() => toggle(o.id)} className="accent-[#0E7C7B]" />
                <span className="truncate flex-1">{o.label}</span>
                {o.price != null && (
                  <span className="text-xs font-mono text-[#0E7C7B] whitespace-nowrap">{Number(o.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((o) => (
            <span key={o.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-[#0E7C7B] text-xs font-medium">
              {o.label}
              {o.price != null && <span className="font-mono text-[#0E7C7B]">{Number(o.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
              <button type="button" onClick={() => toggle(o.id)} className="hover:text-red-600" title="Remove"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ServiceMultiSelect({ services, ...props }) {
  const options = (services ?? []).map((s) => ({
    id: s.serviceId,
    label: s.serviceName,
    price: Number(s.salePrice ?? 0)
  }));
  return <LookupMultiSelect options={options} {...props} />;
}