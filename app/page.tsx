// app/page.tsx

export default function Home() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Site</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your pet's health companion
          </p>
          <a 
            href="/dashboard" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Dashboard
          </a>
        </div>
      </main>
    )
  }