
import { nflTeamColors } from '@/lib/nfl-team-colors';
import { cn } from '@/lib/utils';

type TeamHelmetProps = {
  team?: string;  // ← Make it optional
  className?: string;
};

export function TeamHelmet({ team = 'DEFAULT', className }: TeamHelmetProps) {
  const colors = nflTeamColors[team] || nflTeamColors['DEFAULT'];
  const initials = team ? team.substring(0, 3).toUpperCase() : '???';

  return (
    <div className={cn("flex items-center justify-center rounded-full", className)} title={team || 'Unknown Team'}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M39.5 24C39.5 32.5563 32.5563 39.5 24 39.5C15.4437 39.5 8.5 32.5563 8.5 24C8.5 15.4437 15.4437 8.5 24 8.5C32.5563 8.5 39.5 15.4437 39.5 24Z"
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth="2"
        />
        <path
          d="M24 8.5C24 8.5 28 16 28 24C28 32 24 39.5 24 39.5"
          stroke={colors.secondary}
          strokeWidth="2"
        />
        <rect x="2" y="23" width="10" height="6" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
        <text
          x="24"
          y="28"
          fill={colors.secondary === '#000000' && (colors.primary === '#000000' || colors.primary === '#0B162A' || colors.primary === '#101820') ? '#FFFFFF' : colors.secondary}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}
