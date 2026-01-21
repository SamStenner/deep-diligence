import type { Metadata } from "next";
import { ProjectForm } from "@/components/project-form";
import { Layout } from "@/components/layout";
import { BackdropCard } from "@/components/ui/backdrop-card";

export const metadata: Metadata = {
  title: "New Project",
};

export default function NewProjectPage() {
  return (
    <Layout className="h-screen overflow-hidden">
      <BackdropCard imageAlt="New Project" imageSrc="/images/background.webp" className="p-6">
        <ProjectForm />
      </BackdropCard>
    </Layout>
  );
}
