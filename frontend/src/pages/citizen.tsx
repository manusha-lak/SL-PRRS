import clsx from "clsx";
import { startTransition, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthShell, CitizenLayout } from "../components/layout";
import {
  AccordionList,
  Breadcrumbs,
  EmptyState,
  KpiCard,
  MaterialIcon,
  PageTabs,
  ProgressSteps,
  ReferenceCodeCard,
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
import {
  caseTimeline,
  citizenUser,
  faqItems,
  notificationItems,
  reports,
  stations
} from "../data/mockData";
import { useQueryState } from "../lib/useQueryState";

type LoginForm = {
  identifier: string;
  password: string;
};

type RegisterForm = {
  name: string;
  nic: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accepted: boolean;
};

type ForgotPasswordForm = {
  identifier: string;
  password: string;
  confirmPassword: string;
};

type ReportDraft = {
  incidentType: string;
  location: string;
  incidentDate: string;
  description: string;
  urgency: string;
  stationId: string;
};

type UploadStatus = "Uploaded" | "Uploading" | "Retry";

type UploadFile = {
  id: number;
  name: string;
  size: string;
  status: UploadStatus;
};

type NotificationSettings = Record<string, boolean>;

const reportStepLabels = ["Incident Details", "Select Station", "Upload Evidence", "Review"];

const reportEvidence: UploadFile[] = [
  { id: 1, name: "vehicle-damage-photo-01.jpg", size: "1.8 MB", status: "Uploaded" },
  { id: 2, name: "parking-camera-still.png", size: "2.4 MB", status: "Uploaded" },
  { id: 3, name: "witness-statement.pdf", size: "280 KB", status: "Uploading" }
];

const loginHistory = [
  { device: "Windows Laptop", location: "Colombo 05", time: "Today | 09:14 AM" },
  { device: "Android Mobile", location: "Nugegoda", time: "Yesterday | 07:38 PM" },
  { device: "Safari Browser", location: "Kandy", time: "2024-11-12 | 01:05 PM" }
];

const evidenceGallery = [
  { id: "e-1", title: "Vehicle Image", type: "JPG", detail: "Uploaded 2024-11-14 | 09:40 AM" },
  { id: "e-2", title: "Parking Lot Snapshot", type: "PNG", detail: "Uploaded 2024-11-14 | 09:44 AM" },
  { id: "e-3", title: "Driver Statement", type: "PDF", detail: "Uploaded 2024-11-14 | 10:02 AM" }
];

function getLoginErrors(form: LoginForm) {
  return {
    identifier: form.identifier.trim() ? "" : "Email or NIC is required.",
    password: form.password.trim() ? "" : "Password is required."
  };
}

function getRegisterErrors(form: RegisterForm) {
  return {
    name: form.name.trim() ? "" : "Full name is required.",
    nic: /^[0-9]{9}[VXvx]$|^[0-9]{12}$/.test(form.nic.trim()) ? "" : "Enter a valid Sri Lankan NIC.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "" : "Enter a valid email address.",
    phone: form.phone.trim().length >= 10 ? "" : "Enter a valid mobile number.",
    password: form.password.trim().length >= 8 ? "" : "Use at least 8 characters.",
    confirmPassword:
      form.confirmPassword.trim() && form.confirmPassword === form.password
        ? ""
        : "Passwords must match.",
    accepted: form.accepted ? "" : "You must confirm the declaration before submitting."
  };
}

function getForgotPasswordErrors(form: ForgotPasswordForm) {
  return {
    identifier: form.identifier.trim() ? "" : "Email or NIC is required.",
    password: form.password.trim().length >= 8 ? "" : "Use at least 8 characters.",
    confirmPassword:
      form.confirmPassword.trim() && form.confirmPassword === form.password
        ? ""
        : "Passwords must match."
  };
}

function getDraftErrors(draft: ReportDraft) {
  return {
    incidentType: draft.incidentType ? "" : "Select an incident category.",
    location: draft.location.trim() ? "" : "Incident location is required.",
    incidentDate: draft.incidentDate ? "" : "Incident date is required.",
    description: draft.description.trim().length >= 30 ? "" : "Provide at least 30 characters.",
    stationId: draft.stationId ? "" : "Select a receiving station."
  };
}

function ErrorBanner({
  title,
  errors
}: {
  title: string;
  errors: string[];
}) {
  if (!errors.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClassName}>{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs text-red-600">{error}</span> : null}
      {!error && hint ? <span className="mt-2 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 py-4 md:flex-row md:items-center md:justify-between">
      <dt className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-[var(--slprrs-navy)]">{value}</dd>
    </div>
  );
}

function EvidenceTile({
  title,
  detail,
  type,
  onOpen
}: {
  title: string;
  detail: string;
  type: string;
  onOpen?: () => void;
}) {
  return (
    <button
      className="group overflow-hidden rounded-2xl border border-[rgba(0,43,91,0.08)] bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg"
      onClick={onOpen}
      type="button"
    >
      <div className="flex h-40 items-center justify-center bg-[linear-gradient(140deg,rgba(0,43,91,0.12),rgba(200,148,26,0.1))]">
        <div className="rounded-2xl bg-white/70 px-6 py-4 text-center backdrop-blur">
          <p className="text-3xl font-black tracking-[0.12em] text-[var(--slprrs-navy)]">{type}</p>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="font-semibold text-[var(--slprrs-navy)]">{title}</p>
        <p className="mt-2 text-sm text-slate-500">{detail}</p>
      </div>
    </button>
  );
}

export function CitizenLoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [state] = useQueryState("state", "default");
  const [form, setForm] = useState<LoginForm>({ identifier: "", password: "" });
  const [touched, setTouched] = useState<Record<keyof LoginForm, boolean>>({
    identifier: false,
    password: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const errors = getLoginErrors(form);
  const errorList = Object.values(errors).filter(Boolean);

  const updateField = (field: keyof LoginForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setTouched({ identifier: true, password: true });

    if (errorList.length) {
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast.push("success", "Login successful", "Citizen workspace is ready.");
      startTransition(() => navigate("/citizen/dashboard"));
    }, 700);
  };

  return (
    <AuthShell
      title="Citizen Login"
      description="Secure sign-in for citizens to submit incidents, track reference codes, and manage uploaded evidence."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {state === "error" ? (
          <ErrorBanner
            errors={["The provided credentials do not match our citizen records."]}
            title="Authentication failed"
          />
        ) : null}
        {submitted ? <ErrorBanner errors={errorList} title="Resolve the following fields" /> : null}

        <Field error={touched.identifier ? errors.identifier : ""} label="Email or NIC">
          <input
            className={inputClassName}
            onBlur={() => setTouched((current) => ({ ...current, identifier: true }))}
            onChange={(event) => updateField("identifier", event.target.value)}
            placeholder="kavindu.perera@gmail.com"
            type="text"
            value={form.identifier}
          />
        </Field>

        <Field error={touched.password ? errors.password : ""} label="Password">
          <div className="relative">
            <input
              className={inputClassName + " pr-12"}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={form.password}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--slprrs-navy)]"
              onClick={() => setShowPassword((current) => !current)}
              type="button"
            >
              <MaterialIcon name={showPassword ? "visibility_off" : "visibility"} />
            </button>
          </div>
        </Field>

        <button
          className={clsx(primaryButtonClassName, "w-full", loading && "cursor-not-allowed opacity-80")}
          disabled={loading || !!errorList.length}
          type="submit"
        >
          {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
          {loading ? "Signing In..." : "Enter Citizen Portal"}
        </button>

        <div className="grid gap-3 text-center text-sm text-slate-500">
          <Link className="font-semibold text-[var(--slprrs-navy)]" to="/citizen/forgot-password">
            Forgot Password
          </Link>
          <Link className="font-semibold text-[var(--slprrs-navy)]" to="/citizen/register">
            Create Citizen Account
          </Link>
          <Link className="font-semibold text-[var(--slprrs-gold)]" to="/officer/login">
            Officer Login
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function CitizenRegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useQueryState("step", "1");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    name: citizenUser.name,
    nic: citizenUser.nic,
    email: citizenUser.email,
    phone: citizenUser.phone,
    password: "",
    confirmPassword: "",
    accepted: false
  });
  const [touched, setTouched] = useState<Record<keyof RegisterForm, boolean>>({
    name: false,
    nic: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    accepted: false
  });
  const errors = getRegisterErrors(form);

  const stepFields: Record<string, (keyof RegisterForm)[]> = {
    "1": ["name", "nic", "email", "phone"],
    "2": ["password", "confirmPassword"],
    "3": ["accepted"]
  };

  const currentErrors = (stepFields[step] || []).map((field) => errors[field]).filter(Boolean);
  const passwordStrength =
    form.password.length >= 12 ? "Strong" : form.password.length >= 8 ? "Medium" : "Low";

  const updateField = <T extends keyof RegisterForm>(field: T, value: RegisterForm[T]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const advanceStep = () => {
    if (step === "1" || step === "2" || step === "3") {
      const nextTouched = { ...touched };
      for (const field of stepFields[step]) {
        nextTouched[field] = true;
      }
      setTouched(nextTouched);
    }

    if (currentErrors.length) {
      setSubmitted(true);
      return;
    }

    if (step === "1") {
      setStep("2");
      return;
    }

    if (step === "2") {
      setStep("3");
      return;
    }

    if (step === "3") {
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        toast.push("success", "Registration complete", "Citizen account has been provisioned.");
        setStep("success");
      }, 800);
    }
  };

  if (step === "success") {
    return (
      <AuthShell
        title="Registration Submitted"
        description="Your citizen profile has been validated and is ready for secure reporting."
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(22,101,52,0.12)] text-[var(--slprrs-success-text)]">
            <MaterialIcon className="text-5xl" filled name="check_circle" />
          </div>
          <p className="text-sm leading-7 text-slate-500">
            A confirmation message has been prepared for {form.email}. Use your new credentials to
            enter the citizen portal.
          </p>
          <button
            className={primaryButtonClassName + " w-full"}
            onClick={() => startTransition(() => navigate("/citizen/login"))}
            type="button"
          >
            Continue to Citizen Login
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Citizen Registration"
      description="Create a secure digital profile for reporting, evidence submission, and case tracking."
    >
      <div className="space-y-6">
        <ProgressSteps current={step === "1" ? 1 : step === "2" ? 2 : 3} steps={["Personal Details", "Set Password", "Verify & Submit", "Confirmation"]} />
        {submitted ? <ErrorBanner errors={currentErrors} title="Resolve the highlighted fields" /> : null}

        {step === "1" ? (
          <div className="grid gap-4">
            <Field error={touched.name ? errors.name : ""} label="Full Name">
              <input
                className={inputClassName}
                onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                onChange={(event) => updateField("name", event.target.value)}
                value={form.name}
              />
            </Field>
            <Field error={touched.nic ? errors.nic : ""} label="NIC Number">
              <input
                className={inputClassName}
                onBlur={() => setTouched((current) => ({ ...current, nic: true }))}
                onChange={(event) => updateField("nic", event.target.value)}
                value={form.nic}
              />
            </Field>
            <Field error={touched.email ? errors.email : ""} label="Email Address">
              <input
                className={inputClassName}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                onChange={(event) => updateField("email", event.target.value)}
                type="email"
                value={form.email}
              />
            </Field>
            <Field error={touched.phone ? errors.phone : ""} label="Mobile Number">
              <input
                className={inputClassName}
                onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                onChange={(event) => updateField("phone", event.target.value)}
                value={form.phone}
              />
            </Field>
          </div>
        ) : null}

        {step === "2" ? (
          <div className="space-y-4">
            <Field error={touched.password ? errors.password : ""} label="Set Password">
              <input
                className={inputClassName}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                onChange={(event) => updateField("password", event.target.value)}
                type="password"
                value={form.password}
              />
            </Field>
            <div className="rounded-2xl bg-[var(--slprrs-surface-low)] px-4 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Password Strength</span>
                <span>{passwordStrength}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white">
                <div
                  className={clsx(
                    "h-2 rounded-full transition",
                    passwordStrength === "Strong"
                      ? "w-full bg-[var(--slprrs-success-text)]"
                      : passwordStrength === "Medium"
                        ? "w-2/3 bg-[var(--slprrs-gold)]"
                        : "w-1/3 bg-red-400"
                  )}
                />
              </div>
            </div>
            <Field error={touched.confirmPassword ? errors.confirmPassword : ""} label="Confirm Password">
              <input
                className={inputClassName}
                onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                type="password"
                value={form.confirmPassword}
              />
            </Field>
          </div>
        ) : null}

        {step === "3" ? (
          <SurfaceCard className="p-6">
            <dl>
              <SummaryRow label="Full Name" value={form.name} />
              <SummaryRow label="NIC" value={form.nic} />
              <SummaryRow label="Email" value={form.email} />
              <SummaryRow label="Phone" value={form.phone} />
            </dl>
            <label className="mt-6 flex gap-3 text-sm text-slate-600">
              <input
                checked={form.accepted}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--slprrs-gold)]"
                onBlur={() => setTouched((current) => ({ ...current, accepted: true }))}
                onChange={(event) => updateField("accepted", event.target.checked)}
                type="checkbox"
              />
              <span>
                I confirm that the information above is accurate and may be used for secure digital
                police services.
              </span>
            </label>
            {touched.accepted && errors.accepted ? (
              <span className="mt-2 block text-xs text-red-600">{errors.accepted}</span>
            ) : null}
          </SurfaceCard>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {step !== "1" ? (
            <button className={secondaryButtonClassName} onClick={() => setStep(step === "3" ? "2" : "1")} type="button">
              Back
            </button>
          ) : null}
          <button
            className={clsx(primaryButtonClassName, "flex-1", loading && "cursor-not-allowed opacity-80")}
            onClick={advanceStep}
            type="button"
          >
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
            {step === "3" ? "Submit Registration" : "Continue"}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useQueryState("step", "1");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ForgotPasswordForm>({
    identifier: citizenUser.email,
    password: "",
    confirmPassword: ""
  });
  const [touched, setTouched] = useState<Record<keyof ForgotPasswordForm, boolean>>({
    identifier: false,
    password: false,
    confirmPassword: false
  });
  const errors = getForgotPasswordErrors(form);

  const stepErrorList =
    step === "1"
      ? [errors.identifier].filter(Boolean)
      : step === "3"
        ? [errors.password, errors.confirmPassword].filter(Boolean)
        : [];

  const moveNext = () => {
    if (step === "1") {
      setTouched((current) => ({ ...current, identifier: true }));
      setSubmitted(true);
      if (errors.identifier) {
        return;
      }
      setStep("2");
      return;
    }

    if (step === "2") {
      setStep("3");
      return;
    }

    if (step === "3") {
      setTouched({ identifier: true, password: true, confirmPassword: true });
      setSubmitted(true);
      if (stepErrorList.length) {
        return;
      }
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        toast.push("success", "Password updated", "Use your new password to sign in.");
        setStep("4");
      }, 800);
    }
  };

  if (step === "4") {
    return (
      <AuthShell
        title="Password Reset Complete"
        description="Your citizen credentials have been refreshed successfully."
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(22,101,52,0.12)] text-[var(--slprrs-success-text)]">
            <MaterialIcon className="text-5xl" filled name="verified" />
          </div>
          <p className="text-sm leading-7 text-slate-500">
            Return to the login page and continue with the updated password.
          </p>
          <button
            className={primaryButtonClassName + " w-full"}
            onClick={() => startTransition(() => navigate("/citizen/login"))}
            type="button"
          >
            Return to Citizen Login
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot Password"
      description="Recover citizen access with a guided multi-step password reset flow."
    >
      <div className="space-y-6">
        <ProgressSteps current={step === "1" ? 1 : step === "2" ? 2 : 3} steps={["Identify Account", "Check Inbox", "Set New Password", "Done"]} />
        {submitted ? <ErrorBanner errors={stepErrorList} title="Resolve the highlighted fields" /> : null}

        {step === "1" ? (
          <Field error={touched.identifier ? errors.identifier : ""} label="Email or NIC">
            <input
              className={inputClassName}
              onBlur={() => setTouched((current) => ({ ...current, identifier: true }))}
              onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))}
              value={form.identifier}
            />
          </Field>
        ) : null}

        {step === "2" ? (
          <SurfaceCard className="p-6">
            <p className="text-sm leading-7 text-slate-500">
              A secure reset link has been issued to <strong>{form.identifier}</strong>. In this
              mock production flow, continue to simulate the email step.
            </p>
          </SurfaceCard>
        ) : null}

        {step === "3" ? (
          <div className="space-y-4">
            <Field error={touched.password ? errors.password : ""} label="New Password">
              <input
                className={inputClassName}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                type="password"
                value={form.password}
              />
            </Field>
            <Field error={touched.confirmPassword ? errors.confirmPassword : ""} label="Confirm New Password">
              <input
                className={inputClassName}
                onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                type="password"
                value={form.confirmPassword}
              />
            </Field>
          </div>
        ) : null}

        <div className="flex gap-3">
          {step !== "1" ? (
            <button className={secondaryButtonClassName} onClick={() => setStep(step === "3" ? "2" : "1")} type="button">
              Back
            </button>
          ) : null}
          <button
            className={clsx(primaryButtonClassName, "flex-1", loading && "cursor-not-allowed opacity-80")}
            onClick={moveNext}
            type="button"
          >
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
            {step === "3" ? "Update Password" : "Continue"}
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export function CitizenDashboardPage() {
  const [state, setState] = useQueryState("state", "default");
  const recentReports = state === "empty" ? [] : reports;

  return (
    <CitizenLayout active="dashboard" title="Citizen Dashboard">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Citizen Portal"
          title={`Welcome Back, ${citizenUser.name.split(",")[0]}`}
          body="Use the citizen workspace to file new incidents, track reference codes, and respond to evidence requests from your assigned station."
        />

        <div className="grid gap-5 xl:grid-cols-4">
          <KpiCard icon="flag" label="Active Reports" value="02" status="Active" />
          <KpiCard icon="schedule" label="Pending Updates" value="01" status="Pending" />
          <KpiCard icon="verified" label="Resolved Cases" value="01" status="Resolved" />
          <KpiCard icon="cloud_upload" label="Evidence Files" value="06" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SurfaceCard className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                  Quick Actions
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--slprrs-navy)]">
                  Reporting workspace
                </h2>
              </div>
              <button className={ghostButtonClassName} onClick={() => setState(state === "empty" ? "default" : "empty")} type="button">
                Toggle Empty State
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link className="rounded-2xl bg-[var(--slprrs-navy)] p-5 text-white" to="/citizen/submit-report">
                <MaterialIcon filled name="add_circle" />
                <p className="mt-4 text-lg font-bold">Submit Incident</p>
                <p className="mt-2 text-sm text-slate-300">Create a formal report with evidence.</p>
              </Link>
              <Link className="rounded-2xl bg-white p-5 shadow-sm" to="/citizen/track-report">
                <MaterialIcon className="text-[var(--slprrs-navy)]" name="track_changes" />
                <p className="mt-4 text-lg font-bold text-[var(--slprrs-navy)]">Track Reference</p>
                <p className="mt-2 text-sm text-slate-500">Check the latest investigation timeline.</p>
              </Link>
              <Link className="rounded-2xl bg-white p-5 shadow-sm" to="/citizen/stations">
                <MaterialIcon className="text-[var(--slprrs-navy)]" name="location_on" />
                <p className="mt-4 text-lg font-bold text-[var(--slprrs-navy)]">Find a Station</p>
                <p className="mt-2 text-sm text-slate-500">Locate the nearest police division.</p>
              </Link>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
              Citizen Identity
            </p>
            <dl className="mt-5 space-y-4">
              <SummaryRow label="NIC" value={citizenUser.nic} />
              <SummaryRow label="Email" value={citizenUser.email} />
              <SummaryRow label="Phone" value={citizenUser.phone} />
            </dl>
          </SurfaceCard>
        </div>

        {recentReports.length ? (
          <SurfaceCard className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                  Recent Reports
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--slprrs-navy)]">Latest case activity</h2>
              </div>
              <Link className={secondaryButtonClassName} to="/citizen/reports">
                View All Reports
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.ref}
                  className="rounded-2xl border border-[rgba(0,43,91,0.08)] bg-[var(--slprrs-surface-low)] px-5 py-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-bold text-[var(--slprrs-navy)]">{report.type}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        {report.ref} | {report.station} | {report.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={report.status} />
                      <Link className={ghostButtonClassName} to={`/citizen/reports/${report.ref}`}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        ) : (
          <EmptyState
            action={
              <Link className={primaryButtonClassName} to="/citizen/submit-report">
                Submit Your First Report
              </Link>
            }
            body="No reports have been submitted from this citizen profile yet. Use the guided incident form to begin."
            icon="assignment"
            title="No reports available"
          />
        )}
      </div>
    </CitizenLayout>
  );
}

