import Groq from 'groq-sdk'

export interface ResumeContent {
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

export interface JobDescription {
  title: string
  company: string
  description: string
  requirements?: string[]
  keywords?: string[]
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
    console.log('Resume has rawText:', !!resumeContent.rawText)
    console.log('Groq API Key exists:', !!process.env.GROQ_API_KEY)
    console.log('Groq API Key length:', process.env.GROQ_API_KEY?.length || 0)
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 10) {
      console.warn('Groq API key missing or invalid, using fallback')
      return createFallbackResponse(resumeContent, jobDescription)
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const prompt = `
You are an expert resume writer and ATS optimization specialist. 

Job Details:
- Position: ${jobDescription.title}
- Company: ${jobDescription.company}
- Description: ${jobDescription.description}

Current Resume Content:
${resumeContent.rawText || JSON.stringify(resumeContent, null, 2)}

Please tailor this resume to match the job requirements. Return a JSON response with this exact structure:
{
  "tailoredResume": {
    "personalInfo": {
      "name": "Full Name",
      "email": "email@example.com", 
      "phone": "Phone Number",
      "address": "Address"
    },
    "summary": "Enhanced professional summary that highlights relevant experience for ${jobDescription.title} at ${jobDescription.company}. Include keywords from the job description and emphasize matching skills and achievements.",
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name", 
        "duration": "Duration",
        "description": "Enhanced description with job-relevant keywords and achievements"
      }
    ],
    "education": [
      {
        "degree": "Degree Name",
        "school": "School Name",
        "year": "Year"
      }
    ],
    "skills": ["skill1", "skill2", "skill3"]
  },
  "score": 85,
  "keywordMatches": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Focus on:
1. Optimizing the summary for ATS and human readers
2. Incorporating relevant keywords naturally
3. Highlighting transferable skills
4. Quantifying achievements where possible
5. Ensuring the content matches the job requirements

Return only valid JSON, no additional text.`

    console.log('Making Groq API request...')
    console.log('Prompt length:', prompt.length)

    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    console.log('Groq response received, length:', content?.length || 0)

    if (!content) {
      throw new Error('No content received from Groq')
    }

    let parsedResponse
    try {
      // Try to parse the JSON response
      parsedResponse = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.log('Raw response:', content)
      
      // If JSON parsing fails, use fallback
      return createFallbackResponse(resumeContent, jobDescription)
    }

    // Validate the response structure
    if (!parsedResponse.tailoredResume) {
      console.warn('Invalid response structure, using fallback')
      return createFallbackResponse(resumeContent, jobDescription)
    }

    return {
      tailoredResume: parsedResponse.tailoredResume,
      score: parsedResponse.score || 75,
      keywordMatches: parsedResponse.keywordMatches || [],
      suggestions: parsedResponse.suggestions || []
    }

  } catch (error) {
    console.error('AI tailoring error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })

    // Return fallback response on any error
    return createFallbackResponse(resumeContent, jobDescription)
  }
}

function extractKeywords(jobDescription: string, resumeContent: ResumeContent): string[] {
  const jobWords = jobDescription.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3)

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
    personalInfo: resumeContent.personalInfo || {
      name: "Your Name",
      email: "email@example.com",
      phone: "Phone Number",
      address: "Your Address"
    },
    summary: resumeContent.summary ? 
      `${resumeContent.summary} Seeking ${jobDescription.title} position at ${jobDescription.company} with expertise in ${keywords.slice(0, 3).join(', ')}.` : 
      `Experienced professional seeking ${jobDescription.title} position at ${jobDescription.company}. Strong background in ${keywords.slice(0, 3).join(', ')} with proven track record of success.`,
    experience: resumeContent.experience || [
      {
        title: "Previous Role",
        company: "Previous Company",
        duration: "Date Range",
        description: `Relevant experience applicable to ${jobDescription.title} role. Demonstrated expertise in ${keywords.slice(0, 2).join(' and ')}.`
      }
    ],
    education: resumeContent.education || [
      {
        degree: "Relevant Degree",
        school: "University/Institution",
        year: "Year"
      }
    ],
    skills: resumeContent.skills || keywords.slice(0, 8)
  }
  
  return {
    tailoredResume: enhancedResume,
    score: Math.min(keywords.length * 8 + 60, 95),
    keywordMatches: keywords,
    suggestions: [
      `Customize summary for ${jobDescription.title} role`,
      `Add keywords: ${keywords.slice(0, 3).join(', ')}`,
      `Highlight relevant experience for ${jobDescription.company}`,
      `Quantify achievements with specific metrics`,
      `Include industry-specific terminology`
    ]
  }
}
