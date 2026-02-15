export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Documentation</h1>
      <p className="text-gray-400 mb-10">
        Everything you need to know about registering and operating bots on the Hive registry.
      </p>

      {/* Manifest Schema */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Bot Manifest Schema</h2>
        <p className="text-gray-300 mb-4 leading-relaxed">
          Every bot registered with Hive can provide a manifest file, a JSON document hosted at a
          well-known URL that describes the bot&apos;s capabilities, commands, and interaction
          contract. The manifest allows automated discovery and validation.
        </p>
        <p className="text-gray-400 mb-4 text-sm">
          The recommended location is{' '}
          <code className="px-1.5 py-0.5 bg-gray-800 rounded text-honey-400 text-xs">
            https://your-domain.com/.well-known/bot-manifest.json
          </code>
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-500 font-mono">
            bot-manifest.json
          </div>
          <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
            <code>{`{
  "$schema": "https://hive.example.com/schemas/bot-manifest/v1.json",
  "did": "did:plc:abc123...",
  "handle": "mybot.bsky.social",
  "display_name": "My Bot",
  "description": "A helpful bot that does things.",
  "operator": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "website": "https://example.com"
  },
  "categories": ["utility", "devops"],
  "commands": [
    {
      "name": "help",
      "description": "Show available commands",
      "example": "@mybot.bsky.social help"
    },
    {
      "name": "status",
      "description": "Check system status",
      "example": "@mybot.bsky.social status <service>"
    }
  ],
  "capabilities": [
    "Responds to mentions",
    "Processes images",
    "Rate-limited to 100 requests/hour"
  ],
  "interaction_modes": ["mention", "direct_message"],
  "response_format": {
    "type": "text",
    "max_length": 300,
    "language": "en"
  },
  "rate_limits": {
    "requests_per_hour": 100,
    "burst": 10
  }
}`}</code>
          </pre>
        </div>
      </section>

      {/* Interaction Contract */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Interaction Contract</h2>
        <p className="text-gray-300 mb-4 leading-relaxed">
          Hive bots follow a standard interaction contract based on ATProto mentions. Users
          interact with bots by mentioning them in posts, and bots respond in-thread.
        </p>

        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-honey-400">Mentions as Commands</h3>
            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
              To invoke a bot command, mention the bot&apos;s handle followed by the command name
              and any arguments:
            </p>
            <code className="block p-3 bg-gray-950 rounded-lg text-sm text-gray-300 font-mono">
              @mybot.bsky.social status api-service
            </code>
            <p className="text-xs text-gray-500 mt-2">
              The bot parses the mention text, extracts the command, and responds accordingly.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-honey-400">Response Format</h3>
            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
              Bots should respond as a reply in the same thread. Responses should be:
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-honey-500 rounded-full mt-1.5 shrink-0" />
                Concise and within character limits (typically 300 characters)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-honey-500 rounded-full mt-1.5 shrink-0" />
                Clearly formatted with relevant information
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-honey-500 rounded-full mt-1.5 shrink-0" />
                Delivered within a reasonable time (under 30 seconds for most commands)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-honey-500 rounded-full mt-1.5 shrink-0" />
                Respectful of rate limits and platform guidelines
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-honey-400">Error Handling</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              When a bot cannot process a request, it should respond with a helpful error message
              rather than failing silently. Include the reason for failure and, if applicable,
              suggest the correct usage. For example:
            </p>
            <code className="block p-3 bg-gray-950 rounded-lg text-sm text-gray-300 font-mono mt-3">
              Sorry, I don&apos;t recognize the command &quot;stats&quot;. Did you mean &quot;status&quot;? Try: @mybot help
            </code>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Verification Process</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Verification proves that the person registering a bot on Hive actually controls the
          associated ATProto account. Verified bots receive a trust badge displayed in the
          directory.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="w-8 h-8 bg-honey-600 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-200">Register your bot</h3>
              <p className="text-sm text-gray-400 mt-1">
                Submit your bot&apos;s DID, handle, description, and optional manifest URL. You will
                receive a one-time listing secret to manage your bot. The bot appears in the directory
                as &quot;unverified.&quot;
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="w-8 h-8 bg-honey-600 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-200">Start verification</h3>
              <p className="text-sm text-gray-400 mt-1">
                Request a verification nonce from the API using your listing secret. You will receive
                a unique code to prove ownership.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="w-8 h-8 bg-honey-600 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-200">Post the nonce</h3>
              <p className="text-sm text-gray-400 mt-1">
                Post the verification nonce from the bot&apos;s ATProto account (in a post or in the
                profile description). The registry will check for the nonce and, once confirmed,
                upgrade the bot&apos;s trust badge to &quot;verified.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference link */}
      <section className="p-6 bg-gray-900 border border-gray-800 rounded-xl text-center">
        <h2 className="text-lg font-semibold mb-2">API Reference</h2>
        <p className="text-sm text-gray-400 mb-4">
          The Hive API is a RESTful Fastify service. All endpoints accept and return JSON.
        </p>
        <div className="inline-flex flex-wrap gap-3 text-sm">
          <code className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300">
            GET /bots
          </code>
          <code className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300">
            GET /bots/:did
          </code>
          <code className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300">
            POST /bots
          </code>
          <code className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300">
            PATCH /bots/:did
          </code>
          <code className="px-3 py-1.5 bg-gray-800 rounded-lg text-gray-300">
            POST /bots/:did/verify
          </code>
        </div>
      </section>
    </div>
  );
}
