
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface ResumeContent {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    website?: string
  }
  summary: string
  skills: string[]
  experience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education: Array<{
    degree: string
    school: string
    year: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
  }>
  rawText?: string
}

export interface JobDescription {
  title: string
  company: string
  description: string
  requirements: string[]
  keywords: string[]
}

export interface AITailoringResult {
  tailoredResume: ResumeContent
  score: number
  keywordMatches: string[]
  suggestions: string[]
}

export async function tailorResumeWithAI(
  resumeContent: ResumeContent,
  jobDescription: JobDescription
): Promise<AITailoringResult> {
  try {
    console.log('Groq API Key exists:', !!process.env.GROQ_API_KEY)
    console.log('Groq API Key length:', process.env.GROQ_API_KEY?.length || 0)
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 10) {
      console.warn('Groq API key missing or invalid, using fallback')
      return createFallbackResponse(resumeContent, jobDescription)
    }
    
    const prompt = `
You are an expert resume writer and ATS optimization specialist. 

CURRENT RESUME:
Name: ${resumeContent.personalInfo?.name || 'Not provided'}
Summary: ${resumeContent.summary || 'Not provided'}
Skills: ${resumeContent.skills?.join(', ') || 'Not provided'}
Experience: ${resumeContent.experience?.map(exp => `${exp.title} at ${exp.company}`).join('; ') || 'Not provided'}

RAW TEXT:
${resumeContent.rawText || 'No raw text provided'}

TARGET JOB:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Description: ${jobDescription.description}
Requirements: ${jobDescription.requirements?.join('; ') || 'Not specified'}

TASK: Optimize this resume for the job posting. Return ONLY valid JSON with:
{
  "tailoredResume": {
    "personalInfo": {"name": "Current Name", "email": "email@example.com", "phone": "123-456-7890", "location": "Location"},
    "summary": "Enhanced summary with job-relevant keywords",
    "skills": ["skill1", "skill2", "skill3"],
    "experience": [{"title": "Job Title", "company": "Company", "duration": "2020-2023", "description": "Enhanced description"}],
    "education": [],
    "projects": []
  },
  "score": 85,
  "keywordMatches": ["keyword1", "keyword2", "keyword3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Focus on incorporating job keywords naturally and highlighting relevant experience.`

    console.log('Making Groq API request...')
    console.log('Prompt length:', prompt.length)
    
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    })
    
    console.log('Groq response received, choices:', response.choices?.length)

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    try {
      console.log('Raw AI response:', content.substring(0, 500) + '...')
      
      // Try to clean the response if it has extra text
      let cleanContent = content.trim()
      const jsonStart = cleanContent.indexOf('{')
      const jsonEnd = cleanContent.lastIndexOf('}') + 1
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd)
      }
      
      const aiResult = JSON.parse(cleanContent)
      console.log('Parsed AI result keys:', Object.keys(aiResult))
      
      // Validate and set defaults
      return {
        tailoredResume: aiResult.tailoredResume || resumeContent,
        score: Math.min(Math.max(aiResult.score || 75, 0), 100),
        keywordMatches: Array.isArray(aiResult.keywordMatches) ? aiResult.keywordMatches : [],
        suggestions: Array.isArray(aiResult.suggestions) ? aiResult.suggestions : ['Review and customize further based on specific job requirements']
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Content that failed to parse:', content)
      // Return a fallback response
      return {
        tailoredResume: resumeContent,
        score: 70,
        keywordMatches: extractKeywords(jobDescription.description, resumeContent),
        suggestions: ['AI parsing failed - manual review recommended', 'Ensure keywords from job description are included', 'Customize summary for this specific role']
      }
    }

  } catch (error) {
    console.error('AI tailoring error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Return a fallback response instead of throwing
    return {
      tailoredResume: resumeContent,
      score: 65,
      keywordMatches: extractKeywords(jobDescription.description, resumeContent),
      suggestions: ['AI service unavailable - manual tailoring recommended', 'Match keywords from job description', 'Customize experience bullets for relevance']
    }
  }
}

function extractKeywords(jobDescription: string, resumeContent: ResumeContent): string[] {
  const jobWords = jobDescription.toLowerCase().match(/\b\w{3,}\b/g) || []
  const resumeText = (resumeContent.rawText || JSON.stringify(resumeContent)).toLowerCase()
  
  return jobWords
    .filter(word => resumeText.includes(word))
    .filter((word, index, self) => self.indexOf(word) === index)
    .slice(0, 10)
}

function createFallbackResponse(resumeContent: ResumeContent, jobDescription: JobDescription): AITailoringResult {
  console.log('Creating fallback AI response')
  
  // Basic keyword matching
  const keywords = extractKeywords(jobDescription.description, resumeContent)
  
  // Create enhanced resume with job title
  const enhancedResume = {
    ...resumeContent,
    summary: resumeContent.summary ? 
      `${resumeContent.summary} Seeking ${jobDescription.title} position at ${jobDescription.company}.` : 
      `Experienced professional seeking ${jobDescription.title} position at ${jobDescription.company}.`
  }
  
  return {
    tailoredResume: enhancedResume,
    score: Math.min(keywords.length * 8 + 60, 95),
    keywordMatches: keywords,
    suggestions: [
      `Customize summary for ${jobDescription.title} role`,
      `Add keywords: ${keywords.slice(0, 3).join(', ')}`,
      `Highlight relevant experience for ${jobDescription.company}`
    ]
  }
}
