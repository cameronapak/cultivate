import { MCPKeyManager } from '@/client/components/MCPKeyManager';

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-8">
          {/* MCP Integration Section */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">MCP Integration</h2>
            <p className="text-gray-600 text-sm mb-6">
              Connect Cultivate to AI applications using the Model Context Protocol (MCP).
              Generate an API key below to get started.
            </p>
            <MCPKeyManager />
          </section>
        </div>
      </div>
    </div>
  );
}
