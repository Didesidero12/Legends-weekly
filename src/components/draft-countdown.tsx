
'use client';

import { useState, useEffect } from 'react';

export function DraftCountdown({ targetDate, onComplete }: { targetDate: Date; onComplete: () => void }) {
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        onComplete();
      }
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    const key = interval as keyof typeof timeLeft;
    if (!timeLeft[key] && key !== 'seconds' && key !== 'minutes') { // Always show minutes and seconds
      // Don't show days or hours if they are 0
      if((key === 'days' && timeLeft.days > 0) || (key === 'hours' && (timeLeft.days > 0 || timeLeft.hours > 0))) {
         timerComponents.push(
            <div key={key} className="flex flex-col items-center justify-center bg-card p-4 rounded-lg min-w-[100px]">
                <span className="text-4xl md:text-6xl font-bold tabular-nums">{String(timeLeft[key]).padStart(2, '0')}</span>
                <span className="text-sm md:text-base text-muted-foreground uppercase">{key}</span>
            </div>
        );
      } else if (key !== 'days' && key !== 'hours') {
         timerComponents.push(
            <div key={key} className="flex flex-col items-center justify-center bg-card p-4 rounded-lg min-w-[100px]">
                <span className="text-4xl md:text-6xl font-bold tabular-nums">{String(timeLeft[key]).padStart(2, '0')}</span>
                <span className="text-sm md:text-base text-muted-foreground uppercase">{key}</span>
            </div>
        );
      }

    } else {
        timerComponents.push(
            <div key={key} className="flex flex-col items-center justify-center bg-card p-4 rounded-lg min-w-[100px]">
                <span className="text-4xl md:text-6xl font-bold tabular-nums">{String(timeLeft[key]).padStart(2, '0')}</span>
                <span className="text-sm md:text-base text-muted-foreground uppercase">{key}</span>
            </div>
        );
    }
  });

  return (
    <div className="flex gap-4">
      {timerComponents.length ? timerComponents : <span>Draft is starting!</span>}
    </div>
  );
}
