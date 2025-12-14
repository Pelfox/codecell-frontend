import z from 'zod';

export const executeSchema = z.object({
  sourceCode: z
    .string('Source code should be a valid string.')
    .min(1, 'Minimal length of the source code is 1 symbol.'),
  timeoutSeconds: z
    .number('Timeout seconds setting should be a valid number.')
    .min(10, 'Minimum time for a timeout is 10 seconds.')
    .max(120, 'Maximum time for a timeout is 2 minutes.'),
  stdin: z
    .string('The provided stdin should consist of strings.')
    .max(256, 'Maximum length of each stdin argument is 256 symbols.')
    .array()
    .max(100, 'Maximum amount of stdin arguments is 100.'),
});
