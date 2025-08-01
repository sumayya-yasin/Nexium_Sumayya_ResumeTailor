
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ResumeContent {
  personalInfo: {
    name: string
    email: string
    phone?: string
    location?: string
    linkedin?: string
    website?: string
  }
  summary: string
  skills: string[]
  experience: Array<{
    company: string
    position: string
    duration: string
    achievements: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    year: string
    gpa?: string
  }>
  projects?: Array<{
    name: string
    description: string
    technologies: string[]
    link?: string
  }>
}

export interface JobDescription {
  title: string
  company: string
  description: string
  requirements: string[]
  keywords: string[]
}

export async function tailorResumeToJob(
  resume: ResumeContent,
  jobDescription: JobDescription
): Promise<{
  tailoredResume: ResumeContent
  suggestions: string[]
  keywordMatches: string[]
  score: number
}> {
  try {
    const prompt = `
You are an expert resume optimization AI. Your task is to tailor a resume to match a specific job description while maintaining authenticity and accuracy.

Original Resume:
${JSON.stringify(resume, null, 2)}

Job Description:
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Description: ${jobDescription.description}
Requirements: ${jobDescription.requirements.join(', ')}
Keywords: ${jobDescription.keywords.join(', ')}

Instructions:
1. Optimize the resume summary to align with the job requirements
2. Reorder and emphasize relevant skills based on job keywords
3. Enhance experience descriptions using action verbs and quantifiable achievements
4. Highlight relevant projects and education
5. Ensure keyword optimization without keyword stuffing
6. Maintain truthfulness - DO NOT add false information

Return a JSON response with:
- tailoredResume: The optimized resume content
- suggestions: Array of improvement suggestions
- keywordMatches: Array of matched keywords from the job description
- score: Overall match score (0-100)
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert resume optimization assistant. Always return valid JSON responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return result
  } catch (error) {
    console.error('AI resume tailoring error:', error)
    throw new Error('Failed to tailor resume with AI')
  }
}

export async function generateResumeFeedback(
  resume: ResumeContent
): Promise<{
  feedback: string
  suggestions: string[]
  score: number
}> {
  try {
    const prompt = `
Analyze this resume and provide constructive feedback:

${JSON.stringify(resume, null, 2)}

Provide feedback on:
1. Overall structure and formatting
2. Content quality and impact
3. Keyword optimization
4. Achievement quantification
5. Areas for improvement

Return JSON with:
- feedback: Overall assessment (string)
- suggestions: Array of specific improvement suggestions
- score: Overall resume quality score (0-100)
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert resume reviewer. Always return valid JSON responses."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return result
  } catch (error) {
    console.error('AI feedback generation error:', error)
    throw new Error('Failed to generate resume feedback')
  }
}
