
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import connectDB, { JobDescription } from '@/lib/mongodb'
import { notifyJobDescriptionAdded } from '@/lib/n8n'

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

    const { title, company, description, requirements, keywords } = req.body

    if (!title || !company || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Connect to MongoDB
    await connectDB()

    // Create job description
    const jobDescription = new JobDescription({
      userId: user.id,
      title,
      company,
      description,
      requirements: requirements || [],
      keywords: keywords || [],
    })

    await jobDescription.save()

    // Trigger n8n workflow
    await notifyJobDescriptionAdded(
      user.id,
      jobDescription._id.toString(),
      title,
      company
    )

    res.status(201).json({
      success: true,
      data: jobDescription,
    })
  } catch (error) {
    console.error('Job creation error:', error)
    res.status(500).json({ error: 'Failed to create job description' })
  }
}
