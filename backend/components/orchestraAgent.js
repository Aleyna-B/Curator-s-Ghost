// ============================================
// ORCHESTRATOR AGENT (io.net Reasoning Agent)
// ============================================

/**
 * Uses io.net's reasoning_agent to classify
 * a follow-up question about an artwork.
 *
 * This is a TRUE agent call, not a chat completion.
 */
const axios = require('axios');

async function orchestratorAgent({ message }) {
    const payload = {
        objective: `
A user is asking a follow-up question about a painting in a museum.

Classify the question into:
- intent: expand | historical | critique | comparison
- focus: technique | symbolism | historical_context | artist_influence | general

User question:
"${message}"

Return ONLY valid JSON.
`,
        agent_names: ["reasoning_agent"],
        args: {
            type: "solve_with_reasoning",
            name: "reasoning_agent",
            objective:
                "A logic-driven problem solver that breaks down complex scenarios into clear, step-by-step conclusions.",
            instructions:
                "Break down the user's question and return a structured classification."
        }
    };

    const response = await axios.post(
        "https://api.intelligence.io.solutions/api/v1/workflows/run",
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.IOINTELLIGENCE_API_KEY}`
            }
        }
    );

    const agentOutput =
        response.data?.result ||
        response.data?.outputs?.[0]?.content;

    return JSON.parse(agentOutput);
}

module.exports = {
    orchestratorAgent
};