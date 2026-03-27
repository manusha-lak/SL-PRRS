import { Link } from "react-router-dom";
import { GovTopBanner, PublicShell } from "../components/layout";
import {
  AppLogo,
  KpiCard,
  MaterialIcon,
  SectionHeading,
  SurfaceCard,
  primaryButtonClassName,
  secondaryButtonClassName
} from "../components/ui";

export function SplashPage() {
  return (
    <div className="min-h-screen bg-[var(--slprrs-navy-deep)] text-white">
      <GovTopBanner />
      <main className="relative flex min-h-[calc(100vh-2rem)] items-center justify-center overflow-hidden px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,148,26,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_24%)]" />
        <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-white/5 md:block" />
        <div className="relative z-10 w-full max-w-3xl text-center">
          <div className="mx-auto flex w-fit items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <AppLogo compact />
          </div>
          <h1 className="mt-8 text-5xl font-bold tracking-tight text-white md:text-6xl">SL-PRRS</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
            Sri Lanka Police Rapid Report System. Secure digital reporting, evidence submission,
            case tracking, and station-based officer response.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link className={primaryButtonClassName + " min-w-[13rem]"} to="/citizen/login">
              <MaterialIcon name="person" />
              Citizen Login
            </Link>
            <Link className={secondaryButtonClassName + " min-w-[13rem] border-white text-white hover:bg-white/8"} to="/officer/login">
              <MaterialIcon name="shield" />
              Officer Login
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-300">
            <Link to="/citizen/register">Register as Citizen</Link>
            <Link to="/landing">Public Landing</Link>
            <Link to="/citizen/track-report">Track a Report</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export function LandingPage() {
  return (
    <PublicShell active="home">
      <section className="relative overflow-hidden bg-[linear-gradient(120deg,var(--slprrs-navy-deep),rgba(0,43,91,0.94),rgba(0,43,91,0.88))] px-6 py-20 text-white md:px-10 lg:px-16">
        <div className="absolute inset-y-0 left-0 w-2 bg-[var(--slprrs-gold)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,148,26,0.18),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-sm bg-[var(--slprrs-gold)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--slprrs-navy-deep)]">
              Secure Institutional Portal
            </p>
            <h1 className="mt-8 text-5xl font-bold leading-[1.04] tracking-tight md:text-7xl">
              Report Incidents.
              <br />
              <span className="text-[var(--slprrs-gold)]">Track Progress.</span>
              <br />
              Stay Safe.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-slate-300">
              Sri Lanka’s official digital incident reporting platform. Submit reports securely,
              upload evidence directly to investigators, and monitor case progress from a single
              portal.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link className={primaryButtonClassName} to="/citizen/submit-report">
                Submit a Report
              </Link>
              <Link className={secondaryButtonClassName + " border-white text-white hover:bg-white/8"} to="/citizen/track-report">
                Track My Report
              </Link>
            </div>
          </div>
          <div className="glass-panel rounded-[2rem] p-8 text-[var(--slprrs-text)] shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="grid grid-cols-2 gap-4">
              <KpiCard icon="verified_user" label="Secure & Encrypted" value="256-bit" />
              <KpiCard icon="translate" label="Trilingual Support" value="3" />
              <KpiCard icon="schedule" label="Availability" value="24/7" />
              <KpiCard icon="distance" label="Direct Routing" value="Live" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16">
        <SectionHeading
          title="Process Integrity"
          body="Five steps to ensure each incident is documented, routed, investigated, and tracked with institutional clarity."
        />
        <div className="mt-14 grid gap-8 md:grid-cols-5">
          {[
            ["01", "Register", "Create a secure citizen identity and access the reporting portal."],
            ["02", "Find Station", "Resolve the nearest station or choose the correct police division."],
            ["03", "Upload Evidence", "Attach images, documents, or videos to support the report."],
            ["04", "Submit Report", "Finalize the case and receive a secure reference code."],
            ["05", "Track Progress", "View timeline updates and communicate with the assigned station."]
          ].map(([step, title, description]) => (
            <div key={step} className="relative rounded-2xl bg-white p-6 shadow-sm">
              <span className="absolute right-5 top-4 text-6xl font-black text-[rgba(0,43,91,0.05)]">{step}</span>
              <h3 className="relative text-sm font-bold uppercase tracking-[0.18em] text-[var(--slprrs-navy)]">
                {title}
              </h3>
              <p className="relative mt-4 text-sm leading-7 text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[rgba(255,255,255,0.7)] px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            title="Police Digital Services"
            body="Centralized access to the public services most commonly needed by citizens and assigned officers."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Incident Reporting", "flag", "File a new formal complaint or emergency incident."],
              ["Evidence Upload", "upload_file", "Attach secure files to support active cases."],
              ["Station Finder", "location_on", "Locate the nearest station and view services."],
              ["Case Tracking", "timeline", "Monitor current case status from intake to closure."],
              ["Officer Portal", "admin_panel_settings", "Secure operations dashboard for station staff."],
              ["Reference Lookup", "fingerprint", "Retrieve case details using the official receipt code."]
            ].map(([title, icon, description]) => (
              <SurfaceCard key={title} className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(0,43,91,0.06)]">
                  <MaterialIcon className="text-[var(--slprrs-navy)]" name={icon} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-[var(--slprrs-navy)]">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-500">{description}</p>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

export function SessionExpiredPage() {
  return (
    <StateShell
      eyebrow="Session Expired"
      title="Your secure session has ended"
      body="Authenticate again to continue reporting incidents, reviewing evidence, or accessing officer tools."
      primaryTo="/citizen/login"
      primaryLabel="Citizen Login"
      secondaryTo="/officer/login"
      secondaryLabel="Officer Login"
    />
  );
}

export function ServerErrorPage() {
  return (
    <StateShell
      eyebrow="500"
      title="Service temporarily unavailable"
      body="This simulated state represents a production incident response screen. Return to the portal and try again."
      primaryTo="/"
      primaryLabel="Return to Splash"
      secondaryTo="/landing"
      secondaryLabel="Go to Landing"
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--slprrs-navy-deep)] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-[var(--slprrs-gold)]" />
        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--slprrs-gold)]">
          SL-PRRS
        </p>
        <h1 className="mt-4 text-3xl font-bold">Loading Secure Workspace</h1>
        <p className="mt-4 text-sm text-slate-300">Preparing citizen and officer portal services.</p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <StateShell
      eyebrow="404"
      title="Page not found"
      body="The route you requested is not part of the current SL-PRRS frontend map."
      primaryTo="/"
      primaryLabel="Return to Splash"
      secondaryTo="/landing"
      secondaryLabel="Public Landing"
    />
  );
}

function StateShell({
  eyebrow,
  title,
  body,
  primaryTo,
  primaryLabel,
  secondaryTo,
  secondaryLabel
}: {
  eyebrow: string;
  title: string;
  body: string;
  primaryTo: string;
  primaryLabel: string;
  secondaryTo: string;
  secondaryLabel: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="surface-card w-full max-w-2xl rounded-[2rem] p-10 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--slprrs-gold)]">
          {eyebrow}
        </p>
        <h1 className="mt-6 text-4xl font-bold text-[var(--slprrs-navy)]">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className={primaryButtonClassName} to={primaryTo}>
            {primaryLabel}
          </Link>
          <Link className={secondaryButtonClassName} to={secondaryTo}>
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
