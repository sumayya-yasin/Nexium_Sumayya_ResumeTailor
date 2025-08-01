
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { connectToDatabase } from '@/lib/mongodb'
import { tailorResumeWithAI, JobDescription } from '@/lib/ai'
import { ObjectId } from 'mongodb'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { resumeContent, jobDescriptionId, originalResumeId } = req.body

    if (!resumeContent || !jobDescriptionId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { db } = await connectToDatabase()

    // Get job description
    const jobDescriptionDoc = await db.collection('job_descriptions')
      .findOne({ _id: new ObjectId(jobDescriptionId) })

    if (!jobDescriptionDoc) {
      return res.status(404).json({ error: 'Job description not found' })
    }

    // Convert to JobDescription type
    const jobDescription = {
      title: jobDescriptionDoc.title,
      company: jobDescriptionDoc.company,
      description: jobDescriptionDoc.description,
      requirements: jobDescriptionDoc.requirements || [],
      keywords: jobDescriptionDoc.keywords || []
    }

    // Tailor resume with AI
    const startTime = Date.now()
    console.log('Starting AI tailoring with job description:', jobDescription.title)
    console.log('Resume content keys:', Object.keys(resumeContent))
    console.log('Resume has rawText:', !!resumeContent.rawText)
    
    const aiResult = await tailorResumeWithAI(resumeContent, jobDescription)
    const processingTime = Date.now() - startTime
    console.log('AI tailoring completed in', processingTime, 'ms with score:', aiResult.score)

    // Save tailored resume
    const tailoredResume = {
      userId: user.id,
      jobDescriptionId: jobDescriptionId,
      originalResumeId: originalResumeId,
      tailoredContent: aiResult.tailoredResume,
      aiMetadata: {
        confidence: aiResult.score || 75,
        processingTime: processingTime,
        keywordMatches: aiResult.keywordMatches || [],
        suggestions: aiResult.suggestions || []
      },
      createdAt: new Date()
    }

    const result = await db.collection('tailored_resumes').insertOne(tailoredResume)

    return res.status(200).json({
      success: true,
      data: {
        ...aiResult,
        _id: result.insertedId,
        processingTime
      }
    })

  } catch (error) {
    console.error('Error tailoring resume:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
