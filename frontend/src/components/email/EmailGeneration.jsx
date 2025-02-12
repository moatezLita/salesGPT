//src/components/email/EmailGeneration.jsx
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateEmail, useEmailResults } from '@/services/queries/useEmails';
import { Loader2, Mail, Copy, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmailGeneration({ analysisId }) {
    const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [targetPersona, setTargetPersona] = useState('Decision Maker');
    const [tone, setTone] = useState('professional');
    
    const { mutate: generateEmail, isPending: isGenerating } = useGenerateEmail();
    const { data: emailData, isLoading, isError, refetch } = useEmailResults(analysisId);

    const emails = emailData?.[0]?.emails?.emails || [];
    
    const handleGenerateEmail = () => {
        generateEmail(
            {
                analysisId,
                targetPersona,
                tone
            },
            {
                onSuccess: () => {
                    refetch();
                }
            }
        );
    };

    const copyToClipboard = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="bg-red-50">
                <CardContent className="p-6">
                    <p className="text-red-600 text-center">Failed to load emails</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className="border-2 border-blue-50 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold">Generated Emails</CardTitle>
                        {emails?.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                {emails.length} email variations available
                            </p>
                        )}
                    </div>
                    <div className="flex gap-4 items-center">
                        <Select value={targetPersona} onValueChange={setTargetPersona}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select persona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                                <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                                <SelectItem value="Business Owner">Business Owner</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleGenerateEmail}
                            disabled={isGenerating}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Generate New
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {emails?.length > 0 ? (
                        <div className="space-y-6">
                            {/* Email Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {emails.map((email, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedEmailIndex(index)}
                                        className={`px-4 py-2 rounded-md transition-all ${
                                            selectedEmailIndex === index
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                    >
                                        Version {index + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Selected Email */}
                            <motion.div
                                key={selectedEmailIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                {/* Subject Line */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium text-gray-600">Subject Line</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(emails[selectedEmailIndex].subject, 'subject')}
                                            className="h-8"
                                        >
                                            {copiedIndex === 'subject' ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-gray-900">{emails[selectedEmailIndex].subject}</p>
                                </div>

                                {/* Email Body */}
                                <div className="bg-white border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium text-gray-600">Email Body</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(emails[selectedEmailIndex].body, 'body')}
                                            className="h-8"
                                        >
                                            {copiedIndex === 'body' ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="prose prose-blue max-w-none">
                                        {emails[selectedEmailIndex].body.split('\n').map((paragraph, i) => (
                                            <p key={i} className="mb-4 last:mb-0">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium text-gray-600">Call to Action</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(emails[selectedEmailIndex].call_to_action, 'cta')}
                                            className="h-8"
                                        >
                                            {copiedIndex === 'cta' ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-gray-900">{emails[selectedEmailIndex].call_to_action}</p>
                                </div>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">No emails generated yet</p>
                            <Button
                                onClick={handleGenerateEmail}
                                disabled={isGenerating}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Generate First Email
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}