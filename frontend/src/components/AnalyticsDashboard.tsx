import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import { AnalyticsAPI, SentimentAPI } from '../api';
import { AlertTriangle, Loader2, Activity, Search, Bell, ChevronDown, FileText, Users, CheckCircle2 } from 'lucide-react';

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
    let interval: ReturnType<typeof setInterval>;
    if (stats?.isProcessing) {
      interval = setInterval(async () => {
        try {
          const statsData = await SentimentAPI.getStats();
          setStats(statsData);
          if (!statsData.isProcessing) {
            clearInterval(interval);
            loadData();
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [stats?.isProcessing]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500 flex-col">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <p>{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-medium hover:bg-slate-200">Retry</button>
      </div>
    );
  }

  if (!overview) {
    return <div className="p-8">No data available.</div>;
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto overflow-y-auto h-full pb-20 bg-[#f8f9fc]">
      
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex-1 max-w-md relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-slate-100 outline-none text-slate-700 font-medium" 
          />
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-3 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow text-slate-500 relative">
            <div className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
            <Bell className="w-5 h-5" />
          </button>
          <button className="flex items-center px-5 py-3 bg-[#00c689] text-white rounded-2xl shadow-sm hover:bg-[#00b079] transition-colors font-bold text-sm">
            Export <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Dashboard Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Platform at a Glance</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time snapshot of sentiment, ratings, and active anomalies.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard 
          title="Total Reviews Analyzed" 
          value={overview.analyzedReviews.toLocaleString()} 
          trend="+12.50% from Yesterday"
          subtitle={`${overview.totalMovies} Movies`}
          bgColor="bg-[#eef2fa]"
          iconBgColor="bg-[#4b6bfb]" 
          icon={FileText} 
        />
        <KpiCard 
          title="Average Sentiment" 
          value={overview.averageSentimentScore.toFixed(3)} 
          trend="+5.20% from Yesterday"
          bgColor="bg-[#e9f8f3]"
          iconBgColor="bg-[#00c689]" 
          icon={Activity} 
        />
        <KpiCard 
          title="Positive / Negative Ratio" 
          value={`${overview.positivePercentage}%`} 
          trend="+2.10% from Yesterday"
          subtitle={`${overview.negativePercentage}% Negative`}
          bgColor="bg-[#e8eaf6]"
          iconBgColor="bg-[#5c6bc0]" 
          icon={Users} 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Sentiment Trend Line Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] col-span-2 relative">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800">Sentiment Trend</h3>
            <select 
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="text-sm border-none bg-slate-50 text-slate-600 font-bold rounded-xl focus:ring-0 px-4 py-2 cursor-pointer outline-none"
            >
              <option value="day">This Week</option>
              <option value="week">This Month</option>
              <option value="month">This Year</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{fontSize: 12, fill: '#94a3b8'}} tickMargin={15} minTickGap={30} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#94a3b8'}} domain={[-1, 1]} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Line yAxisId="left" type="monotone" name="Avg Score" dataKey="averageScore" stroke="#00c689" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, fill: '#00c689', stroke: '#fff', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Rating Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800">Rating Distribution</h3>
            <button className="px-3 py-1.5 bg-[#00c689] text-white font-bold rounded-lg text-xs">
              See Details
            </button>
          </div>
          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.ratingDistribution} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="rating" tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#4b6bfb" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 mb-8">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="text-lg font-bold text-slate-800">Sentiment Anomalies</h3>
          <div className="flex space-x-3">
            <select className="text-sm border-none bg-slate-50 text-slate-600 font-bold rounded-xl focus:ring-0 px-4 py-2 cursor-pointer outline-none">
              <option>All Status</option>
            </select>
            <button className="px-4 py-2 bg-[#00c689] text-white font-bold rounded-xl hover:bg-[#00b079] text-sm flex items-center">
              + Generate Report
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-100">
                <th className="pb-4 font-medium pl-6">Period</th>
                <th className="pb-4 font-medium">Expected Score</th>
                <th className="pb-4 font-medium">Actual Score</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 italic">No significant anomalies detected.</td>
                </tr>
              ) : (
                anomalies.map((a, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-6 font-bold text-slate-700">{a.period}</td>
                    <td className="py-4 text-slate-500 font-medium">{a.expectedScore.toFixed(2)}</td>
                    <td className="py-4 text-slate-800 font-bold">{a.sentimentScore.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center w-max ${a.severity.includes('POSITIVE') ? 'bg-[#e9f8f3] text-[#00c689]' : 'bg-rose-50 text-rose-500'}`}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {a.severity.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function KpiCard({ title, value, subtitle, trend, bgColor, iconBgColor, icon: Icon }: any) {
  return (
    <div className={`p-6 rounded-3xl ${bgColor} shadow-sm relative overflow-hidden flex flex-col justify-between h-44 border border-white/50`}>
      {/* Decorative watermark */}
      <div className="absolute -right-4 -bottom-6 opacity-[0.07] pointer-events-none">
        <Icon className="w-40 h-40" />
      </div>
      
      <div className="flex justify-between items-start z-10">
        <div className="text-slate-600 font-bold">{title}</div>
        <div className={`p-2.5 rounded-2xl ${iconBgColor} text-white shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="z-10 mt-6">
        <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
        <div className="flex items-center mt-3 space-x-2">
          {trend && (
            <span className="text-[#00c689] font-extrabold text-[11px] uppercase tracking-wide bg-[#00c689]/10 px-2 py-1 rounded-md">
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500 text-xs font-medium">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
