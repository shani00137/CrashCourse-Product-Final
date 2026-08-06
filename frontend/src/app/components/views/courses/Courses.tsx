import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Plus, Search, X, Paperclip, Edit2, Trash2, ChevronLeft, ChevronRight,
  AlertCircle, BookOpen, CheckCircle, Download, Upload, File, Video, Mic, Loader2,
} from "lucide-react";
import { Btn, BouncingDots, Card, Input, Modal, Select } from "../../shared/ui";
import {
  getAllCourses, saveCourse, updateCourse, changeCourseStatus,
  getCourseMaterials, deleteCourseMaterial, uploadCourseMaterial, courseFileUrl,
  type CourseRow, type CourseMaterial,
} from "../../../../services/courseService";

export function CoursesScreen() {
  const pageSize = 10;
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [materialCourse, setMaterialCourse] = useState<CourseRow | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [materialType, setMaterialType] = useState("PDF");
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: "success" | "error", message: string) => setToast({ type, message });

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
    getAllCourses({ pageNumber: page, pageSize, searchTerm: debouncedSearch })
      .then(res => {
        if (cancelled) return;
        setRows(res.data ?? []);
        setTotalRecords(res.totalRecords ?? 0);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load courses.");
        setRows([]);
        setTotalRecords(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, debouncedSearch]);

  useEffect(() => load(), [load]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  const openAdd = () => {
    setEditing(null);
    setFormCode("");
    setFormName("");
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (c: CourseRow) => {
    setEditing(c);
    setFormCode(c.courseCode);
    setFormName(c.courseName);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSaveCourse = async (e: FormEvent) => {
    e.preventDefault();
    const code = formCode.trim();
    const name = formName.trim();
    if (!code || !name) {
      setFormError("Please enter both Course Code and Course Name.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append("CourseCode", code);
      fd.append("CourseName", name);
      if (editing) {
        fd.append("CourseId", String(editing.courseId));
        const msg = await updateCourse(fd);
        showToast("success", msg || "Course updated successfully");
      } else {
        const msg = await saveCourse(fd);
        showToast("success", msg || "Course saved successfully");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (c: CourseRow) => {
    if (!window.confirm(`Are you sure to change status of "${c.courseName}"?`)) return;
    try {
      const msg = await changeCourseStatus(c.courseId);
      showToast("success", msg || "Status updated successfully");
      load();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to change status.");
    }
  };

  const openAttachments = (c: CourseRow) => {
    setMaterialCourse(c);
    setMaterials([]);
    setMaterialsError(null);
    setMaterialType("PDF");
    setMaterialFile(null);
    setUploadProgress(0);
    loadMaterials(c.courseId);
  };

  const loadMaterials = async (courseId: number) => {
    setMaterialsLoading(true);
    setMaterialsError(null);
    try {
      const list = await getCourseMaterials(courseId);
      setMaterials(list.filter(m => m.materialType !== "MCQS"));
    } catch (err) {
      setMaterialsError(err instanceof Error ? err.message : "Failed to load attachments.");
    } finally {
      setMaterialsLoading(false);
    }
  };

  const downloadMaterial = async (m: CourseMaterial) => {
    if (!m.courseUrl) return;
    try {
      const res = await fetch(courseFileUrl(m.courseUrl));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = m.fileName ?? "attachment";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast("error", "Could not download the file.");
    }
  };

  const handleDeleteMaterial = async (m: CourseMaterial) => {
    if (!window.confirm("Are you sure to delete this attachment?")) return;
    try {
      const msg = await deleteCourseMaterial(m.courseMaterialId);
      showToast("success", msg || "Deleted successfully");
      loadMaterials(m.courseId);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete attachment.");
    }
  };

  const handleUploadMaterial = async (e: FormEvent) => {
    e.preventDefault();
    if (!materialCourse) return;
    if (!materialFile) {
      setMaterialsError("Please choose a file to upload.");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setMaterialsError(null);
    try {
      const fd = new FormData();
      fd.append("CourseId", String(materialCourse.courseId));
      fd.append("MaterialType", materialType);
      fd.append("CourseUrl", materialFile);
      const msg = await uploadCourseMaterial(fd, setUploadProgress);
      showToast("success", msg || "Uploaded successfully");
      setMaterialFile(null);
      await loadMaterials(materialCourse.courseId);
    } catch (err) {
      setMaterialsError(err instanceof Error ? err.message : "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const typeBadge = (t: string) =>
    t === "PDF" ? "bg-red-50 text-red-600" : t === "Video" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600";

  const materialTypeIcon = (t: string) =>
    t === "PDF" ? <File size={12} /> : t === "Video" ? <Video size={12} /> : <Mic size={12} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Courses</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={openAdd}>Add Course</Btn>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search course name…"
            className="h-9 w-full pl-9 pr-8 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
          />
          {search && (
            <button onClick={() => setSearch("")} title="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition">
              <X size={13} />
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Course Code", "Course Name", "Attachment", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.courseId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#0E7C7B] font-medium whitespace-nowrap">{c.courseCode}</td>
                  <td className="px-4 py-3 font-medium text-[#1A202C]">{c.courseName}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openAttachments(c)} title="View attachments"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#0E7C7B] bg-[#E6F4F4] hover:bg-[#d4ecec] transition">
                      <Paperclip size={12} /> Attachment
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button role="switch" aria-checked={c.isActive} onClick={() => toggleStatus(c)}
                      title={c.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                      className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${c.isActive ? "bg-[#0E7C7B]" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${c.isActive ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="Edit course" onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-[#718096] hover:text-blue-600 hover:bg-blue-50 transition"><Edit2 size={14} /></button>
                      <button title="Delete is not available" disabled className="p-1.5 rounded-lg text-[#718096] opacity-40 cursor-not-allowed"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <BouncingDots label={rows.length ? "Refreshing results…" : "Loading courses…"} />}
          {!loading && error && (
            <div className="py-10 text-center">
              <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
            </div>
          )}
          {!loading && !error && totalRecords === 0 && (
            <div className="py-16 text-center">
              <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[#718096] font-medium">No courses found</p>
              <p className="text-xs text-gray-400 mt-1">{search.trim() ? "Try clearing your search" : "Add a course to get started"}</p>
            </div>
          )}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-xs text-[#718096]">
            {loading ? "Loading…" : totalRecords === 0 ? "No results" : `Showing ${start + 1}–${Math.min(start + pageSize, totalRecords)} of ${totalRecords} course${totalRecords === 1 ? "" : "s"}`}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1}
              className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft size={14} className="mx-auto" />
            </button>
            <span className="px-2 text-xs text-[#718096] whitespace-nowrap">Page {safePage} of {totalPages}</span>
            <button onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages}
              className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight size={14} className="mx-auto" />
            </button>
          </div>
        </div>
      </Card>

      {/* Add / Edit modal */}
      {formOpen && (
        <Modal title={editing ? "Edit Course" : "Add New Course"} onClose={() => setFormOpen(false)}>
          <form onSubmit={handleSaveCourse} className="flex flex-col gap-4">
            <Input label="Course Code" placeholder="e.g. MDS-101" value={formCode} onChange={e => setFormCode(e.target.value)} required />
            <Input label="Course Name" placeholder="Full course name" value={formName} onChange={e => setFormName(e.target.value)} required />
            {formError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Btn>
              <Btn type="submit" variant="primary" disabled={saving} className={saving ? "cursor-wait" : ""}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Save Changes" : "Create Course"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* Attachment modal */}
      {materialCourse && (
        <Modal title={`Attachments — ${materialCourse.courseName}`} onClose={() => setMaterialCourse(null)} className="max-w-2xl">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-lg border border-[rgba(0,0,0,0.06)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                    {["File Name", "Type", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {materials.map(m => (
                    <tr key={m.courseMaterialId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                      <td className="px-4 py-2.5 text-[#1A202C]">{m.fileName ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${typeBadge(m.materialType)}`}>
                          {materialTypeIcon(m.materialType)} {m.materialType}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button title="Download" onClick={() => downloadMaterial(m)} className="p-1.5 rounded-lg text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 transition"><Download size={14} /></button>
                          <button title="Delete attachment" onClick={() => handleDeleteMaterial(m)} className="p-1.5 rounded-lg text-[#718096] hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {materialsLoading && <BouncingDots label="Loading attachments…" />}
              {!materialsLoading && materialsError && (
                <div className="py-6 text-center">
                  <AlertCircle size={22} className="mx-auto text-red-400 mb-2" />
                  <p className="text-sm text-red-600 font-medium">{materialsError}</p>
                </div>
              )}
              {!materialsLoading && !materialsError && materials.length === 0 && (
                <div className="py-10 text-center">
                  <Paperclip size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-[#718096]">No attachments yet</p>
                </div>
              )}
            </div>

            {/* Add new attachment */}
            <form onSubmit={handleUploadMaterial} className="flex flex-col gap-3 border border-[rgba(0,0,0,0.08)] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#1A202C] uppercase tracking-wide">Add New Attachment</p>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Course Material" options={["PDF", "Video", "Audio"]} value={materialType} onChange={setMaterialType} />
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Course File</label>
                  <input
                    type="file"
                    accept=".pdf,video/*,audio/*"
                    onChange={e => setMaterialFile(e.target.files?.[0] ?? null)}
                    className="h-10 px-2 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#E6F4F4] file:text-[#0E7C7B] file:text-xs file:font-medium"
                  />
                </div>
              </div>
              {uploading && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#718096] flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Uploading…</span>
                    <span className="font-medium text-[#0E7C7B]">{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#EDF2F7] overflow-hidden">
                    <div className="h-full bg-[#0E7C7B] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Btn variant="ghost" onClick={() => setMaterialFile(null)}>Reset</Btn>
                <Btn type="submit" variant="primary" disabled={uploading} className={uploading ? "cursor-wait" : ""}>
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Upload
                </Btn>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-[#0E7C7B]" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
