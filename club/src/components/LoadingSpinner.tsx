function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--primary-color)]"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
