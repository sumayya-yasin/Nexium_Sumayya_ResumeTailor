import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function tailorResume(resumeContent: string, jobDescription: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Tailor the given resume to match the job description while keeping it truthful and professional. Maintain the original structure but optimize keywords and emphasize relevant experience."
        },
        {
          role: "user",
          content: `Job Description:\n${jobDescription}\n\nOriginal Resume:\n${resumeContent}\n\nPlease tailor this resume to better match the job description.`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    return completion.choices[0]?.message?.content || resumeContent
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to tailor resume with AI')
  }
}

export async function generateJobSuggestions(resumeContent: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a career advisor. Based on the resume provided, suggest 5 job titles that would be a good fit. Return only a JSON array of job titles as strings."
        },
        {
          role: "user",
          content: `Resume:\n${resumeContent}\n\nSuggest job titles:`
        }
      ],
      max_tokens: 200,
      temperature: 0.5
    })

    const response = completion.choices[0]?.message?.content
    if (response) {
      try {
        return JSON.parse(response)
      } catch {
        // If JSON parsing fails, return a default array
        return []
      }
    }
    return []
  } catch (error) {
    console.error('OpenAI API error:', error)
    return []
  }
}