import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import AuthForm from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, FileText } from "lucide-react";

const Home: NextPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      // Check if there's a hash in the URL (from magic link)
      if (window.location.hash) {
        const { data, error } = await supabase.auth.getSession()
        if (data.session && !error) {
          window.location.href = '/dashboard'
          return
        }
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    handleAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (event === 'SIGNED_IN' && session) {
          window.location.href = '/dashboard'
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <Head>
          <title>Resume Tailor - AI-Powered Resume Optimization</title>
          <meta name="description" content="Tailor your resume to any job description with AI" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Header */}
        <div className="bg-[#1e293b] border-b border-slate-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-white">AI Resume Tailor</h1>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="bg-slate-600 text-white hover:bg-slate-500 border-slate-500">
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome back, {user.email}!
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Ready to optimize your resume with AI?
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Head>
        <title>Resume Tailor - AI-Powered Resume Optimization</title>
        <meta name="description" content="Tailor your resume to any job description with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <div className="bg-[#1e293b] border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-white">AI Resume Tailor</h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1e293b] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6 border border-primary/30">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Resume Optimization
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
              Tailor Your Resume to{" "}
              <span className="text-primary">
                Any Job Description
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our AI analyzes job descriptions and intelligently optimizes your resume content,
              keywords, and formatting to maximize your chances of landing interviews.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="container mx-auto px-4 py-16">
        {/* Auth Form */}
        <div className="max-w-2xl mx-auto">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Home;