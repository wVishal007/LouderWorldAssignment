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