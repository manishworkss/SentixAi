const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  
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
      console.error("Unauthorized");
    }
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const AnalyticsAPI = {
  getOverview: async () => (await fetchWithAuth('/analytics/overview')).data,
  getSentimentOverTime: async (groupBy: 'day'|'week'|'month' = 'month', movieId?: string) => {
    const query = new URLSearchParams({ groupBy });
    if (movieId) query.append('movieId', movieId);
    return (await fetchWithAuth(`/analytics/sentiment-over-time?${query.toString()}`)).data;
  },
  getSentimentAnomalies: async (groupBy: 'day'|'week'|'month' = 'month', threshold = 2.0) => {
    return (await fetchWithAuth(`/analytics/sentiment-anomalies?groupBy=${groupBy}&threshold=${threshold}`)).data;
  },
  getMovieAnalytics: async (movieId: string) => (await fetchWithAuth(`/analytics/movies/${movieId}`)).data,
  getMovieAspects: async (movieId: string) => (await fetchWithAuth(`/analytics/movies/${movieId}/aspects`)).data
};

export const SentimentAPI = {
  getStats: async () => (await fetchWithAuth('/sentiment/stats')).data,
  getMovieSentiments: (movieId: string, page = 1, limit = 50) => 
    fetchWithAuth(`/sentiment/movies/${movieId}?page=${page}&limit=${limit}`),
  getReviewSentiment: async (reviewId: string) => (await fetchWithAuth(`/sentiment/reviews/${reviewId}`)).data
};

export const MovieAPI = {
  searchMovies: (query: string, page = 1) => fetchWithAuth(`/movies?title=${encodeURIComponent(query)}&page=${page}&limit=20`),
  getMovie: async (id: string) => (await fetchWithAuth(`/movies/${id}`)).data
};

export const IngestionAPI = {
  startImdbIngestion: async (maxRecords: number) => fetchWithAuth('/ingestion/imdb', {
    method: 'POST',
    body: JSON.stringify({ maxRecords })
  }),
  getJobStatus: async (jobId: string) => (await fetchWithAuth(`/ingestion/${jobId}`)).data
};
