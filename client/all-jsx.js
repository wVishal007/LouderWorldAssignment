

// ===============================
// FILE: src\App.jsx
// ===============================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./services/auth";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <Login />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}


// ===============================
// FILE: src\components\dashboard\DashboardFilters.jsx
// ===============================

import { useState } from 'react';

export default function DashboardFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    city: 'Sydney',
    status: 'all',
    search: '',
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="input-field"
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
            className="input-field"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="updated">Updated</option>
            <option value="imported">Imported</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}

// ===============================
// FILE: src\components\dashboard\DashboardLayout.jsx
// ===============================

import { Outlet } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// ===============================
// FILE: src\components\dashboard\EventPreview.jsx
// ===============================

import { useState } from 'react';

export default function EventPreview({ event, onClose, onImport }) {
  const [importNotes, setImportNotes] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    await onImport(event._id, { importNotes });
    setIsImporting(false);
    onClose();
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

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-slate-900">{event.title}</h3>
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
              className="w-full h-64 object-cover rounded-xl mb-4"
            />
          )}

          <div className="space-y-3 mb-6">
            <div>
              <span className="text-sm text-slate-500">📅 Date & Time</span>
              <p className="text-lg font-semibold">{formatDate(event.dateTime)}</p>
            </div>

            <div>
              <span className="text-sm text-slate-500">📍 Venue</span>
              <p className="text-lg font-semibold">{event.venueName || 'TBD'}</p>
            </div>

            <div>
              <span className="text-sm text-slate-500">🌐 Source</span>
              <p className="text-lg font-semibold">{event.sourceName}</p>
            </div>

            {event.importedBy && (
              <div>
                <span className="text-sm text-slate-500">👤 Imported By</span>
                <p className="text-lg font-semibold">{event.importedBy?.name || 'Admin'}</p>
              </div>
            )}
          </div>

          <div>
            <span className="text-sm text-slate-500">📝 Description</span>
            <p className="text-slate-700 mt-1">{event.description || event.shortSummary || 'No description available'}</p>
          </div>
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
                <div className="mt-4 p-3 bg-white rounded-lg">
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
                  className="input-field resize-none"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full btn-primary py-4 text-lg"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===============================
// FILE: src\components\dashboard\EventTable.jsx
// ===============================

import { useState } from 'react';
import EventPreview from './EventPreview';

export default function EventTable({ events, onImport }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      updated: 'bg-amber-100 text-amber-800',
      imported: 'bg-green-100 text-green-800',
      inactive: 'bg-slate-100 text-slate-600',
    };
    return colors[status] || colors.inactive;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
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
                  {event.venueName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                    {event.sourceName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                  >
                    Review
                  </button>
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
        />
      )}
    </div>
  );
}

// ===============================
// FILE: src\components\events\EventCard.jsx
// ===============================

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

// ===============================
// FILE: src\components\events\EventFilters.jsx
// ===============================

import { useState } from 'react';

export default function EventFilters({ onFilterChange, cities = ['Sydney', 'Melbourne', 'Brisbane'] }) {
  const [filters, setFilters] = useState({
    city: 'Sydney',
    search: '',
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search Events
          </label>
          <input
            type="text"
            placeholder="Search by title, venue, or description..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="input-field"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ===============================
// FILE: src\components\events\EventList.jsx
// ===============================

import { useState, useEffect } from 'react';
import EventCard from './EventCard';
import { eventsAPI } from '../../services/api';
import EventFilters from './EventFilters';

export default function EventList({ onImport }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: 'Sydney', search: '' });

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsAPI.getAll(filters);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    {/* Hero */}
    <div className="mb-12 text-center">
      <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
        Discover Amazing Events
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
        Find concerts, meetups, workshops & experiences happening near you
      </p>
    </div>

    {/* Filters */}
    <div className="mb-10">
      <EventFilters onFilterChange={setFilters} />
    </div>

    {/* Content */}
    {loading ? (
      <div className="text-center py-20">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-fuchsia-500 border-t-transparent" />
        <p className="mt-4 text-slate-400">Loading events...</p>
      </div>
    ) : events.length === 0 ? (
      <div className="text-center py-16 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No events found
        </h3>
        <p className="text-slate-400">
          Try adjusting filters or check back later
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => (
          <EventCard key={event._id} event={event} onImport={onImport} />
        ))}
      </div>
    )}
  </div>
);
}

