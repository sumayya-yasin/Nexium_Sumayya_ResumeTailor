
import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import AuthForm from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Zap, Target, Shield, Workflow } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Head>
          <title>Resume Tailor - AI-Powered Resume Optimization</title>
          <meta name="description" content="Tailor your resume to any job description with AI" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.email}!
            </h1>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>

          <div className="text-center mb-12">
            <p className="text-xl text-gray-600 mb-4">
              Ready to optimize your resume with AI?
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Resume Tailor - AI-Powered Resume Optimization</title>
        <meta name="description" content="Tailor your resume to any job description with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Resume Optimization
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Tailor Your Resume to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Any Job Description
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Our AI analyzes job descriptions and intelligently optimizes your resume content,
            keywords, and formatting to maximize your chances of landing interviews.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>AI Content Analysis</CardTitle>
              <CardDescription>
                Advanced AI analyzes job requirements and optimizes your resume content
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Keyword Optimization</CardTitle>
              <CardDescription>
                Automatically match and highlight relevant keywords from job descriptions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Multiple Formats</CardTitle>
              <CardDescription>
                Download optimized resumes in PDF format or copy to clipboard
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and stored securely with Supabase
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Workflow className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Smart Automation</CardTitle>
              <CardDescription>
                Automated workflows with n8n for notifications and processing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <CardTitle>Real-time Feedback</CardTitle>
              <CardDescription>
                Get instant AI feedback and suggestions for improvement
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Home;
