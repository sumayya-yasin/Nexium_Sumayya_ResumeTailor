import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus, Download, Clock, Star, Bot, Save, Upload, Briefcase } from 'lucide-react'
import { ResumeContent } from '@/lib/ai'

interface SavedResume {
  _id: string
  jobDescriptionId: string
  tailoredContent: ResumeContent
  aiMetadata: {
    confidence: number
    processingTime: number
  }
  createdAt: string
}

interface UserProfile {
  id: string
  user_id: string
  resume_content: ResumeContent | null
  created_at: string
  updated_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [loadingResumes, setLoadingResumes] = useState(false)
  const [processingAI, setProcessingAI] = useState(false)
  const [aiResponse, setAiResponse] = useState<any>(null)

  // Form states
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeContent, setResumeContent] = useState<ResumeContent & { rawText?: string }>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    rawText: ''
  })

  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
        fetchSavedResumes(session.access_token)
      } else {
        router.push('/')
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/')
      } else if (session?.user) {
        setUser(session.user)
        fetchUserProfile(session.user.id)
        fetchSavedResumes(session.access_token)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const fetchUserProfile = async (userId: string) => {
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return

      const token = session.data.session.access_token
      if (!token) {
        console.error('No access token available')
        return
      }

      const response = await fetch('/api/profiles/get', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      const responseText = await response.text()
      console.log('Profile API response:', responseText)

      if (!response.ok) {
        console.error('Profile API error:', response.status, responseText)
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse profile response as JSON:', parseError)
        console.error('Response text:', responseText)
        return
      }

      if (data.profile) {
        setUserProfile(data.profile)
        if (data.profile.resume_content) {
          setResumeContent(data.profile.resume_content)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const fetchSavedResumes = async (accessToken: string) => {
    if (!accessToken) return

    setLoadingResumes(true)
    try {
      const response = await fetch('/api/resumes/list', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setSavedResumes(data.data || [])
      } else {
        console.error('Failed to fetch saved resumes:', data.error || response.statusText)
        setSavedResumes([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching saved resumes:', error)
      setSavedResumes([]) // Set empty array on error
    } finally {
      setLoadingResumes(false)
    }
  }

  const saveResumeContent = async () => {
    if (!user) return

    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return

      const token = session.data.session.access_token
      if (!token) {
        alert('Authentication required')
        return
      }

      const response = await fetch('/api/profiles/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resume_content: resumeContent
        }),
      })

      const responseText = await response.text()
      console.log('Save API response:', responseText)

      if (!response.ok) {
        console.error('Save API error:', response.status, responseText)
        alert(`Failed to save: ${response.status} ${responseText}`)
        return
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse save response as JSON:', parseError)
        console.error('Response text:', responseText)
        alert('Failed to save: Invalid response format')
        return
      }

      if (response.ok) {
        alert('Resume content saved successfully!')
        await fetchUserProfile(user.id)
      } else {
        console.error('Save error:', data.error)
        alert(`Failed to save: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to save resume content:', error)
      alert('Failed to save resume content')
    }
  }

  const handleAITailorResume = async () => {
    if (!jobTitle || !company || !jobDescription || (!resumeContent.rawText && !resumeContent.personalInfo.name)) {
      alert('Please fill in all required fields including your resume content')
      return
    }

    setProcessingAI(true)
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) return

      // First create job description
      const jobResponse = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          title: jobTitle,
          company: company,
          description: jobDescription,
          requirements: jobDescription.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')),
          keywords: jobDescription.toLowerCase().match(/\b\w+\b/g)?.slice(0, 20) || []
        }),
      })

      if (!jobResponse.ok) throw new Error('Failed to create job description')
      const jobData = await jobResponse.json()

      // Then tailor resume
      const tailorResponse = await fetch('/api/resume/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify({
          resumeContent: resumeContent,
          jobDescriptionId: jobData.data._id,
          originalResumeId: 'dashboard-input'
        }),
      })

      if (!tailorResponse.ok) throw new Error('Failed to tailor resume')
      const tailorData = await tailorResponse.json()

      setAiResponse(tailorData.data)
      fetchSavedResumes(session.data.session.access_token)
    } catch (error) {
      console.error('AI tailoring error:', error)
      alert('Failed to tailor resume with AI')
    } finally {
      setProcessingAI(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const extractSummary = (text: string) => {
    const summarySection = text.match(/summary[:\n]([\s\S]*?)(?=experience|education|skills|$)/i)
    return summarySection?.[1]?.trim() || ''
  }

  const downloadTailoredResume = (resume: any) => {
    const tailoredContent = resume.tailoredContent || resume
    let content = ''

    // Personal Info
    if (tailoredContent.personalInfo) {
      const info = tailoredContent.personalInfo
      content += `${info.name || ''}\n`
      content += `${info.email || ''}\n`
      content += `${info.phone || ''}\n`
      content += `${info.address || info.location || ''}\n\n`
    }

    // Summary
    if (tailoredContent.summary) {
      content += `PROFESSIONAL SUMMARY\n${tailoredContent.summary}\n\n`
    }

    // Experience
    if (tailoredContent.experience && tailoredContent.experience.length > 0) {
      content += `PROFESSIONAL EXPERIENCE\n`
      tailoredContent.experience.forEach((exp: any) => {
        content += `${exp.title} - ${exp.company}\n`
        content += `${exp.duration}\n`
        content += `${exp.description}\n\n`
      })
    }

    // Education
    if (tailoredContent.education && tailoredContent.education.length > 0) {
      content += `EDUCATION\n`
      tailoredContent.education.forEach((edu: any) => {
        content += `${edu.degree} - ${edu.school}\n`
        content += `${edu.year}\n\n`
      })
    }

    // Skills
    if (tailoredContent.skills && tailoredContent.skills.length > 0) {
      content += `SKILLS\n${tailoredContent.skills.join(', ')}\n\n`
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tailored-resume-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadAIResponse = () => {
    if (!aiResponse) return
    downloadTailoredResume(aiResponse.tailoredResume)
  }

  const downloadSavedResume = (resume: SavedResume) => {
    downloadTailoredResume(resume.tailoredContent);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Card 1: Existing Resume Content */}
            <Card className="border-2 border-primary/30 bg-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-primary" />
                    <CardTitle className="text-xl text-white">Your Resume Content</CardTitle>
                  </div>
                  <Button onClick={saveResumeContent} size="sm" className="bg-primary hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
                <CardDescription className="text-slate-300">
                  Enter your existing resume information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Paste Your Complete Resume</label>
                  <textarea 
                    rows={12}
                    value={resumeContent.rawText || ''}
                    onChange={(e) => setResumeContent({
                      ...resumeContent,
                      rawText: e.target.value,
                      // Also update the name field for AI processing if it's empty
                      personalInfo: {
                        ...resumeContent.personalInfo,
                        name: resumeContent.personalInfo.name || 'Resume User'
                      }
                    })}
                    placeholder="Paste your entire resume content here... Include all sections: personal info, summary, experience, education, skills, etc."
                    className="w-full p-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm font-mono leading-relaxed placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Tip: Copy and paste your entire resume text. The AI will extract and optimize the relevant information.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Job Description */}
            <Card className="border-2 border-blue-500/30 bg-slate-800">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-xl text-white">Job Description</CardTitle>
                </div>
                <CardDescription className="text-slate-300">
                  Enter the job details you want to tailor your resume for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full p-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Company</label>
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google, Microsoft, Startup Inc..."
                    className="w-full p-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Job Description</label>
                  <textarea 
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full p-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm placeholder-slate-400"
                  />
                </div>
                <Button 
                  onClick={handleAITailorResume}
                  disabled={processingAI}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2"
                >
                  {processingAI ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Bot className="w-4 h-4 mr-2" />
                      Tailor with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: AI Response (Conditional) */}
            {aiResponse && (
              <Card className="border-2 border-purple-500/30 bg-slate-800 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-purple-400" />
                      <CardTitle className="text-xl text-white">AI-Tailored Resume</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                        Match: {aiResponse.score}%
                      </span>
                      <Button size="sm" variant="outline" className="bg-slate-600 text-white hover:bg-slate-500 border-slate-500" onClick={downloadAIResponse}>
                        <Download className="w-4 h-4 mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-slate-300">
                    Your resume optimized for this specific job opportunity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Optimized Resume</h4>
                    <p className="text-slate-300 text-sm">{aiResponse.tailoredResume?.summary}</p>
                    {aiResponse.tailoredResume?.experience?.map((exp: any, index: number) => (
                      <div key={index}>
                        <h5 className="font-semibold text-white mt-2">{exp.title}</h5>
                        <p className="text-slate-300 text-sm">{exp.company} - {exp.duration}</p>
                        <p className="text-slate-300 text-sm">{exp.description}</p>
                      </div>
                    ))}
                    {aiResponse.tailoredResume?.education?.map((edu: any, index: number) => (
                      <div key={index}>
                        <h5 className="font-semibold text-white mt-2">{edu.degree}</h5>
                        <p className="text-slate-300 text-sm">{edu.school} - {edu.year}</p>
                      </div>
                    ))}
                    <h5 className="font-semibold text-white mt-2">Skills</h5>
                    <p className="text-slate-300 text-sm">{aiResponse.tailoredResume?.skills?.join(', ')}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Key Skills Highlighted</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiResponse.tailoredResume?.skills?.slice(0, 8).map((skill: string, index: number) => (
                          <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs border border-purple-500/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Keyword Matches</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiResponse.keywordMatches?.slice(0, 6).map((keyword: string, index: number) => (
                          <span key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs border border-green-500/30">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {aiResponse.suggestions && (
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                      <h4 className="font-semibold text-white mb-2">AI Suggestions</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {aiResponse.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Card 4: Saved Resumes */}
            <Card className={`${aiResponse ? "lg:col-span-2" : "lg:col-span-2"} bg-slate-800 border-2 border-slate-600`}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <CardTitle className="text-xl text-white">Saved Resumes</CardTitle>
                </div>
                <CardDescription className="text-slate-300">
                  Your previously AI-tailored resumes from MongoDB
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingResumes ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : savedResumes.length > 0 ? (
                  <div className="space-y-3">
                    {savedResumes.map((resume) => (
                      <div key={resume._id} className="flex items-center justify-between p-4 border border-slate-600 bg-slate-700 rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-white">
                              {resume.tailoredContent?.personalInfo?.name || 'Tailored Resume'}
                            </p>
                            <p className="text-sm text-slate-400 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(resume.createdAt)} • Match: {resume.aiMetadata?.confidence || 0}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="bg-slate-600 text-white hover:bg-slate-500 border-slate-500" onClick={() => downloadSavedResume(resume)}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <p className="text-sm text-slate-400">Total saved resumes: {savedResumes.length}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">No saved resumes yet</p>
                    <p className="text-sm text-slate-500">AI-tailored resumes will appear here after processing</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}