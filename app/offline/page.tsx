'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">You're Offline</h1>
        <p className="text-slate-400 mb-6">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-black hover:bg-zinc-900 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

