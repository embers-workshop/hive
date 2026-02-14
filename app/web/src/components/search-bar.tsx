'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/bots?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/bots');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bots by name, handle, or description..."
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-honey-500 focus:ring-1 focus:ring-honey-500 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-honey-600 hover:bg-honey-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
