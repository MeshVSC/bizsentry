
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const googleApiKey = process.env.GOOGLE_API_KEY;
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!googleApiKey || googleApiKey.trim() === "") {
  const baseMessage = "GOOGLE_API_KEY is missing or empty.";
  const fullMessage = `Missing or empty env.GOOGLE_API_KEY. Please ensure it is set in your .env file (as per README.md) and that the file is being loaded correctly by your environment for Genkit Google AI plugin.`;

  if (isBuildPhase) {
    console.error(`[Genkit GoogleAI Init Error - BUILD PHASE] ${baseMessage}`);
    console.error("[Genkit GoogleAI Init Error - BUILD PHASE] This is required for AI features. Check your CI/CD or hosting provider's environment variable settings, or ensure your .env file is correctly populated and included in the build context.");
    throw new Error(`BUILD ERROR: ${fullMessage}`);
  } else {
    // In development or runtime, it might be preferable to log a warning and let the app start,
    // with AI features failing later. However, for consistency with Supabase key checks and
    // to prevent unexpected runtime failures of AI features, throwing an error is clearer.
    console.error(`[Genkit GoogleAI Init Error] ${baseMessage}`);
    // throw new Error(fullMessage); // Optionally, you might want to throw here to stop the dev server too.
                                 // For now, let's log an error and allow dev server to start, AI features will fail.
                                 // Re-instating throw for consistency with Supabase key handling during startup/build.
     throw new Error(fullMessage);
  }
}

export const ai = genkit({
  plugins: [googleAI()], // GOOGLE_API_KEY is used internally by googleAI()
  model: 'googleai/gemini-2.0-flash',
});

