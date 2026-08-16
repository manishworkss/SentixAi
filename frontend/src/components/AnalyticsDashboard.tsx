import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { AnalyticsAPI, SentimentAPI } from '../api';
import { AlertTriangle, CheckCircle2, Loader2, Activity } from 'lucide-react';

const COLORS = ['#22c55e', '#ef4444', '#94a3b8']; // Positive, Negative, Neutral

export function AnalyticsDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');

  const loadData = async () => {
    try {
      const [overviewData, timeData, anomalyData, statsData] = await Promise.all([
        AnalyticsAPI.getOverview(),
        AnalyticsAPI.getSentimentOverTime(groupBy),
        AnalyticsAPI.getSentimentAnomalies(groupBy),
        SentimentAPI.getStats()
      ]);
      setOverview(overviewData);
      setTimeSeries(timeData);
      setAnomalies(anomalyData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError('Unable to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupBy]);

  useEffect(() => {
    // Poll stats if processing is active
    let interval: ReturnType<typeof setInterval>;
    if (stats?.isProcessing) {
      interval = setInterval(async () => {
        try {
          const statsData = await SentimentAPI.getStats();
          setStats(statsData);
          if (!statsData.isProcessing) {
            clearInterval(interval);
            loadData(); // reload overview when finished
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [stats?.isProcessing]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <span className="ml-3 text-slate-500">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500 flex-col">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <p>{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-slate-100 rounded-md text-slate-700 hover:bg-slate-200">Retry</button>
      </div>
    );
  }

  if (!overview) {
    return <div className="p-8">No sentiment data available yet.</div>;
  }

  const pieData = [
    { name: 'Positive', value: overview.sentimentDistribution.POSITIVE },
    { name: 'Negative', value: overview.sentimentDistribution.NEGATIVE },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto h-full pb-20">
      
      {/* Header & Status */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Analytics Overview</h1>
          <p className="text-slate-500 mt-1">Global insights across {overview.totalMovies.toLocaleString()} movies and {overview.totalReviews.toLocaleString()} reviews.</p>
        </div>
        
        {/* Processing Status Pill */}
        <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border ${stats?.isProcessing ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {stats?.isProcessing ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-pulse" />
              AI analysis is processing ({stats?.progressPercentage}% - {stats?.analyzedReviews.toLocaleString()} done)
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Sentiment analysis complete
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Analyzed" value={overview.analyzedReviews.toLocaleString()} subtitle={`${overview.pendingReviews.toLocaleString()} pending`} />
        <KpiCard title="Average Rating" value={overview.averageRating.toFixed(2)} subtitle="/ 10" />
        <KpiCard title="Avg Sentiment" value={overview.averageSentimentScore.toFixed(3)} subtitle="Scale: -1 to +1" />
        <KpiCard title="Positive / Negative" value={`${overview.positivePercentage}% / ${overview.negativePercentage}%`} subtitle="Sentiment ratio" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sentiment Distribution Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-slate-800 self-start mb-4">Sentiment Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => value?.toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Over Time */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Sentiment Trend</h3>
            <select 
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="text-sm border-slate-300 rounded-md focus:ring-slate-500 focus:border-slate-500 px-3 py-1 bg-slate-50"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{fontSize: 12, fill: '#64748b'}} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} domain={[-1, 1]} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" name="Avg Score" dataKey="averageScore" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" name="Total Reviews" dataKey="totalReviews" stroke="#cbd5e1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rating Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Rating Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="rating" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomalies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Sentiment Anomalies ({groupBy})</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {anomalies.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">
                No significant sentiment anomalies detected.
              </div>
            ) : (
              anomalies.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800">{a.period}</div>
                    <div className="text-xs text-slate-500">Expected: {a.expectedScore.toFixed(2)} | Actual: {a.sentimentScore.toFixed(2)}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${a.severity.includes('POSITIVE') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {a.severity.replace('_', ' ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-sm font-medium text-slate-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}
