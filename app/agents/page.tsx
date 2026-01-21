import * as icons from "lucide-react";
import { Layout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subAgentRegistry } from "@/lib/research/agents/sub.agents";

export default function AgentsPage() {
  const agents = Object.entries(subAgentRegistry);

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Available research agents for due diligence
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {agents.map(([id, agent]) => {
            const Icon = icons[agent.icon] ?? icons.Bot;
            return (
              <Card key={id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {agent.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{agent.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
