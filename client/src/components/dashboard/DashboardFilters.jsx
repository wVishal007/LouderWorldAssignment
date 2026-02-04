// src/components/dashboard/DashboardFilters.jsx
import { useState } from 'react';

export default function DashboardFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    city: 'Sydney',
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      city: 'Sydney',
      status: 'all',
      search: '',
      startDate: '',
      endDate: '',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        {(filters.search || filters.status !== 'all' || filters.startDate || filters.endDate) && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            <option value="Sydney">Sydney</option>
            <option value="Melbourne">Melbourne</option>
            <option value="Brisbane">Brisbane</option>
            <option value="Perth">Perth</option>
            <option value="Adelaide">Adelaide</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          >
            <option value="all">All Statuses</option>
            <option value="new">🆕 New</option>
            <option value="updated">🔄 Updated</option>
            <option value="imported">✅ Imported</option>
            <option value="inactive">⏸️ Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Title, venue, description..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>
    </div>
  );
}