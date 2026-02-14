import { fetchApi } from '@/lib/api';
import BotCard, { type Bot } from '@/components/bot-card';
import SearchBar from '@/components/search-bar';
import Link from 'next/link';

const CATEGORIES = ['devops', 'research', 'personal', 'creative', 'moderation', 'utility', 'social'];
const TRUST_BADGES = ['verified', 'pending', 'unverified'];

interface BotsResponse {
  bots: Bot[];
  total: number;
}

export default async function BotsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; trust_badge?: string; offset?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || '';
  const trustBadge = params.trust_badge || '';
  const offset = parseInt(params.offset || '0', 10);
  const limit = 12;

  const queryParts: string[] = [`limit=${limit}`, `offset=${offset}`];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  if (category) queryParts.push(`category=${encodeURIComponent(category)}`);
  if (trustBadge) queryParts.push(`trust_badge=${encodeURIComponent(trustBadge)}`);

  let bots: Bot[] = [];
  let total = 0;
  try {
    const data = await fetchApi<BotsResponse>(`/bots?${queryParts.join('&')}`);
    bots = data.bots ?? [];
    total = data.total ?? 0;
  } catch {
    // API may not be available
  }

  const hasNext = offset + limit < total;
  const hasPrev = offset > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Bot Directory</h1>
        <SearchBar defaultValue={search} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-56 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Category filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <Link
                      key={cat}
                      href={`/bots?${new URLSearchParams({
                        ...(search ? { search } : {}),
                        ...(isActive ? {} : { category: cat }),
                        ...(trustBadge ? { trust_badge: trustBadge } : {}),
                      }).toString()}`}
                      className={`block px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        isActive
                          ? 'bg-honey-600/20 text-honey-400 font-medium'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Trust badge filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                Trust Badge
              </h3>
              <div className="space-y-1.5">
                {TRUST_BADGES.map((badge) => {
                  const isActive = trustBadge === badge;
                  return (
                    <Link
                      key={badge}
                      href={`/bots?${new URLSearchParams({
                        ...(search ? { search } : {}),
                        ...(category ? { category } : {}),
                        ...(isActive ? {} : { trust_badge: badge }),
                      }).toString()}`}
                      className={`block px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        isActive
                          ? 'bg-honey-600/20 text-honey-400 font-medium'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      {badge}
                    </Link>
                  );
                })}
              </div>
            </div>

            {(category || trustBadge || search) && (
              <Link
                href="/bots"
                className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear all filters
              </Link>
            )}
          </div>
        </aside>

        {/* Bot grid */}
        <div className="flex-1">
          {bots.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} bots
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {bots.map((bot) => (
                  <BotCard key={bot.did} bot={bot} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 mt-8">
                {hasPrev ? (
                  <Link
                    href={`/bots?${new URLSearchParams({
                      ...(search ? { search } : {}),
                      ...(category ? { category } : {}),
                      ...(trustBadge ? { trust_badge: trustBadge } : {}),
                      offset: String(Math.max(0, offset - limit)),
                    }).toString()}`}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    &larr; Previous
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-gray-600 text-sm">
                    &larr; Previous
                  </span>
                )}
                {hasNext ? (
                  <Link
                    href={`/bots?${new URLSearchParams({
                      ...(search ? { search } : {}),
                      ...(category ? { category } : {}),
                      ...(trustBadge ? { trust_badge: trustBadge } : {}),
                      offset: String(offset + limit),
                    }).toString()}`}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Next &rarr;
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-gray-600 text-sm">
                    Next &rarr;
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg mb-2">No bots found.</p>
              <p className="text-sm">
                Try adjusting your search or filters, or{' '}
                <Link href="/register" className="text-honey-500 hover:text-honey-400 underline">
                  register a new bot
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
