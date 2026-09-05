"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { createProject } from "../app/actions/project-actions";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Input";

const STEPS = [
  {
    id: "name",
    title: "Name your pipeline",
    description: "What should we call this intelligence pipeline?",
    field: "name",
    placeholder: "e.g., Enterprise SaaS Monitor",
  },
  {
    id: "productDescription",
    title: "What do you sell?",
    description: "Briefly describe your product and the exact problems it solves. We use this to evaluate if a conversation is genuinely a good fit.",
    field: "productDescription",
    placeholder: "We sell an AI-powered customer support tool that helps teams reduce ticket resolution time. Our ideal customer is a B2B SaaS with high ticket volume.",
    isTextarea: true,
  },
  {
    id: "keywords",
    title: "What conversations matter?",
    description: "List the keywords, competitor names, or phrases that indicate someone might need your product. (Comma separated)",
    field: "keywords",
    placeholder: "e.g., intercom, zendesk alternative, ai customer support",
  },
  {
    id: "sources",
    title: "Where should we look?",
    description: "List the subreddits where your buyers hang out. (Comma separated)",
    field: "sources",
    placeholder: "e.g., saas, startups, sideproject",
  }
];

export function NewProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    productDescription: "",
    keywords: "",
    sources: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));

    try {
      const result = await createProject(data);
      if (result.error) {
        setError(result.error);
      } else if (result.projectId) {
        router.push(`/projects/${result.projectId}/leads`);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  const step = STEPS[currentStep];
  if (!step) return null;

  const field = step.field as string;
  const isLastStep = currentStep === STEPS.length - 1;
  const canProceed = formData[field] && formData[field].trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {/* Step indicator — a segmented readout in the same family as the
          score meter, not a numbered-circle stepper. */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 flex-1 transition-colors duration-300 ${
                i <= currentStep ? "bg-signal" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="signal-dash font-terminal text-sm tracking-widest text-signal uppercase">
          [ Step {currentStep + 1} of {STEPS.length} ]
        </p>
      </div>

      <div className="pixel-frame border-2 border-border bg-card shadow-pixel p-8 sm:p-12 min-h-[380px] flex flex-col">
        {error && (
          <div className="mb-6 border-2 border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-3 text-balance">{step.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{step.description}</p>
            </div>

            <div className="flex-1">
              {step.isTextarea ? (
                <Textarea
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  placeholder={step.placeholder}
                  className="h-32"
                  autoFocus
                />
              ) : (
                <Input
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  placeholder={step.placeholder}
                  className="h-12"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canProceed) {
                      e.preventDefault();
                      isLastStep ? handleSubmit() : handleNext();
                    }
                  }}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0 || loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || loading}
              className="min-w-[160px]"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing</>
              ) : (
                <>{"[ Create pipeline "}<Check className="mx-1.5 h-4 w-4" />{" ]"}</>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
