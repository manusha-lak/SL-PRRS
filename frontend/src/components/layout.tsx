import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { alerts, citizenUser, officerUser } from "../data/mockData";
import {
  AppLogo,
  MaterialIcon,
  ghostButtonClassName,
  primaryButtonClassName,
  secondaryButtonClassName
} from "./ui";
import { useState, type ReactNode } from "react";

type PublicNavKey = "home" | "submit" | "track" | "stations";

type PortalNavItem = {
  label: string;
  to: string;
  icon: string;
  key: string;
};

const citizenNav: PortalNavItem[] = [
  { key: "dashboard", label: "Citizen Dashboard", to: "/citizen/dashboard", icon: "dashboard" },
  { key: "reports", label: "My Reports", to: "/citizen/reports", icon: "assignment" },
  { key: "submit", label: "Submit Report", to: "/citizen/submit-report", icon: "add_circle" },
  { key: "track", label: "Track Report", to: "/citizen/track-report", icon: "track_changes" },
  { key: "evidence", label: "Evidence", to: "/citizen/evidence", icon: "description" },
  { key: "stations", label: "Station Finder", to: "/citizen/stations", icon: "location_on" },
  { key: "profile", label: "Profile", to: "/citizen/profile", icon: "account_circle" },
  { key: "help", label: "Help & FAQ", to: "/citizen/help", icon: "help" }
];

const officerNav: PortalNavItem[] = [
  { key: "dashboard", label: "Officer Dashboard", to: "/officer/dashboard", icon: "dashboard" },
  { key: "alerts", label: "Alerts Inbox", to: "/officer/alerts", icon: "notifications" },
  { key: "cases", label: "Case Management", to: "/officer/cases", icon: "folder_open" },
  { key: "profile", label: "Officer Profile", to: "/officer/profile", icon: "badge" }
];

function navLinkClasses(active: boolean) {
  return clsx(
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
    active
      ? "nav-active"
      : "text-slate-200 hover:bg-white/6 hover:text-white"
  );
}

function headerLinkClasses(active: boolean) {
  return clsx(
    "pb-1 text-sm font-medium transition",
    active ? "border-b-2 border-[var(--slprrs-gold)] text-[var(--slprrs-gold)]" : "text-slate-200 hover:text-white"
  );
}

export function PublicShell({
  active,
  children
}: {
  active?: PublicNavKey;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <GovTopBanner />
      <PublicHeader active={active} />
      {children}
      <PublicFooter />
    </div>
  );
}

export function GovTopBanner() {
  return (
    <div className="relative overflow-hidden bg-[var(--slprrs-navy)] px-6 py-2 text-[10px] uppercase tracking-[0.2em] text-white">
      <span>Official Digital Service of the Sri Lanka Police | Gov.lk</span>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-6 text-white/6">
        <MaterialIcon className="text-[90px]" name="shield" />
      </div>
    </div>
  );
}

export function PublicHeader({ active }: { active?: PublicNavKey }) {
  const [dropdown, setDropdown] = useState<"notifications" | "account" | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[rgba(200,148,26,0.25)] bg-[var(--slprrs-navy)] px-6 py-3 text-white shadow-lg shadow-[rgba(0,43,91,0.18)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <AppLogo />
        <nav className="hidden items-center gap-8 md:flex">
          <Link className={headerLinkClasses(active === "home")} to="/landing">
            Home
          </Link>
          <Link className={headerLinkClasses(active === "submit")} to="/citizen/submit-report">
            Submit Report
          </Link>
          <Link className={headerLinkClasses(active === "track")} to="/citizen/track-report">
            Track Report
          </Link>
          <Link className={headerLinkClasses(active === "stations")} to="/citizen/stations">
            Station Finder
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <HeaderIconButton active={dropdown === "notifications"} icon="notifications" onClick={() => setDropdown(dropdown === "notifications" ? null : "notifications")} />
          <HeaderIconButton active={dropdown === "account"} icon="account_circle" onClick={() => setDropdown(dropdown === "account" ? null : "account")} />
        </div>
      </div>
      {dropdown ? (
        <HeaderDropdown kind={dropdown} onClose={() => setDropdown(null)} />
      ) : null}
    </header>
  );
}

