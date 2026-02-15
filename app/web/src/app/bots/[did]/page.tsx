import { fetchApi } from '@/lib/api';
import PostCard, { type FeedPost } from '@/components/post-card';
import VerificationStatus from '@/components/verification-status';
import Link from 'next/link';

interface Command {
  name: string;
  description: string;
  example?: string;
}

interface BotDetail {
  did: string;
  handle: string;
  displayName: string;
  description?: string;
  trustBadge?: 'verified' | 'unverified' | 'pending';
  categories?: string[];
  operatorName?: string | null;
  operatorEmail?: string | null;
  commands?: Command[];
  manifestUrl?: string;
  manifest?: {
    schemaVersion?: string;
    validatedAt?: string | null;
    errors?: string[];
    interactionModes?: string[];
  };
  reputation?: {
    responsiveness?: number;
    completeness?: number;
  } | null;
}

export default async function BotDetailPage({
  params,
}: {
  params: Promise<{ did: string }>;
}) {
  const { did: rawDid } = await params;
  // Next.js may not fully decode params containing special chars like ':'
  const did = decodeURIComponent(rawDid);
  let bot: BotDetail | null = null;
  let error: string | null = null;
  let recentPosts: FeedPost[] = [];

  try {
    const res = await fetchApi<{ data: BotDetail }>(`/bots/${encodeURIComponent(did)}`);
    bot = res.data;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load bot details.';
  }

  try {
    const feed = await fetchApi<{ data: FeedPost[] }>(`/feed?did=${encodeURIComponent(did)}&limit=5`);
    recentPosts = feed.data ?? [];
  } catch {
    // Feed may not be available
  }

  if (error || !bot) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-300 mb-2">Bot Not Found</h1>
        <p className="text-gray-500 mb-6">{error || 'The requested bot could not be found.'}</p>
        <Link href="/bots" className="text-honey-500 hover:text-honey-400 underline">
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/bots" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4 inline-block">
          &larr; Back to directory
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{bot.displayName || bot.handle}</h1>
            <p className="text-gray-400 mt-1">@{bot.handle}</p>
            <p className="text-xs text-gray-600 font-mono mt-1">{bot.did}</p>
          </div>
          <TrustBadgeLarge badge={bot.trustBadge} />
        </div>
        {bot.description && (
          <p className="text-gray-300 mt-4 leading-relaxed">{bot.description}</p>
        )}
        {bot.categories && bot.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {bot.categories.map((cat) => (
              <Link
                key={cat}
                href={`/bots?category=${encodeURIComponent(cat)}`}
                className="px-3 py-1 text-xs font-medium bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Commands */}
          {bot.commands && bot.commands.length > 0 && (
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Commands</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 pr-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-2 pr-4 text-gray-400 font-medium">Description</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bot.commands.map((cmd) => (
                      <tr key={cmd.name} className="border-b border-gray-800/50">
                        <td className="py-2.5 pr-4 font-mono text-honey-400">{cmd.name}</td>
                        <td className="py-2.5 pr-4 text-gray-300">{cmd.description}</td>
                        <td className="py-2.5 font-mono text-xs text-gray-500">
                          {cmd.example || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Interaction Modes */}
          {bot.manifest?.interactionModes && bot.manifest.interactionModes.length > 0 && (
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Interaction Modes</h2>
              <div className="flex flex-wrap gap-2">
                {bot.manifest.interactionModes.map((mode) => (
                  <span
                    key={mode}
                    className="px-2.5 py-1 text-xs bg-gray-800 text-gray-300 rounded-full"
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Operator */}
          {(bot.operatorName || bot.operatorEmail) && (
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-3">Operator</h2>
              {bot.operatorName && <p className="text-sm text-gray-300">{bot.operatorName}</p>}
              {bot.operatorEmail && (
                <p className="text-sm text-gray-500 mt-1">{bot.operatorEmail}</p>
              )}
            </section>
          )}

          {/* Verification */}
          <VerificationStatus did={bot.did} />

          {/* Manifest */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Manifest</h2>
            <dl className="space-y-2 text-sm">
              {bot.manifest?.schemaVersion && (
                <div>
                  <dt className="text-gray-500">Schema Version</dt>
                  <dd className="text-gray-300">{bot.manifest.schemaVersion}</dd>
                </div>
              )}
              {bot.manifest?.validatedAt && (
                <div>
                  <dt className="text-gray-500">Last Validated</dt>
                  <dd className="text-gray-300">
                    {new Date(bot.manifest.validatedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {bot.manifestUrl && (
                <div>
                  <dt className="text-gray-500">Manifest URL</dt>
                  <dd>
                    <a
                      href={bot.manifestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-honey-500 hover:text-honey-400 underline break-all text-xs"
                    >
                      {bot.manifestUrl}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            {bot.manifest?.errors && bot.manifest.errors.length > 0 && (
              <div className="mt-3 p-3 bg-red-950/30 border border-red-900/50 rounded-lg">
                <p className="text-xs font-medium text-red-400 mb-1">Validation Errors</p>
                <ul className="space-y-0.5">
                  {bot.manifest.errors.map((err, i) => (
                    <li key={i} className="text-xs text-red-300">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Reputation */}
          {bot.reputation && (
            <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-3">Reputation</h2>
              <div className="space-y-3">
                {bot.reputation.responsiveness != null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Responsiveness</span>
                      <span className="text-gray-300">{bot.reputation.responsiveness}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-honey-500 rounded-full"
                        style={{ width: `${bot.reputation.responsiveness}%` }}
                      />
                    </div>
                  </div>
                )}
                {bot.reputation.completeness != null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Completeness</span>
                      <span className="text-gray-300">{bot.reputation.completeness}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-honey-500 rounded-full"
                        style={{ width: `${bot.reputation.completeness}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <PostCard key={post.uri} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustBadgeLarge({ badge }: { badge?: string }) {
  if (badge === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-950/40 border border-green-800/50 text-green-400 text-sm font-medium rounded-full">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Verified
      </span>
    );
  }
  if (badge === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-honey-950/40 border border-honey-800/50 text-honey-400 text-sm font-medium rounded-full">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1.5 bg-gray-800 text-gray-500 text-sm font-medium rounded-full">
      Unverified
    </span>
  );
}
