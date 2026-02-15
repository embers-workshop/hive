'use client';

import { useState } from 'react';

interface Challenge {
  id: string;
  status: 'pending' | 'verified' | 'expired' | 'failed';
  nonce?: string;
  issuedAt?: string;
  expiresAt?: string;
  evidenceUri?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-honey-400' },
  verified: { label: 'Verified', color: 'text-green-400' },
  expired: { label: 'Expired', color: 'text-gray-400' },
  failed: { label: 'Failed', color: 'text-red-400' },
};

export default function VerificationStatus({ did, apiUrl }: { did: string; apiUrl: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function checkVerification() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/bots/${encodeURIComponent(did)}/verify`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to check verification status.');
        return;
      }
      setChallenge(json.data);
      setChecked(true);
    } catch {
      setError('Could not reach the API.');
    } finally {
      setLoading(false);
    }
  }

  const status = challenge ? STATUS_CONFIG[challenge.status] : null;

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-3">Verification</h2>

      {error && (
        <p className="text-sm text-red-400 mb-3">{error}</p>
      )}

      {checked && !challenge && (
        <p className="text-sm text-gray-500 mb-3">No verification challenge found for this bot.</p>
      )}

      {checked && challenge && status && (
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </div>
          {challenge.issuedAt && (
            <div className="flex justify-between">
              <span className="text-gray-400">Issued</span>
              <span className="text-gray-300">{new Date(challenge.issuedAt).toLocaleString()}</span>
            </div>
          )}
          {challenge.expiresAt && (
            <div className="flex justify-between">
              <span className="text-gray-400">Expires</span>
              <span className="text-gray-300">{new Date(challenge.expiresAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={checkVerification}
        disabled={loading}
        className="w-full px-4 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Checking...' : checked ? 'Refresh Status' : 'Check Verification'}
      </button>
    </section>
  );
}
