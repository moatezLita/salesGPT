// app/analyze/[id]/page.js
'use client';

import { AnalysisResults } from "@/components/analyze/AnalysisResults";
import { EmailGeneration } from "@/components/email/EmailGeneration";

export default function AnalysisPage({ params }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Analysis Results</h1>
      <AnalysisResults analysisId={params.id} />
      <EmailGeneration analysisId={params.id} />

    </div>
  );
}