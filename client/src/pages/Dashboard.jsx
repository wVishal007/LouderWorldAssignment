// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import EventTable from '../components/dashboard/EventTable';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import ErrorBoundary from '../components/layout/ErrorBoundary';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ 
    city: 'Sydney', 
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardAPI.getEvents(filters);
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to load dashboard events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (eventIdOrIds, data = {}) => {
    try {
      if (Array.isArray(eventIdOrIds)) {
        // Bulk import
        await dashboardAPI.bulkUpdateStatus(eventIdOrIds, 'imported');
      } else {
        // Single import
        await dashboardAPI.importEvent(eventIdOrIds, data);
      }
      loadEvents();
    } catch (error) {
      console.error('Failed to import event:', error);
      alert('Failed to import event. Please try again.');
    }
  };

  const handleMarkInactive = async (eventId) => {
    try {
      await dashboardAPI.markAsInactive(eventId);
      loadEvents();
    } catch (error) {
      console.error('Failed to mark as inactive:', error);
      alert('Failed to mark event as inactive. Please try again.');
    }
  };

  const getStats = () => {
    const stats = {
      new: events.filter(e => e.status === 'new').length,
      updated: events.filter(e => e.status === 'updated').length,
      imported: events.filter(e => e.status === 'imported').length,
      inactive: events.filter(e => e.status === 'inactive').length,
      total: events.length,
    };
    return stats;
  };

  const stats = getStats();

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage and import events to your platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="text-blue-500 text-3xl mr-3">🆕</div>
              <div>
                <p className="text-sm text-slate-600">New Events</p>
                <p className="text-2xl font-bold text-blue-800">{stats.new}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="text-amber-500 text-3xl mr-3">🔄</div>
              <div>
                <p className="text-sm text-slate-600">Updated Events</p>
                <p className="text-2xl font-bold text-amber-800">{stats.updated}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="text-green-500 text-3xl mr-3">✅</div>
              <div>
                <p className="text-sm text-slate-600">Imported Events</p>
                <p className="text-2xl font-bold text-green-800">{stats.imported}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border-l-4 border-slate-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="text-slate-500 text-3xl mr-3">⏸️</div>
              <div>
                <p className="text-sm text-slate-600">Inactive Events</p>
                <p className="text-2xl font-bold text-slate-800">{stats.inactive}</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="text-indigo-500 text-3xl mr-3">📊</div>
              <div>
                <p className="text-sm text-slate-600">Total Events</p>
                <p className="text-2xl font-bold text-indigo-800">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <DashboardFilters onFilterChange={setFilters} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <EventTable 
          events={events} 
          loading={loading}
          onImport={handleImport}
          onMarkInactive={handleMarkInactive}
        />
      </div>
    </ErrorBoundary>
  );
}