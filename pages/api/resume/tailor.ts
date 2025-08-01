
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import connectDB, { JobDescription, AIResume } from '@/lib/mongodb'
import { tailorResumeToJob, ResumeContent } from '@/lib/ai'
import { notifyResumeTailored } from '@/lib/n8n'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { resumeContent, jobDescriptionId } = req.body

    if (!resumeContent || !jobDescriptionId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Connect to MongoDB
    await connectDB()

    // Get job description from MongoDB
    const jobDescription = await JobDescription.findById(jobDescriptionId)
    if (!jobDescription) {
      return res.status(404).json({ error: 'Job description not found' })
    }

    // Tailor resume using AI
    const aiResult = await tailorResumeToJob(resumeContent, {
      title: jobDescription.title,
      company: jobDescription.company,
      description: jobDescription.description,
      requirements: jobDescription.requirements,
      keywords: jobDescription.keywords,
    })

    // Save tailored resume to MongoDB
    const aiResume = new AIResume({
      userId: user.id,
      jobDescriptionId: jobDescriptionId,
      originalResumeId: req.body.originalResumeId || 'temp',
      tailoredContent: aiResult.tailoredResume,
      aiMetadata: {
        model: 'gpt-4-turbo-preview',
        promptVersion: '1.0',
        processingTime: Date.now(),
        confidence: aiResult.score,
      },
    })

    await aiResume.save()

    // Trigger n8n workflow
    await notifyResumeTailored(
      user.id,
      aiResume._id.toString(),
      jobDescription.title,
      aiResult.score
    )

    res.status(200).json({
      success: true,
      data: {
        id: aiResume._id,
        tailoredResume: aiResult.tailoredResume,
        suggestions: aiResult.suggestions,
        keywordMatches: aiResult.keywordMatches,
        score: aiResult.score,
      },
    })
  } catch (error) {
    console.error('Resume tailoring error:', error)
    res.status(500).json({ error: 'Failed to tailor resume' })
  }
}
