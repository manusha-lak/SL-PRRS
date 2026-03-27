import clsx from "clsx";
import { startTransition, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell, OfficerLayout } from "../components/layout";
import {
  Breadcrumbs,
  EmptyState,
  KpiCard,
  MaterialIcon,
  Modal,
  PageTabs,
  SectionHeading,
  StatusBadge,
  SurfaceCard,
  Timeline,
  ghostButtonClassName,
  inputClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  useToast
} from "../components/ui";
import { alerts, caseTimeline, officerUser, reports } from "../data/mockData";
import { useQueryState } from "../lib/useQueryState";

type OfficerLoginForm = {
  badge: string;
  password: string;
};

type CaseDetailTab = "details" | "evidence" | "timeline" | "notes";

const activityFeed = [
  "Alert SLPRS-2024-0043 acknowledged by duty officer.",
  "Evidence review requested from citizen profile #5219.",
  "Vehicle Theft case escalated to investigation desk.",
  "Station operations briefing completed for Colombo North."
];

const officerHistory = [
  { action: "Logged into officer portal", time: "Today | 08:05 AM" },
  { action: "Updated case SLPRS-2024-0042", time: "Today | 10:28 AM" },
  { action: "Reviewed citizen evidence upload", time: "Today | 11:14 AM" }
];

