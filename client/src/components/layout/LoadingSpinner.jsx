// src/components/layout/LoadingSpinner.jsx
export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent`}
      />
      {text && <p className="mt-4 text-slate-600 font-medium">{text}</p>}
    </div>
  );
}