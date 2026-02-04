// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-slate-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Page Not Found</h1>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          ← Go Home
        </Link>
      </div>
    </div>
  );
}