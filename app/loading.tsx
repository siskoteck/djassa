export default function GlobalLoadingDjassa() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 pt-4">
        {.map((n) => (
          <div key={n} className="h-60 bg-white rounded-3xl border border-gray-200 p-4" />
        ))}
      </div>
    </div>
  );
}