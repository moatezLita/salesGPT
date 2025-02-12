// components/analyze/AnalyzeForm.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAnalyzeWebsite } from '@/services/queries/useAnalyze';
import { Loader2, Globe, ArrowRight } from 'lucide-react';

export function AnalyzeForm() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const { mutate: analyze, isPending, error } = useAnalyzeWebsite();

    const handleSubmit = (e) => {
        e.preventDefault();
        analyze(url, {
            onSuccess: (data) => {
                if (data?.data?.analysis_id) {
                    router.push(`/analyze/${data.data.analysis_id}`);
                }
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto bg-blue-50 rounded-full p-3 w-fit">
                        <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Analyze Website</CardTitle>
                    <CardDescription className="text-base">
                        Enter a company website URL to analyze and generate personalized emails
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Input
                                type="url"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                className="h-12 pl-4 pr-4 text-lg border-2 focus:border-blue-500 transition-all duration-300"
                            />
                            <Button 
                                type="submit" 
                                disabled={isPending || !url}
                                className="absolute right-0 top-0 h-12 px-6 bg-blue-600 hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                        {error && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                <p className="text-red-600 text-sm flex items-center gap-2">
                                    <span>⚠️</span>
                                    {error.message}
                                </p>
                            </div>
                        )}
                        {isPending && (
                            <div className="text-center text-sm text-gray-500">
                                This may take a few moments while we analyze the website...
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}