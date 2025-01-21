import { SetupStep } from "@/lib/setup-config";
import { FC } from "react";

interface ProgressIndicatorProps {
  steps: SetupStep[];
  currentStep: string;
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
  // Sort steps by order before rendering
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  
  return (
    <div className="flex justify-between mt-auto p-4 border-t">
      {sortedSteps.map((step, index) => (
        <div key={step.id} className={`flex items-center ${currentStep === step.id ? 'text-primary' : 'text-muted-foreground'}`}>
          <span>{step.title}</span>
          {index < sortedSteps.length - 1 && <span className="mx-2">→</span>}
        </div>
      ))}
    </div>
  );
}; 