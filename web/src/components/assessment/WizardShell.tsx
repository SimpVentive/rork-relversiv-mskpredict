interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
}

export function WizardShell({
  currentStep,
  totalSteps,
  stepName,
  children,
  onBack,
  onNext,
  onSubmit,
  isLoading = false,
}: WizardShellProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-borderLight">
        <div
          className="h-full bg-infoPrimary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="bg-bgSecondary border-b border-borderLight">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-infoPrimary uppercase">
                STEP {currentStep + 1}
              </p>
              <h1 className="text-2xl font-bold text-textPrimary mt-2">
                {stepName}
              </h1>
            </div>
            <div className="text-sm text-textSecondary font-medium">
              {currentStep + 1}/{totalSteps}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-bgPrimary rounded border border-borderLight p-8 space-y-6 shadow-soft">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-bgSecondary border-t border-borderLight">
        <div className="max-w-4xl mx-auto px-6 py-6 flex gap-4">
          <button
            onClick={onBack}
            disabled={currentStep === 0 || isLoading}
            className="px-6 py-2 text-sm font-medium text-textPrimary bg-bgTertiary border border-borderLight rounded hover:bg-borderLight disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          <button
            onClick={isLastStep && onSubmit ? onSubmit : onNext}
            disabled={isLoading}
            className={`flex-1 px-6 py-2 text-sm font-semibold rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isLastStep
                ? "bg-successPrimary hover:bg-opacity-90"
                : "bg-infoPrimary hover:bg-opacity-90"
            }`}
          >
            {isLoading
              ? "Processing..."
              : isLastStep
                ? "Run Prediction"
                : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
