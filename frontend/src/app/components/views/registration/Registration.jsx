import { useEffect, useState } from "react";
import {
  Upload,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Btn, Card } from "../../shared/ui";
import {
  saveApplicant,
  updateApplicant,
  getCountries,
  getActiveCourses
} from "../../../../services/applicantService";
function RegistrationScreen({ applicant, onDone }) {
  const isEdit = !!applicant;
  const [fullName, setFullName] = useState(applicant ? `${applicant.firstName} ${applicant.lastName}`.trim() : "");
  const [mobile, setMobile] = useState(applicant?.mobile ?? "");
  const [otherMobile, setOtherMobile] = useState(applicant?.otherMobile ?? "");
  const [email, setEmail] = useState(applicant?.email ?? "");
  const [address, setAddress] = useState(applicant?.address ?? "");
  const [countryId, setCountryId] = useState(applicant?.countryId ?? 0);
  const [courseId, setCourseId] = useState(applicant?.courseMD?.courseId ?? 0);
  const [registrationDate, setRegistrationDate] = useState(applicant?.registrationDate?.slice(0, 10) ?? "");
  const [photo, setPhoto] = useState(null);
  const [countries, setCountries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  useEffect(() => {
    getCountries().then(setCountries).catch(() => {
    });
    getActiveCourses().then(setCourses).catch(() => {
    });
  }, []);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPhoto(dataUrl.split(",")[1] ?? dataUrl);
    };
    reader.readAsDataURL(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || "";
    if (!firstName) {
      setError("Please enter the applicant's full name.");
      return;
    }
    if (!mobile.trim()) {
      setError("Please enter a mobile number.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    if (!countryId) {
      setError("Please select a country.");
      return;
    }
    if (!courseId) {
      setError("Please select a course.");
      return;
    }
    const regDate = registrationDate ? new Date(registrationDate) : /* @__PURE__ */ new Date();
    const expiry = new Date(regDate);
    expiry.setFullYear(expiry.getFullYear() + 1);
    const payload = {
      applicantId: applicant?.applicantId ?? 0,
      registrationNo: applicant?.registrationNo ?? "",
      firstName,
      lastName,
      mobile: mobile.trim(),
      otherMobile: otherMobile.trim(),
      email: email.trim(),
      address: address.trim(),
      photoUrl: photo,
      registrationDate: regDate.toISOString(),
      expiryDate: expiry.toISOString(),
      isActive: applicant?.isActive ?? true,
      countryId,
      courseId
    };
    setSaving(true);
    try {
      const res = isEdit ? await updateApplicant(payload) : await saveApplicant(payload);
      if (res.startsWith("System.")) {
        setError("Server error while saving. Please try again.");
      } else {
        setSuccess(res);
        if (!isEdit) {
          setFullName("");
          setMobile("");
          setOtherMobile("");
          setEmail("");
          setAddress("");
          setCountryId(0);
          setCourseId(0);
          setRegistrationDate("");
          setPhoto(null);
        } else {
          onDone();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save applicant.");
    } finally {
      setSaving(false);
    }
  };
  const fieldCls = "h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition";
  const labelCls = "text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide";
  return <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">{isEdit ? "Edit Applicant" : "Student Registration"}</h1>
        <Btn variant="ghost" onClick={onDone}>Back to Applicants</Btn>
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-[#1A202C]">Applicant Information</h3>
          {isEdit && <span className="text-xs text-[#718096] font-mono">Editing #{applicant?.registrationNo}</span>}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Zara Ahmed" className={fieldCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Mobile Number</label>
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+971 50 000 0000" className={fieldCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Other Mobile</label>
              <input type="tel" value={otherMobile} onChange={(e) => setOtherMobile(e.target.value)} placeholder="+971 55 000 0000" className={fieldCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="applicant@email.com" className={fieldCls} />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className={labelCls}>Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" className={fieldCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Country</label>
              <select value={countryId} onChange={(e) => setCountryId(Number(e.target.value))} className={`${fieldCls} appearance-none`}>
                <option value={0}>Select Country</option>
                {countries.map((c) => <option key={c.countryId} value={c.countryId}>{c.coutryName}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Course</label>
              <select value={courseId} onChange={(e) => setCourseId(Number(e.target.value))} className={`${fieldCls} appearance-none`}>
                <option value={0}>Select Course</option>
                {courses.map((c) => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Registration Date</label>
              <input type="date" value={registrationDate} onChange={(e) => setRegistrationDate(e.target.value)} className={fieldCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelCls}>Applicant Photo</label>
              <label className="h-10 border-2 border-dashed border-[rgba(0,0,0,0.15)] rounded-lg flex items-center gap-2 px-3 text-[#718096] text-sm cursor-pointer hover:border-[#0E7C7B] hover:text-[#0E7C7B] transition">
                <Upload size={14} /><span>{photo ? "Photo selected" : "Click to upload photo"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </div>
          </div>

          {error && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>}
          {success && <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <CheckCircle size={14} className="flex-shrink-0" />
              <span>{success}</span>
            </div>}

          <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-[rgba(0,0,0,0.06)]">
            <Btn variant="ghost" onClick={onDone}>Cancel</Btn>
            <Btn type="submit" variant="primary" disabled={saving}>{saving ? "Saving\u2026" : isEdit ? "Update Applicant" : "Register Applicant"}</Btn>
          </div>
        </form>
      </Card>
    </div>;
}
export {
  RegistrationScreen
};
