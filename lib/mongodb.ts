import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri: string = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db('resume-tailor')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw new Error('Database connection failed')
  }
}

export default clientPromise

// Job Description Schema
import mongoose from 'mongoose'

// Job Description Schema
export const JobDescriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  keywords: [String],
  requirements: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// AI Generated Resume Schema  
export const AIResumeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  jobDescriptionId: { type: String, required: true },
  originalResumeId: { type: String, required: true },
  tailoredContent: { type: Object, required: true },
  aiMetadata: {
    model: String,
    promptVersion: String,
    processingTime: Number,
    confidence: Number
  },
  createdAt: { type: Date, default: Date.now }
})

// AI Feedback Logs Schema
export const AIFeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  resumeId: { type: String, required: true },
  feedback: { type: String, required: true },
  suggestions: [String],
  score: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now }
})

export const JobDescription = mongoose.models.JobDescription || mongoose.model('JobDescription', JobDescriptionSchema)
export const AIResume = mongoose.models.AIResume || mongoose.model('AIResume', AIResumeSchema)
export const AIFeedback = mongoose.models.AIFeedback || mongoose.model('AIFeedback', AIFeedbackSchema)