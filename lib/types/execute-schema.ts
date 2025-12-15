import z from 'zod';

/**
 * Schema describing an execution request.
 */
export const executeSchema = z.object({
  /**
   * Source code to be executed.
   */
  sourceCode: z
    .string('Source code should be a valid string.')
    .min(1, 'Minimal length of the source code is 1 symbol.'),
  /**
   * Maximum execution time in seconds.
   */
  timeoutSeconds: z
    .number('Timeout seconds setting should be a valid number.')
    .min(10, 'Minimum time for a timeout is 10 seconds.')
    .max(120, 'Maximum time for a timeout is 2 minutes.'),
  /**
   * Standard input values passed to the executed program. Each array element
   * represents one stdin input line.
   */
  stdin: z
    .string('The provided stdin should consist of strings.')
    .max(256, 'Maximum length of each stdin argument is 256 symbols.')
    .array()
    .max(100, 'Maximum amount of stdin arguments is 100.'),
});
