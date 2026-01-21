import type { Metadata } from "next";
import { ProjectForm } from "@/components/project-form";
import { Layout } from "@/components/layout";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "New Project",
};

export default function NewProjectPage() {
  return (
    <Layout className="h-screen overflow-hidden">
      <div className="relative h-full overflow-hidden">
        <ScrollArea className="h-full relative">
          <Image
            src="/images/background.webp"
            alt="New Project"
            width={1000}
            height={1000}
            className="w-full absolute top-0 left-0 h-full rounded-xl object-cover"
          />
          <div className="grid min-h-[calc(100vh-6rem)] place-items-center px-6 sm:px-10 max-w-3xl 2xl:max-w-3xl mx-auto">
            <div className="w-full">
              <div className="relative p-3.5">
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-card/70 backdrop-blur-xs" />
                <div className="relative">
                  <ProjectForm />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
}
