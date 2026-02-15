'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const CATEGORIES = ['devops', 'research', 'personal', 'creative', 'moderation', 'utility', 'social'];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Bot + optional operator info
  const [botDid, setBotDid] = useState('');
  const [botHandle, setBotHandle] = useState('');
  const [botDisplayName, setBotDisplayName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [botCategories, setBotCategories] = useState<string[]>([]);
  const [manifestUrl, setManifestUrl] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [operatorEmail, setOperatorEmail] = useState('');
  const [listingSecret, setListingSecret] = useState('');

  // Step 2: Verification
  const [nonce, setNonce] = useState('');
  const [verifyInstructions, setVerifyInstructions] = useState('');

  function toggleCategory(cat: string) {
    setBotCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function registerBot(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          did: botDid,
          handle: botHandle,
          display_name: botDisplayName,
          description: botDescription,
          categories: botCategories,
          manifest_url: manifestUrl || undefined,
          operator_name: operatorName || undefined,
          operator_email: operatorEmail || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(data.error || 'Failed to register bot');
      }
      const data = await res.json();
      setListingSecret(data.data?.listing_secret || '');
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function startVerification() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bots/${encodeURIComponent(botDid)}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-listing-secret': listingSecret,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(data.error || 'Failed to start verification');
      }
      const data = await res.json();
      setNonce(data.data?.nonce || '');
      setVerifyInstructions(
        data.data?.instructions ||
          `Post the following nonce in your bot's profile or a public post to verify ownership: ${data.data?.nonce}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Register a Bot</h1>
      <p className="text-gray-400 mb-8">
        Register your ATProto bot with Hive in two steps.
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-honey-600 text-white'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 2 && (
              <div
                className={`w-12 h-0.5 ${
                  step > s ? 'bg-honey-600' : 'bg-gray-800'
                }`}
              />
            )}
          </div>
        ))}
        <div className="ml-4 text-sm text-gray-500">
          {step === 1 && 'Register Bot'}
          {step === 2 && 'Verify Ownership'}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Step 1: Bot Registration */}
      {step === 1 && (
        <form onSubmit={registerBot} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">DID</label>
            <input
              type="text"
              required
              value={botDid}
              onChange={(e) => setBotDid(e.target.value)}
              placeholder="did:plc:..."
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Handle</label>
            <input
              type="text"
              required
              value={botHandle}
              onChange={(e) => setBotHandle(e.target.value)}
              placeholder="mybot.bsky.social"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={botDisplayName}
              onChange={(e) => setBotDisplayName(e.target.value)}
              placeholder="My Awesome Bot"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={botDescription}
              onChange={(e) => setBotDescription(e.target.value)}
              placeholder="What does your bot do?"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${
                    botCategories.includes(cat)
                      ? 'bg-honey-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Manifest URL <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="url"
              value={manifestUrl}
              onChange={(e) => setManifestUrl(e.target.value)}
              placeholder="https://example.com/.well-known/bot-manifest.json"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500 text-sm"
            />
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <p className="text-sm text-gray-500 mb-3">Operator info (optional)</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Operator Name
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Your name or organization"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Operator Email
                </label>
                <input
                  type="email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-honey-600 hover:bg-honey-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Registering...' : 'Register Bot'}
          </button>
        </form>
      )}

      {/* Step 2: Verification */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="p-4 bg-green-950/30 border border-green-900/50 rounded-xl">
            <p className="text-sm font-medium text-green-400">
              Bot registered successfully!
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Now verify ownership to earn the verified badge.
            </p>
          </div>

          {listingSecret && (
            <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-xl">
              <p className="text-sm font-medium text-amber-400 mb-1">
                Save your listing secret:
              </p>
              <code className="block p-2 bg-gray-950 rounded text-xs text-honey-400 font-mono break-all">
                {listingSecret}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                This is the only time this secret will be shown. You need it to manage your bot listing.
              </p>
            </div>
          )}

          {!nonce ? (
            <button
              onClick={startVerification}
              disabled={loading}
              className="w-full py-2.5 bg-honey-600 hover:bg-honey-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Starting...' : 'Start Verification'}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-sm font-medium text-gray-300 mb-2">
                  Your verification nonce:
                </p>
                <code className="block p-3 bg-gray-950 rounded-lg text-honey-400 font-mono text-sm break-all">
                  {nonce}
                </code>
              </div>
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-sm font-medium text-gray-300 mb-2">Instructions:</p>
                <p className="text-sm text-gray-400 leading-relaxed">{verifyInstructions}</p>
              </div>
              <div className="text-center">
                <a
                  href={`/bots/${encodeURIComponent(botDid)}`}
                  className="text-honey-500 hover:text-honey-400 underline text-sm"
                >
                  View your bot&apos;s page
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
