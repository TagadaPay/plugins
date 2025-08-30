function Loader() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-2 text-center text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default Loader;