export function ReportsPage() {
  const [status, setStatus] = useQueryState("status", "all");
  const [state, setState] = useQueryState("state", "default");
  const [search, setSearch] = useState("");

  const filteredReports = useMemo(() => {
    if (state === "empty") {
      return [];
    }

    return reports.filter((report) => {
      const matchesStatus =
        status === "all" ||
        (status === "active" && ["Pending", "Under Investigation"].includes(report.status)) ||
        report.status.toLowerCase().replaceAll(" ", "-") === status;
      const matchesSearch =
        !search ||
        report.ref.toLowerCase().includes(search.toLowerCase()) ||
        report.type.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [search, state, status]);

  return (
    <CitizenLayout active="reports" title="My Reports">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Case Portfolio"
          title="My Reports"
          body="Review every submitted case, apply quick filters, and open the full report detail view."
        />

        <SurfaceCard className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <Field label="Search reports">
                <input
                  className={inputClassName}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Reference code or incident type"
                  type="text"
                  value={search}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All"],
                ["active", "Active"],
                ["pending", "Pending"],
                ["under-investigation", "Under Investigation"],
                ["resolved", "Resolved"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={clsx(
                    "rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition",
                    status === value
                      ? "bg-[var(--slprrs-navy)] text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                  onClick={() => setStatus(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
              <button className={ghostButtonClassName} onClick={() => setState(state === "empty" ? "default" : "empty")} type="button">
                Toggle Empty
              </button>
            </div>
          </div>
        </SurfaceCard>

        {filteredReports.length ? (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <SurfaceCard key={report.ref} className="p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-[var(--slprrs-navy)]">{report.type}</h2>
                      <StatusBadge status={report.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {report.ref} | {report.station} | Submitted {report.date}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link className={secondaryButtonClassName} to={`/citizen/reports/${report.ref}`}>
                      View Details
                    </Link>
                    <Link className={ghostButtonClassName} to="/citizen/track-report?tab=code&state=found">
                      Track Progress
                    </Link>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>
        ) : (
          <EmptyState
            action={
              <button className={secondaryButtonClassName} onClick={() => setState("default")} type="button">
                Clear Filters
              </button>
            }
            body="No reports match the current filters. Adjust the search criteria or reset the report state."
            icon="filter_alt_off"
            title="No reports found"
          />
        )}
      </div>
    </CitizenLayout>
  );
}

export function ReportDetailPage() {
  const { reference = "" } = useParams();
  const [tab, setTab] = useQueryState("tab", "incident");
  const report = reports.find((item) => item.ref === reference);

  if (!report) {
    return (
      <CitizenLayout active="reports" title="Report Detail">
        <EmptyState
          action={
            <Link className={primaryButtonClassName} to="/citizen/reports">
              Return to My Reports
            </Link>
          }
          body="The requested report reference is not present in the mock data set."
          icon="folder_off"
          title="Report not found"
        />
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout active="reports" title="Report Detail">
      <div className="mx-auto max-w-7xl space-y-8">
        <Breadcrumbs
          items={[
            { label: "Citizen Dashboard", to: "/citizen/dashboard" },
            { label: "My Reports", to: "/citizen/reports" },
            { label: report.ref }
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SurfaceCard className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                  Incident Overview
                </p>
                <h1 className="mt-3 text-3xl font-bold text-[var(--slprrs-navy)]">{report.type}</h1>
              </div>
              <StatusBadge status={report.status} />
            </div>
            <dl className="mt-6">
              <SummaryRow label="Reference Code" value={report.ref} />
              <SummaryRow label="Assigned Station" value={report.station} />
              <SummaryRow label="Submitted On" value={report.date} />
              <SummaryRow label="Citizen" value={citizenUser.name} />
            </dl>
          </SurfaceCard>
          <ReferenceCodeCard code={report.ref} />
        </div>

        <SurfaceCard className="p-6">
          <PageTabs
            onChange={setTab}
            tabs={[
              { value: "incident", label: "Incident" },
              { value: "station", label: "Station" },
              { value: "evidence", label: "Evidence" },
              { value: "timeline", label: "Timeline" }
            ]}
            value={tab}
          />

          <div className="mt-6">
            {tab === "incident" ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    Incident Narrative
                  </p>
                  <p className="mt-4 text-sm leading-8 text-slate-600">
                    Citizen reported a vehicle theft from the designated parking area. CCTV stills
                    and witness statements have been submitted to support the investigation.
                  </p>
                </SurfaceCard>
                <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    Contact Context
                  </p>
                  <p className="mt-4 text-sm leading-8 text-slate-600">
                    Citizen is available for follow-up after 5:00 PM and has enabled evidence
                    review notifications.
                  </p>
                </SurfaceCard>
              </div>
            ) : null}

            {tab === "station" ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                  <h2 className="text-2xl font-bold text-[var(--slprrs-navy)]">{report.station}</h2>
                  <p className="mt-3 text-sm text-slate-500">
                    Colombo North Division | York Street, Colombo 01
                  </p>
                  <div className="mt-6 space-y-3 text-sm text-slate-600">
                    <p>Receiving desk: Open 24/7</p>
                    <p>Primary line: +94 11 242 1111</p>
                    <p>Case desk: Vehicle and property investigation desk</p>
                  </div>
                </SurfaceCard>
                <div className="rounded-[1.75rem] bg-[linear-gradient(145deg,rgba(0,43,91,0.14),rgba(200,148,26,0.16))] p-6">
                  <div className="flex h-full min-h-64 items-center justify-center rounded-[1.5rem] border border-dashed border-white/50 bg-white/55">
                    <div className="text-center">
                      <MaterialIcon className="text-5xl text-[var(--slprrs-navy)]" name="map" />
                      <p className="mt-4 text-sm font-semibold text-[var(--slprrs-navy)]">
                        Station map preview
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {tab === "evidence" ? (
              <div className="grid gap-4 md:grid-cols-3">
                {evidenceGallery.map((item) => (
                  <EvidenceTile key={item.id} detail={item.detail} title={item.title} type={item.type} />
                ))}
              </div>
            ) : null}

            {tab === "timeline" ? <Timeline items={[...caseTimeline]} /> : null}
          </div>
        </SurfaceCard>
      </div>
    </CitizenLayout>
  );
}

export function SubmitReportPage() {
  const toast = useToast();
  const [step, setStep] = useQueryState("step", "1");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>(reportEvidence);
  const [draft, setDraft] = useState<ReportDraft>({
    incidentType: "Vehicle Theft",
    location: "Lot C, Colombo 03",
    incidentDate: "2024-11-14T09:15",
    description:
      "The vehicle was parked in the public lot for less than one hour and was missing upon return. CCTV footage and witness statements are available.",
    urgency: "high",
    stationId: "colombo-fort"
  });
  const errors = getDraftErrors(draft);

  const moveForward = () => {
    if (step === "1") {
      setSubmitted(true);
      if ([errors.incidentType, errors.location, errors.incidentDate, errors.description].filter(Boolean).length) {
        return;
      }
      setStep("2");
      return;
    }

    if (step === "2") {
      setSubmitted(true);
      if (errors.stationId) {
        return;
      }
      setStep("3");
      return;
    }

    if (step === "3") {
      setStep("review");
      return;
    }

    if (step === "review") {
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        toast.push("success", "Report submitted", "Reference SLPRS-2024-0042 has been issued.");
        setStep("success");
      }, 900);
    }
  };

  const selectedStation = stations.find((station) => station.id === draft.stationId) ?? stations[0];

  return (
    <CitizenLayout active="submit" title="Submit Report">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Guided Intake"
          title="Submit Incident Report"
          body="Follow the guided intake flow to describe the incident, select the receiving station, and upload supporting evidence."
        />

        <ProgressSteps
          current={step === "1" ? 1 : step === "2" ? 2 : step === "3" ? 3 : 4}
          steps={reportStepLabels}
        />

        {step === "success" ? (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                Submission Complete
              </p>
              <h2 className="mt-4 text-3xl font-bold text-[var(--slprrs-navy)]">
                Your incident has been received
              </h2>
              <p className="mt-4 text-sm leading-8 text-slate-500">
                The nearest station has been assigned automatically using the selected location. You
                can now track this case or return to the dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className={primaryButtonClassName} to="/citizen/dashboard">
                  Back to Dashboard
                </Link>
                <Link className={secondaryButtonClassName} to="/citizen/track-report?tab=code&state=found">
                  Track This Report
                </Link>
              </div>
            </SurfaceCard>
            <ReferenceCodeCard code="SLPRS-2024-0042" />
          </div>
        ) : (
          <>
            {submitted && step === "1" ? (
              <ErrorBanner
                errors={[errors.incidentType, errors.location, errors.incidentDate, errors.description].filter(Boolean)}
                title="Complete the incident detail fields"
              />
            ) : null}
            {submitted && step === "2" && errors.stationId ? (
              <ErrorBanner errors={[errors.stationId]} title="Select a receiving station" />
            ) : null}

            {step === "1" ? (
              <SurfaceCard className="p-6">
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field error={submitted ? errors.incidentType : ""} label="Incident Type">
                    <select
                      className={inputClassName}
                      onChange={(event) => setDraft((current) => ({ ...current, incidentType: event.target.value }))}
                      value={draft.incidentType}
                    >
                      <option>Vehicle Theft</option>
                      <option>Fraud / Cheating</option>
                      <option>Assault</option>
                      <option>Property Damage</option>
                    </select>
                  </Field>
                  <Field label="Urgency Level">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ["high", "Urgent"],
                        ["medium", "Standard"],
                        ["low", "Information"]
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          className={clsx(
                            "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                            draft.urgency === value
                              ? "border-[var(--slprrs-gold)] bg-[rgba(200,148,26,0.1)] text-[var(--slprrs-navy)]"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                          )}
                          onClick={() => setDraft((current) => ({ ...current, urgency: value }))}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field error={submitted ? errors.location : ""} label="Incident Location">
                    <input
                      className={inputClassName}
                      onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                      value={draft.location}
                    />
                  </Field>
                  <Field error={submitted ? errors.incidentDate : ""} label="Incident Date & Time">
                    <input
                      className={inputClassName}
                      onChange={(event) => setDraft((current) => ({ ...current, incidentDate: event.target.value }))}
                      type="datetime-local"
                      value={draft.incidentDate}
                    />
                  </Field>
                  <div className="lg:col-span-2">
                    <Field error={submitted ? errors.description : ""} label="Incident Description">
                      <textarea
                        className={inputClassName + " min-h-36 resize-none"}
                        onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                        value={draft.description}
                      />
                    </Field>
                  </div>
                </div>
              </SurfaceCard>
            ) : null}

            {step === "2" ? (
              <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
                <SurfaceCard className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                        Station Matching
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-[var(--slprrs-navy)]">
                        Select receiving station
                      </h2>
                    </div>
                    <button
                      className={ghostButtonClassName}
                      onClick={() => setDraft((current) => ({ ...current, stationId: "colombo-fort" }))}
                      type="button"
                    >
                      Auto-assign nearest
                    </button>
                  </div>
                  <div className="mt-6 space-y-4">
                    {stations.map((station) => (
                      <button
                        key={station.id}
                        className={clsx(
                          "w-full rounded-2xl border p-5 text-left transition",
                          draft.stationId === station.id
                            ? "border-[var(--slprrs-gold)] bg-[rgba(200,148,26,0.08)]"
                            : "border-[rgba(0,43,91,0.08)] bg-white hover:border-[var(--slprrs-navy)]"
                        )}
                        onClick={() => setDraft((current) => ({ ...current, stationId: station.id }))}
                        type="button"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-lg font-bold text-[var(--slprrs-navy)]">{station.name}</p>
                            <p className="mt-2 text-sm text-slate-500">
                              {station.division} | {station.address}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            {station.distance}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </SurfaceCard>

                <div className="rounded-[1.8rem] bg-[linear-gradient(145deg,rgba(0,43,91,0.12),rgba(200,148,26,0.16))] p-6">
                  <div className="flex h-full min-h-[24rem] items-center justify-center rounded-[1.5rem] bg-white/75 p-6">
                    <div className="text-center">
                      <MaterialIcon className="text-5xl text-[var(--slprrs-navy)]" name="map" />
                      <p className="mt-4 text-lg font-bold text-[var(--slprrs-navy)]">{selectedStation.name}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Auto-selection preview based on reported location.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === "3" ? (
              <SurfaceCard className="p-6">
                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                      Evidence Upload
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--slprrs-navy)]">
                      Add supporting files
                    </h2>
                    <div className="mt-6 rounded-[1.75rem] border-2 border-dashed border-[rgba(200,148,26,0.5)] bg-[rgba(200,148,26,0.05)] p-10 text-center">
                      <MaterialIcon className="text-5xl text-[var(--slprrs-gold)]" name="cloud_upload" />
                      <p className="mt-4 text-lg font-semibold text-[var(--slprrs-navy)]">
                        Drag files here or add a demo evidence file
                      </p>
                      <button
                        className={secondaryButtonClassName + " mt-6"}
                        onClick={() =>
                          setFiles((current) => [
                            ...current,
                            {
                              id: Date.now(),
                              name: "additional-evidence-photo.jpg",
                              size: "1.1 MB",
                              status: "Uploaded"
                            }
                          ])
                        }
                        type="button"
                      >
                        Add Demo File
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-2xl border border-[rgba(0,43,91,0.08)] bg-[var(--slprrs-surface-low)] px-5 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--slprrs-navy)]">{file.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{file.size}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={clsx(
                                "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]",
                                file.status === "Uploaded"
                                  ? "bg-[var(--slprrs-success-bg)] text-[var(--slprrs-success-text)]"
                                  : file.status === "Uploading"
                                    ? "bg-[var(--slprrs-info-bg)] text-[var(--slprrs-info-text)]"
                                    : "bg-[var(--slprrs-danger-bg)] text-[var(--slprrs-danger-text)]"
                              )}
                            >
                              {file.status}
                            </span>
                            <button
                              className="text-slate-400 transition hover:text-red-500"
                              onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
                              type="button"
                            >
                              <MaterialIcon name="close" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SurfaceCard>
            ) : null}

            {step === "review" ? (
              <SurfaceCard className="p-6">
                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                      Submission Review
                    </p>
                    <dl className="mt-6">
                      <SummaryRow label="Incident Type" value={draft.incidentType} />
                      <SummaryRow label="Location" value={draft.location} />
                      <SummaryRow label="Date & Time" value={draft.incidentDate} />
                      <SummaryRow label="Receiving Station" value={selectedStation.name} />
                      <SummaryRow label="Evidence Files" value={`${files.length} file(s)`} />
                    </dl>
                  </div>
                  <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      Review Notes
                    </p>
                    <p className="mt-4 text-sm leading-8 text-slate-600">{draft.description}</p>
                  </SurfaceCard>
                </div>
              </SurfaceCard>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {step !== "1" ? (
                <button
                  className={secondaryButtonClassName}
                  onClick={() => setStep(step === "2" ? "1" : step === "3" ? "2" : "3")}
                  type="button"
                >
                  Back
                </button>
              ) : null}
              <button
                className={clsx(primaryButtonClassName, "flex-1", loading && "cursor-not-allowed opacity-80")}
                onClick={moveForward}
                type="button"
              >
                {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
                {step === "review" ? "Submit Report" : "Continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </CitizenLayout>
  );
}

export function TrackReportPage() {
  const [tab, setTab] = useQueryState("tab", "code");
  const [state, setState] = useQueryState("state", "found");
  const [referenceInput, setReferenceInput] = useState("SLPRS-2024-0042");
  const foundReport = reports[0];

  const handleLookup = () => {
    setState(referenceInput.trim().toUpperCase() === foundReport.ref ? "found" : "not-found");
  };

  return (
    <CitizenLayout active="track" title="Track Report">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Tracking"
          title="Track Report Status"
          body="Search by reference code or switch to the active case list for the signed-in citizen."
        />

        <SurfaceCard className="p-6">
          <PageTabs
            onChange={setTab}
            tabs={[
              { value: "code", label: "Track by Code" },
              { value: "active", label: "My Active Cases" }
            ]}
            value={tab}
          />

          {tab === "code" ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <Field label="Reference Code">
                  <input
                    className={inputClassName}
                    onChange={(event) => setReferenceInput(event.target.value)}
                    value={referenceInput}
                  />
                </Field>
                <button className={primaryButtonClassName + " self-end"} onClick={handleLookup} type="button">
                  Search
                </button>
              </div>

              {state === "found" ? (
                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-[var(--slprrs-navy)]">{foundReport.ref}</h2>
                      <StatusBadge status={foundReport.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {foundReport.type} | {foundReport.station} | {foundReport.date}
                    </p>
                    <div className="mt-6">
                      <Timeline items={[...caseTimeline]} />
                    </div>
                  </SurfaceCard>
                  <ReferenceCodeCard code={foundReport.ref} />
                </div>
              ) : (
                <EmptyState
                  action={
                    <button className={secondaryButtonClassName} onClick={() => setState("found")} type="button">
                      Load Sample Result
                    </button>
                  }
                  body="The provided reference code is not present in this mock environment. Verify the receipt and try again."
                  icon="search_off"
                  title="No matching report found"
                />
              )}
            </div>
          ) : null}

          {tab === "active" ? (
            <div className="mt-6 grid gap-4">
              {reports
                .filter((report) => report.status === "Pending" || report.status === "Under Investigation")
                .map((report) => (
                  <SurfaceCard key={report.ref} className="bg-[var(--slprrs-surface-low)] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-bold text-[var(--slprrs-navy)]">{report.type}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {report.ref} | {report.station}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <StatusBadge status={report.status} />
                        <Link className={ghostButtonClassName} to={`/citizen/reports/${report.ref}`}>
                          Open
                        </Link>
                      </div>
                    </div>
                  </SurfaceCard>
                ))}
            </div>
          ) : null}
        </SurfaceCard>
      </div>
    </CitizenLayout>
  );
}

export function EvidencePage() {
  const [state, setState] = useQueryState("state", "grid");
  const [selectedEvidence, setSelectedEvidence] = useState<(typeof evidenceGallery)[number] | null>(null);

  return (
    <CitizenLayout active="evidence" title="Evidence Library">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Evidence"
          title="My Uploaded Files"
          body="Review previously submitted evidence and open any item in a lightbox-style preview."
        />

        <div className="flex justify-end">
          <button className={ghostButtonClassName} onClick={() => setState(state === "grid" ? "empty" : "grid")} type="button">
            Toggle Empty State
          </button>
        </div>

        {state === "empty" ? (
          <EmptyState
            action={
              <Link className={primaryButtonClassName} to="/citizen/submit-report?step=3">
                Upload Evidence
              </Link>
            }
            body="No evidence files are available in the citizen library. Upload new files during report submission."
            icon="gallery_thumbnail"
            title="Evidence library is empty"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {evidenceGallery.map((item) => (
              <EvidenceTile
                key={item.id}
                detail={item.detail}
                onOpen={() => setSelectedEvidence(item)}
                title={item.title}
                type={item.type}
              />
            ))}
          </div>
        )}

        {selectedEvidence ? (
          <div
            className="fade-in fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4 py-6"
            onClick={() => setSelectedEvidence(null)}
            role="presentation"
          >
            <div
              className="slide-up w-full max-w-3xl rounded-[1.75rem] bg-white p-6 shadow-[0_30px_60px_rgba(0,43,91,0.28)]"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                    Evidence Preview
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[var(--slprrs-navy)]">
                    {selectedEvidence.title}
                  </h3>
                </div>
                <button className="rounded-full bg-slate-100 p-2" onClick={() => setSelectedEvidence(null)} type="button">
                  <MaterialIcon name="close" />
                </button>
              </div>
              <div className="mt-6 flex min-h-72 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(145deg,rgba(0,43,91,0.14),rgba(200,148,26,0.12))]">
                <div className="rounded-3xl bg-white/70 px-12 py-10 text-center backdrop-blur">
                  <p className="text-5xl font-black tracking-[0.12em] text-[var(--slprrs-navy)]">
                    {selectedEvidence.type}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">{selectedEvidence.detail}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </CitizenLayout>
  );
}

export function StationFinderPage() {
  const [state, setState] = useQueryState("state", "directory");
  const [stationId, setStationId] = useQueryState("station", "colombo-fort");
  const selectedStation = stations.find((station) => station.id === stationId) ?? stations[0];

  return (
    <CitizenLayout active="stations" title="Station Finder">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Station Directory"
          title="Find the Right Police Station"
          body="Browse the national station directory, simulate GPS-based location access, and inspect station-level contact details."
        />

        <div className="flex flex-wrap gap-3">
          <button className={secondaryButtonClassName} onClick={() => setState("gps")} type="button">
            GPS Prompt
          </button>
          <button className={secondaryButtonClassName} onClick={() => setState("selected")} type="button">
            Selected State
          </button>
          <button className={secondaryButtonClassName} onClick={() => setState("directory")} type="button">
            Directory View
          </button>
        </div>

        {state === "gps" ? (
          <SurfaceCard className="p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(0,43,91,0.08)] text-[var(--slprrs-navy)]">
              <MaterialIcon className="text-5xl" name="my_location" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-[var(--slprrs-navy)]">Allow location access</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-500">
              Grant GPS access to resolve the nearest police station automatically from the current
              location of the reporting device.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button className={primaryButtonClassName} onClick={() => setState("selected")} type="button">
                Allow & Resolve Station
              </button>
              <button className={secondaryButtonClassName} onClick={() => setState("directory")} type="button">
                Choose Manually
              </button>
            </div>
          </SurfaceCard>
        ) : null}

        {state !== "gps" ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
            <SurfaceCard className="p-6">
              <div className="space-y-4">
                {stations.map((station) => (
                  <button
                    key={station.id}
                    className={clsx(
                      "w-full rounded-2xl border p-5 text-left transition",
                      station.id === selectedStation.id
                        ? "border-[var(--slprrs-gold)] bg-[rgba(200,148,26,0.08)]"
                        : "border-[rgba(0,43,91,0.08)] bg-white hover:border-[var(--slprrs-navy)]"
                    )}
                    onClick={() => {
                      setStationId(station.id);
                      setState("selected");
                    }}
                    type="button"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-bold text-[var(--slprrs-navy)]">{station.name}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {station.division} | {station.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--slprrs-gold)]">
                          {station.distance}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">{station.phone}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </SurfaceCard>

            <div className="space-y-6">
              <div className="rounded-[1.8rem] bg-[linear-gradient(145deg,rgba(0,43,91,0.14),rgba(200,148,26,0.16))] p-6">
                <div className="flex min-h-[24rem] items-center justify-center rounded-[1.5rem] bg-white/72">
                  <div className="text-center">
                    <MaterialIcon className="text-5xl text-[var(--slprrs-navy)]" name="map" />
                    <p className="mt-4 text-sm font-semibold text-[var(--slprrs-navy)]">
                      Split map and directory preview
                    </p>
                  </div>
                </div>
              </div>

              {state === "selected" ? (
                <SurfaceCard className="p-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                    Selected Station
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-[var(--slprrs-navy)]">
                    {selectedStation.name}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {selectedStation.division} | {selectedStation.address}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {selectedStation.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link className={primaryButtonClassName} to={`/citizen/stations/${selectedStation.id}`}>
                      View Details
                    </Link>
                    <Link className={secondaryButtonClassName} to="/citizen/submit-report?step=2">
                      Use for Report
                    </Link>
                  </div>
                </SurfaceCard>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </CitizenLayout>
  );
}

export function StationDetailPage() {
  const { stationId = "" } = useParams();
  const station = stations.find((item) => item.id === stationId);

  if (!station) {
    return (
      <CitizenLayout active="stations" title="Station Detail">
        <EmptyState
          action={
            <Link className={primaryButtonClassName} to="/citizen/stations">
              Return to Station Finder
            </Link>
          }
          body="The requested station is not present in the current mock data set."
          icon="location_off"
          title="Station not found"
        />
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout active="stations" title="Station Detail">
      <div className="mx-auto max-w-7xl space-y-8">
        <Breadcrumbs
          items={[
            { label: "Citizen Dashboard", to: "/citizen/dashboard" },
            { label: "Station Finder", to: "/citizen/stations" },
            { label: station.name }
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <SurfaceCard className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
              Station Profile
            </p>
            <h1 className="mt-4 text-3xl font-bold text-[var(--slprrs-navy)]">{station.name}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {station.division} | {station.address}
            </p>
            <dl className="mt-6">
              <SummaryRow label="District" value={station.district} />
              <SummaryRow label="Province" value={station.province} />
              <SummaryRow label="Main Contact" value={station.phone} />
              <SummaryRow label="Citizen Distance" value={station.distance} />
            </dl>
            <div className="mt-6 flex flex-wrap gap-2">
              {station.services.map((service) => (
                <span
                  key={service}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"
                >
                  {service}
                </span>
              ))}
            </div>
          </SurfaceCard>

          <div className="space-y-6">
            <div className="rounded-[1.8rem] bg-[linear-gradient(145deg,rgba(0,43,91,0.14),rgba(200,148,26,0.16))] p-6">
              <div className="flex min-h-[20rem] items-center justify-center rounded-[1.5rem] bg-white/72">
                <div className="text-center">
                  <MaterialIcon className="text-5xl text-[var(--slprrs-navy)]" name="map" />
                  <p className="mt-4 text-sm text-slate-500">Map and routing preview</p>
                </div>
              </div>
            </div>
            <SurfaceCard className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                Recommended Actions
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className={primaryButtonClassName} to="/citizen/submit-report?step=2">
                  Use This Station
                </Link>
                <Link className={secondaryButtonClassName} to="/citizen/track-report">
                  Track Existing Report
                </Link>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}

export function CitizenProfilePage() {
  const [tab, setTab] = useQueryState("tab", "personal");
  const [notificationState, setNotificationState] = useState<NotificationSettings>({
    "Case status updates": true,
    "Evidence review requests": true,
    "Station notifications": false,
    "Security alerts": true
  });

  return (
    <CitizenLayout active="profile" title="Profile">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Citizen Identity"
          title="Profile & Security"
          body="Manage the citizen identity profile, password controls, and notification preferences."
        />

        <SurfaceCard className="p-6">
          <PageTabs
            onChange={setTab}
            tabs={[
              { value: "personal", label: "Personal Info" },
              { value: "security", label: "Security" },
              { value: "notifications", label: "Notifications" }
            ]}
            value={tab}
          />

          <div className="mt-6">
            {tab === "personal" ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="Full Name">
                  <input className={inputClassName} defaultValue={citizenUser.name} />
                </Field>
                <Field label="NIC">
                  <input className={inputClassName} defaultValue={citizenUser.nic} />
                </Field>
                <Field label="Email">
                  <input className={inputClassName} defaultValue={citizenUser.email} />
                </Field>
                <Field label="Phone">
                  <input className={inputClassName} defaultValue={citizenUser.phone} />
                </Field>
              </div>
            ) : null}

            {tab === "security" ? (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    Change Password
                  </p>
                  <div className="mt-5 space-y-4">
                    <Field label="Current Password">
                      <input className={inputClassName} type="password" />
                    </Field>
                    <Field label="New Password">
                      <input className={inputClassName} type="password" />
                    </Field>
                    <Field label="Confirm Password">
                      <input className={inputClassName} type="password" />
                    </Field>
                    <button className={primaryButtonClassName} type="button">
                      Update Password
                    </button>
                  </div>
                </SurfaceCard>
                <SurfaceCard className="bg-[var(--slprrs-surface-low)] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    Login History
                  </p>
                  <div className="mt-5 space-y-4">
                    {loginHistory.map((entry) => (
                      <div key={entry.time} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                        <p className="font-semibold text-[var(--slprrs-navy)]">{entry.device}</p>
                        <p className="mt-1 text-sm text-slate-500">{entry.location}</p>
                        <p className="mt-2 text-xs text-slate-400">{entry.time}</p>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>
              </div>
            ) : null}

            {tab === "notifications" ? (
              <div className="space-y-4">
                {notificationItems.map((item) => (
                  <label
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-[rgba(0,43,91,0.08)] bg-[var(--slprrs-surface-low)] px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold text-[var(--slprrs-navy)]">{item}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Receive secure delivery for this event type.
                      </p>
                    </div>
                    <button
                      className={clsx(
                        "relative h-8 w-14 rounded-full transition",
                        notificationState[item] ? "bg-[var(--slprrs-navy)]" : "bg-slate-300"
                      )}
                      onClick={(event) => {
                        event.preventDefault();
                        setNotificationState((current) => ({ ...current, [item]: !current[item] }));
                      }}
                      type="button"
                    >
                      <span
                        className={clsx(
                          "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                          notificationState[item] ? "left-7" : "left-1"
                        )}
                      />
                    </button>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </SurfaceCard>
      </div>
    </CitizenLayout>
  );
}

export function HelpFaqPage() {
  return (
    <CitizenLayout active="help" title="Help & FAQ">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeading
          eyebrow="Citizen Support"
          title="Help & Frequently Asked Questions"
          body="Reference the most common reporting questions and review the support paths for urgent escalation."
        />

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <AccordionList items={faqItems} />

          <div className="space-y-6">
            <SurfaceCard className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                Support Channels
              </p>
              <div className="mt-5 space-y-4">
                {[
                  ["Emergency", "119", "Immediate emergency hotline"],
                  ["Citizen Desk", "+94 11 242 1111", "General digital portal inquiries"],
                  ["Email", "support@sl-prrs.gov.lk", "Portal account and evidence support"]
                ].map(([title, value, detail]) => (
                  <div key={title} className="rounded-2xl bg-[var(--slprrs-surface-low)] px-4 py-4">
                    <p className="font-semibold text-[var(--slprrs-navy)]">{title}</p>
                    <p className="mt-2 text-lg font-bold text-[var(--slprrs-gold)]">{value}</p>
                    <p className="mt-2 text-sm text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--slprrs-gold)]">
                Need to report now?
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Start the guided incident flow directly from the citizen workspace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className={primaryButtonClassName} to="/citizen/submit-report">
                  Submit Report
                </Link>
                <Link className={secondaryButtonClassName} to="/citizen/stations">
                  Find Station
                </Link>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
