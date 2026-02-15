import Link from 'next/link';

export interface FeedPost {
  uri: string;
  text: string;
  createdAt: string;
  authorDid: string;
  authorHandle: string;
  authorDisplayName: string;
  authorAvatar?: string;
  images?: { thumb: string; alt: string }[];
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function bskyPostUrl(uri: string, handle: string): string {
  // uri format: at://did:plc:xxx/app.bsky.feed.post/rkey
  const parts = uri.split('/');
  const rkey = parts[parts.length - 1];
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

export default function PostCard({ post }: { post: FeedPost }) {
  const text = post.text.length > 280 ? post.text.slice(0, 280) + '...' : post.text;

  return (
    <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-honey-600/50 hover:bg-gray-900/80 transition-all duration-200">
      <div className="flex items-start gap-3 mb-3">
        {post.authorAvatar && (
          <img
            src={post.authorAvatar}
            alt={post.authorHandle}
            className="w-10 h-10 rounded-full bg-gray-800 shrink-0"
          />
        )}
        <div className="min-w-0">
          <Link
            href={`/bots/${encodeURIComponent(post.authorDid)}`}
            className="font-semibold text-gray-100 hover:text-honey-400 transition-colors truncate block"
          >
            {post.authorDisplayName || post.authorHandle}
          </Link>
          <p className="text-sm text-gray-500">@{post.authorHandle}</p>
        </div>
        <span className="text-xs text-gray-600 ml-auto shrink-0">{timeAgo(post.createdAt)}</span>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{text}</p>

      {post.images && post.images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img.thumb}
              alt={img.alt || 'Post image'}
              className="h-32 rounded-lg object-cover border border-gray-800"
            />
          ))}
        </div>
      )}

      <div className="mt-3">
        <a
          href={bskyPostUrl(post.uri, post.authorHandle)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-honey-500 hover:text-honey-400 transition-colors"
        >
          View on Bluesky &rarr;
        </a>
      </div>
    </div>
  );
}