function HeaderDropdown({
  kind,
  onClose
}: {
  kind: "notifications" | "account";
  onClose: () => void;
}) {
  return (
    <div className="absolute right-6 top-full z-50 mt-3 w-[22rem] rounded-2xl bg-white shadow-2xl shadow-[rgba(0,43,91,0.18)]">
      {kind === "notifications" ? (
        <>
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--slprrs-gold)]">
              Notifications
            </p>
            <h3 className="mt-2 text-lg font-bold text-[var(--slprrs-navy)]">Recent Alerts</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div key={alert.ref} className="flex gap-3 px-5 py-4">
                <span className={clsx("mt-1 h-2.5 w-2.5 rounded-full", alert.unread ? "bg-[var(--slprrs-gold)]" : "bg-slate-300")} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{alert.ref}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {alert.type} · {alert.citizen}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">{alert.time}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="p-3">
          <Link className={ghostButtonClassName + " flex w-full justify-start"} onClick={onClose} to="/citizen/profile">
            Profile
          </Link>
          <Link className={ghostButtonClassName + " flex w-full justify-start"} onClick={onClose} to="/citizen/help">
            Help & FAQ
          </Link>
          <Link className={ghostButtonClassName + " flex w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"} onClick={onClose} to="/citizen/login">
            Logout
          </Link>
        </div>
      )}
    </div>
  );
}

function HeaderIconButton({
  icon,
  active,
  onClick
}: {
  icon: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={clsx(
        "rounded-full p-2 transition",
        active ? "bg-white/10 text-[var(--slprrs-gold)]" : "text-white hover:bg-white/6"
      )}
      onClick={onClick}
      type="button"
    >
      <MaterialIcon name={icon} />
    </button>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-[rgba(0,43,91,0.08)] bg-[var(--slprrs-navy)] px-6 py-8 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <AppLogo compact />
          <p className="mt-5 max-w-sm text-[11px] uppercase tracking-[0.25em] text-slate-400">
            Official platform of the Sri Lanka Police for secure digital reporting and case tracking.
          </p>
        </div>
        <div className="grid gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-300 md:text-right">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Accessibility</span>
        </div>
      </div>
    </footer>
  );
}

export function CitizenLayout({
  active,
  children,
  title
}: {
  active: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <PortalFrame
      active={active}
      navItems={citizenNav}
      title={title}
      sidebarProfile={
        <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--slprrs-gold)] bg-[rgba(255,255,255,0.08)] text-white">
              <MaterialIcon filled name="account_circle" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{citizenUser.name}</p>
              <p className="text-xs text-slate-400">Citizen ID: 88241</p>
            </div>
          </div>
        </div>
      }
      footerAction={
        <button className="w-full rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-100">
          Emergency Call 119
        </button>
      }
    >
      {children}
    </PortalFrame>
  );
}

