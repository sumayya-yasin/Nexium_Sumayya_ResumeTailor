
import mongoose from 'mongoose'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, options).then((mongoose) => {
      return mongoose
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB

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
