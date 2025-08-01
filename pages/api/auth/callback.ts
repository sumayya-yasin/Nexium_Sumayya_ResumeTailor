
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { event, session } = req.body

    if (event === 'SIGNED_IN' && session) {
      const { user } = session
      
      // Check if this is a new user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!existingProfile) {
        // Create new user profile
        await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
          })

        console.log(`New user signed up: ${user.id} - ${user.email}`)
      }
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Auth callback error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
