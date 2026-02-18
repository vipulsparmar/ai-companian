import { generalAIScenario } from './generalAI';

import type { RealtimeAgent } from '@openai/agents/realtime';

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  generalAI: generalAIScenario,
};

export const defaultAgentSetKey = 'generalAI';
