
# AI Resume Tailor - Technical Architecture

## System Overview

The AI Resume Tailor is a full-stack web application built with modern technologies, leveraging AI services for intelligent resume optimization. The system follows a microservices-inspired architecture with clear separation of concerns.

## Technology Stack

### Frontend
- **Framework:** Next.js 15 with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React hooks and local state
- **Build Tool:** Next.js built-in bundling
- **Deployment:** Replit hosting

### Backend
- **Runtime:** Node.js with Next.js API routes
- **Authentication:** Supabase Auth
- **AI Processing:** OpenAI GPT-3.5-turbo API
- **File Handling:** Built-in Next.js capabilities

### Databases
- **User Data:** Supabase (PostgreSQL)
  - User profiles and authentication
  - Base resume content storage
- **Document Storage:** MongoDB Atlas
  - Job descriptions
  - Tailored resume versions
  - Processing metadata

### External Services
- **OpenAI API:** Content generation and optimization
- **Supabase:** Authentication, user management, profiles
- **MongoDB Atlas:** Document storage and retrieval
- **Replit:** Application hosting and deployment

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │   Web Browser   │  │  Mobile Device  │  │   Tablet        ││
│  │   (Desktop)     │  │   (iOS/Android) │  │   (iPad/etc)    ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend                           │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │   Pages     │ │ Components  │ │     Hooks           │ │ │
│  │  │             │ │             │ │                     │ │ │
│  │  │ • Landing   │ │ • AuthForm  │ │ • useAuth           │ │ │
│  │  │ • Dashboard │ │ • ResumeCard│ │ • useResume         │ │ │
│  │  │ • Results   │ │ • JobForm   │ │ • useAI             │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js API Routes                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │    Auth     │ │   Resume    │ │      Jobs           │ │ │
│  │  │             │ │             │ │                     │ │ │
│  │  │ • callback  │ │ • tailor    │ │ • create            │ │ │
│  │  │             │ │ • list      │ │                     │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │ │
│  │  │  Profiles   │ │   Test      │ │     Utils           │ │ │
│  │  │             │ │             │ │                     │ │ │
│  │  │ • get       │ │ • openai    │ │ • validation        │ │ │
│  │  │ • save      │ │             │ │ • helpers           │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   AI Service    │ │  Auth Service   │ │  Data Service   │ │
│  │                 │ │                 │ │                 │ │
│  │ • Content Gen   │ │ • User Mgmt     │ │ • CRUD Ops      │ │
│  │ • Optimization  │ │ • Session Mgmt  │ │ • Validation    │ │
│  │ • Analysis      │ │ • Token Verify  │ │ • Transformers  │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│  │   Supabase      │ │  MongoDB Atlas  │ │   OpenAI API    │ │
│  │  (PostgreSQL)   │ │   (Documents)   │ │   (AI Models)   │ │
│  │                 │ │                 │ │                 │ │
│  │ • Users         │ │ • Job Desc      │ │ • GPT-3.5       │ │
│  │ • Profiles      │ │ • Resumes       │ │ • Completions   │ │
│  │ • Auth Sessions │ │ • Metadata      │ │                 │ │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Database Schemas

### Supabase (PostgreSQL) Schema

```sql
-- Users table (managed by Supabase Auth)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

### MongoDB Collections Schema

```javascript
// Job Descriptions Collection
{
  _id: ObjectId,
  userId: String,          // Supabase user ID
  title: String,
  company: String,
  description: String,
  requirements: [String],
  keywords: [String],
  createdAt: Date,
  updatedAt: Date
}

// Tailored Resumes Collection
{
  _id: ObjectId,
  userId: String,          // Supabase user ID
  jobDescriptionId: ObjectId,
  originalResumeId: String,
  tailoredContent: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      website: String
    },
    summary: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      school: String,
      year: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String]
    }]
  },
  aiMetadata: {
    confidence: Number,
    processingTime: Number,
    keywordMatches: [String],
    suggestions: [String],
    model: String,
    version: String
  },
  createdAt: Date,
  updatedAt: Date
}

// AI Feedback Collection (for analytics)
{
  _id: ObjectId,
  userId: String,
  resumeId: ObjectId,
  feedback: {
    rating: Number,
    comments: String,
    improvements: [String]
  },
  createdAt: Date
}
```

## API Endpoints

### Authentication Endpoints
```typescript
POST /api/auth/callback
// Handles Supabase auth callbacks
// Returns: JWT token, user info

GET /api/auth/user
// Gets current user information
// Returns: User profile data
```

### Profile Management
```typescript
GET /api/profiles/get
// Retrieves user profile and resume content
// Headers: Authorization: Bearer <token>
// Returns: Profile object with resume data

POST /api/profiles/save
// Saves/updates user profile and resume content
// Headers: Authorization: Bearer <token>
// Body: { resume_content: ResumeContent }
// Returns: Updated profile object
```

### Job Description Management
```typescript
POST /api/jobs/create
// Creates a new job description entry
// Headers: Authorization: Bearer <token>
// Body: { title, company, description, requirements, keywords }
// Returns: Created job description with ID

