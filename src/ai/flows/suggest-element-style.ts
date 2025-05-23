// src/ai/flows/suggest-element-style.ts
'use server';

/**
 * @fileOverview A flow that suggests CSS styles for an HTML element based on a natural language prompt.
 *
 * - suggestElementStyle - A function that accepts a description of the desired style and returns CSS rules.
 * - SuggestElementStyleInput - The input type for the suggestElementStyle function.
 * - SuggestElementStyleOutput - The return type for the suggestElementStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestElementStyleInputSchema = z.object({
  elementDescription: z
    .string()
    .describe(
      'A natural language description of the desired style for the HTML element.'
    ),
});
export type SuggestElementStyleInput = z.infer<typeof SuggestElementStyleInputSchema>;

const SuggestElementStyleOutputSchema = z.object({
  cssRules: z
    .string()
    .describe('CSS rules that implement the described style.'),
});
export type SuggestElementStyleOutput = z.infer<typeof SuggestElementStyleOutputSchema>;

export async function suggestElementStyle(input: SuggestElementStyleInput): Promise<SuggestElementStyleOutput> {
  return suggestElementStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestElementStylePrompt',
  input: {schema: SuggestElementStyleInputSchema},
  output: {schema: SuggestElementStyleOutputSchema},
  prompt: `You are an expert CSS developer.  You will generate CSS rules based on the description of the element provided.

Description: {{{elementDescription}}}
`,
});

const suggestElementStyleFlow = ai.defineFlow(
  {
    name: 'suggestElementStyleFlow',
    inputSchema: SuggestElementStyleInputSchema,
    outputSchema: SuggestElementStyleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
