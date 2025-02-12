// components/home/Hero.js with quick analyze input
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAnalyzeWebsite } from '@/services/queries/useAnalyze';

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const { mutate: analyze, isPending } = useAnalyzeWebsite();

  const handleAnalyze = (e) => {
    e.preventDefault();
    analyze(url, {
      onSuccess: (data) => {
        router.push(`/analyze?id=${data.analysisId}`);
      },
    });
  };

  return (
    <div className="relative overflow-hidden bg-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50" />
      </div>
      
      <div className="relative min-h-[80vh] flex flex-col items-center justify-center space-y-8 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-3xl"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
            <motion.span
              className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              AI-Powered Sales Intelligence
            </motion.span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mx-auto max-w-2xl text-lg text-gray-600"
          >
            Generate highly personalized cold emails by analyzing company websites with advanced AI
          </motion.p>
          
          <motion.form
            onSubmit={handleAnalyze}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex max-w-xl mx-auto gap-2 px-4"
          >
            <Input
              type="url"
              placeholder="Enter company website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              required
            />
            <Button 
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {isPending ? 'Analyzing...' : 'Analyze Now'}
            </Button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}