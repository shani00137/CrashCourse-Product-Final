import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
function StatusBadge({ status }) {
  const map = {
    Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Passed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Partial: "bg-blue-50 text-blue-700 border border-blue-200",
    Uploaded: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Review: "bg-blue-50 text-blue-700 border border-blue-200",
    Expired: "bg-red-50 text-red-700 border border-red-200",
    Failed: "bg-red-50 text-red-700 border border-red-200",
    Unpaid: "bg-red-50 text-red-700 border border-red-200",
    Blocked: "bg-red-50 text-red-700 border border-red-200",
    Inactive: "bg-gray-100 text-gray-600 border border-gray-200"
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>;
}
function Avatar({ initials, size = "sm" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-14 h-14 text-lg" };
  return <div className={`${sizes[size]} rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>;
}
function Btn({ children, variant = "primary", onClick, className = "", icon, disabled, type = "button" }) {
  const styles = {
    primary: "bg-[#0E7C7B] text-white hover:bg-[#0a6665] shadow-sm",
    secondary: "bg-[#F4A425] text-[#1A202C] hover:bg-[#e09520] shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    ghost: "bg-transparent text-[#718096] hover:bg-gray-100",
    outline: "border border-[#0E7C7B] text-[#0E7C7B] hover:bg-[#E6F4F4] bg-white"
  };
  return <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${styles[variant]} ${className}`}
  >
      {icon}{children}
    </button>;
}
function Input({ label, type = "text", placeholder, value, onChange, required }) {
  return <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">{label}</label>
      <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
  />
    </div>;
}
function Select({ label, options, value, onChange }) {
  return <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">{label}</label>
      <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition appearance-none"
  >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>;
}
function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] border border-[rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>;
}
function BouncingDots({ label = "Searching\u2026", color = "#0E7C7B" }) {
  return <div className="py-10 flex flex-col items-center gap-3">
      <div className="flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => <span
    key={i}
    className="w-2.5 h-2.5 rounded-full animate-bounce"
    style={{ backgroundColor: color, animationDelay: `${i * 0.15}s` }}
  />)}
      </div>
      <p className="text-xs text-[#718096]">{label}</p>
    </div>;
}
function SearchableSelect({ options, value, onSelect, allLabel, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
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
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);
  const selected = options.find((o) => o.id === value);
  const searching = query.trim() !== debouncedQuery;
  const q = debouncedQuery.toLowerCase();
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const pick = (id) => {
    onSelect(id);
    setOpen(false);
    setQuery("");
  };
  return <div className="relative" ref={ref}>
      <button
    onClick={() => setOpen((o) => !o)}
    title={selected ? selected.label : allLabel}
    className={`h-9 px-3 rounded-lg border bg-white text-sm flex items-center justify-between gap-2 min-w-44 transition ${open ? "border-[#0E7C7B] ring-1 ring-[#0E7C7B]" : "border-[rgba(0,0,0,0.12)] hover:border-[#0E7C7B]"}`}
  >
        <span className={`truncate ${selected ? "text-[#1A202C]" : "text-[#718096]"}`}>{selected ? selected.label : allLabel}</span>
        <ChevronDown size={13} className={`text-[#718096] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="absolute z-30 mt-1 w-64 bg-white rounded-lg border border-[rgba(0,0,0,0.12)] shadow-xl">
          <div className="p-2 border-b border-[rgba(0,0,0,0.06)]">
            <div className="relative">
              {searching ? (
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <span className="block h-3 w-3 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                </span>
              ) : (
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              )}
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
              {searching && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#718096] pointer-events-none">Searching…</span>}
              {query && !searching && <button onClick={() => setQuery("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
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
            {filtered.length === 0 && <p className="px-3 py-2 text-xs text-gray-400">No matches for "{debouncedQuery}"</p>}
            {filtered.map((o) => <button
    key={o.id}
    onClick={() => pick(o.id)}
    title={o.label}
    className={`w-full text-left px-3 py-1.5 text-sm truncate transition ${value === o.id ? "bg-teal-50 text-[#0E7C7B] font-medium" : "text-[#1A202C] hover:bg-[#F7FAFC]"}`}
  >
                {o.label}
              </button>)}
          </div>
        </div>}
    </div>;
}
function Modal({ title, children, onClose, className = "max-w-lg" }) {
  return <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${className}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <h3 className="text-base font-semibold text-[#1A202C]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>;
}
export {
  Avatar,
  BouncingDots,
  Btn,
  Card,
  Input,
  Modal,
  SearchableSelect,
  Select,
  StatusBadge
};
