import axios from 'axios';
import { getAuthToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Analytics tracking functions
export const trackPageView = async (
  pageUrl: string,
  pageTitle?: string,
  timeOnPage?: number
) => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await axios.post(
      `${API_BASE_URL}/api/analytics/pageview`,
      {
        pageUrl,
        pageTitle,
        referrerUrl: document.referrer,
        userAgent: navigator.userAgent,
        timeOnPage
      },
      { headers }
    );
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

export const trackClick = async (
  elementId: string,
  elementText?: string,
  coordinates?: { x: number; y: number }
) => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await axios.post(
      `${API_BASE_URL}/api/analytics/click`,
      {
        pageUrl: window.location.href,
        elementId,
        elementText,
        clickCoordinates: coordinates
      },
      { headers }
    );
  } catch (error) {
    console.error('Failed to track click:', error);
  }
};

export const trackVideoInteraction = async (
  moduleId: string,
  videoUrl: string,
  actionType: string,
  videoTime?: number,
  duration?: number
) => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await axios.post(
      `${API_BASE_URL}/api/analytics/video`,
      {
        moduleId,
        videoUrl,
        actionType,
        videoTime,
        duration
      },
      { headers }
    );
  } catch (error) {
    console.error('Failed to track video interaction:', error);
  }
};

export const trackQuizAttempt = async (moduleId: string, data: any) => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.error('Authentication required for quiz tracking');
      return;
    }

    await axios.post(
      `${API_BASE_URL}/api/analytics/quiz`,
      {
        moduleId,
        ...data
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    console.error('Failed to track quiz attempt:', error);
  }
};

// Get analytics summary for the current user
export const getAnalyticsSummary = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(
      `${API_BASE_URL}/api/analytics/summary`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to get analytics summary:', error);
    throw error;
  }
};
