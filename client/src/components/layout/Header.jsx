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
