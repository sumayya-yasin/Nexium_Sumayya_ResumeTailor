import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

const options = {
  serverSelectionTimeoutMS: 5000, 
  socketTimeoutMS: 45000, 
}

if (process.env.NODE_ENV === 'development') {
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

export default clientPromise

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await clientPromise
    const db = client.db('resume_tailor')
    return { client, db }
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

import mongoose from 'mongoose'

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