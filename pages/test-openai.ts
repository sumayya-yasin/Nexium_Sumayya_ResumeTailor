
import { NextApiRequest, NextApiResponse } from 'next'
import Groq from 'groq-sdk'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing Groq connection...')
    console.log('API Key exists:', !!process.env.GROQ_API_KEY)
    console.log('API Key starts with:', process.env.GROQ_API_KEY?.substring(0, 10))

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        error: 'Groq API key not configured',
        hasKey: false
      })
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: 'Say "Hello, Groq API is working!"' }],
      max_tokens: 20,
    })

    const content = response.choices[0]?.message?.content

    return res.status(200).json({
      success: true,
      response: content,
      hasKey: true,
      usage: response.usage
    })

  } catch (error) {
    console.error('Groq test error:', error)
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasKey: !!process.env.GROQ_API_KEY,
      details: error
    })
  }
}
