import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../slices/authSlice";

export default function Header() {
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="text-2xl font-extrabold">
          LOUDER<span className="text-indigo-600">WORLD</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate("/dashboard")}>
                Dashboard
              </button>

              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                    {user?.name?.[0]}
                  </div>
                )}

                <span>{user?.name?.split(" ")[0]}</span>

                <button
                  onClick={logout}
                  className="text-red-600"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