function OfficerField({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClassName}>{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function OfficerLoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<OfficerLoginForm>({
    badge: officerUser.badge,
    password: ""
  });
  const [touched, setTouched] = useState<Record<keyof OfficerLoginForm, boolean>>({
    badge: false,
    password: false
  });
  const [loading, setLoading] = useState(false);

  const errors = {
    badge: form.badge.trim() ? "" : "Badge number is required.",
    password: form.password.trim() ? "" : "Password is required."
  };
  const errorList = Object.values(errors).filter(Boolean);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ badge: true, password: true });

    if (errorList.length) {
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast.push("success", "Officer authenticated", "Operations dashboard is ready.");
      startTransition(() => navigate("/officer/dashboard"));
    }, 700);
  };

  return (
    <AuthShell
      title="Officer Login"
      description="Restricted access for police officers to review alerts, manage assigned cases, and update investigation status."
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        {!!errorList.length && Object.values(touched).some(Boolean) ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            Resolve the highlighted officer credential fields before continuing.
          </div>
        ) : null}

        <OfficerField error={touched.badge ? errors.badge : ""} label="Badge Number">
          <input
            className={inputClassName}
            onBlur={() => setTouched((current) => ({ ...current, badge: true }))}
            onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
            value={form.badge}
          />
        </OfficerField>

        <OfficerField error={touched.password ? errors.password : ""} label="Password">
          <input
            className={inputClassName}
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            type="password"
            value={form.password}
          />
        </OfficerField>

        <button
          className={clsx(primaryButtonClassName, "w-full", loading && "cursor-not-allowed opacity-80")}
          disabled={loading || !!errorList.length}
          type="submit"
        >
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
          {loading ? "Signing In..." : "Enter Officer Portal"}
        </button>

        <div className="grid gap-3 text-center text-sm text-slate-500">
          <Link className="font-semibold text-[var(--slprrs-navy)]" to="/citizen/login">
            Citizen Login
          </Link>
          <Link className="font-semibold text-[var(--slprrs-gold)]" to="/landing">
            Public Landing
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function OfficerDashboardPage() {
  const [tab, setTab] = useQueryState("tab", "overview");

  return (
    <OfficerLayout active="dashboard" title="Officer Dashboard">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Police Operations"
          title="Officer Dashboard"
          body="Review case load, station performance, and operational activity from the assigned police station."
        />

        <SurfaceCard className="p-6">
          <PageTabs
            onChange={setTab}
            tabs={[
              { value: "overview", label: "Overview" },
              { value: "station", label: "My Station" },
              { value: "activity", label: "Today's Activity" }
            ]}
            value={tab}
          />

          <div className="mt-6">
            {tab === "overview" ? (
              <div className="space-y-6">
                <div className="grid gap-5 xl:grid-cols-4">
                  <KpiCard icon="notifications_active" label="Unread Alerts" value="02" status="Pending" />
                  <KpiCard icon="folder_open" label="Open Cases" value="07" status="Active" />
                  <KpiCard icon="schedule" label="Awaiting Review" value="03" />
                  <KpiCard icon="verified" label="Resolved Today" value="02" status="Resolved" />
                </div>
                <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                  <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                      Priority Alerts
                    </p>
                    <div className="mt-5 space-y-4">
                      {alerts.map((alert) => (
                        <div key={alert.ref} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-[var(--slprrs-navy)]">{alert.ref}</p>
                            <span
                              className={clsx(
                                "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]",
                                alert.unread
                                  ? "bg-[var(--slprrs-warning-bg)] text-[var(--slprrs-warning-text)]"
                                  : "bg-slate-100 text-slate-500"
                              )}
                            >
                              {alert.unread ? "Unread" : "Read"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {alert.type} | {alert.citizen}
                          </p>
                        </div>
                      ))}
                    </div>
                  </SurfaceCard>
                  <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                      Assigned Officer
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-[var(--slprrs-navy)]">{officerUser.name}</h2>
                    <p className="mt-3 text-sm text-slate-500">
                      {officerUser.rank} | {officerUser.badge}
                    </p>
                    <dl className="mt-6 space-y-4">
                      <div className="rounded-2xl bg-white px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Station</p>
                        <p className="mt-2 font-semibold text-[var(--slprrs-navy)]">{officerUser.station}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Division</p>
                        <p className="mt-2 font-semibold text-[var(--slprrs-navy)]">{officerUser.division}</p>
                      </div>
                    </dl>
                  </SurfaceCard>
                </div>
              </div>
            ) : null}

            {tab === "station" ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                  <h2 className="text-2xl font-bold text-[var(--slprrs-navy)]">{officerUser.station}</h2>
                  <p className="mt-3 text-sm text-slate-500">{officerUser.division}</p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Active Cases</p>
                      <p className="mt-3 text-3xl font-bold text-[var(--slprrs-gold)]">07</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Evidence Requests</p>
                      <p className="mt-3 text-3xl font-bold text-[var(--slprrs-gold)]">03</p>
                    </div>
                  </div>
                </SurfaceCard>
                <div className="rounded-[1.8rem] bg-[linear-gradient(145deg,rgba(0,43,91,0.14),rgba(200,148,26,0.16))] p-6">
                  <div className="flex min-h-[22rem] items-center justify-center rounded-[1.5rem] bg-white/72">
                    <div className="text-center">
                      <MaterialIcon className="text-5xl text-[var(--slprrs-navy)]" name="storefront" />
                      <p className="mt-4 text-sm text-slate-500">Station operations map and service footprint</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "activity" ? (
              <div className="space-y-4">
                {activityFeed.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[rgba(0,43,91,0.08)] bg-[var(--slprrs-surface-low)] px-5 py-4"
                  >
                    <p className="font-semibold text-[var(--slprrs-navy)]">{item}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </SurfaceCard>
      </div>
    </OfficerLayout>
  );
}

export function OfficerAlertsPage() {
  const [state, setState] = useQueryState("state", "default");
  const visibleAlerts = state === "empty" ? [] : alerts;

  return (
    <OfficerLayout active="alerts" title="Alerts Inbox">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Alert Feed"
          title="Alerts Inbox"
          body="Review station alerts, acknowledge unread items, and open related case workflows."
        />

        <div className="flex justify-end">
          <button className={ghostButtonClassName} onClick={() => setState(state === "empty" ? "default" : "empty")} type="button">
            Toggle All Read
          </button>
        </div>

        {visibleAlerts.length ? (
          <div className="grid gap-4">
            {visibleAlerts.map((alert) => (
              <SurfaceCard key={alert.ref} className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xl font-bold text-[var(--slprrs-navy)]">{alert.ref}</p>
                      <span
                        className={clsx(
                          "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]",
                          alert.unread
                            ? "bg-[var(--slprrs-warning-bg)] text-[var(--slprrs-warning-text)]"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {alert.unread ? "Unread" : "Read"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {alert.type} | {alert.citizen} | {alert.time}
                    </p>
                  </div>
                  <Link className={secondaryButtonClassName} to="/officer/cases">
                    Open Case
                  </Link>
                </div>
              </SurfaceCard>
            ))}
          </div>
        ) : (
          <EmptyState
            action={
              <button className={secondaryButtonClassName} onClick={() => setState("default")} type="button">
                Reload Alerts
              </button>
            }
            body="All current alerts have been reviewed. The inbox is clear for the moment."
            icon="notifications_off"
            title="No unread alerts"
          />
        )}
      </div>
    </OfficerLayout>
  );
}

export function OfficerCasesPage() {
  const toast = useToast();
  const [tab, setTab] = useQueryState("tab", "all");
  const [detailTab, setDetailTab] = useState<CaseDetailTab>("details");
  const [selectedReport, setSelectedReport] = useState<(typeof reports)[number] | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const filteredReports = useMemo(() => {
    if (tab === "all") {
      return reports;
    }
    if (tab === "pending") {
      return reports.filter((report) => report.status === "Pending");
    }
    if (tab === "investigation") {
      return reports.filter((report) => report.status === "Under Investigation");
    }
    return reports.filter((report) => report.status === "Resolved" || report.status === "Closed");
  }, [tab]);

  return (
    <OfficerLayout active="cases" title="Case Management">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Operations Desk"
          title="Case Management"
          body="Work through pending and active cases, inspect evidence, and publish timeline updates."
        />

        <SurfaceCard className="p-6">
          <PageTabs
            onChange={setTab}
            tabs={[
              { value: "all", label: "All Cases" },
              { value: "pending", label: "Pending" },
              { value: "investigation", label: "Under Investigation" },
              { value: "resolved", label: "Resolved" }
            ]}
            value={tab}
          />

          <div className="mt-6 overflow-hidden rounded-2xl border border-[rgba(0,43,91,0.08)]">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-left">
              <thead className="bg-[var(--slprrs-surface-low)] text-[11px] uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-4 py-4">Reference</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Station</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredReports.map((report) => (
                  <tr key={report.ref} className="hover:bg-[rgba(0,43,91,0.03)]">
                    <td className="px-4 py-4 font-semibold text-[var(--slprrs-navy)]">{report.ref}</td>
                    <td className="px-4 py-4">{report.type}</td>
                    <td className="px-4 py-4">{report.station}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        className={ghostButtonClassName}
                        onClick={() => {
                          setSelectedReport(report);
                          setDetailTab("details");
                        }}
                        type="button"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <Modal
          onClose={() => setSelectedReport(null)}
          open={!!selectedReport}
          title={selectedReport ? `Case Detail | ${selectedReport.ref}` : "Case Detail"}
        >
          {selectedReport ? (
            <div className="space-y-6">
              <PageTabs
                onChange={(value) => setDetailTab(value as CaseDetailTab)}
                tabs={[
                  { value: "details", label: "Details" },
                  { value: "evidence", label: "Evidence" },
                  { value: "timeline", label: "Timeline" },
                  { value: "notes", label: "Notes" }
                ]}
                value={detailTab}
              />

              {detailTab === "details" ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    ["Reference", selectedReport.ref],
                    ["Incident Type", selectedReport.type],
                    ["Receiving Station", selectedReport.station],
                    ["Current Status", selectedReport.status]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-[var(--slprrs-surface-low)] px-4 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                      <p className="mt-2 font-semibold text-[var(--slprrs-navy)]">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {detailTab === "evidence" ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {["JPG", "PNG", "PDF"].map((kind) => (
                    <div key={kind} className="overflow-hidden rounded-2xl border border-[rgba(0,43,91,0.08)]">
                      <div className="flex h-32 items-center justify-center bg-[linear-gradient(145deg,rgba(0,43,91,0.14),rgba(200,148,26,0.12))]">
                        <p className="text-3xl font-black text-[var(--slprrs-navy)]">{kind}</p>
                      </div>
                      <div className="px-4 py-4">
                        <p className="font-semibold text-[var(--slprrs-navy)]">Evidence File</p>
                        <p className="mt-2 text-sm text-slate-500">Citizen-uploaded supporting evidence.</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {detailTab === "timeline" ? <Timeline items={[...caseTimeline]} /> : null}

              {detailTab === "notes" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-[var(--slprrs-surface-low)] px-4 py-4 text-sm text-slate-600">
                    Initial station review completed. Waiting for additional evidence verification from citizen account.
                  </div>
                  <textarea className={inputClassName + " min-h-32 resize-none"} placeholder="Add officer note..." />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button className={primaryButtonClassName} onClick={() => setStatusModalOpen(true)} type="button">
                  Update Status
                </button>
                <button className={secondaryButtonClassName} onClick={() => setSelectedReport(null)} type="button">
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </Modal>

        <Modal onClose={() => setStatusModalOpen(false)} open={statusModalOpen} title="Update Case Status">
          <div className="space-y-5">
            <OfficerField label="New Status">
              <select className={inputClassName} defaultValue="Under Investigation">
                <option>Pending</option>
                <option>Under Investigation</option>
                <option>Awaiting Review</option>
                <option>Resolved</option>
              </select>
            </OfficerField>
            <OfficerField label="Officer Note">
              <textarea className={inputClassName + " min-h-32 resize-none"} defaultValue="Investigation continues. Evidence desk has been notified." />
            </OfficerField>
            <div className="flex gap-3">
              <button
                className={primaryButtonClassName}
                onClick={() => {
                  setStatusModalOpen(false);
                  toast.push("success", "Status updated", "Case timeline has been refreshed.");
                }}
                type="button"
              >
                Save Update
              </button>
              <button className={secondaryButtonClassName} onClick={() => setStatusModalOpen(false)} type="button">
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </OfficerLayout>
  );
}

export function OfficerProfilePage() {
  const [tab, setTab] = useQueryState("tab", "details");

  return (
    <OfficerLayout active="profile" title="Officer Profile">
      <div className="mx-auto max-w-7xl space-y-8">
        <Breadcrumbs
          items={[
            { label: "Officer Dashboard", to: "/officer/dashboard" },
            { label: "Officer Profile" }
          ]}
        />

        <SectionHeading
          eyebrow="Officer Identity"
          title="Officer Profile"
          body="Review assigned station details, update the sign-in password, and inspect the officer activity log."
        />

        <SurfaceCard className="p-6">
          <PageTabs
            onChange={setTab}
            tabs={[
              { value: "details", label: "My Details" },
              { value: "password", label: "Change Password" },
              { value: "activity", label: "Activity Log" }
            ]}
            value={tab}
          />

          <div className="mt-6">
            {tab === "details" ? (
              <div className="grid gap-5 md:grid-cols-2">
                {[
                  ["Name", officerUser.name],
                  ["Rank", officerUser.rank],
                  ["Badge", officerUser.badge],
                  ["Station", officerUser.station]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-[var(--slprrs-surface-low)] px-4 py-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                    <p className="mt-2 font-semibold text-[var(--slprrs-navy)]">{value}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {tab === "password" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <OfficerField label="Current Password">
                  <input className={inputClassName} type="password" />
                </OfficerField>
                <OfficerField label="New Password">
                  <input className={inputClassName} type="password" />
                </OfficerField>
                <div className="md:col-span-2">
                  <button className={primaryButtonClassName} type="button">
                    Update Password
                  </button>
                </div>
              </div>
            ) : null}

            {tab === "activity" ? (
              <div className="space-y-4">
                {officerHistory.map((entry) => (
                  <div
                    key={entry.time}
                    className="rounded-2xl border border-[rgba(0,43,91,0.08)] bg-[var(--slprrs-surface-low)] px-5 py-4"
                  >
                    <p className="font-semibold text-[var(--slprrs-navy)]">{entry.action}</p>
                    <p className="mt-2 text-sm text-slate-500">{entry.time}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </SurfaceCard>
      </div>
    </OfficerLayout>
  );
}
