import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";

type ToastTone = "success" | "error" | "info" | "warning";
type ToastItem = { id: number; tone: ToastTone; title: string; message: string };

const statusStyles: Record<string, string> = {
  Pending: "bg-[var(--slprrs-warning-bg)] text-[var(--slprrs-warning-text)]",
  "Under Investigation": "bg-[var(--slprrs-info-bg)] text-[var(--slprrs-info-text)]",
  "Awaiting Review": "bg-purple-100 text-purple-700",
  Resolved: "bg-[var(--slprrs-success-bg)] text-[var(--slprrs-success-text)]",
  Closed: "bg-slate-100 text-slate-600",
  Active: "bg-[var(--slprrs-info-bg)] text-[var(--slprrs-info-text)]"
};

const toastToneStyles: Record<ToastTone, { eyebrow: string; bar: string }> = {
  success: { eyebrow: "text-[var(--slprrs-success-text)]", bar: "bg-[var(--slprrs-success-text)]" },
  error: { eyebrow: "text-[var(--slprrs-danger-text)]", bar: "bg-[var(--slprrs-danger-text)]" },
  info: { eyebrow: "text-[var(--slprrs-info-text)]", bar: "bg-[var(--slprrs-info-text)]" },
  warning: { eyebrow: "text-[var(--slprrs-warning-text)]", bar: "bg-[var(--slprrs-warning-text)]" }
};

const ToastContext = createContext<{
  push: (tone: ToastTone, title: string, message: string) => void;
} | null>(null);

export const inputClassName =
  "w-full rounded-lg border border-[rgba(0,43,91,0.16)] bg-[var(--slprrs-surface-low)] px-4 py-3 text-sm text-[var(--slprrs-text)] outline-none transition focus:border-[var(--slprrs-gold)] focus:ring-4 focus:ring-[rgba(200,148,26,0.12)]";

export const labelClassName =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500";

export const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--slprrs-gold)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-105 active:scale-[0.99]";

export const secondaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--slprrs-navy)] px-5 py-3 text-sm font-bold text-[var(--slprrs-navy)] transition hover:bg-[rgba(0,43,91,0.04)]";

export const ghostButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[var(--slprrs-navy)]";

export function MaterialIcon({ name, filled = false, className = "" }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span
      className={clsx("material-symbols-outlined", className)}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
        <MaterialIcon className="text-[var(--slprrs-gold)]" filled name="security" />
      </div>
      <div className={compact ? "hidden sm:block" : ""}>
        <p className="text-lg font-bold uppercase tracking-[0.12em] text-white">SL-PRRS</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-300">
          Rapid Report System
        </p>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]",
        statusStyles[status] || "bg-slate-100 text-slate-600"
      )}
    >
      {status}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--slprrs-gold)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="signature-underline mt-3 text-3xl font-bold tracking-tight text-[var(--slprrs-navy)] md:text-4xl">
        {title}
      </h1>
      {body ? <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-500">{body}</p> : null}
    </div>
  );
}

export function SurfaceCard({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={clsx("surface-card rounded-2xl", className)}>{children}</section>;
}

export function KpiCard({
  label,
  value,
  icon,
  status
}: {
  label: string;
  value: string | number;
  icon: string;
  status?: string;
}) {
  return (
    <SurfaceCard className="border-t-4 border-t-[var(--slprrs-navy)] p-6">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-slate-100 p-3">
          <MaterialIcon className="text-[var(--slprrs-navy)]" name={icon} />
        </div>
        {status ? <StatusBadge status={status} /> : null}
      </div>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[var(--slprrs-gold)]">{value}</p>
    </SurfaceCard>
  );
}

export function PageTabs({
  tabs,
  value,
  onChange
}: {
  tabs: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={clsx(
            "rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition",
            value === tab.value
              ? "bg-[var(--slprrs-navy)] text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Breadcrumbs({
  items
}: {
  items: { label: string; to?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.to ? (
            <Link className="transition hover:text-[var(--slprrs-navy)]" to={item.to}>
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-[var(--slprrs-navy)]">{item.label}</span>
          )}
          {index < items.length - 1 ? <MaterialIcon className="text-sm" name="chevron_right" /> : null}
        </div>
      ))}
    </nav>
  );
}