GET /api/jobs/list
// Lists user's job descriptions
// Headers: Authorization: Bearer <token>
// Query: ?limit=10&offset=0
// Returns: Array of job descriptions
```

### Resume Processing
```typescript
POST /api/resume/tailor
// Processes resume with AI optimization
// Headers: Authorization: Bearer <token>
// Body: { resumeContent, jobDescriptionId, originalResumeId }
// Returns: Tailored resume with AI metadata

GET /api/resumes/list
// Lists user's tailored resumes
// Headers: Authorization: Bearer <token>
// Query: ?limit=10&offset=0
// Returns: Array of tailored resumes

GET /api/resumes/:id
// Gets specific tailored resume
// Headers: Authorization: Bearer <token>
// Returns: Full resume object
```

### Testing & Utilities
```typescript
GET /api/test-openai
// Tests OpenAI API connection
// Returns: API status and test response

POST /api/utils/parse-resume
// Parses raw resume text into structured data
// Body: { rawText: string }
// Returns: Structured resume object
```

## Data Flow

### Resume Tailoring Process

```
1. User Input
   ├── Resume Content (Raw Text)
   └── Job Description (Title, Company, Description)
   
2. Validation & Processing
   ├── Input Validation
   ├── User Authentication Check
   └── Rate Limiting Check
   
3. AI Processing
   ├── Content Analysis
   ├── Keyword Extraction
   ├── OpenAI API Call
   └── Response Processing
   
4. Data Storage
   ├── Save Job Description (MongoDB)
   ├── Save Tailored Resume (MongoDB)
   └── Update User Profile (Supabase)
   
5. Response Generation
   ├── Format Results
   ├── Calculate Metrics
   └── Return to Client
```

### Authentication Flow

```
1. User Login Request
   ├── Email Input
   └── Magic Link Generation
   
2. Supabase Processing
   ├── Send Magic Link Email
   └── Generate Session Token
   
3. Email Verification
   ├── User Clicks Link
   ├── Token Validation
   └── Session Creation
   
4. Client Authorization
   ├── Store JWT Token
   ├── Set Auth Headers
   └── Enable Protected Routes
```

## Security Architecture

### Authentication & Authorization
- **JWT Tokens:** Supabase-managed authentication
- **Row Level Security:** Database-level access control
- **API Rate Limiting:** Prevent abuse and ensure fair usage
- **Input Validation:** Sanitize and validate all inputs

### Data Protection
- **Encryption in Transit:** HTTPS/TLS for all communications
- **Encryption at Rest:** Database-level encryption
- **Data Isolation:** User data separated by authentication
- **Privacy Controls:** GDPR-compliant data handling

### API Security
- **CORS Configuration:** Restrict cross-origin requests
- **Request Validation:** Schema validation for all endpoints
- **Error Handling:** Secure error messages without data leakage
- **Logging & Monitoring:** Track API usage and errors

## Performance Optimization

### Frontend Performance
- **Code Splitting:** Dynamic imports for optimal bundles
- **Image Optimization:** Next.js automatic image optimization
- **Caching Strategy:** Browser and CDN caching
- **Lazy Loading:** Load components and data on demand

### Backend Performance
- **Database Indexing:** Optimized queries with proper indexes
- **Connection Pooling:** Efficient database connections
- **Caching Layer:** Redis for frequently accessed data
- **API Response Compression:** Gzip compression for responses

### AI Processing Optimization
- **Request Batching:** Group multiple AI requests
- **Response Caching:** Cache similar requests/responses
- **Fallback Handling:** Graceful degradation when AI unavailable
- **Processing Timeouts:** Prevent long-running requests

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking:** Real-time error monitoring and alerts
- **Performance Metrics:** Response times, throughput, uptime
- **User Analytics:** Usage patterns, feature adoption
- **AI Performance:** Success rates, processing times

### Business Metrics
- **User Engagement:** DAU, MAU, session duration
- **Feature Usage:** Resume processing, downloads, saves
- **Success Tracking:** Job application outcomes
- **Performance Indicators:** Match scores, user satisfaction

## Deployment Architecture

### Replit Deployment
- **Environment Configuration:** Development, staging, production
- **Environment Variables:** Secure secret management
- **Build Process:** Automated builds with CI/CD
- **Health Checks:** Application health monitoring

### Scaling Considerations
- **Horizontal Scaling:** Multiple app instances
- **Database Scaling:** Read replicas, connection pooling
- **CDN Integration:** Static asset distribution
- **Load Balancing:** Request distribution across instances

## Future Architecture Enhancements

### Microservices Migration
- **AI Service:** Dedicated AI processing service
- **User Service:** Authentication and profile management
- **Document Service:** Resume and job description management
- **Analytics Service:** Usage tracking and insights

### Advanced Features
- **Real-time Updates:** WebSocket connections for live updates
- **Offline Support:** Progressive Web App capabilities
- **Mobile Apps:** Native iOS/Android applications
- **API Gateway:** Centralized API management and routing

### Infrastructure Improvements
- **Container Orchestration:** Docker and Kubernetes deployment
- **Message Queues:** Asynchronous processing with Redis/RabbitMQ
- **Multi-region Deployment:** Global content distribution
- **Advanced Monitoring:** APM tools and observability stack
