import { describe, it, expect } from 'vitest';
import { validateManifest, ManifestSchema } from '../manifest-schema.js';

describe('ManifestSchema', () => {
  const validManifest = {
    name: 'TestBot',
    did: 'did:plc:abc123',
    operator: 'Test Operator',
    commands: [
      {
        name: 'help',
        description: 'Show help',
        example_mention: '@testbot help',
      },
    ],
    interaction_modes: ['mention', 'reply'],
    schema_version: '1.0',
  };

  it('validates a correct manifest', () => {
    const result = validateManifest(validManifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('TestBot');
      expect(result.data.did).toBe('did:plc:abc123');
      expect(result.data.commands).toHaveLength(1);
    }
  });

  it('rejects manifest missing required fields', () => {
    const result = validateManifest({ name: 'TestBot' });
    expect(result.success).toBe(false);
  });

  it('rejects empty object', () => {
    const result = validateManifest({});
    expect(result.success).toBe(false);
  });

  it('rejects non-object input', () => {
    expect(validateManifest(null).success).toBe(false);
    expect(validateManifest('string').success).toBe(false);
    expect(validateManifest(42).success).toBe(false);
  });

  it('validates manifest with DM policy', () => {
    const manifest = {
      ...validManifest,
      dm: {
        enabled: true,
        privacy_note: 'Messages are not stored',
        retention: '7d',
        opt_out_instructions: 'Send STOP',
      },
    };
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dm?.enabled).toBe(true);
      expect(result.data.dm?.retention).toBe('7d');
    }
  });

  it('rejects invalid DM retention value', () => {
    const manifest = {
      ...validManifest,
      dm: {
        enabled: true,
        retention: 'forever',
      },
    };
    const result = validateManifest(manifest);
    expect(result.success).toBe(false);
  });

  it('validates manifest with safety policy', () => {
    const manifest = {
      ...validManifest,
      safety: {
        refusal_policy: 'No harmful content',
        disallowed_content: ['violence', 'spam'],
        escalation_channel: 'admin@example.com',
      },
    };
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
  });

  it('rejects invalid interaction_modes', () => {
    const manifest = {
      ...validManifest,
      interaction_modes: ['mention', 'invalid_mode'],
    };
    const result = validateManifest(manifest);
    expect(result.success).toBe(false);
  });

  it('defaults schema_version to 1.0', () => {
    const { schema_version, ...noVersion } = validManifest;
    const result = validateManifest(noVersion);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.schema_version).toBe('1.0');
    }
  });

  it('validates manifest with tools and rate_limits', () => {
    const manifest = {
      ...validManifest,
      tools: ['github', 'web', 'code_execution'],
      rate_limits: { requests_per_hour: 100, burst: 10 },
    };
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools).toHaveLength(3);
    }
  });

  it('validates manifest with multiple commands', () => {
    const manifest = {
      ...validManifest,
      commands: [
        { name: 'help', description: 'Show help' },
        { name: 'status', description: 'Check status', args_schema: { service: 'string' } },
        { name: 'deploy', description: 'Deploy code', response_contract: 'Returns job ID' },
      ],
    };
    const result = validateManifest(manifest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.commands).toHaveLength(3);
    }
  });
});
