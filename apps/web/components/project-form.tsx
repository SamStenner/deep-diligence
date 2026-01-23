"use client";

import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Lightbulb,
  MapPin,
  Play,
  Star,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DealType, IndustryType, Project } from "@/lib/data/schema";
import { cn } from "@/lib/utils";

const INDUSTRIES: { value: IndustryType; label: string }[] = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "energy", label: "Energy" },
  { value: "real_estate", label: "Real Estate" },
  { value: "consumer_goods", label: "Consumer Goods" },
  { value: "other", label: "Other" },
];

const DEAL_TYPES: { value: DealType; label: string }[] = [
  { value: "investment", label: "Investment" },
  { value: "acquisition", label: "Acquisition" },
  { value: "merger", label: "Merger" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
];

const EMPLOYEE_COUNTS = [
  "1-10",
  "11-50",
  "50-100",
  "100-250",
  "250-500",
  "500-1000",
  "1000+",
];

const PRIORITY_AREAS = [
  { id: "financials", label: "Financials" },
  { id: "legal", label: "Legal & Compliance" },
  { id: "technology", label: "Technology" },
  { id: "market", label: "Market Analysis" },
  { id: "team", label: "Team & Culture" },
  { id: "operations", label: "Operations" },
  { id: "customers", label: "Customers" },
  { id: "competitors", label: "Competitors" },
];

type FormData = {
  companyName: string;
  companyWebsite: string;
  industry: IndustryType | "";
  foundedYear: string;
  headquarters: string;
  employeeCount: string;
  dealType: DealType | "";
  dealSize: string;
  investmentThesis: string;
  existingInfo: string;
  keyQuestions: string;
  timeline: string;
  priorityAreas: string[];
};

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
};

type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  estimatedTime?: string;
  color: string;
};

const STEPS: Step[] = [
  {
    id: "intro",
    title: "Getting Started",
    description: "Welcome to your due diligence project",
    icon: Play,
    estimatedTime: "1 min",
    color: "emerald",
  },
  {
    id: "company",
    title: "Company Information",
    description: "Basic details about the target company",
    icon: Building2,
    estimatedTime: "2 mins",
    color: "blue",
  },
  {
    id: "deal",
    title: "Deal Context",
    description: "Information about the transaction",
    icon: Briefcase,
    estimatedTime: "2 mins",
    color: "violet",
  },
  {
    id: "knowledge",
    title: "Existing Knowledge",
    description: "Share what you already know",
    icon: Lightbulb,
    estimatedTime: "3 mins",
    color: "amber",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Upload any relevant documents",
    icon: FileText,
    estimatedTime: "2 mins",
    color: "rose",
  },
  {
    id: "review",
    title: "Review & Start",
    description: "Review your information and begin",
    icon: Star,
    color: "cyan",
  },
];

