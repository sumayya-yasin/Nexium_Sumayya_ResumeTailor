
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, Download, Zap, Plus, Trash2 } from 'lucide-react'

interface ResumeContent {
  personalInfo?: {
    name?: string
    email?: string
    phone?: string
    address?: string
  }
  summary?: string
  experience?: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education?: Array<{
    degree: string
    school: string
    year: string
  }>
  skills?: string[]
  rawText?: string
}

interface JobDescription {
  _id?: string
  title: string
  company: string
  description: string
  requirements?: string[]
  keywords?: string[]
}

interface TailoredResume {
  _id: string
  tailoredContent: ResumeContent
  score: number
  keywordMatches: string[]
  suggestions: string[]
  processingTime: number
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null)
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([])
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResume[]>([])
  const [newJob, setNewJob] = useState({ title: '', company: '', description: '' })
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTailoredResume, setCurrentTailoredResume] = useState<TailoredResume | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      await Promise.all([
        fetchUserProfile(session.access_token),
        fetchJobDescriptions(session.access_token),
        fetchTailoredResumes(session.access_token)
      ])
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/profiles/get', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.profile?.resume_content) {
          setResumeContent(data.profile.resume_content)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchJobDescriptions = async (token: string) => {
    try {
      const response = await fetch('/api/jobs/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setJobDescriptions(data.jobs || [])
        }
      }
    } catch (error) {
      console.error('Error fetching job descriptions:', error)
    }
  }

  const fetchTailoredResumes = async (token: string) => {
    try {
      const response = await fetch('/api/resumes/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTailoredResumes(data.resumes || [])
        }
      }
    } catch (error) {
      console.error('Error fetching tailored resumes:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const content: ResumeContent = {
        rawText: text,
        personalInfo: extractPersonalInfo(text),
        summary: extractSummary(text),
        experience: extractExperience(text),
        education: extractEducation(text),
        skills: extractSkills(text)
      }

      setResumeContent(content)
      await saveProfile(content)
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Error processing file. Please try again.')
    }
  }

  const saveProfile = async (content: ResumeContent) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/profiles/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ resume_content: content })
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }
    } catch (error) {
      console.error('Save profile error:', error)
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJob.title || !newJob.company || !newJob.description) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(newJob)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setJobDescriptions([...jobDescriptions, data.job])
          setNewJob({ title: '', company: '', description: '' })
        }
      }
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  const handleTailorResume = async () => {
    if (!resumeContent || !selectedJobId) {
      alert('Please upload a resume and select a job description')
      return
    }

    setIsProcessing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/resume/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          resumeContent,
          jobDescriptionId: selectedJobId,
          originalResumeId: 'original'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCurrentTailoredResume(data.data)
          await fetchTailoredResumes(session.access_token)
        }
      } else {
        const errorData = await response.json()
        console.error('Tailor error:', errorData)
        alert('Error tailoring resume. Please try again.')
      }
    } catch (error) {
      console.error('Error tailoring resume:', error)
      alert('Error tailoring resume. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadResume = (resume: TailoredResume) => {
    const content = formatResumeForDownload(resume.tailoredContent)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tailored-resume-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatResumeForDownload = (content: ResumeContent): string => {
    let formatted = ''
    
    if (content.personalInfo) {
      const { name, email, phone, address } = content.personalInfo
      formatted += `${name || 'Name'}\n`
      formatted += `${email || 'email@example.com'} | ${phone || 'Phone'}\n`
      formatted += `${address || 'Address'}\n\n`
    }

    if (content.summary) {
      formatted += `PROFESSIONAL SUMMARY\n`
      formatted += `${content.summary}\n\n`
    }

    if (content.experience?.length) {
      formatted += `PROFESSIONAL EXPERIENCE\n`
      content.experience.forEach(exp => {
        formatted += `${exp.title} - ${exp.company} (${exp.duration})\n`
        formatted += `${exp.description}\n\n`
      })
    }

    if (content.education?.length) {
      formatted += `EDUCATION\n`
      content.education.forEach(edu => {
        formatted += `${edu.degree} - ${edu.school} (${edu.year})\n`
      })
      formatted += '\n'
    }

    if (content.skills?.length) {
      formatted += `SKILLS\n`
      formatted += content.skills.join(', ') + '\n'
    }

    return formatted
  }

  // Helper functions for text extraction
  const extractPersonalInfo = (text: string) => {
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
    const phoneMatch = text.match(/[\d\s\-\(\)]{10,}/)
    
    return {
      name: text.split('\n')[0] || '',
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0] || '',
      address: ''
    }
  }

  const extractSummary = (text: string) => {
  const summarySection = text.match(/summary[:\n]([\s\S]*?)(?=experience|education|skills|$)/i)
    return summarySection?.[1]?.trim() || ''
  }

  const extractExperience = (text: string) => {
    return []
  }

  const extractEducation = (text: string) => {
    return []
  }

  const extractSkills = (text: string) => {
    const skillsSection = text.match(/skills[:\n](.*?)(?=experience|education|$)/i)
    return skillsSection?.[1]?.split(/[,\n]/).map(s => s.trim()).filter(Boolean) || []
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Resume Tailor Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Resume Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Resume
              </CardTitle>
              <CardDescription>
                Upload your base resume to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {resumeContent && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">✓ Resume uploaded successfully</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Descriptions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Job Descriptions
              </CardTitle>
              <CardDescription>
                Add job descriptions to tailor your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateJob} className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newJob.company}
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <textarea
                  placeholder="Job Description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
                />
                <Button type="submit" size="sm" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Job
                </Button>
              </form>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {jobDescriptions.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJobId(job._id!)}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedJobId === job._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-medium text-sm">{job.title}</h4>
                    <p className="text-xs text-gray-600">{job.company}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Tailoring Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                AI Tailoring
              </CardTitle>
              <CardDescription>
                Generate optimized resume with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTailorResume}
                disabled={!resumeContent || !selectedJobId || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Tailor Resume
                  </>
                )}
              </Button>

              {currentTailoredResume && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="font-medium text-green-800">✓ Resume Tailored Successfully!</h4>
                  <p className="text-sm text-green-600 mt-1">
                    Score: {currentTailoredResume.score}% | 
                    Keywords: {currentTailoredResume.keywordMatches.length} |
                    Time: {currentTailoredResume.processingTime}ms
                  </p>
                  <Button
                    onClick={() => downloadResume(currentTailoredResume)}
                    size="sm"
                    className="mt-2 w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Optimized Resume Display */}
        {currentTailoredResume && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Optimized Resume</CardTitle>
              <CardDescription>
                Complete tailored resume content optimized for the selected job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Personal Info */}
                {currentTailoredResume.tailoredContent.personalInfo && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">{currentTailoredResume.tailoredContent.personalInfo.name}</p>
                      <p>{currentTailoredResume.tailoredContent.personalInfo.email}</p>
                      <p>{currentTailoredResume.tailoredContent.personalInfo.phone}</p>
                      <p>{currentTailoredResume.tailoredContent.personalInfo.address}</p>
                    </div>
                  </div>
                )}

                {/* Summary */}
                {currentTailoredResume.tailoredContent.summary && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Professional Summary</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="whitespace-pre-wrap">{currentTailoredResume.tailoredContent.summary}</p>
                    </div>
                  </div>
                )}

                {/* Experience */}
                {currentTailoredResume.tailoredContent.experience?.length && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Professional Experience</h3>
                    <div className="space-y-4">
                      {currentTailoredResume.tailoredContent.experience.map((exp, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium">{exp.title} - {exp.company}</h4>
                          <p className="text-sm text-gray-600 mb-2">{exp.duration}</p>
                          <p className="whitespace-pre-wrap">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {currentTailoredResume.tailoredContent.education?.length && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Education</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      {currentTailoredResume.tailoredContent.education.map((edu, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-sm text-gray-600">{edu.school} - {edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {currentTailoredResume.tailoredContent.skills?.length && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Skills</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex flex-wrap gap-2">
                        {currentTailoredResume.tailoredContent.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">AI Insights</h3>
                  <div className="bg-blue-50 p-4 rounded-md space-y-3">
                    <div>
                      <h4 className="font-medium text-blue-800">Matched Keywords</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentTailoredResume.keywordMatches.map((keyword, index) => (
                          <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Suggestions</h4>
                      <ul className="mt-1 space-y-1">
                        {currentTailoredResume.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-blue-700">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Tailored Resumes */}
        {tailoredResumes.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Previous Tailored Resumes</CardTitle>
              <CardDescription>
                Your previously generated resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tailoredResumes.map((resume) => (
                  <div key={resume._id} className="border border-gray-200 rounded-md p-4 flex justify-between items-start">
                    <div>
                      <p className="font-medium">Score: {resume.score}%</p>
                      <p className="text-sm text-gray-600">Keywords: {resume.keywordMatches.length}</p>
                      <p className="text-xs text-gray-500">Processing time: {resume.processingTime}ms</p>
                    </div>
                    <Button
                      onClick={() => downloadResume(resume)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
