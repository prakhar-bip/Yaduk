import { YadukLogo } from "./YadukLogo";

export function Mascot({ className = "" }: { className?: string }) {
  return <YadukLogo className={className} />;
}

export function SparkLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 40" className={className} aria-hidden="true">
      <path
        d="M4 30 C 60 4, 96 36, 150 18 S 250 4, 316 24"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="q-draw"
      />
      <circle cx="150" cy="18" r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
    </svg>
  );
}
