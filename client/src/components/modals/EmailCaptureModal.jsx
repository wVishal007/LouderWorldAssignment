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