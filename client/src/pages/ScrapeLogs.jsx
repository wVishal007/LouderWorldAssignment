// src/pages/ScrapeLogs.jsx
import { useState, useEffect } from 'react';
import { scrapeLogAPI } from '../services/api';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';
import ErrorBoundary from '../components/layout/ErrorBoundary';

export default function ScrapeLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scrapeLogAPI.getLogs();
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to load logs:', err);
      setError('Failed to load scrape logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return '—';
    const duration = new Date(end) - new Date(start);
    const seconds = Math.floor(duration / 1000);
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner text="Loading scrape logs..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Scrape Logs</h1>
          <p className="text-slate-600">View scraping activity and performance</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {logs.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No Scrape Logs"
            description="No scraping activity has been recorded yet."
          />
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fetched</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">New</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Started</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{log.sourceName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.city || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.totalFetched || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{log.newEvents || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-medium">{log.updatedEvents || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDuration(log.startedAt, log.finishedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(log.startedAt).toLocaleString('en-AU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}