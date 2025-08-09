'use client';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Easy Mailer
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Convert your Word documents into email templates with dynamic variables.
          Fill in the fields and send or copy your personalized email.
        </p>
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            Application is being deployed. Full functionality will be available soon!
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>Easy Mailer - Convert documents to email templates instantly</p>
        <p className="mt-2">Files are processed locally and deleted immediately after use</p>
      </footer>
    </main>
  );
}