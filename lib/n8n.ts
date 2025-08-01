
export interface N8nWebhookPayload {
  event: string
  userId: string
  data: Record<string, any>
  timestamp: string
}

export async function triggerN8nWorkflow(
  webhookUrl: string,
  payload: N8nWebhookPayload
): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('N8n webhook trigger failed:', error)
    // Don't throw error to prevent breaking main application flow
  }
}

export const N8N_EVENTS = {
  USER_SIGNUP: 'user_signup',
  RESUME_TAILORED: 'resume_tailored',
  JOB_DESCRIPTION_ADDED: 'job_description_added',
  AI_PROCESS_ERROR: 'ai_process_error',
} as const

export async function notifyUserSignup(userId: string, email: string) {
  if (!process.env.N8N_WEBHOOK_USER_SIGNUP) return
  
  await triggerN8nWorkflow(process.env.N8N_WEBHOOK_USER_SIGNUP, {
    event: N8N_EVENTS.USER_SIGNUP,
    userId,
    data: { email },
    timestamp: new Date().toISOString(),
  })
}

export async function notifyResumeTailored(
  userId: string,
  resumeId: string,
  jobTitle: string,
  score: number
) {
  if (!process.env.N8N_WEBHOOK_RESUME_TAILORED) return
  
  await triggerN8nWorkflow(process.env.N8N_WEBHOOK_RESUME_TAILORED, {
    event: N8N_EVENTS.RESUME_TAILORED,
    userId,
    data: { resumeId, jobTitle, score },
    timestamp: new Date().toISOString(),
  })
}

export async function notifyJobDescriptionAdded(
  userId: string,
  jobId: string,
  jobTitle: string,
  company: string
) {
  if (!process.env.N8N_WEBHOOK_JOB_ADDED) return
  
  await triggerN8nWorkflow(process.env.N8N_WEBHOOK_JOB_ADDED, {
    event: N8N_EVENTS.JOB_DESCRIPTION_ADDED,
    userId,
    data: { jobId, jobTitle, company },
    timestamp: new Date().toISOString(),
  })
}
