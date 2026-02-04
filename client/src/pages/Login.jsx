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