// ===============================
// FILE: src\components\layout\Footer.jsx
// ===============================

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">LOUDERWORLD</h3>
            <p className="text-slate-400">
              Discover amazing events happening around you. Your gateway to unforgettable experiences.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <p className="text-slate-400">
              © {new Date().getFullYear()} LouderWorld. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ===============================
// FILE: src\components\layout\Header.jsx
// ===============================

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../services/auth";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
              LOUDER<span className="text-slate-900">WORLD</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-slate-700 hover:text-indigo-600 font-medium transition"
                >
                  Dashboard
                </button>

                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold">
                      {user?.name?.[0] || "A"}
                    </div>
                  )}

                  <span className="text-sm font-medium text-slate-700">
                    {user?.name?.split(" ")[0] || "Admin"}
                  </span>

                  <button
                    onClick={logout}
                    className="text-sm font-medium text-slate-600 hover:text-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2 text-white font-medium shadow-md hover:shadow-lg transition"
              >
                Login
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setOpen(false);
                  }}
                  className="block w-full text-left text-slate-700 font-medium"
                >
                  Dashboard
                </button>

                <button
                  onClick={logout}
                  className="block w-full text-left text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setOpen(false);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 py-3 text-white font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


// ===============================
// FILE: src\components\modals\EmailCaptureModal.jsx
// ===============================

import { useState } from 'react';
import { leadsAPI } from '../../services/api';

export default function EmailCaptureModal({ eventId, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !consent) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await leadsAPI.create({
        email,
        consent: true,
        eventId,
      });

      // Redirect to event source URL or show success
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎫</div>
          <h2 className="text-2xl font-bold mb-2">Get Your Tickets</h2>
          <p className="text-slate-600">
            Enter your email to receive ticket information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field"
              required
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 text-indigo-600 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="consent" className="ml-3 text-sm text-slate-700">
              <strong>I consent to receiving event information and updates via email.</strong>
              <br />
              <span className="text-xs text-slate-500">
                Your email will only be used for this event. Unsubscribe anytime.
              </span>
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? 'Submitting...' : '📧 Submit Email'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-4">
          By submitting, you agree to our Privacy Policy
        </p>
      </div>
    </div>
  );
}

// ===============================
// FILE: src\main.jsx
// ===============================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


// ===============================
// FILE: src\pages\Dashboard.jsx
// ===============================

import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import EventTable from '../components/dashboard/EventTable';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    city: 'Sydney', 
    status: 'all',
    search: '' 
  });

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getEvents(filters);
      console.log(response.data);
      
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load dashboard events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (eventId, data) => {
    try {
      await dashboardAPI.importEvent(eventId, data);
      loadEvents(); // Refresh the list
    } catch (error) {
      console.error('Failed to import event:', error);
    }
  };

  const getStats = () => {
    const stats = {
      new: events.filter(e => e.status === 'new').length,
      updated: events.filter(e => e.status === 'updated').length,
      imported: events.filter(e => e.status === 'imported').length,
      inactive: events.filter(e => e.status === 'inactive').length,
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-600">Manage and import events to your platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
      </div>

      <DashboardFilters onFilterChange={setFilters} />

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-slate-600">Loading events...</p>
        </div>
      ) : (
        <EventTable events={events} onImport={handleImport} />
      )}
    </div>
  );
}

// ===============================
// FILE: src\pages\Home.jsx
// ===============================

import EventList from "../components/events/EventList";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-black via-slate-900 to-black">
      <EventList />
    </div>
  );
}


// ===============================
// FILE: src\pages\Login.jsx
// ===============================

import { authAPI } from "../services/api";

export default function Login() {
  const handleLogin = () => {
    authAPI.login(); // browser redirect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white via-fuchsia-300/30 to-white p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl p-8 text-center border border-white/30">

        <div className="absolute -top-10 -left-10 h-32 w-32 bg-pink-500/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-purple-500/30 blur-3xl rounded-full" />

        <div className="text-6xl mb-4">🚀</div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome to <span className="text-fuchsia-600">LouderWorld</span>
        </h1>

        <p className="text-slate-600 mb-8">
          Sign in to continue to the admin dashboard
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-4 rounded-xl border border-slate-300 bg-white py-4 text-slate-700 font-medium shadow-md hover:shadow-xl"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="h-6 w-6"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
