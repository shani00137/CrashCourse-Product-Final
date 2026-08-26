import { useCallback, useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  BookOpen
} from "lucide-react";
import { Btn, BouncingDots, Card } from "../../shared/ui";
import { getAllTopics, createTopic, updateTopic, deleteTopic } from "../../../../services/questionService";

export function TopicManagerScreen({ onBack }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllTopics()
      .then(list => {
        if (cancelled) return;
        setTopics(Array.isArray(list) ? list : []);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load topics.");
        setTopics([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => load(), [load]);

  const filteredTopics = topics.filter(t =>
    t.topTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingTopic(null);
    setFormTitle("");
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (topic) => {
    setEditingTopic(topic);
    setFormTitle(topic.topTitle || "");
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTopic(null);
    setFormTitle("");
    setFormError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const title = formTitle.trim();
    if (!title) {
      setFormError("Topic title is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingTopic) {
        const msg = await updateTopic({ topId: editingTopic.topId, topTitle: title });
        showToast("success", msg || "Topic updated successfully.");
      } else {
        const msg = await createTopic({ topTitle: title });
        showToast("success", msg || "Topic created successfully.");
      }
      closeForm();
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save topic.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (topic) => {
    if (!window.confirm(`Delete topic "${topic.topTitle}"? This will unlink it from ${topic.questionCount || 0} question(s).`)) return;
    setDeletingId(topic.topId);
    try {
      const msg = await deleteTopic(topic.topId);
      showToast("success", msg || "Topic deleted successfully.");
      load();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete topic.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalQuestions = topics.reduce((sum, t) => sum + (t.questionCount || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
            <Tag size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A202C]">Manage Topics</h1>
            <p className="text-[11px] text-[#718096]">Create, edit, or delete question topics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-[#718096] bg-white border border-[rgba(0,0,0,0.06)] rounded-xl px-4 py-2 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Tag size={12} className="text-violet-500" />
              <span className="font-bold text-[#1A202C]">{topics.length}</span>
              <span>topics</span>
            </div>
            <span className="w-px h-3.5 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-[#0E7C7B]" />
              <span className="font-bold text-[#1A202C]">{totalQuestions}</span>
              <span>questions tagged</span>
            </div>
          </div>
          <Btn variant="primary" icon={<Plus size={14} />} onClick={openCreate}>Add Topic</Btn>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="h-9 w-full pl-9 pr-8 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
          />
          {search && (
            <button onClick={() => setSearch("")} title="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition">
              <X size={13} />
            </button>
          )}
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="p-4">
          <BouncingDots label={topics.length ? "Refreshing topics..." : "Loading topics..."} />
        </Card>
      )}

      {/* Error */}
      {!loading && error && (
        <Card className="p-10 text-center">
          <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <p className="text-xs text-gray-400 mt-1">Make sure the API is running.</p>
        </Card>
      )}

      {/* Empty */}
      {!loading && !error && filteredTopics.length === 0 && (
        <Card className="p-16 text-center">
          <Tag size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[#718096] font-medium">{search.trim() ? "No topics match your search" : "No topics yet"}</p>
          <p className="text-xs text-gray-400 mt-1">{search.trim() ? "Try a different search term" : "Create your first topic to organize questions"}</p>
          {!search.trim() && (
            <Btn variant="primary" icon={<Plus size={14} />} onClick={openCreate} className="mt-4">
              Create Topic
            </Btn>
          )}
        </Card>
      )}

      {/* Topic list */}
      {!loading && !error && filteredTopics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTopics.map(topic => (
            <Card key={topic.topId} className="p-4 group hover:shadow-md transition-all duration-150">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0">
                    <Tag size={15} className="text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1A202C] truncate">{topic.topTitle}</p>
                    <p className="text-[11px] text-[#718096]">
                      {topic.questionCount || 0} question{(topic.questionCount || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(topic)}
                    className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit topic"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(topic)}
                    disabled={deletingId === topic.topId}
                    className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    title="Delete topic"
                  >
                    {deletingId === topic.topId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-50 text-violet-600 border border-violet-200">
                  ID: {topic.topId}
                </span>
                {topic.questionCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E6F4F4] text-[#0E7C7B] border border-[#0E7C7B]/20">
                    <BookOpen size={9} />
                    {topic.questionCount}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[rgba(0,0,0,0.08)] w-full max-w-md mx-4 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    {editingTopic ? <Edit2 size={14} className="text-violet-600" /> : <Plus size={14} className="text-violet-600" />}
                  </div>
                  <h2 className="text-base font-bold text-[#1A202C]">{editingTopic ? "Edit Topic" : "New Topic"}</h2>
                </div>
                <button type="button" onClick={closeForm} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  Topic Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Anatomy, Pharmacology, Pathology..."
                  autoFocus
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                  <AlertCircle size={14} className="flex-shrink-0" /> {formError}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-1">
                <Btn variant="ghost" onClick={closeForm} type="button">Cancel</Btn>
                <Btn type="submit" variant="primary" disabled={saving} className={saving ? "cursor-wait" : ""}>
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingTopic ? "Save Changes" : "Create Topic"}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="flex justify-start">
        <Btn variant="ghost" onClick={onBack}>Back to Question Bank</Btn>
      </div>

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
