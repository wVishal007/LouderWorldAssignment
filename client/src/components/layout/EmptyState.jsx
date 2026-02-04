// src/components/layout/EmptyState.jsx
export default function EmptyState({ icon = '😕', title, description, action }) {
  return (
    <div className="text-center py-16 bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-8">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}