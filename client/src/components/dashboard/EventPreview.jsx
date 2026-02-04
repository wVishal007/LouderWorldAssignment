// src/components/dashboard/EventPreview.jsx
import { useState } from 'react';
import ConfirmModal from '../modals/ConfirmModal';

export default function EventPreview({ event, onClose, onImport, onMarkInactive }) {
  const [importNotes, setImportNotes] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await onImport(event._id, { importNotes });
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleMarkInactive = () => {
    setShowConfirmModal(true);
  };

  const confirmMarkInactive = async () => {
    try {
      await onMarkInactive(event._id);
      onClose();
    } catch (error) {
      console.error('Mark inactive failed:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{event.title}</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {event.sourceName}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              ID: {event._id.slice(0, 8)}...
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 object-cover rounded-xl mb-4 shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          )}

          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="text-sm text-slate-500">📅 Date & Time</span>
              <p className="text-lg font-semibold mt-1">{formatDate(event.dateTime)}</p>
              {event.endDateTime && (
                <p className="text-sm text-slate-600 mt-1">Ends: {formatDateTime(event.endDateTime)}</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="text-sm text-slate-500">📍 Venue</span>
              <p className="text-lg font-semibold mt-1">{event.venueName || 'TBD'}</p>
              {event.venueAddress && (
                <p className="text-sm text-slate-600 mt-1">{event.venueAddress}</p>
              )}
              {event.city && (
                <p className="text-sm text-slate-600 mt-1">📍 {event.city}</p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="text-sm text-slate-500">🌐 Source</span>
              <p className="text-lg font-semibold mt-1">{event.sourceName}</p>
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm block mt-1 truncate"
              >
                {event.sourceUrl}
              </a>
            </div>

            {event.importedBy && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <span className="text-sm text-slate-500">👤 Imported By</span>
                <p className="text-lg font-semibold mt-1">{event.importedBy?.name || 'Admin'}</p>
                {event.importedAt && (
                  <p className="text-sm text-slate-600 mt-1">
                    On: {formatDateTime(event.importedAt)}
                  </p>
                )}
              </div>
            )}

            {event.lastScrapedAt && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <span className="text-sm text-slate-500">⏱️ Last Scraped</span>
                <p className="text-sm text-slate-600 mt-1">{formatDateTime(event.lastScrapedAt)}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <span className="text-sm text-slate-500">📝 Description</span>
            <p className="text-slate-700 mt-2 whitespace-pre-line">
              {event.description || event.shortSummary || 'No description available'}
            </p>
          </div>

          {(event.category?.length > 0 || event.tags?.length > 0) && (
            <div className="mt-4">
              {event.category?.length > 0 && (
                <div>
                  <span className="text-sm text-slate-500">🏷️ Categories</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {event.category.map((cat, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {event.tags?.length > 0 && (
                <div className="mt-3">
                  <span className="text-sm text-slate-500">🔖 Tags</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {event.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          {event.status === 'imported' ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="text-green-500 text-4xl mb-3">✅</div>
              <h4 className="text-xl font-semibold mb-2">Already Imported</h4>
              <p className="text-slate-600 mb-4">
                This event has already been imported to the platform.
              </p>
              {event.importNotes && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                  <span className="text-sm text-slate-500">Import Notes:</span>
                  <p className="mt-2 text-slate-700">{event.importNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Import Notes (Optional)
                </label>
                <textarea
                  value={importNotes}
                  onChange={(e) => setImportNotes(e.target.value)}
                  placeholder="Add any notes about this import..."
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? '🔄 Importing...' : '✅ Import to Platform'}
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Importing this event will:</strong>
                  <br />
                  • Mark it as "imported" in the system
                  <br />
                  • Make it available on the public website
                  <br />
                  • Track who imported it and when
                </p>
              </div>

              {event.status !== 'inactive' && (
                <button
                  onClick={handleMarkInactive}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition"
                >
                  ⏸️ Mark as Inactive
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmModal
          title="Mark Event as Inactive"
          message="Are you sure you want to mark this event as inactive? This will hide it from the public website."
          confirmText="Yes, Mark Inactive"
          cancelText="Cancel"
          onConfirm={confirmMarkInactive}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}