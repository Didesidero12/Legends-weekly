
'use client';
import Image from 'next/image';
import { Player } from '@/lib/types';
import { cn, formatPlayerName } from '@/lib/utils';
import { TeamHelmet } from './team-helmet';

interface PlayerInfoProps {
    player: Player;
    onClick: () => void;
    showImage?: boolean;
    showPosition?: boolean;
    layout?: 'left' | 'right';
    secondaryInfo?: React.ReactNode;
    abbreviateName?: boolean;
    overrideName?: string;  // ← ADD THIS LINE
}

export function PlayerInfo({ 
  player, 
  onClick, 
  showImage = true, 
  showPosition = true, 
  layout = 'left', 
  secondaryInfo, 
  abbreviateName = false,
  overrideName,  // ← ADD THIS
}: PlayerInfoProps) {
    const layoutClasses = layout === 'right' ? 'flex-row-reverse text-right' : 'flex-row text-left';
    
    const displayName = overrideName ?? (abbreviateName ? formatPlayerName(player.name) : player.name);

    return (
        <div className={cn("flex items-center gap-3", layoutClasses)}>
            {showImage && (
                <img 
  src={player.headshotUrl} 
  alt={player.name} 
  className="w-10 h-10 rounded-full object-cover"
  onError={(e) => {
    e.currentTarget.src = 'https://picsum.photos/seed/fallback/64/64';
  }}
/>
            )}
            <div className={cn(layout === 'right' ? 'items-end' : 'items-start', "flex flex-col")}>
                 <div className={cn("flex items-center gap-2", layout === 'right' && 'flex-row-reverse')}>
                    <button onClick={onClick} className={cn("font-medium hover:underline", layout === 'left' ? 'text-left' : 'text-right')}>{displayName}</button>
                    <TeamHelmet team={player.nflTeam} className="w-4 h-4" />
                    {showPosition && <span className="text-xs text-muted-foreground">{player.position}</span>}
                </div>
                {secondaryInfo}
            </div>
        </div>
    );
}
