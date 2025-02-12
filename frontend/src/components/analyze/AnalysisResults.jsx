import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Mail, Building2, Target, Lightbulb, AlertTriangle, Users, LineChart, MessageSquare } from 'lucide-react';
import { useAnalysis } from '@/services/queries/useAnalyze';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const AnalysisSection = ({ icon: Icon, title, children }) => (
  <motion.div
    {...fadeIn}
    className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <h4 className="font-semibold text-lg text-gray-800">{title}</h4>
    </div>
    <div className="text-gray-600 space-y-2">
      {children}
    </div>
  </motion.div>
);

const ListItem = ({ children }) => (
  <li className="flex items-start gap-2 mb-2">
    <span className="mt-2 w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0" />
    <span>{children}</span>
  </li>
);

export function AnalysisResults({ analysisId }) {
  const router = useRouter();
  const { data, isLoading, error } = useAnalysis(analysisId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing website data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load analysis results: {error.message}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/analyze')}
              className="mx-auto"
            >
              Try Another Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.analysis?.website_data || !data?.analysis?.analysis) {
    return (
      <Card className="bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Invalid analysis data format</p>
            <Button
              variant="outline"
              onClick={() => router.push('/analyze')}
              className="mx-auto"
            >
              Try Another Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { website_data, analysis } = data.analysis;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div 
        {...fadeIn}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {website_data?.title || 'Unknown Website'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {website_data.meta_description}
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website Information */}
        <AnalysisSection icon={Globe} title="Website Information">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">URL</span>
              <a href={website_data.final_url} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">{website_data.final_url}</a>
            </div>
            {website_data.contact_info?.email && (
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Contact</span>
                <a href={`mailto:${website_data.contact_info.email}`} 
                   className="text-blue-600 hover:underline">{website_data.contact_info.email}</a>
              </div>
            )}
          </div>
        </AnalysisSection>

        {/* Industry & Position */}
        <AnalysisSection icon={Building2} title="Industry & Position">
          <p className="mb-4">{analysis.industry}</p>
          <p>{analysis.market_position}</p>
        </AnalysisSection>

        {/* Products & Services */}
        {analysis.products_services?.length > 0 && (
          <AnalysisSection icon={LineChart} title="Products & Services">
            <ul className="list-none space-y-2">
              {analysis.products_services.map((service, index) => (
                <ListItem key={index}>{service}</ListItem>
              ))}
            </ul>
          </AnalysisSection>
        )}

        {/* Target Audience */}
        <AnalysisSection icon={Target} title="Target Audience">
          <p>{analysis.target_audience}</p>
        </AnalysisSection>

        {/* Unique Selling Points */}
        {analysis.unique_selling_points?.length > 0 && (
          <AnalysisSection icon={Lightbulb} title="Unique Selling Points">
            <ul className="list-none space-y-2">
              {analysis.unique_selling_points.map((point, index) => (
                <ListItem key={index}>{point}</ListItem>
              ))}
            </ul>
          </AnalysisSection>
        )}

        {/* Pain Points */}
        {analysis.customer_pain_points?.length > 0 && (
          <AnalysisSection icon={AlertTriangle} title="Customer Pain Points">
            <ul className="list-none space-y-2">
              {analysis.customer_pain_points.map((point, index) => (
                <ListItem key={index}>{point}</ListItem>
              ))}
            </ul>
          </AnalysisSection>
        )}

        {/* Competition */}
        {analysis.competitors?.length > 0 && (
          <AnalysisSection icon={Users} title="Competition">
            <ul className="list-none space-y-2">
              {analysis.competitors.map((competitor, index) => (
                <ListItem key={index}>{competitor}</ListItem>
              ))}
            </ul>
          </AnalysisSection>
        )}

        {/* Sales Approach */}
        {analysis.sales_approach && (
          <AnalysisSection icon={MessageSquare} title="Sales Approach">
            <p>{analysis.sales_approach}</p>
          </AnalysisSection>
        )}
      </div>

      {/* Actions */}
      <motion.div 
        {...fadeIn}
        className="flex justify-center gap-4 mt-12"
      >
        {/* <Button
          onClick={() => router.push(`/emails/generate/${analysisId}`)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-lg gap-2"
        >
          <Mail className="h-5 w-5" />
          Generate Email
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/analyze')}
          className="px-6 py-2 text-lg"
        >
          New Analysis
        </Button> */}
      </motion.div>
    </div>
  );
}