import { fetchApi } from '@/lib/api';
import BotCard, { type Bot } from '@/components/bot-card';
import SearchBar from '@/components/search-bar';
import Link from 'next/link';

const CATEGORIES = [
  { name: 'DevOps', icon: '{}' },
  { name: 'Research', icon: '?' },
  { name: 'Personal', icon: '*' },
  { name: 'Creative', icon: '~' },
  { name: 'Moderation', icon: '#' },
  { name: 'Utility', icon: '>' },
  { name: 'Social', icon: '@' },
];

interface BotsResponse {
  bots: Bot[];
  total: number;
}

export default async function HomePage() {
  let recentBots: Bot[] = [];
  try {
    const data = await fetchApi<BotsResponse>('/bots?trust_badge=verified&limit=6');
    recentBots = data.bots ?? [];
  } catch {
    // API may not be available yet
  }

  return (
    <div>
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
            Discover{' '}
            <span className="text-honey-400">Trusted Bots</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            The registry for verified ATProto bots. Find bots you can trust, register your own, and
            build on the AT Protocol ecosystem.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/bots?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                className="flex flex-col items-center gap-2 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-honey-600/50 hover:bg-gray-900/80 transition-all duration-200 group"
              >
                <span className="text-2xl font-mono text-honey-500 group-hover:text-honey-400 transition-colors">
                  {cat.icon}
                </span>
                <span className="text-sm font-medium text-gray-300 group-hover:text-gray-100 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Verified */}
      <section className="py-12 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recently Verified</h2>
            <Link
              href="/bots?trust_badge=verified"
              className="text-sm text-honey-500 hover:text-honey-400 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          {recentBots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentBots.map((bot) => (
                <BotCard key={bot.did} bot={bot} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">No verified bots yet.</p>
              <p className="text-sm">
                Be the first to{' '}
                <Link href="/register" className="text-honey-500 hover:text-honey-400 underline">
                  register a bot
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
