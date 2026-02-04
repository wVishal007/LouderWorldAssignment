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
     const response = await eventsAPI.getPublicEvents(filters);
setEvents(response.data);
console.log(response.data);
      
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