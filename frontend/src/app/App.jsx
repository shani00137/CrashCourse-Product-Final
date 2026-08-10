import { useState, useEffect, useCallback } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router";
import * as auth from "../services/authService";
import { onAuthExpired } from "../services/apiClient";
import { changeApplicantStatus } from "../services/applicantService";
import { LoginScreen } from "./components/views/auth/Login";
import { AdminShell } from "./components/layout/AdminShell";

function LoginPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(auth.isAuthenticated());

  if (authed) {
    return <Navigate to="/" replace />;
  }

  return (
    <LoginScreen
      onLogin={loggedInUser => {
        setAuthed(true);
        navigate("/", { replace: true });
      }}
    />
  );
}

function ProtectedApp() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(auth.isAuthenticated());
  const [user, setUser] = useState(auth.getCurrentUser());
  const [screen, setScreen] = useState("dashboard");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [questionForm, setQuestionForm] = useState(null);

  const handleSelectApplicant = useCallback(a => {
    setSelectedApplicant(a);
    setScreen("applicant-detail");
  }, []);

  const handleEditApplicant = useCallback(a => {
    setEditingApplicant(a);
    setScreen("registration");
  }, []);

  const handleAddApplicant = useCallback(() => {
    setEditingApplicant(null);
    setScreen("registration");
  }, []);

  const handleAddQuestion = useCallback(() => {
    setQuestionForm({ question: null });
    setScreen("question-form");
  }, []);

  const handleEditQuestion = useCallback(q => {
    setQuestionForm({ question: q });
    setScreen("question-form");
  }, []);

  const handleToggleApplicantActive = useCallback(async a => {
    await changeApplicantStatus(a.applicantId);
    setScreen("applicants");
  }, []);

  useEffect(() => {
    const off = onAuthExpired(() => {
      auth.logout();
      setUser(null);
      setAuthed(false);
      navigate("/login", { replace: true });
    });
    return off;
  }, [navigate]);

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setAuthed(false);
    navigate("/login", { replace: true });
  };

  return (
    <AdminShell
      screen={screen}
      setScreen={setScreen}
      user={user}
      onLogout={handleLogout}
      selectedApplicant={selectedApplicant}
      editingApplicant={editingApplicant}
      questionForm={questionForm}
      onSelectApplicant={handleSelectApplicant}
      onEditApplicant={handleEditApplicant}
      onAddApplicant={handleAddApplicant}
      onAddQuestion={handleAddQuestion}
      onEditQuestion={handleEditQuestion}
      onToggleApplicantActive={handleToggleApplicantActive}
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}

export default App;
