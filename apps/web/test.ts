import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function executePhoneCall(
  { to }: { to: string },
) {
  const call = await elevenlabs.conversationalAi.twilio.outboundCall({
    agentId: "agent_8301kfhhaca4ert90ghs9j0qcy7n",
    agentPhoneNumberId: "phnum_5201kfhj7swde5gvjjqasg1qeb6d",
    toNumber: to,
  })
  return call;
}

executePhoneCall({ to: "+447713801748" }).then(console.log);