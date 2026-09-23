import { z } from "zod";

export const PatchResponseSchema = z.object({
  diagnosis: z.string().describe("what's wrong with the code"),
  patchedCode: z.string().describe("the full corrected file content"),
  confidence: z.number().min(0).max(1),
});

export type PatchResponse = z.infer<typeof PatchResponseSchema>;

export const FixRequestSchema = z.object({
  taskId: z.string(),
  buggyCode: z.string(),
  failingTest: z.string(),
  retryCount: z.number().int().nonnegative(),
});

export type FixRequest = z.infer<typeof FixRequestSchema>;

export const FixAttemptSchema = z.object({
  taskId: z.string(),
  attemptNumber: z.number().int().positive(),
  codeVersion: z.string(),
  testResult: z.string(),
  diagnosis: z.string().optional(),
  succeeded: z.boolean(),
  createdAt: z.string(),
});

export type FixAttempt = z.infer<typeof FixAttemptSchema>;
