import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import { AnalyticsAPI, SentimentAPI } from '../api';
import { AlertTriangle, Loader2, Activity, Search, Bell, ChevronDown, FileText, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

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
      <div className="flex h-full items-center justify-center bg-sentix-bg text-sentix-cyan">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-rose-500 flex-col bg-sentix-bg">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <p>{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-sentix-panel border border-sentix-border rounded-xl text-white font-medium hover:bg-sentix-border transition-colors">Retry</button>
      </div>
    );
  }

  if (!overview) {
    return <div className="p-8 bg-sentix-bg text-white">No data available.</div>;
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1400px] mx-auto overflow-y-auto h-full pb-20">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="flex-1 w-full max-w-md relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-sentix-text" />
          <input 
            type="text" 
            placeholder="Search analytics..." 
            className="w-full pl-12 pr-4 py-3 bg-sentix-panel border border-sentix-border rounded-2xl shadow-md focus:ring-2 focus:ring-sentix-cyan outline-none text-white font-medium transition-all" 
          />
        </div>
        <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
          <button className="p-3 bg-sentix-panel border border-sentix-border rounded-full shadow-md hover:border-sentix-cyan transition-colors text-sentix-text relative">
            <div className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full"></div>
            <Bell className="w-5 h-5" />
          </button>
          <button className="flex items-center px-5 py-3 bg-sentix-green text-sentix-bg rounded-2xl shadow-md hover:bg-sentix-greenHover transition-colors font-bold text-sm">
            Export <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Dashboard Title */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Platform at a Glance</h1>
        <p className="text-sentix-text text-sm mt-1">Real-time snapshot of sentiment, ratings, and active anomalies.</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants}>
          <KpiCard 
            title="Total Reviews Analyzed" 
            value={overview.analyzedReviews.toLocaleString()} 
            trend="+12.50% from Yesterday"
            subtitle={`${overview.totalMovies} Movies`}
            baseColor="border-sentix-cyan text-sentix-cyan"
            icon={FileText} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard 
            title="Average Sentiment" 
            value={overview.averageSentimentScore.toFixed(3)} 
            trend="+5.20% from Yesterday"
            baseColor="border-sentix-green text-sentix-green"
            icon={Activity} 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard 
            title="Positive / Negative Ratio" 
            value={`${overview.positivePercentage}%`} 
            trend="+2.10% from Yesterday"
            subtitle={`${overview.negativePercentage}% Negative`}
            baseColor="border-indigo-500 text-indigo-400"
            icon={Users} 
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Sentiment Trend Line Chart */}
        <motion.div variants={itemVariants} className="bg-sentix-panel border border-sentix-border p-6 rounded-3xl shadow-lg col-span-2 relative">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white">Sentiment Trend</h3>
            <select 
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="text-sm border border-sentix-border bg-sentix-bg text-white font-bold rounded-xl focus:ring-1 focus:ring-sentix-cyan px-4 py-2 cursor-pointer outline-none transition-colors"
            >
              <option value="day">This Week</option>
              <option value="week">This Month</option>
              <option value="month">This Year</option>
            </select>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2c3440" />
                <XAxis dataKey="period" tick={{fontSize: 12, fill: '#9ab'}} tickMargin={15} minTickGap={30} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#9ab'}} domain={[-1, 1]} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #2c3440', backgroundColor: '#1e252b', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#00e054' }}
                />
                <Line yAxisId="left" type="monotone" name="Avg Score" dataKey="averageScore" stroke="#00e054" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#14181c', stroke: '#00e054' }} activeDot={{ r: 6, fill: '#00e054', stroke: '#14181c', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Rating Distribution Bar Chart */}
        <motion.div variants={itemVariants} className="bg-sentix-panel border border-sentix-border p-6 rounded-3xl shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-white">Rating Distribution</h3>
            <button className="px-3 py-1.5 bg-sentix-bg border border-sentix-border hover:border-sentix-cyan transition-colors text-sentix-text hover:text-white font-bold rounded-lg text-xs">
              See Details
            </button>
          </div>
          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.ratingDistribution} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2c3440" />
                <XAxis dataKey="rating" tick={{fontSize: 12, fill: '#9ab'}} axisLine={false} tickLine={false} tickMargin={10} />
                <Tooltip 
                  cursor={{fill: '#2c3440'}}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #2c3440', backgroundColor: '#1e252b', color: '#fff' }}
                  itemStyle={{ color: '#00B4D8' }}
                />
                <Bar dataKey="count" fill="#00B4D8" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* Anomalies Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-sentix-panel border border-sentix-border rounded-3xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-2 gap-4">
          <h3 className="text-lg font-bold text-white">Sentiment Anomalies</h3>
          <div className="flex space-x-3 w-full sm:w-auto">
            <select className="text-sm border border-sentix-border bg-sentix-bg text-white font-bold rounded-xl focus:ring-1 focus:ring-sentix-cyan px-4 py-2 cursor-pointer outline-none w-full sm:w-auto">
              <option>All Status</option>
            </select>
            <button className="px-4 py-2 bg-sentix-green text-sentix-bg font-bold rounded-xl hover:bg-sentix-greenHover transition-colors text-sm flex items-center whitespace-nowrap">
              + Generate Report
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-sentix-text text-sm border-b border-sentix-border">
                <th className="pb-4 font-bold pl-6 uppercase tracking-wider">Period</th>
                <th className="pb-4 font-bold uppercase tracking-wider">Expected Score</th>
                <th className="pb-4 font-bold uppercase tracking-wider">Actual Score</th>
                <th className="pb-4 font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sentix-text italic">No significant anomalies detected.</td>
                </tr>
              ) : (
                anomalies.map((a, i) => (
                  <tr key={i} className="border-b border-sentix-border/50 last:border-none hover:bg-sentix-bg transition-colors">
                    <td className="py-4 pl-6 font-bold text-white">{a.period}</td>
                    <td className="py-4 text-sentix-text font-medium">{a.expectedScore.toFixed(2)}</td>
                    <td className="py-4 text-white font-bold">{a.sentimentScore.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center w-max border ${a.severity.includes('POSITIVE') ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
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
      </motion.div>

    </div>
  );
}

function KpiCard({ title, value, subtitle, trend, baseColor, icon: Icon }: any) {
  return (
    <div className={`p-6 rounded-3xl bg-sentix-panel border border-sentix-border shadow-lg relative overflow-hidden flex flex-col justify-between h-44 hover:border-current transition-colors ${baseColor}`}>
      {/* Decorative watermark */}
      <div className="absolute -right-4 -bottom-6 opacity-[0.05] pointer-events-none">
        <Icon className="w-40 h-40 currentColor" />
      </div>
      
      <div className="flex justify-between items-start z-10">
        <div className="text-sentix-text font-bold uppercase tracking-wider text-xs">{title}</div>
        <div className={`p-2 rounded-xl bg-current/10 text-current`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="z-10 mt-6">
        <div className="text-3xl font-black text-white tracking-tight drop-shadow-md">{value}</div>
        <div className="flex items-center mt-3 space-x-2">
          {trend && (
            <span className="text-sentix-green font-extrabold text-[11px] uppercase tracking-wide bg-sentix-green/10 border border-sentix-green/20 px-2 py-1 rounded-md">
              {trend}
            </span>
          )}
          {subtitle && <span className="text-sentix-text text-xs font-medium">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
