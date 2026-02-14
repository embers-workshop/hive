import Link from 'next/link';

export interface Bot {
  did: string;
  handle: string;
  display_name: string;
  description?: string;
  trust_badge?: 'verified' | 'unverified' | 'pending';
  categories?: string[];
}

function TrustBadge({ badge }: { badge?: string }) {
  if (badge === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
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
      <span className="inline-flex items-center gap-1 text-xs font-medium text-honey-400">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium text-gray-500">
      Unverified
    </span>
  );
}

export default function BotCard({ bot }: { bot: Bot }) {
  const description = bot.description
    ? bot.description.length > 120
      ? bot.description.slice(0, 120) + '...'
      : bot.description
    : 'No description provided.';

  return (
    <Link
      href={`/bots/${encodeURIComponent(bot.did)}`}
      className="block group"
    >
      <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-honey-600/50 hover:bg-gray-900/80 transition-all duration-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-100 group-hover:text-honey-400 transition-colors truncate">
              {bot.display_name || bot.handle}
            </h3>
            <p className="text-sm text-gray-500 truncate">@{bot.handle}</p>
          </div>
          <TrustBadge badge={bot.trust_badge} />
        </div>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{description}</p>
        {bot.categories && bot.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bot.categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 text-xs font-medium bg-gray-800 text-gray-300 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
