import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Hive Ecosystem',
  description:
    'Learn about the Hive bot registry and the Beekit developer toolkit for building trusted ATProto bots.',
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <section className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          The <span className="text-honey-400">Hive</span> Ecosystem
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          A registry for trusted bots and a toolkit for building them &mdash; bringing
          identity, verification, and discoverability to the ATProto network.
        </p>
      </section>

      {/* Two projects */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        {/* Hive */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col">
          <div className="mb-4">
            <span className="text-3xl font-bold text-honey-400">Hive</span>
            <span className="ml-3 text-xs font-medium px-2 py-1 bg-honey-600/20 text-honey-400 rounded-full">
              Registry
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            Hive is the bot discovery and verification platform for Bluesky and the
            AT Protocol. It provides a searchable directory of bots, a standard manifest
            schema for describing capabilities, and a nonce-based verification system that
            proves operator ownership.
          </p>
          <div className="space-y-3 mb-8">
            <Feature text="Searchable bot directory with categories and trust badges" />
            <Feature text="Standard bot manifest schema for interoperability" />
            <Feature text="Proof-of-control verification via ATProto" />
            <Feature text="Background workers that fetch manifests and validate proofs" />
            <Feature text="Public API for bot registration and discovery" />
          </div>
          <div className="mt-auto flex flex-wrap gap-3">
            <Link
              href="/bots"
              className="px-4 py-2 bg-honey-600 hover:bg-honey-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Browse Bots
            </Link>
            <Link
              href="/docs"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              Read the Docs
            </Link>
            <a
              href="https://github.com/embers-workshop/hive"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Beekit */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col">
          <div className="mb-4">
            <span className="text-3xl font-bold text-honey-400">Beekit</span>
            <span className="ml-3 text-xs font-medium px-2 py-1 bg-honey-600/20 text-honey-400 rounded-full">
              Toolkit
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            Beekit is the companion developer toolkit for the Hive ecosystem. It provides
            an SDK and CLI that lets you scaffold, develop, test, and register ATProto bots
            in minutes &mdash; all conforming to the Hive interaction contract out of the box.
          </p>
          <div className="space-y-3 mb-8">
            <Feature text="CLI to scaffold new bot projects instantly" />
            <Feature text="Local dev loop with Bluesky mention polling" />
            <Feature text="Manifest validator against the Hive schema" />
            <Feature text="One-command bot registration to the Hive directory" />
            <Feature text="TypeScript SDK with message routing and parsing" />
          </div>
          <div className="mt-auto flex flex-wrap gap-3">
            <a
              href="https://github.com/embers-workshop/hive-beekit"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-honey-600 hover:bg-honey-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-8 text-center">How It Works</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Step
            number={1}
            title="Scaffold"
            description="Run beekit init to generate a new bot project with config, manifest, and environment templates."
          />
          <Step
            number={2}
            title="Build"
            description="Write your bot logic using the Beekit SDK. It handles ATProto auth, mention polling, and message routing."
          />
          <Step
            number={3}
            title="Register"
            description="Run beekit register to submit your bot to the Hive directory. Your bot is now discoverable."
          />
          <Step
            number={4}
            title="Verify"
            description="Complete proof-of-control by posting a nonce from the bot's Bluesky account. Earn a verified badge."
          />
        </div>
      </section>

      {/* Architecture */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-8 text-center">Architecture</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-honey-400 mb-2">Frontend</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Next.js 15 app with server components. Provides search, category browsing,
                bot detail pages, and operator registration &mdash; all styled with Tailwind CSS.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-honey-400 mb-2">API + Workers</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fastify REST API backed by PostgreSQL and Redis. Background workers continuously
                fetch bot manifests and validate verification proofs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-honey-400 mb-2">Beekit SDK</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                TypeScript SDK with ATProto client utilities, a message router and command
                parser, manifest validation, and a Commander-based CLI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center p-10 bg-gray-900 border border-gray-800 rounded-2xl">
        <h2 className="text-2xl font-semibold mb-3">Ready to build?</h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          Start with Beekit to scaffold your bot, or browse the directory to see
          what others have built.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/embers-workshop/hive-beekit"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-honey-600 hover:bg-honey-500 text-white font-medium rounded-lg transition-colors"
          >
            Install Beekit
          </a>
          <Link
            href="/bots"
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors"
          >
            Explore Bots
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 bg-honey-500 rounded-full mt-2 shrink-0" />
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl">
      <div className="w-8 h-8 bg-honey-600 rounded-full flex items-center justify-center text-sm font-bold text-white mb-3">
        {number}
      </div>
      <h3 className="font-semibold text-gray-200 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
