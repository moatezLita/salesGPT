// app/analyze/page.js
import { AnalyzeForm } from "@/components/analyze/AnalyzeForm";
import { RecentAnalyses } from "@/components/analyze/RecentAnalyses";

export default function AnalyzePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Website Analysis</h1>
      <div className="space-y-8">
        <AnalyzeForm />
        <RecentAnalyses />
      </div>
    </div>
  );
}