export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-fg">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M5 18V12M10 18V8M15 18v-4M20 18V5" />
        </svg>
      </span>
      <span className="text-lg">Tally</span>
    </span>
  );
}
