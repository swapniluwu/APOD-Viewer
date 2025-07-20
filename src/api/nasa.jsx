import axios from 'axios';

const API_URL = 'https://api.nasa.gov/planetary/apod';
const DEMO_KEY = 'DEMO_KEY';
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const REQUEST_TIMEOUT = 10000;
const RANGE_REQUEST_TIMEOUT = 15000;

const retryRequest = async (fn, retries = MAX_RETRIES, delay = BASE_DELAY) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      console.error('Max retries reached', error);
      throw error;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

const isValidDate = (dateString) => {
  if (!dateString) return true;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString) && !isNaN(new Date(dateString).getTime());
};

const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const enhanceApodData = (data) => {
  if (!data) throw new Error('No data provided for enhancement');
  
  const displayUrl = data.media_type === 'video' 
    ? (isValidUrl(data.thumbnail_url) ? data.thumbnail_url : data.url)
    : (isValidUrl(data.url) ? data.url : data.hdurl);
  
  const downloadUrl = data.media_type === 'image' 
    ? (isValidUrl(data.hdurl) ? data.hdurl : data.url)
    : (isValidUrl(data.thumbnail_url) ? data.thumbnail_url : data.url);

  return {
    ...data,
    media_type: data.media_type || 'image',
    display_url: displayUrl,
    download_url: downloadUrl,
    url: data.url,
    hdurl: data.hdurl,
    thumbnail_url: data.thumbnail_url
  };
};

export const getApod = async (date = '') => {
  const request = async () => {
    try {
      if (!isValidDate(date)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD or leave empty for today');
      }

      const response = await axios.get(API_URL, {
        params: {
          api_key: import.meta.env.VITE_NASA_API_KEY || DEMO_KEY,
          date: date || undefined,
          thumbs: true
        },
        timeout: REQUEST_TIMEOUT
      });

      if (!response.data) throw new Error('No data received from NASA API');
      return enhanceApodData(response.data);
    } catch (error) {
      let errorMessage = 'Failed to fetch astronomy picture';
      
      if (error.code === 'ECONNABORTED') errorMessage = 'Request timed out';
      else if (error.response?.status === 403) errorMessage = 'API key invalid';
      else if (error.response?.status === 404) errorMessage = 'No image available';
      else if (error.response?.status === 429) errorMessage = 'Too many requests';
      
      const enhancedError = new Error(errorMessage);
      enhancedError.cause = error;
      throw enhancedError;
    }
  };
  return retryRequest(request);
};

export const getApodRange = async (startDate, endDate) => {
  const request = async () => {
    try {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD');
      }
      if (new Date(startDate) > new Date(endDate)) {
        throw new Error('Start date must be before end date');
      }

      const response = await axios.get(API_URL, {
        params: {
          api_key: import.meta.env.VITE_NASA_API_KEY || DEMO_KEY,
          start_date: startDate,
          end_date: endDate,
          thumbs: true
        },
        timeout: RANGE_REQUEST_TIMEOUT
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Unexpected API response format');
      }

      return response.data
        .reverse()
        .map(apod => enhanceApodData(apod));
    } catch (error) {
      let errorMessage = 'Failed to fetch picture gallery';
      if (error.code === 'ECONNABORTED') errorMessage = 'Request timed out';
      else if (error.response?.status === 400) errorMessage = 'Invalid date range';
      
      const enhancedError = new Error(errorMessage);
      enhancedError.cause = error;
      throw enhancedError;
    }
  };
  return retryRequest(request);
};

export default {
  getApod,
  getApodRange,
  enhanceApodData,
  isValidDate
};