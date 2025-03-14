import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateEmail, useEmailResults } from '@/services/queries/useEmails';
import { Loader2, Mail, Copy, Check, RefreshCw, Building2, Users, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { TabsList, Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';

export function EmailGeneration({ analysisId }) {
    const [selectedEmailIndex, setSelectedEmailIndex] = useState(0);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [activeTab, setActiveTab] = useState('business');
    
    const [businessInfo, setBusinessInfo] = useState({
        companyName: '',
        businessType: '',
        productDescription: ''
    });
    
    const [emailSettings, setEmailSettings] = useState({
        targetPersona: 'Decision Maker',
        tone: 'professional'
    });
    
    const { mutate: generateEmail, isPending: isGenerating } = useGenerateEmail();
    const { data, isLoading, isError, refetch } = useEmailResults(analysisId);

    // Correctly access the nested emails array
    const emails = data?.emails?.[data?.emails?.length - 1]?.emails?.emails?.emails || [];
    
    const handleGenerateEmail = () => {
        generateEmail(
            {
                analysisId,
                targetPersona: emailSettings.targetPersona,
                tone: emailSettings.tone,
                companyName: businessInfo.companyName,
                businessType: businessInfo.businessType,
                serviceDescription: businessInfo.productDescription
            },
            {
                onSuccess: () => {
                    refetch();
                    setActiveTab('emails');
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
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold">Email Generator</CardTitle>
                        {emails.length > 0 && (
                            <p className="text-sm text-gray-500">
                                {emails.length} email variations available
                            </p>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="business" className="flex items-center">
                                <Building2 className="w-4 h-4 mr-2" />
                                Business Info
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                Email Settings
                            </TabsTrigger>
                            <TabsTrigger value="emails" className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Generated Emails
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="business" className="space-y-4">
                            <div className="space-y-4">
                                <Input
                                    placeholder="Your Company Name"
                                    value={businessInfo.companyName}
                                    onChange={(e) => setBusinessInfo(prev => ({
                                        ...prev,
                                        companyName: e.target.value
                                    }))}
                                />
                                <Input
                                    placeholder="Business Type (e.g., Paper Supply, Software Company)"
                                    value={businessInfo.businessType}
                                    onChange={(e) => setBusinessInfo(prev => ({
                                        ...prev,
                                        businessType: e.target.value
                                    }))}
                                />
                                <Textarea
                                    placeholder="Describe your product or service..."
                                    value={businessInfo.productDescription}
                                    onChange={(e) => setBusinessInfo(prev => ({
                                        ...prev,
                                        productDescription: e.target.value
                                    }))}
                                    className="min-h-[100px]"
                                />
                                <Button
                                    onClick={() => setActiveTab('settings')}
                                    className="w-full"
                                >
                                    Next: Email Settings
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-4">
                            <div className="space-y-4">
                                <Select 
                                    value={emailSettings.targetPersona}
                                    onValueChange={(value) => setEmailSettings(prev => ({
                                        ...prev,
                                        targetPersona: value
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select target persona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                                        <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                                        <SelectItem value="Business Owner">Business Owner</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select 
                                    value={emailSettings.tone}
                                    onValueChange={(value) => setEmailSettings(prev => ({
                                        ...prev,
                                        tone: value
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select email tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="professional">Professional</SelectItem>
                                        <SelectItem value="friendly">Friendly</SelectItem>
                                        <SelectItem value="casual">Casual</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setActiveTab('business')}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleGenerateEmail}
                                        disabled={isGenerating}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Generate Emails
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Emails Tab */}
                        <TabsContent value="emails" className="space-y-6">
                            {emails.length > 0 ? (
                                <div className="space-y-6">
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

                                    <motion.div
                                        key={selectedEmailIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        {/* Email content sections */}
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
                                        onClick={() => setActiveTab('business')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Start Email Generation
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export default EmailGeneration;

