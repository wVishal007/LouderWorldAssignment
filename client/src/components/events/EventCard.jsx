import { useState } from 'react';
import EmailCaptureModal from '../modals/EmailCaptureModal';

export default function EventCard({ event, onImport }) {
  const [showModal, setShowModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-AU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleImport = async () => {
    if (onImport) {
      setIsImporting(true);
      await onImport(event._id);
      setIsImporting(false);
    }
  };

return (
  <div className="group rounded-2xl overflow-hidden bg-white/90 backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">

    {/* Image */}
    {event.imageUrl ? (
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${event.imageUrl})` }}
      />
    ) : (
      <div className="h-48 bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center">
        <span className="text-white text-5xl">🎉</span>
      </div>
    )}

    {/* Content */}
    <div className="p-6">

      {/* Top meta */}
      <div className="flex justify-between items-center mb-3">
        <span className={`status-badge status-${event.status}`}>
          {event.status}
        </span>
        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
          {event.sourceName}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2 line-clamp-2 text-slate-900 group-hover:text-indigo-600 transition">
        {event.title}
      </h3>

      {/* Info */}
      <div className="space-y-2 text-slate-600 mb-4 text-sm">
        <p className="flex items-center gap-2">
          <span>📅</span>
          {formatDate(event.dateTime)}
        </p>
        <p className="flex items-center gap-2">
          <span>📍</span>
          <span className="line-clamp-1">
            {event.venueName || "Venue TBD"}
          </span>
        </p>
      </div>

      {/* Description */}
      <p className="text-slate-600 text-sm mb-5 line-clamp-2">
        {event.shortSummary || "No description available"}
      </p>

      {/* Action */}
      {event.status === "imported" ? (
        <button
          disabled
          className="w-full rounded-xl bg-green-500/80 py-3 text-white font-medium cursor-not-allowed"
        >
          ✅ Imported
        </button>
      ) : onImport ? (
        <button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-white font-medium shadow-md hover:shadow-lg transition"
        >
          {isImporting ? "Importing..." : "📥 Import"}
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-white font-medium shadow-md hover:shadow-lg transition"
        >
          🎫 Get Tickets
        </button>
      )}
    </div>

    {showModal && (
      <EmailCaptureModal
        eventId={event._id}
        onClose={() => setShowModal(false)}
        onSuccess={() => setShowModal(false)}
      />
    )}
  </div>
);

}