export function ProgressSteps({
  steps,
  current
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = stepNumber === current;
        const complete = stepNumber < current;

        return (
          <div
            key={step}
            className={clsx(
              "rounded-2xl border px-4 py-4 transition",
              active
                ? "border-[var(--slprrs-gold)] bg-[rgba(200,148,26,0.08)]"
                : "border-[rgba(0,43,91,0.08)] bg-white"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold",
                  complete
                    ? "bg-[var(--slprrs-navy)] text-white"
                    : active
                      ? "bg-[var(--slprrs-gold)] text-white"
                      : "bg-slate-100 text-slate-500"
                )}
              >
                {complete ? <MaterialIcon className="text-base" filled name="check" /> : stepNumber}
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Step {stepNumber}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--slprrs-navy)]">{step}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action
}: {
  icon: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <SurfaceCard className="border-dashed border-slate-300 bg-[rgba(255,255,255,0.94)] p-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-[var(--slprrs-navy)] shadow-sm">
        <MaterialIcon className="text-4xl" name={icon} />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-[var(--slprrs-navy)]">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">{body}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </SurfaceCard>
  );
}

export function AccordionList({
  items
}: {
  items: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const open = index === openIndex;

        return (
          <div key={item.question} className="overflow-hidden rounded-2xl border border-[rgba(0,43,91,0.08)] bg-white">
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpenIndex(open ? -1 : index)}
              type="button"
            >
              <span className="font-semibold text-[var(--slprrs-navy)]">{item.question}</span>
              <MaterialIcon
                className={clsx("transition", open ? "rotate-180 text-[var(--slprrs-gold)]" : "text-slate-400")}
                name="expand_more"
              />
            </button>
            {open ? <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-500">{item.answer}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

export function ReferenceCodeCard({ code }: { code: string }) {
  return (
    <div className="rounded-2xl border border-[rgba(0,43,91,0.1)] bg-[var(--slprrs-navy)] p-6 text-white shadow-xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--slprrs-gold)]">
        Reference Code
      </p>
      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-white/8 px-4 py-4">
        <code className="text-lg font-bold tracking-[0.14em]">{code}</code>
        <button className={secondaryButtonClassName} type="button">
          <MaterialIcon name="content_copy" /> Copy
        </button>
      </div>
    </div>
  );
}

export function Timeline({
  items
}: {
  items: { label: string; time: string; state: string }[];
}) {
  return (
    <div className="relative ml-3 border-l-2 border-slate-200 pl-8">
      {items.map((item, index) => (
        <div key={item.label} className={clsx(index === 0 ? "pt-0" : "pt-8", "relative pb-2")}>
          <span
            className={clsx(
              "absolute -left-[2.15rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white",
              item.state === "Completed"
                ? "bg-[var(--slprrs-success-text)]"
                : item.state === "Current"
                  ? "bg-[var(--slprrs-gold)]"
                  : "bg-slate-300"
            )}
          />
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <h4 className="font-semibold text-[var(--slprrs-navy)]">{item.label}</h4>
              <p className="mt-1 text-sm text-slate-500">{item.state}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
              {item.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const api = useMemo(
    () => ({
      push: (tone: ToastTone, title: string, message: string) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setToasts((current) => [...current, { id, tone, title, message }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 4000);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[rgba(0,43,91,0.18)]">
            <div className="flex items-start justify-between gap-3 px-4 py-4">
              <div>
                <p className={clsx("text-[11px] font-bold uppercase tracking-[0.25em]", toastToneStyles[toast.tone].eyebrow)}>
                  {toast.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">{toast.message}</p>
              </div>
              <button
                className="text-slate-400 transition hover:text-slate-700"
                onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                type="button"
              >
                <MaterialIcon name="close" />
              </button>
            </div>
            <div className={clsx("toast-progress h-1 origin-left", toastToneStyles[toast.tone].bar)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return value;
}

export function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fade-in fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4 py-6 md:px-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="slide-up max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[1.25rem] bg-white shadow-[0_28px_60px_rgba(0,43,91,0.24)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h3 className="text-2xl font-bold text-[var(--slprrs-navy)]">{title}</h3>
          <button className="rounded-full bg-slate-100 p-2 text-slate-500" onClick={onClose} type="button">
            <MaterialIcon name="close" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
