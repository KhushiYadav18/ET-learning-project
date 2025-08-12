import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/courses`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to fetch courses.');
  }
};

export const getCourseById = async (courseId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/courses/${courseId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to fetch course.');
  }
};

export const enrollInCourse = async (courseId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/courses/${courseId}/enroll`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to enroll in course.');
  }
};

export const getEnrolledCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/courses/enrolled/list`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to fetch enrolled courses.');
  }
};

export const updateCourseProgress = async (
  courseId: string,
  moduleId: string,
  status: string,
  timeSpent?: number,
  score?: number
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/courses/${courseId}/progress`, {
      moduleId,
      status,
      timeSpent,
      score
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to update progress.');
  }
};

export const getCourseProgress = async (courseId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/courses/${courseId}/progress`);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.message) {
      throw new Error(error.response.data.error.message);
    }
    throw new Error('Failed to fetch course progress.');
  }
};
