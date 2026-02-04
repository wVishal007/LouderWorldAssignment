// src/components/dashboard/EventTable.jsx
import { useState } from 'react';
import EventPreview from './EventPreview';
import LoadingSpinner from '../layout/LoadingSpinner';
import EmptyState from '../layout/EmptyState';

export default function EventTable({ events, loading, onImport, onMarkInactive }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bulkSelected, setBulkSelected] = useState([]);

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      updated: 'bg-amber-100 text-amber-800 border-amber-200',
      imported: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSelect = (eventId) => {
    setBulkSelected(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleSelectAll = () => {
    if (bulkSelected.length === events.length) {
      setBulkSelected([]);
    } else {
      setBulkSelected(events.map(e => e._id));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading events..." />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No Events Found"
        description="Try adjusting your filters or check back later when new events are scraped."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {bulkSelected.length > 0 && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-800">
            {bulkSelected.length} event{bulkSelected.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onImport(bulkSelected, { bulk: true })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              ✅ Import Selected
            </button>
            <button
              onClick={() => setBulkSelected([])}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={bulkSelected.length === events.length && events.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Venue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {events.map((event) => (
              <tr
                key={event._id}
                className={`hover:bg-slate-50 cursor-pointer ${
                  selectedEvent?._id === event._id ? 'bg-indigo-50' : ''
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={bulkSelected.includes(event._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelect(event._id);
                    }}
                    className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900 line-clamp-2">
                    {event.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {formatDate(event.dateTime)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 line-clamp-1">
                  {event.venueName || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                    {event.sourceName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                      className="px-3 py-1.5 text-indigo-600 hover:text-indigo-900 font-medium text-sm bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                    >
                      👁️ Review
                    </button>
                    {event.status !== 'imported' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onImport(event._id);
                        }}
                        className="px-3 py-1.5 text-green-600 hover:text-green-900 font-medium text-sm bg-green-50 rounded-lg hover:bg-green-100 transition"
                      >
                        ✅ Import
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <EventPreview
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onImport={onImport}
          onMarkInactive={onMarkInactive}
        />
      )}
    </div>
  );
}