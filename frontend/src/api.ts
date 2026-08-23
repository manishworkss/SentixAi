import { auth } from './config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Use Firebase ID token if user is logged in
  let token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized globally if needed
      console.error("Unauthorized");
    }
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || data; // Handle both wrapper structures
}

export const AnalyticsAPI = {
  getOverview: () => fetchWithAuth('/analytics/overview'),
  getSentimentOverTime: (groupBy: 'day'|'week'|'month' = 'month', movieId?: string) => {
    const query = new URLSearchParams({ groupBy });
    if (movieId) query.append('movieId', movieId);
    return fetchWithAuth(`/analytics/sentiment-over-time?${query.toString()}`);
  },
  getSentimentAnomalies: (groupBy: 'day'|'week'|'month' = 'month', threshold = 2.0) => {
    return fetchWithAuth(`/analytics/sentiment-anomalies?groupBy=${groupBy}&threshold=${threshold}`);
  },
  getMovieAnalytics: (movieId: string) => fetchWithAuth(`/analytics/movies/${movieId}`),
  getMovieAspects: (movieId: string) => fetchWithAuth(`/analytics/movies/${movieId}/aspects`)
};

export const SentimentAPI = {
  getStats: () => fetchWithAuth('/sentiment/stats'),
  getMovieSentiments: (movieId: string, page = 1, limit = 50) => 
    fetchWithAuth(`/sentiment/movies/${movieId}?page=${page}&limit=${limit}`),
  getReviewSentiment: (reviewId: string) => fetchWithAuth(`/sentiment/reviews/${reviewId}`)
};

export const MovieAPI = {
  searchMovies: (query: string, page = 1) => fetchWithAuth(`/movies?title=${encodeURIComponent(query)}&page=${page}&limit=20`),
  getMovie: (id: string) => fetchWithAuth(`/movies/${id}`),
  getMovieReviews: (id: string, page = 1) => fetchWithAuth(`/movies/${id}/reviews?page=${page}&limit=20`)
};

export const IngestionAPI = {
  startImdbIngestion: (maxRecords = 1000) => 
    fetchWithAuth('/ingestion/imdb', { method: 'POST', body: JSON.stringify({ maxRecords }) }),
  getJobStatus: (jobId: string) => fetchWithAuth(`/ingestion/${jobId}`)
};
