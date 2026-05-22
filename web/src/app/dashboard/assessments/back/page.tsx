import Link from "next/link";

export default function BackAssessmentPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="rounded-3xl border border-borderLight bg-white p-10 shadow-soft">
        <h1 className="text-4xl font-bold mb-4">Back Assessment</h1>
        <p className="text-textSecondary mb-6">
          Start a lower back pain assessment and generate a risk prediction.
        </p>
        <p className="mb-8 text-sm text-textSecondary">
          The assessment workflow is available here. Use this page to collect patient data and run the prediction engine.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
