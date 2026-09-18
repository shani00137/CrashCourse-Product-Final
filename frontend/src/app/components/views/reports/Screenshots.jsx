import { useCallback, useEffect, useState } from "react";
import { Camera, Eye, X, RefreshCw, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Btn, Card } from "../../shared/ui";
import { getAllUserScreenShots } from "../../../../services/appUserService";
import { API_BASE_URL } from "../../../../services/apiClient";

const pageSize = 12;

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const formatTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};
const imageSrc = (url) => `${API_BASE_URL}/${(url || "").replace(/^\/+/, "")}`;

export function ScreenshotsScreen() {
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUserScreenShots({
        pageNumber: page,
        pageSize,
        searchTerm: "",
        applicantId: 0,
        status: ""
      });
      setRows(res.data || []);
      setTotalRecords(res.totalRecords || 0);
    } catch (err) {
      setError(err.message || "Failed to load screenshots.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">User Screenshots</h1>
        <Btn variant="outline" icon={<RefreshCw size={16} />} onClick={load} disabled={loading}>
          Refresh
        </Btn>
      </div>

      {loading && (
        <div className="text-sm text-[#718096] py-10 text-center">Loading screenshots...</div>
      )}

      {!loading && error && (
        <Card className="p-6 flex flex-col items-center gap-3 text-center">
          <ImageOff size={28} className="text-red-300" />
          <p className="text-sm text-[#718096]">{error}</p>
          <Btn variant="outline" icon={<RefreshCw size={16} />} onClick={load}>Try Again</Btn>
        </Card>
      )}

      {!loading && !error && rows.length === 0 && (
        <Card className="p-10 flex flex-col items-center gap-3 text-center">
          <Camera size={32} className="text-red-300" />
          <p className="text-sm font-medium text-[#1A202C]">No screenshots yet</p>
          <p className="text-xs text-[#718096]">
            Screenshots with a detected phone will appear here automatically.
          </p>
        </Card>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {rows.map((s) => (
            <Card
              key={s.screenShotId || s.imageUrl}
              className="overflow-hidden cursor-pointer group"
              onClick={() => setLightbox(s)}
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                {s.imageUrl ? (
                  <img
                    src={imageSrc(s.imageUrl)}
                    alt={`Screenshot of ${s.applicantName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    loading="lazy"
                  />
                ) : (
                  <Camera size={28} className="text-red-300" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                  <Eye size={22} className="text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-[#1A202C]">{s.applicantName || `Applicant #${s.applicantId}`}</p>
                <p className="text-xs text-[#718096] font-mono mt-0.5">{formatDate(s.dateTime)} {formatTime(s.dateTime)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && totalRecords > pageSize && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm text-[#1A202C] disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm text-[#718096]">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm text-[#1A202C] disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-8" onClick={() => setLightbox(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
              {lightbox.imageUrl ? (
                <img src={imageSrc(lightbox.imageUrl)} alt="Screenshot preview" className="max-h-[70vh] w-full object-contain" />
              ) : (
                <Camera size={48} className="text-red-300" />
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1A202C]">{lightbox.applicantName || `Applicant #${lightbox.applicantId}`}</p>
                <p className="text-xs text-[#718096] font-mono">{formatDate(lightbox.dateTime)} {formatTime(lightbox.dateTime)}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="p-2 text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}