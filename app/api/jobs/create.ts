
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { connectToDatabase } from '@/lib/mongodb'

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

    const { title, company, description, requirements, keywords } = req.body

    if (!title || !company || !description) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { db } = await connectToDatabase()

    const jobDescription = {
      userId: user.id,
      title,
      company,
      description,
      requirements: requirements || [],
      keywords: keywords || [],
      createdAt: new Date()
    }

    const result = await db.collection('job_descriptions').insertOne(jobDescription)

    return res.status(200).json({
      success: true,
      data: {
        ...jobDescription,
        _id: result.insertedId
      }
    })

  } catch (error) {
    console.error('Error creating job description:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