export function OfficerLayout({
  active,
  children,
  title
}: {
  active: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <PortalFrame
      active={active}
      navItems={officerNav}
      title={title}
      lightSidebar
      sidebarProfile={
        <div className="rounded-2xl bg-[rgba(0,43,91,0.04)] p-4">
          <p className="text-sm font-semibold text-[var(--slprrs-navy)]">{officerUser.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {officerUser.rank} · {officerUser.badge}
          </p>
        </div>
      }
      footerAction={
        <button className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          Emergency Call 119
        </button>
      }
    >
      {children}
    </PortalFrame>
  );
}

function PortalFrame({
  active,
  navItems,
  title,
  children,
  sidebarProfile,
  footerAction,
  lightSidebar = false
}: {
  active: string;
  navItems: PortalNavItem[];
  title: string;
  children: ReactNode;
  sidebarProfile: ReactNode;
  footerAction: ReactNode;
  lightSidebar?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<"notifications" | "account" | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarClasses = lightSidebar
    ? "bg-[rgba(255,255,255,0.92)] text-[var(--slprrs-navy)] border-r border-[rgba(0,43,91,0.08)]"
    : "bg-[var(--slprrs-navy)] text-white";

  return (
    <div className="flex min-h-screen bg-[var(--slprrs-surface)]">
      {mobileOpen ? (
        <div className="fade-in fixed inset-0 z-[70] bg-black/45 md:hidden" onClick={() => setMobileOpen(false)} />
      ) : null}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-[80] flex w-72 flex-col px-4 py-6 shadow-2xl transition md:static md:translate-x-0",
          sidebarClasses,
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-2">
          {lightSidebar ? (
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--slprrs-navy)]">
                <MaterialIcon className="text-[var(--slprrs-gold)]" filled name="security" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-[0.08em] text-[var(--slprrs-navy)]">SL-PRRS</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Police Operations</p>
              </div>
            </div>
          ) : (
            <AppLogo />
          )}
          <div className="mt-8">{sidebarProfile}</div>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.key}
              className={navLinkClasses(active === item.key)}
              onClick={() => setMobileOpen(false)}
              to={item.to}
            >
              <MaterialIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={clsx("mt-6 border-t pt-4", lightSidebar ? "border-slate-200" : "border-white/10")}>
          {footerAction}
          <button
            className={clsx(
              "mt-3 flex items-center gap-2 px-4 py-3 text-sm",
              lightSidebar ? "text-slate-500" : "text-slate-400"
            )}
            onClick={() => navigate(lightSidebar ? "/officer/login" : "/citizen/login")}
            type="button"
          >
            <MaterialIcon name="logout" />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-h-screen flex-1">
        <header className="sticky top-0 z-40 border-b-2 border-[rgba(200,148,26,0.28)] bg-[var(--slprrs-navy)] px-5 py-4 text-white shadow-lg shadow-[rgba(0,43,91,0.16)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-full p-2 hover:bg-white/6 md:hidden" onClick={() => setMobileOpen(true)} type="button">
                <MaterialIcon name="menu" />
              </button>
              <h1 className="text-xl font-bold uppercase tracking-[0.12em]">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <MaterialIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" name="search" />
                <input
                  className="rounded-full border border-white/10 bg-white/6 py-2 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-300"
                  placeholder={lightSidebar ? "Search case..." : "Search report ID..."}
                  type="text"
                />
              </div>
              <HeaderIconButton active={dropdown === "notifications"} icon="notifications" onClick={() => setDropdown(dropdown === "notifications" ? null : "notifications")} />
              <HeaderIconButton active={dropdown === "account"} icon="account_circle" onClick={() => setDropdown(dropdown === "account" ? null : "account")} />
            </div>
          </div>
          {dropdown ? (
            <div className="absolute right-5 top-full z-50 mt-3 w-[22rem] rounded-2xl bg-white shadow-2xl shadow-[rgba(0,43,91,0.18)]">
              {dropdown === "notifications" ? (
                <>
                  <div className="border-b border-slate-100 px-5 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--slprrs-gold)]">
                      Alert Feed
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-[var(--slprrs-navy)]">Latest Updates</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {alerts.map((alert) => (
                      <div key={alert.ref} className="flex gap-3 px-5 py-4">
                        <span className={clsx("mt-1 h-2.5 w-2.5 rounded-full", alert.unread ? "bg-[var(--slprrs-gold)]" : "bg-slate-300")} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{alert.ref}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {alert.type} · {alert.citizen}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400">{alert.time}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-3">
                  <button
                    className={ghostButtonClassName + " flex w-full justify-start"}
                    onClick={() => navigate(lightSidebar ? "/officer/profile" : "/citizen/profile")}
                    type="button"
                  >
                    Profile
                  </button>
                  <button
                    className={ghostButtonClassName + " flex w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"}
                    onClick={() => navigate(lightSidebar ? "/officer/login" : "/citizen/login")}
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>

        {!lightSidebar ? (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/96 px-3 py-2 shadow-[0_-10px_24px_rgba(0,43,91,0.08)] md:hidden">
            <div className="flex items-center justify-between">
              {citizenNav.slice(0, 5).map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link key={item.key} className="flex min-w-[3.75rem] flex-col items-center gap-1 px-2 py-2 text-[11px]" to={item.to}>
                    <MaterialIcon className={isActive ? "text-[var(--slprrs-gold)]" : "text-slate-400"} filled={isActive} name={item.icon} />
                    <span className={isActive ? "font-bold text-[var(--slprrs-navy)]" : "text-slate-500"}>
                      {item.label.split(" ")[0]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--slprrs-navy-deep)] text-white">
      <GovTopBanner />
      <div className="relative flex min-h-[calc(100vh-2rem)] items-center justify-center px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,148,26,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_22%)]" />
        <div className="relative z-10 w-full max-w-[28rem] rounded-[1.75rem] bg-white p-8 text-[var(--slprrs-text)] shadow-[0_28px_70px_rgba(0,0,0,0.35)]">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--slprrs-surface-soft)] text-[var(--slprrs-navy)]">
              <MaterialIcon className="text-4xl" filled name="shield_person" />
            </div>
            <h1 className="signature-underline mt-6 inline-block text-3xl font-bold text-[var(--slprrs-navy)]">
              {title}
            </h1>
            <p className="mt-6 text-sm leading-7 text-slate-500">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ActionButtonLink({
  to,
  children,
  secondary
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={secondary ? secondaryButtonClassName : primaryButtonClassName} to={to}>
      {children}
    </Link>
  );
}
