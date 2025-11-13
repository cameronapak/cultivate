import { useState } from 'react';
import { useQuery, generateMcpApiKey, revokeMcpApiKey, getMcpKeyStatus } from 'wasp/client/operations';
import { Button } from '../../components/ui/button';
import { Copy, Check, Trash2, Loader } from 'lucide-react';

export function MCPKeyManager() {
  const { data: keyStatus, isLoading: statusLoading, error: statusError } = useQuery(getMcpKeyStatus);
  const [displayedKey, setDisplayedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleGenerateKey = async () => {
    try {
      setIsGenerating(true);
      const result = await generateMcpApiKey();
      setDisplayedKey(result.apiKey);
    } catch (error) {
      console.error('Failed to generate API key:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (displayedKey) {
      navigator.clipboard.writeText(displayedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeKey = async () => {
    if (confirm('Are you sure you want to revoke this API key? Any integrations using it will stop working.')) {
      try {
        setIsRevoking(true);
        await revokeMcpApiKey();
        setDisplayedKey(null);
      } catch (error) {
        console.error('Failed to revoke API key:', error);
      } finally {
        setIsRevoking(false);
      }
    }
  };

  if (statusLoading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (statusError) {
    return <div className="text-sm text-red-500">Error loading key status</div>;
  }

  return (
    <div className="space-y-4">
      {displayedKey ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              ⚠️ Save this key now. It will only be shown once.
            </p>
            <div className="flex items-center gap-2 bg-white p-2 rounded border border-yellow-100">
              <code className="flex-1 text-sm font-mono break-all">{displayedKey}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyKey}
                className="flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setDisplayedKey(null)}
            className="w-full"
          >
            I've saved the key
          </Button>
        </div>
      ) : keyStatus?.hasKey ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You have an active MCP API key. Use it to authenticate with MCP clients.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleGenerateKey}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              Generate new key
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeKey}
              disabled={isRevoking}
              size="sm"
            >
              {isRevoking && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Generate an MCP API key to use Cultivate with AI applications like Claude.
          </p>
          <Button
            onClick={handleGenerateKey}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating && <Loader className="w-4 h-4 mr-2 animate-spin" />}
            Generate API key
          </Button>
        </div>
      )}
    </div>
  );
}
