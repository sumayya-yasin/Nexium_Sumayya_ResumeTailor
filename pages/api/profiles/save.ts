
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { resume_content } = req.body

    if (!resume_content) {
      return res.status(400).json({ error: 'Missing resume content' })
    }

    // Update or insert profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: user.id,
        resume_content: resume_content,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Profile save error:', error)
      return res.status(500).json({ error: 'Failed to save profile' })
    }

    return res.status(200).json({ 
      success: true,
      profile: data 
    })

  } catch (error) {
    console.error('Error in profile save:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
