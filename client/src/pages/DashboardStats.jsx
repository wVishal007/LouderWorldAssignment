// src/pages/DashboardStats.jsx
import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import ErrorBoundary from '../components/layout/ErrorBoundary';

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner text="Loading statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Statistics Overview</h1>
          <p className="text-slate-600">Platform performance and insights</p>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-slate-500 text-sm mb-2">Total Events</div>
            <div className="text-3xl font-bold text-slate-900">{stats.totals.total}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-green-600 text-sm mb-2">✅ Active Events</div>
            <div className="text-3xl font-bold text-green-700">{stats.totals.active}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-blue-600 text-sm mb-2">🆕 New Events</div>
            <div className="text-3xl font-bold text-blue-700">{stats.totals.new}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-green-600 text-sm mb-2">_IMPORTED Events</div>
            <div className="text-3xl font-bold text-green-700">{stats.totals.imported}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-slate-500 text-sm mb-2">⏸️ Inactive Events</div>
            <div className="text-3xl font-bold text-slate-700">{stats.totals.inactive}</div>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Events by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.categories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-900">{cat._id || 'Uncategorized'}</span>
                <span className="text-lg font-bold text-indigo-600">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sources Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Events by Source</h2>
          <div className="space-y-3">
            {stats.sources.map((source, i) => (
              <div key={i} className="flex items-center">
                <div className="w-48 font-medium text-slate-900">{source._id}</div>
                <div className="flex-1 h-6 bg-slate-200 rounded-full overflow-hidden mr-4">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${(source.count / stats.totals.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-12 text-right">{source.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}