// components/analyze/RecentAnalyses.js
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAnalyses } from '@/services/queries/useAnalyze';
import { Loader2, Globe, Calendar, ExternalLink, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function RecentAnalyses() {
  const { data, isLoading } = useAnalyses();
  const router = useRouter();
  const analyses = data?.analyses || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading recent analyses...</p>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Start by analyzing a website above to see your analysis history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Recent Analyses</h2>
        <p className="text-sm text-gray-500">{analyses.length} websites analyzed</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {analyses.map((analysis) => (
          <motion.div key={analysis._id} variants={item}>
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-100">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg line-clamp-1">
                      {analysis.website_data?.title || 'Unknown Website'}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <a 
                      href={analysis.website_data?.final_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2 group-hover:text-blue-600 transition-colors"
                    >
                      <span className="truncate">{analysis.website_data?.final_url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-2" />
                      {formatDate(analysis.created_at)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/analyze/${analysis._id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}