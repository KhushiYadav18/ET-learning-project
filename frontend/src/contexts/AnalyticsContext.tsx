import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { trackPageView, trackClick, trackVideoInteraction, trackQuizAttempt } from '../services/analytics';

interface AnalyticsContextType {
  trackPageView: (url: string, title?: string) => void;
  trackClick: (elementId: string, elementText?: string, coordinates?: { x: number; y: number }) => void;
  trackVideoInteraction: (moduleId: string, videoUrl: string, actionType: string, videoTime?: number, duration?: number) => void;
  trackQuizAttempt: (moduleId: string, data: any) => void;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();
  const sessionId = useRef(uuidv4());
  const pageStartTime = useRef(Date.now());

  // Track page views automatically
  useEffect(() => {
    const currentTime = Date.now();
    const timeOnPage = Math.round((currentTime - pageStartTime.current) / 1000);

    // Track previous page view with time spent
    if (pageStartTime.current > 0) {
      trackPageView(
        location.pathname + location.search,
        document.title,
        timeOnPage
      );
    }

    // Reset timer for new page
    pageStartTime.current = currentTime;

    // Track new page view
    trackPageView(
      location.pathname + location.search,
      document.title
    );
  }, [location]);

  // Track clicks globally
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementId = target.id || target.getAttribute('data-analytics-id');
      const elementText = target.textContent?.trim().substring(0, 100);
      
      if (elementId || elementText) {
        trackClick(
          elementId || 'unknown',
          elementText,
          { x: event.clientX, y: event.clientY }
        );
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Track video interactions
  const handleVideoInteraction = (
    moduleId: string,
    videoUrl: string,
    actionType: string,
    videoTime?: number,
    duration?: number
  ) => {
    trackVideoInteraction(moduleId, videoUrl, actionType, videoTime, duration);
  };

  // Track quiz attempts
  const handleQuizAttempt = (moduleId: string, data: any) => {
    trackQuizAttempt(moduleId, data);
  };

  const value: AnalyticsContextType = {
    trackPageView: (url: string, title?: string) => trackPageView(url, title),
    trackClick: (elementId: string, elementText?: string, coordinates?: { x: number; y: number }) => 
      trackClick(elementId, elementText, coordinates),
    trackVideoInteraction: handleVideoInteraction,
    trackQuizAttempt: handleQuizAttempt,
    sessionId: sessionId.current,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
