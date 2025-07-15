// Stepper.jsx
import { Check } from "lucide-react";

export default function Stepper({ steps, activeStep }) {
  return (
    <div className="flex items-center justify-center mb-8 w-full gap-4">
      {steps.map((label, idx) => (
        <div className="flex items-center gap-2" key={label}>
          <div
            className={[
              "w-10 h-10 rounded-full flex items-center justify-center font-bold transition",
              idx < activeStep
                ? "bg-primary text-white"
                : idx === activeStep
                ? "border-2 border-primary text-primary bg-white"
                : "bg-gray-200 text-gray-400",
            ].join(" ")}
          >
            {idx < activeStep ? <Check className="w-10 h-10" /> : idx + 1}
          </div>
          <span className="text-sm max-w-[72px] text-center">{label}</span>
          {idx < steps.length - 1 && (
            <div
              className={[
                "h-1 w-8 rounded-full transition-all duration-200",
                idx < activeStep ? "bg-primary" : "bg-gray-200",
              ].join(" ")}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
}
