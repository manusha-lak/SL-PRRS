import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/ui";
import {
  CitizenDashboardPage,
  CitizenLoginPage,
  CitizenProfilePage,
  CitizenRegisterPage,
  EvidencePage,
  ForgotPasswordPage,
  HelpFaqPage,
  ReportDetailPage,
  ReportsPage,
  StationDetailPage,
  StationFinderPage,
  SubmitReportPage,
  TrackReportPage
} from "./pages/citizen";
import {
  LandingPage,
  LoadingPage,
  NotFoundPage,
  ServerErrorPage,
  SessionExpiredPage,
  SplashPage
} from "./pages/public";
import {
  OfficerAlertsPage,
  OfficerCasesPage,
  OfficerDashboardPage,
  OfficerLoginPage,
  OfficerProfilePage
} from "./pages/officer";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<SplashPage />} path="/" />
        <Route element={<LandingPage />} path="/landing" />

        <Route element={<CitizenLoginPage />} path="/citizen/login" />
        <Route element={<CitizenRegisterPage />} path="/citizen/register" />
        <Route element={<ForgotPasswordPage />} path="/citizen/forgot-password" />
        <Route element={<CitizenDashboardPage />} path="/citizen/dashboard" />
        <Route element={<ReportsPage />} path="/citizen/reports" />
        <Route element={<ReportDetailPage />} path="/citizen/reports/:reference" />
        <Route element={<SubmitReportPage />} path="/citizen/submit-report" />
        <Route element={<TrackReportPage />} path="/citizen/track-report" />
        <Route element={<EvidencePage />} path="/citizen/evidence" />
        <Route element={<StationFinderPage />} path="/citizen/stations" />
        <Route element={<StationDetailPage />} path="/citizen/stations/:stationId" />
        <Route element={<CitizenProfilePage />} path="/citizen/profile" />
        <Route element={<HelpFaqPage />} path="/citizen/help" />

        <Route element={<OfficerLoginPage />} path="/officer/login" />
        <Route element={<OfficerDashboardPage />} path="/officer/dashboard" />
        <Route element={<OfficerAlertsPage />} path="/officer/alerts" />
        <Route element={<OfficerCasesPage />} path="/officer/cases" />
        <Route element={<OfficerProfilePage />} path="/officer/profile" />

        <Route element={<SessionExpiredPage />} path="/session-expired" />
        <Route element={<ServerErrorPage />} path="/server-error" />
        <Route element={<LoadingPage />} path="/loading" />

        <Route element={<Navigate replace to="/" />} path="/home" />
        <Route element={<Navigate replace to="/citizen/dashboard" />} path="/citizen" />
        <Route element={<Navigate replace to="/officer/dashboard" />} path="/officer" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </ToastProvider>
  );
}
