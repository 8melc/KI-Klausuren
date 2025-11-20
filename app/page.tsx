import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            KI-Klausur-Korrektur
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Automatische Korrektur von Klausuren mit KI-Unterstützung
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/expectation"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">📋</div>
              <h2 className="text-xl font-semibold mb-2">Erwartungshorizont</h2>
              <p className="text-gray-600 text-sm">
                Laden Sie den Erwartungshorizont als PDF hoch
              </p>
            </Link>

            <Link
              href="/upload"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">📄</div>
              <h2 className="text-xl font-semibold mb-2">Klausuren hochladen</h2>
              <p className="text-gray-600 text-sm">
                Laden Sie die zu korrigierenden Klausuren hoch
              </p>
            </Link>

            <Link
              href="/results"
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">✅</div>
              <h2 className="text-xl font-semibold mb-2">Ergebnisse</h2>
              <p className="text-gray-600 text-sm">
                Sehen Sie die korrigierten Klausuren und Bewertungen
              </p>
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">So funktioniert&apos;s</h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Laden Sie zuerst den Erwartungshorizont als PDF hoch</li>
              <li>Laden Sie dann die zu korrigierenden Klausuren hoch</li>
              <li>Die KI analysiert die Klausuren automatisch anhand des Erwartungshorizonts</li>
              <li>Sehen Sie detaillierte Bewertungen und laden Sie korrigierte PDFs herunter</li>
            </ol>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Hinweis:</strong> Für die Nutzung benötigen Sie einen OpenAI API Key. 
              Erstellen Sie eine <code className="bg-yellow-100 px-1 rounded">.env.local</code> Datei 
              mit <code className="bg-yellow-100 px-1 rounded">OPENAI_API_KEY=your-key-here</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
