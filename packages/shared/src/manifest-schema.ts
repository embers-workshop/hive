import { z, ZodError } from 'zod';

export const CommandSchema = z.object({
  name: z.string(),
  description: z.string(),
  args_schema: z.record(z.unknown()).optional(),
  example_mention: z.string().optional(),
  response_contract: z.string().optional(),
});

export const DmPolicySchema = z.object({
  enabled: z.boolean(),
  privacy_note: z.string().optional(),
  retention: z.enum(['none', '7d', '30d']),
  opt_out_instructions: z.string().optional(),
});

export const SafetySchema = z.object({
  refusal_policy: z.string().optional(),
  disallowed_content: z.array(z.string()).optional(),
  escalation_channel: z.string().optional(),
});

export const ManifestSchema = z.object({
  name: z.string(),
  did: z.string(),
  operator: z.string(),
  commands: z.array(CommandSchema),
  interaction_modes: z.array(
    z.enum(['mention', 'reply', 'dm', 'scheduled']),
  ),
  dm: DmPolicySchema.optional(),
  rate_limits: z.record(z.unknown()).optional(),
  tools: z.array(z.string()).optional(),
  safety: SafetySchema.optional(),
  schema_version: z.string().default('1.0'),
});

export type Manifest = z.infer<typeof ManifestSchema>;
export type Command = z.infer<typeof CommandSchema>;
export type DmPolicy = z.infer<typeof DmPolicySchema>;
export type Safety = z.infer<typeof SafetySchema>;

export function validateManifest(
  input: unknown,
): { success: true; data: Manifest } | { success: false; errors: ZodError } {
  const result = ManifestSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
