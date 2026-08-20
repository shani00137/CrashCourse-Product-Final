import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PdfJsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import {
  ArrowLeft,
  Upload,
  FileText,
  FileUp,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
  Maximize2,
  Trash2,
  Edit2,
  Save,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { Btn, Card, SearchableSelect } from "../../shared/ui";
import { RichTextEditor } from "../../shared/RichTextEditor";
import { ocrPdf, parseOcrToQuestions, bulkSaveQuestions } from "../../../../services/questionService";
import { getActiveCourses } from "../../../../services/applicantService";

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfJsWorker;

const ZOOM_STEP = 25;
const ZOOM_MIN = 50;
const ZOOM_MAX = 300;
const OCR_SCALE = 2;

export function UploadFromPdfScreen({ onBack }) {
  const [fileName, setFileName] = useState("");
  const [pdfBytes, setPdfBytes] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const renderTaskRef = useRef(null);
  const fileInputRef = useRef(null);

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);

  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState(null);

  const [autoMode, setAutoMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedPages, setProcessedPages] = useState(new Set());

  const [saving, setSaving] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const autoModeRef = useRef(false);

  useEffect(() => {
    getActiveCourses().then(list => setCourses(Array.isArray(list) ? list : [])).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    autoModeRef.current = autoMode;
  }, [autoMode]);

  useEffect(() => {
    const handler = (e) => {
      if (parsedQuestions.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [parsedQuestions.length]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(currentPage);
    const base = page.getViewport({ scale: 1 });
    const containerWidth = canvasWrapRef.current?.clientWidth || 800;
    const fitScale = containerWidth / base.width;
    const scale = fitScale * (zoom / 100);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    if (renderTaskRef.current) renderTaskRef.current.cancel();
    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;
    try {
      await task.promise;
    } catch (err) {
      if (err?.name === "RenderingCancelledException") return;
      throw err;
    }
  }, [pdfDoc, currentPage, zoom]);

  useEffect(() => {
    if (!pdfDoc) return;
    renderPage().catch(() => {});
    return () => {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
    };
  }, [pdfDoc, currentPage, zoom, renderPage]);

  useEffect(() => {
    const doc = pdfDoc;
    return () => {
      if (doc) doc.destroy();
    };
  }, [pdfDoc]);

  const handleFile = async (file) => {
    if (!file || !file.type.includes("pdf")) {
      setError("Please choose a valid PDF file.");
      return;
    }
    setError(null);
    setLoadingDoc(true);
    try {
      const raw = await file.arrayBuffer();
      const forPdfJs = raw.slice(0);
      const doc = await pdfjsLib.getDocument({ data: forPdfJs }).promise;
      setFileName(file.name);
      setPdfBytes(raw);
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
      setZoom(100);
      setParsedQuestions([]);
      setProcessedPages(new Set());
      setOcrText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this PDF.");
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleBrowse = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const zoomIn = () => setZoom(z => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  const zoomOut = () => setZoom(z => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  const resetZoom = () => setZoom(100);

  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(numPages, p + 1));

  const processPage = useCallback(async (pageNum) => {
    if (!pdfDoc) return null;
    setSubmitting(true);
    setError(null);
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: OCR_SCALE });
      const offscreen = document.createElement("canvas");
      offscreen.width = viewport.width;
      offscreen.height = viewport.height;
      const ctx = offscreen.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = offscreen.toDataURL("image/png");
      const base64 = dataUrl.split(",")[1];

      const ocrRes = await ocrPdf({ imageBase64: base64, fileName });
      if (!ocrRes?.succeeded) {
        throw new Error(ocrRes?.message || "OCR failed for page " + pageNum);
      }

      const pageText = ocrRes.pages?.[0]?.text || ocrRes.fullText || "";
      setOcrText(prev => prev ? prev + "\n\n--- Page " + pageNum + " ---\n\n" + pageText : pageText);

      if (pageText.trim()) {
        const parseRes = await parseOcrToQuestions({ ocrText: pageText, courseId: courseId || 0 });
        if (parseRes?.succeeded && parseRes.questions?.length > 0) {
          setParsedQuestions(prev => [...prev, ...parseRes.questions]);
        }
      }

      setProcessedPages(prev => new Set([...prev, pageNum]));
      return pageText;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process page " + pageNum);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [pdfDoc, fileName, courseId]);

  const handleSubmitPage = async () => {
    if (!pdfDoc) return;
    const text = await processPage(currentPage);
    if (text && autoModeRef.current && currentPage < numPages) {
      setCurrentPage(p => p + 1);
    }
  };

  useEffect(() => {
    if (!autoMode || !processing || submitting || !pdfDoc) return;
    if (currentPage > numPages) {
      setAutoMode(false);
      setProcessing(false);
      return;
    }
    if (processedPages.has(currentPage)) {
      if (currentPage < numPages) {
        setCurrentPage(p => p + 1);
      } else {
        setAutoMode(false);
        setProcessing(false);
      }
      return;
    }
    processPage(currentPage).then(() => {
      if (!autoModeRef.current) return;
      setTimeout(() => {
        setCurrentPage(p => {
          if (p < numPages) return p + 1;
          setAutoMode(false);
          setProcessing(false);
          return p;
        });
      }, 500);
    });
  }, [autoMode, processing, submitting, currentPage, numPages, pdfDoc, processedPages, processPage]);

  const toggleAutoMode = () => {
    if (autoMode) {
      setAutoMode(false);
      setProcessing(false);
    } else {
      setAutoMode(true);
      setProcessing(true);
    }
  };

  const handleBack = () => {
    if (parsedQuestions.length > 0) {
      if (!window.confirm("You have unsaved parsed questions. Leaving will lose your data. Are you sure?")) {
        return;
      }
    }
  };

  const handleDeleteQuestion = (idx) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      setEditData(null);
    } else if (editingIndex !== null && editingIndex > idx) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const startEdit = (idx) => {
    const q = parsedQuestions[idx];
    setEditingIndex(idx);
    setEditData({
      questionContent: q.questionContent || "",
      options: q.options?.map(o => o.text || "") || ["", "", "", ""],
      correctIndex: q.correctIndex ?? 0,
      explanation: q.explanation || ""
    });
  };

  const saveEdit = () => {
    if (editingIndex === null || !editData) return;
    setParsedQuestions(prev => prev.map((q, i) => {
      if (i !== editingIndex) return q;
      return {
        ...q,
        questionContent: editData.questionContent,
        options: editData.options.map(text => ({ text })),
        correctIndex: editData.correctIndex,
        explanation: editData.explanation
      };
    }));
    setEditingIndex(null);
    setEditData(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
  };

  const handleSaveToDatabase = async () => {
    if (!courseId) {
      setError("Please select a course before saving.");
      return;
    }
    if (parsedQuestions.length === 0) {
      setError("No questions to save.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const questionsPayload = parsedQuestions.map(q => ({
        courseId: Number(courseId),
        questionContent: q.questionContent,
        questionOptionsList: q.options.map((opt, i) => ({
          options: typeof opt === "string" ? opt : opt.text || "",
          isRightAns: i === q.correctIndex
        }))
      }));
      const res = await bulkSaveQuestions({ courseId: Number(courseId), questions: questionsPayload });
      alert(res || "Questions saved successfully!");
      setParsedQuestions([]);
      setProcessedPages(new Set());
      setOcrText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save questions.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ocrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const courseOptions = courses.map(c => ({ id: c.courseId, label: `${c.courseCode} — ${c.courseName}` }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#1A202C]">Upload from PDF</h1>
            <p className="text-xs text-[#718096] mt-0.5">Extract text and auto-generate MCQ questions</p>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[#718096] uppercase tracking-wide mb-1 block">Course</label>
            <SearchableSelect
              options={courseOptions}
              value={courseId}
              onSelect={setCourseId}
              allLabel="Select a course..."
              placeholder="Search courses..."
            />
          </div>
          <div className="flex gap-2 items-end">
            <Btn
              variant={autoMode ? "danger" : "outline"}
              icon={autoMode ? <Pause size={14} /> : <Play size={14} />}
              onClick={toggleAutoMode}
              disabled={!pdfDoc}
            >
              {autoMode ? "Stop Auto" : "Auto Process All"}
            </Btn>
            {parsedQuestions.length > 0 && (
              <Btn
                variant="primary"
                icon={saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                onClick={handleSaveToDatabase}
                disabled={saving || !courseId}
              >
                {saving ? "Saving..." : `Save ${parsedQuestions.length} Questions`}
              </Btn>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0E7C7B] flex items-center justify-center flex-shrink-0">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1A202C] truncate">{fileName || "No file selected"}</p>
                <p className="text-[11px] text-[#718096]">
                  {pdfDoc ? `${numPages} page${numPages === 1 ? "" : "s"} · ${processedPages.size} processed` : "PDF viewer"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleBrowse} className="hidden" />
              <Btn variant="outline" icon={<FileUp size={14} />} onClick={() => fileInputRef.current?.click()} disabled={loadingDoc}>
                Browse
              </Btn>
            </div>
          </div>

          {loadingDoc && (
            <div className="h-80 flex flex-col items-center justify-center gap-3">
              <Loader2 size={22} className="animate-spin text-[#0E7C7B]" />
              <p className="text-xs text-[#718096]">Loading PDF...</p>
            </div>
          )}

          {!loadingDoc && !pdfDoc && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-80 rounded-xl border-2 border-dashed border-[rgba(0,0,0,0.15)] hover:border-[#0E7C7B] hover:bg-teal-50/40 transition flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-14 h-14 rounded-full bg-teal-50 text-[#0E7C7B] flex items-center justify-center group-hover:scale-105 transition">
                <Upload size={24} />
              </div>
              <p className="text-sm font-medium text-[#1A202C]">Browse to upload a PDF</p>
              <p className="text-xs text-[#718096]">Click here or press the Browse button above</p>
            </button>
          )}

          {!loadingDoc && pdfDoc && (
            <>
              <div className="flex items-center justify-between gap-2 bg-[#F7FAFC] border border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                  <button onClick={goPrev} disabled={currentPage <= 1} title="Previous page" className="w-7 h-7 rounded-md text-[#718096] hover:bg-white hover:text-[#0E7C7B] border border-transparent hover:border-[rgba(0,0,0,0.1)] transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft size={14} className="mx-auto" />
                  </button>
                  <button onClick={goNext} disabled={currentPage >= numPages} title="Next page" className="w-7 h-7 rounded-md text-[#718096] hover:bg-white hover:text-[#0E7C7B] border border-transparent hover:border-[rgba(0,0,0,0.1)] transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronRight size={14} className="mx-auto" />
                  </button>
                  <span className="text-xs font-semibold text-[#1A202C] whitespace-nowrap">
                    Page {currentPage} of {numPages}
                  </span>
                  {processedPages.has(currentPage) && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Done</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={zoomOut} disabled={zoom <= ZOOM_MIN} title="Zoom out" className="w-7 h-7 rounded-md text-[#718096] hover:bg-white hover:text-[#0E7C7B] border border-transparent hover:border-[rgba(0,0,0,0.1)] transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <ZoomOut size={14} className="mx-auto" />
                  </button>
                  <button onClick={resetZoom} title="Reset zoom" className="px-2 h-7 rounded-md text-[11px] font-semibold text-[#718096] hover:bg-white hover:text-[#0E7C7B] border border-transparent hover:border-[rgba(0,0,0,0.1)] transition whitespace-nowrap">
                    {zoom}%
                  </button>
                  <button onClick={zoomIn} disabled={zoom >= ZOOM_MAX} title="Zoom in" className="w-7 h-7 rounded-md text-[#718096] hover:bg-white hover:text-[#0E7C7B] border border-transparent hover:border-[rgba(0,0,0,0.1)] transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <ZoomIn size={14} className="mx-auto" />
                  </button>
                  <button onClick={resetZoom} title="Fit to width" className="w-7 h-7 rounded-md text-[#718096] hover:bg-white hover:text-[#0E7C7B] border border-transparent hover:border-[rgba(0,0,0,0.1)] transition">
                    <Maximize2 size={14} className="mx-auto" />
                  </button>
                </div>
              </div>

              <div ref={canvasWrapRef} className="h-[500px] overflow-auto bg-[#EDF2F7] rounded-lg border border-[rgba(0,0,0,0.06)] p-3 flex justify-center">
                <canvas ref={canvasRef} className="shadow-lg bg-white rounded-sm" />
              </div>

              <Btn
                variant="primary"
                icon={submitting ? <Loader2 size={14} className="animate-spin" /> : <FileUp size={14} />}
                onClick={handleSubmitPage}
                disabled={submitting || !pdfDoc}
                className={`w-full justify-center ${submitting ? "cursor-wait" : ""}`}
              >
                {submitting
                  ? "Processing..."
                  : autoMode
                    ? `Processing page ${currentPage}...`
                    : "Submit this page"}
              </Btn>
              <p className="text-[11px] text-[#718096] text-center">
                {autoMode
                  ? "Auto mode: processing all pages sequentially"
                  : `Only page ${currentPage} is sent to the OCR engine`}
              </p>
            </>
          )}
        </Card>

        <Card className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A202C]">Parsed Questions</p>
                <p className="text-[11px] text-[#718096]">
                  {parsedQuestions.length > 0
                    ? `${parsedQuestions.length} question${parsedQuestions.length === 1 ? "" : "s"} ready`
                    : "Questions appear here after OCR + AI parsing"}
                </p>
              </div>
            </div>
            {ocrText && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#0E7C7B] border border-[#0E7C7B]/30 hover:bg-[#E6F4F4] transition"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy OCR text"}
              </button>
            )}
          </div>

          {error && !submitting && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span className="break-all">{error}</span>
            </div>
          )}

          {submitting && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 size={22} className="animate-spin text-[#0E7C7B]" />
              <p className="text-xs text-[#718096]">Running OCR and parsing questions...</p>
            </div>
          )}

          {!submitting && parsedQuestions.length === 0 && !error && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FileText size={28} className="text-gray-300" />
              <p className="text-sm font-medium text-[#718096]">No questions yet</p>
              <p className="text-xs text-gray-400">Upload a PDF, select a course, and click "Submit this page"</p>
            </div>
          )}

          {parsedQuestions.length > 0 && (
            <div className="flex flex-col gap-3 max-h-[36rem] overflow-y-auto pr-1">
              {parsedQuestions.map((q, idx) => {
                const isEditing = editingIndex === idx;
                const isCorrect = (q.correctIndex ?? 0);
                return (
                  <div key={idx} className="border border-[rgba(0,0,0,0.08)] rounded-lg p-3 bg-[#F7FAFC]">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#0E7C7B] bg-teal-50 px-2 py-0.5 rounded">
                        Q{idx + 1}
                      </span>
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={saveEdit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition" title="Save edit">
                              <Check size={13} />
                            </button>
                            <button onClick={cancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 rounded transition" title="Cancel edit">
                              <RotateCcw size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(idx)} className="p-1 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Edit question">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleDeleteQuestion(idx)} className="p-1 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete question">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && editData ? (
                      <div className="flex flex-col gap-2">
                        <RichTextEditor
                          value={editData.questionContent}
                          onChange={html => setEditData({ ...editData, questionContent: html })}
                          placeholder="Question text..."
                        />
                        {editData.options.map((opt, oi) => (
                          <div key={oi} className="flex items-start gap-2">
                            <input
                              type="radio"
                              name={`correct-${idx}`}
                              checked={editData.correctIndex === oi}
                              onChange={() => setEditData({ ...editData, correctIndex: oi })}
                              className="accent-[#0E7C7B] mt-1"
                            />
                            <span className="text-[10px] font-bold text-[#718096] w-4 mt-1">{String.fromCharCode(65 + oi)}</span>
                            <RichTextEditor
                              value={opt}
                              onChange={html => {
                                const newOpts = [...editData.options];
                                newOpts[oi] = html;
                                setEditData({ ...editData, options: newOpts });
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}...`}
                              className="flex-1"
                            />
                          </div>
                        ))}
                        <RichTextEditor
                          value={editData.explanation}
                          onChange={html => setEditData({ ...editData, explanation: html })}
                          placeholder="Explanation..."
                        />
                      </div>
                    ) : (
                      <>
                        <div className="text-xs font-medium text-[#1A202C] mb-2 leading-relaxed [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded" dangerouslySetInnerHTML={{ __html: q.questionContent }} />
                        <div className="grid grid-cols-1 gap-1.5 mb-2">
                          {q.options?.map((opt, oi) => {
                            const text = typeof opt === "string" ? opt : opt.text || "";
                            const isOptCorrect = oi === isCorrect;
                            return (
                              <div key={oi} className={`flex items-start gap-2 p-2 rounded text-[11px] border transition ${isOptCorrect ? "border-emerald-200 bg-emerald-50" : "border-[rgba(0,0,0,0.05)] bg-white"}`}>
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${isOptCorrect ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                <span className={isOptCorrect ? "text-emerald-800" : "text-[#718096]"} dangerouslySetInnerHTML={{ __html: text }} />
                              </div>
                            );
                          })}
                        </div>
                        {q.explanation && (
                          <div className="text-[11px] text-[#718096] bg-blue-50 border border-blue-100 rounded px-2.5 py-1.5 leading-relaxed [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded">
                            <span className="font-semibold text-blue-700">Explanation: </span>
                            <span dangerouslySetInnerHTML={{ __html: q.explanation }} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
