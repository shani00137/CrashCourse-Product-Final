import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Users
} from "lucide-react";
import { Btn, BouncingDots, Card, Avatar, StatusBadge, SearchableSelect } from "../../shared/ui";
import {
  getApplicants,
  getCountries,
  getActiveCourses
} from "../../../../services/applicantService";
function ApplicantsScreen({ setScreen, onSelectApplicant, onEditApplicant, onAddApplicant }) {
  const pageSize = 20;
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [countryId, setCountryId] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [page, setPage] = useState(1);
  const [countries, setCountries] = useState([]);
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    getCountries().then(setCountries).catch(() => {
    });
    getActiveCourses().then(setCourses).catch(() => {
    });
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);
  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getApplicants({
      pageNumber: page,
      pageSize,
      searchTerm: debouncedSearch,
      status: statusFilter,
      countryId,
      courseId
    }).then((res) => {
      if (cancelled) return;
      setRows(res.data ?? []);
      setTotalRecords(res.totalRecords ?? 0);
    }).catch((err) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : "Failed to load applicants.");
      setRows([]);
      setTotalRecords(0);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, statusFilter, countryId, courseId]);
  useEffect(() => load(), [load]);
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "All" || countryId !== null || courseId !== null;
  const searching = search.trim() !== debouncedSearch;
  const initials = (a) => ((a.firstName?.[0] ?? "") + (a.lastName?.[0] ?? "")).toUpperCase() || "NA";
  const goToPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));
  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("All");
    setCountryId(null);
    setCourseId(null);
    setPage(1);
  };
  return <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Applicants</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={onAddApplicant}>Add Applicant</Btn>
      </div>

      {
    /* Filters */
  }
      <Card className="p-4">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            {searching ? (
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <span className="block h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
              </span>
            ) : (
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            )}
            <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search name, reg. no, mobile, email…"
    className="h-9 w-full pl-9 pr-8 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
  />
            {searching && <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#718096] pointer-events-none">Searching…</span>}
            {search && !searching && <button
    onClick={() => setSearch("")}
    title="Clear search"
    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
  >
                <X size={13} />
              </button>}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-[rgba(0,0,0,0.12)]">
            {["All", "Active", "Expired"].map((s) => <button
    key={s}
    onClick={() => {
      setStatusFilter(s);
      setPage(1);
    }}
    className={`px-3.5 h-9 text-sm font-medium transition ${statusFilter === s ? "bg-[#0E7C7B] text-white" : "bg-white text-[#718096] hover:bg-[#EDF2F7]"}`}
  >
                {s}
              </button>)}
          </div>
          <SearchableSelect
    options={countries.map((c) => ({ id: c.countryId, label: c.coutryName }))}
    value={countryId}
    onSelect={(id) => {
      setCountryId(id);
      setPage(1);
    }}
    allLabel="All Countries"
    placeholder="Search country…"
  />
          <SearchableSelect
    options={courses.map((c) => ({ id: c.courseId, label: c.courseName }))}
    value={courseId}
    onSelect={(id) => {
      setCourseId(id);
      setPage(1);
    }}
    allLabel="All Courses"
    placeholder="Search course…"
  />
          {hasActiveFilters && <button onClick={clearFilters} className="h-9 px-3 rounded-lg text-sm font-medium text-[#0E7C7B] hover:bg-teal-50 transition flex items-center gap-1.5">
              <X size={13} /> Clear
            </button>}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC] sticky top-0">
                {["Reg. No", "Applicant", "Mobile", "Country", "Course", "Status", "Address", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => <tr key={a.applicantId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{a.registrationNo ?? a.applicantId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={initials(a)} />
                      <span className="font-medium text-[#1A202C] whitespace-nowrap">{a.firstName} {a.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#718096] whitespace-nowrap">{a.mobile ?? "\u2014"}</td>
                  <td className="px-4 py-3 text-[#718096]">{a.coutryName ?? "\u2014"}</td>
                  <td className="px-4 py-3 text-[#718096] max-w-36 truncate">{a.courseMD?.courseName ?? "\u2014"}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.isActive ? "Active" : "Expired"} /></td>
                  <td className="px-4 py-3 text-[#718096] whitespace-nowrap">{a.address ?? "\u2014"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="View details" onClick={() => onSelectApplicant(a)} className="p-1.5 rounded-lg text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 transition"><Eye size={14} /></button>
                      <button title="Edit applicant" onClick={() => onEditApplicant(a)} className="p-1.5 rounded-lg text-[#718096] hover:text-blue-600 hover:bg-blue-50 transition"><Edit2 size={14} /></button>
                      <button title="Delete is not available" disabled className="p-1.5 rounded-lg text-[#718096] opacity-40 cursor-not-allowed"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
          {loading && <BouncingDots label={rows.length ? "Refreshing results\u2026" : "Loading applicants\u2026"} />}
          {!loading && error && <div className="py-10 text-center">
              <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
            </div>}
          {!loading && !error && totalRecords === 0 && <div className="py-16 text-center">
              <Users size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[#718096] font-medium">No applicants found</p>
              <p className="text-xs text-gray-400 mt-1">
                {hasActiveFilters ? "Try clearing your search or filters" : "No applicants registered yet"}
              </p>
            </div>}
        </div>
        {
    /* Pagination */
  }
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-xs text-[#718096]">
            {loading ? "Loading\u2026" : totalRecords === 0 ? "No results" : `Showing ${start + 1}\u2013${Math.min(start + pageSize, totalRecords)} of ${totalRecords} applicant${totalRecords === 1 ? "" : "s"}`}
          </span>
          <div className="flex items-center gap-1">
            <button
    onClick={() => goToPage(safePage - 1)}
    disabled={safePage <= 1}
    className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
  >
              <ChevronLeft size={14} className="mx-auto" />
            </button>
            <span className="px-2 text-xs text-[#718096] whitespace-nowrap">Page {safePage} of {totalPages}</span>
            <button
    onClick={() => goToPage(safePage + 1)}
    disabled={safePage >= totalPages}
    className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
  >
              <ChevronRight size={14} className="mx-auto" />
            </button>
          </div>
        </div>
      </Card>
    </div>;
}
export {
  ApplicantsScreen
};
