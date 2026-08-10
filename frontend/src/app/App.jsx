import { useState, useEffect, useCallback } from "react";
import * as auth from "../services/authService";
import { onAuthExpired } from "../services/apiClient";
import { changeApplicantStatus } from "../services/applicantService";
import { LoginScreen } from "./components/views/auth/Login";
import { AdminShell } from "./components/layout/AdminShell";

function App() {
  const [screen, setScreen] = useState(auth.isAuthenticated() ? "dashboard" : "login");
  const [authed, setAuthed] = useState(auth.isAuthenticated());
  const [user, setUser] = useState(auth.getCurrentUser());
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [editingApplicant, setEditingApplicant] = useState(null);

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

  const handleToggleApplicantActive = useCallback(async a => {
    await changeApplicantStatus(a.applicantId);
    setScreen("applicants");
  }, []);

  useEffect(() => {
    const off = onAuthExpired(() => {
      auth.logout();
      setUser(null);
      setAuthed(false);
      setScreen("login");
    });
    return off;
  }, []);

  if (!authed) {
    return (
      <LoginScreen
        onLogin={loggedInUser => {
          setUser(loggedInUser);
          setAuthed(true);
          setScreen("dashboard");
        }}
      />
    );
  }

  return (
    <AdminShell
      screen={screen}
      setScreen={setScreen}
      user={user}
      onLogout={() => {
        auth.logout();
        setUser(null);
        setAuthed(false);
        setScreen("login");
      }}
      selectedApplicant={selectedApplicant}
      editingApplicant={editingApplicant}
      onSelectApplicant={handleSelectApplicant}
      onEditApplicant={handleEditApplicant}
      onAddApplicant={handleAddApplicant}
      onToggleApplicantActive={handleToggleApplicantActive}
    />
  );
}

export default App;
