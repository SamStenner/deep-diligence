import { AgentConfigList } from "@/components/agent-config";
import { Layout } from "@/components/layout";
import { getAgentToolsMetadata } from "@/lib/research/agents/sub.agents";

export default function AgentsPage() {
  const agentToolsMetadata = getAgentToolsMetadata();
  const totalTools = agentToolsMetadata.reduce(
    (acc, agent) => acc + agent.tools.length,
    0
  );

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
        </div>

        <AgentConfigList agents={agentToolsMetadata} />
      </div>
    </Layout>
  );
}
