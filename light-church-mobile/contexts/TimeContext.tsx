/**
 * TimeContext - Global timer for real-time updates
 * Optimizes performance by avoiding re-renders of parent components
 * Only components that consume this context will re-render every minute
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimeContextValue {
  currentTime: Date;
}

const TimeContext = createContext<TimeContextValue | undefined>(undefined);

export function TimeProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every 60 seconds for countdown timers
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <TimeContext.Provider value={{ currentTime }}>
      {children}
    </TimeContext.Provider>
  );
}

export function useCurrentTime() {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useCurrentTime must be used within a TimeProvider');
  }
  return context.currentTime;
}
