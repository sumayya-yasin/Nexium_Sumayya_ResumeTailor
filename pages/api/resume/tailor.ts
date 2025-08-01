
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { connectToDatabase } from '@/lib/mongodb'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, jobDescription } = req.body

    if (!userId || !jobDescription) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get user's resume from Supabase
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('resume_content')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile?.resume_content) {
      return res.status(404).json({ error: 'Resume not found' })
    }

    // Use OpenAI to tailor the resume
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Tailor the given resume to match the job description while keeping it truthful and professional."
        },
        {
          role: "user",
          content: `Job Description: ${jobDescription}\n\nOriginal Resume: ${profile.resume_content}\n\nPlease tailor this resume to better match the job description.`
        }
      ],
      max_tokens: 2000
    })

    const tailoredResume = completion.choices[0]?.message?.content

    if (!tailoredResume) {
      return res.status(500).json({ error: 'Failed to generate tailored resume' })
    }

    // Save to MongoDB for history
    try {
      const { db } = await connectToDatabase()
      await db.collection('tailored_resumes').insertOne({
        userId,
        jobDescription,
        originalResume: profile.resume_content,
        tailoredResume,
        createdAt: new Date()
      })
    } catch (mongoError) {
      console.error('MongoDB save error:', mongoError)
      // Continue even if MongoDB save fails
    }

    return res.status(200).json({
      success: true,
      tailoredResume
    })

  } catch (error) {
    console.error('Error in resume tailor:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