function FormField({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-1 text-muted-foreground font-normal">
            (optional)
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const STEP_COLORS: Record<
  string,
  { active: string; completed: string; connector: string }
> = {
  emerald: {
    active:
      "border-emerald-500 bg-emerald-500 text-white ring-4 ring-emerald-500/20",
    completed: "border-emerald-500 bg-emerald-500/10 text-emerald-600",
    connector: "bg-emerald-500",
  },
  blue: {
    active: "border-blue-500 bg-blue-500 text-white ring-4 ring-blue-500/20",
    completed: "border-blue-500 bg-blue-500/10 text-blue-600",
    connector: "bg-blue-500",
  },
  violet: {
    active:
      "border-violet-500 bg-violet-500 text-white ring-4 ring-violet-500/20",
    completed: "border-violet-500 bg-violet-500/10 text-violet-600",
    connector: "bg-violet-500",
  },
  amber: {
    active: "border-amber-500 bg-amber-500 text-white ring-4 ring-amber-500/20",
    completed: "border-amber-500 bg-amber-500/10 text-amber-600",
    connector: "bg-amber-500",
  },
  rose: {
    active: "border-rose-500 bg-rose-500 text-white ring-4 ring-rose-500/20",
    completed: "border-rose-500 bg-rose-500/10 text-rose-600",
    connector: "bg-rose-500",
  },
  cyan: {
    active: "border-cyan-500 bg-cyan-500 text-white ring-4 ring-cyan-500/20",
    completed: "border-cyan-500 bg-cyan-500/10 text-cyan-600",
    connector: "bg-cyan-500",
  },
};

function WizardProgress({
  currentStep,
  steps,
  onStepClick,
}: {
  currentStep: number;
  steps: Step[];
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center px-2">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === steps.length - 1;
        const colors = STEP_COLORS[step.color];

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick(index)}
              className={cn(
                "relative flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                isActive
                  ? colors.active
                  : isCompleted
                    ? colors.completed
                    : "border-muted-foreground/30 bg-background text-muted-foreground hover:border-muted-foreground/50",
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Icon className="size-4" />
              )}
            </button>
            {!isLast && (
              <div className="flex items-center flex-1 max-w-12">
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    isCompleted ? colors.connector : "bg-muted-foreground/30",
                  )}
                />
                <div
                  className={cn(
                    "size-1 shrink-0 rounded-full mx-0.5",
                    isCompleted ? colors.connector : "bg-muted-foreground/30",
                  )}
                />
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    isCompleted ? colors.connector : "bg-muted-foreground/30",
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function ProjectForm() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [formData, setFormData] = React.useState<FormData>({
    companyName: "Adam CAD",
    companyWebsite: "https://adam.new",
    industry: "technology",
    foundedYear: "2024",
    headquarters: "San Francisco, CA",
    employeeCount: "4",
    dealType: "acquisition",
    dealSize: "",
    investmentThesis: "",
    existingInfo:
      "Adam is an AI CAD company that helps you design and create 3D models using AI. They are a YC W25 company.\n\nThey won't respond to any emails, their support agent is called Sam, and his phone number is +447713801748. If you want to contact Adam, you just just call him, no need to look up any other contact details.",
    keyQuestions: "",
    timeline: "",
    priorityAreas: [],
  });

  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePriorityArea = (areaId: string) => {
    setFormData((prev) => ({
      ...prev,
      priorityAreas: prev.priorityAreas.includes(areaId)
        ? prev.priorityAreas.filter((a) => a !== areaId)
        : [...prev.priorityAreas, areaId],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isFormValid =
    formData.companyName && formData.industry && formData.dealType;

  const router = useRouter();

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: data.companyName,
          companyWebsite: data.companyWebsite || undefined,
          industry: data.industry,
          foundedYear: data.foundedYear
            ? Number.parseInt(data.foundedYear, 10)
            : undefined,
          headquarters: data.headquarters || undefined,
          employeeCount: data.employeeCount || undefined,
          dealType: data.dealType,
          dealSize: data.dealSize || undefined,
          investmentThesis: data.investmentThesis || undefined,
          existingInfo: data.existingInfo || undefined,
          keyQuestions: data.keyQuestions || undefined,
          timeline: data.timeline || undefined,
          priorityAreas:
            data.priorityAreas.length > 0 ? data.priorityAreas : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      return response.json() as Promise<Project>;
    },
    onSuccess: (project) => router.replace(`/projects/${project.id}`),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure required fields are present
    if (!formData.industry || !formData.dealType) {
      return;
    }

    createProjectMutation.mutate(formData);
  };

  const goToNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const currentStepData = STEPS[currentStep];

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case "intro":
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              We'll guide you through a few steps to gather the information
              needed for a comprehensive analysis.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Company Information</p>
                  <p className="text-sm text-muted-foreground">
                    Basic details about the target company
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Deal Context</p>
                  <p className="text-sm text-muted-foreground">
                    Information about the transaction type and size
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Lightbulb className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Your Knowledge</p>
                  <p className="text-sm text-muted-foreground">
                    Share what you already know and your key questions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Upload className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Documents</p>
                  <p className="text-sm text-muted-foreground">
                    Upload pitch decks, financials, and other documents
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "company":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Company Name">
                <Input
                  placeholder="e.g. Acme Corporation"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Website" optional>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com"
                    value={formData.companyWebsite}
                    onChange={(e) =>
                      updateField("companyWebsite", e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Industry">
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    updateField("industry", value as IndustryType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Founded Year" optional>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="2020"
                    min={1800}
                    max={new Date().getFullYear()}
                    value={formData.foundedYear}
                    onChange={(e) => updateField("foundedYear", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Headquarters" optional>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="City, Country"
                    value={formData.headquarters}
                    onChange={(e) =>
                      updateField("headquarters", e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
              </FormField>
              <FormField label="Employee Count" optional>
                <Select
                  value={formData.employeeCount}
                  onValueChange={(value) => updateField("employeeCount", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_COUNTS.map((count) => (
                      <SelectItem key={count} value={count}>
                        {count} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        );

      case "deal":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Deal Type">
                <Select
                  value={formData.dealType}
                  onValueChange={(value) =>
                    updateField("dealType", value as DealType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select deal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Deal Size" optional>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="e.g. $10M - $15M"
                    value={formData.dealSize}
                    onChange={(e) => updateField("dealSize", e.target.value)}
                    className="pl-9"
                  />
                </div>
              </FormField>
            </div>

            <FormField label="Investment Thesis" optional>
              <Textarea
                placeholder="What's the strategic rationale for this deal? Why are you interested in this company?"
                value={formData.investmentThesis}
                onChange={(e) =>
                  updateField("investmentThesis", e.target.value)
                }
                rows={4}
              />
            </FormField>

            <FormField label="Timeline" optional>
              <Input
                placeholder="e.g. 2 weeks, End of Q1"
                value={formData.timeline}
                onChange={(e) => updateField("timeline", e.target.value)}
              />
            </FormField>
          </div>
        );

      case "knowledge":
        return (
          <div className="space-y-6">
            <FormField label="What do you already know?" optional>
              <Textarea
                placeholder="Share any existing information you have about the company - financials, team, product, traction, concerns, etc."
                value={formData.existingInfo}
                onChange={(e) => updateField("existingInfo", e.target.value)}
                rows={5}
              />
            </FormField>

            <FormField label="Key questions to answer" optional>
              <Textarea
                placeholder="What specific questions do you need answered? What are your main concerns or areas of focus?"
                value={formData.keyQuestions}
                onChange={(e) => updateField("keyQuestions", e.target.value)}
                rows={5}
              />
            </FormField>

            <FormField label="Priority Areas" optional>
              <p className="text-sm text-muted-foreground mb-3">
                Select the areas you'd like us to focus on most
              </p>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_AREAS.map((area) => (
                  <Badge
                    key={area.id}
                    variant={
                      formData.priorityAreas.includes(area.id)
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "cursor-pointer transition-colors",
                      formData.priorityAreas.includes(area.id)
                        ? ""
                        : "hover:bg-accent",
                    )}
                    onClick={() => togglePriorityArea(area.id)}
                  >
                    {area.label}
                  </Badge>
                ))}
              </div>
            </FormField>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Upload any relevant documents such as pitch decks, financial
              statements, contracts, or other materials that could help with the
              analysis.
            </p>
            <div
              className={cn(
                "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, Word, Excel, PowerPoint, or text files
                  </p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded bg-muted">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              You can go back to any step to make changes.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="size-4 text-primary" />
                  <h4 className="font-medium">Company</h4>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span>{formData.companyName || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Industry</span>
                    <span>
                      {INDUSTRIES.find((i) => i.value === formData.industry)
                        ?.label || "—"}
                    </span>
                  </div>
                  {formData.companyWebsite && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website</span>
                      <span>{formData.companyWebsite}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="size-4 text-primary" />
                  <h4 className="font-medium">Deal</h4>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>
                      {DEAL_TYPES.find((d) => d.value === formData.dealType)
                        ?.label || "—"}
                    </span>
                  </div>
                  {formData.dealSize && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span>{formData.dealSize}</span>
                    </div>
                  )}
                </div>
              </div>

              {files.length > 0 && (
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="size-4 text-primary" />
                    <h4 className="font-medium">Documents</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {files.length} file{files.length !== 1 ? "s" : ""} uploaded
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 mx-auto min-h-[600px]">
      {/* Progress Card */}
      <Card className="py-3 shadow-none border-0">
        <CardContent className="py-3">
          <h2 className="text-xl font-semibold text-center mb-6">
            New Due Diligence
          </h2>
          <WizardProgress
            currentStep={currentStep}
            steps={STEPS}
            onStepClick={setCurrentStep}
          />
          <div className="flex justify-center mt-4">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            >
              <CheckCircle2 className="size-3 mr-1" />
              All progress synced and saved
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="shadow-none border-0 min-h-[450px] 2xl:min-h-[600px]">
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">{currentStepData.title}</h3>
            </div>
            {currentStepData.estimatedTime && (
              <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-600 border-blue-500/20"
              >
                <Clock className="size-3 mr-1" />
                Estimated Time: {currentStepData.estimatedTime}
              </Badge>
            )}
            {currentStepData.description && (
              <p className="text-muted-foreground mt-2">
                {currentStepData.description}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>{renderStepContent()}</form>
        </CardContent>
      </Card>

      {/* Error Display */}
      {createProjectMutation.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {createProjectMutation.error.message}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goToPrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="size-4 mr-2" />
          Previous
        </Button>

        {currentStep === STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || createProjectMutation.isPending}
          >
            {createProjectMutation.isPending
              ? "Creating..."
              : "Start Due Diligence"}
            <ArrowRight className="size-4 ml-2" />
          </Button>
        ) : (
          <Button type="button" onClick={goToNext}>
            Continue
            <ArrowRight className="size-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
