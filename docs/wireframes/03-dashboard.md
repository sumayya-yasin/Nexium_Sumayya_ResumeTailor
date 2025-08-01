
# Dashboard Wireframe

## Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 HEADER                                                                  │
│  [📄 Logo] AI Resume Tailor                      user@email.com [Sign Out]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 MAIN CONTENT AREA (2-Column Grid)                                      │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐   │
│  │  📝 YOUR RESUME CONTENT         │  │  💼 JOB DESCRIPTION             │   │
│  │  ┌─────────────────────────────┐ │  │  ┌─────────────────────────────┐ │   │
│  │  │ [💾 Save]                   │ │  │  │ Job Title                   │ │   │
│  │  └─────────────────────────────┘ │  │  │ ┌─────────────────────────┐ │ │   │
│  │                                 │  │  │ │ e.g. Senior Developer   │ │ │   │
│  │  Paste Your Complete Resume     │  │  │ └─────────────────────────┘ │ │   │
│  │  ┌─────────────────────────────┐ │  │  │                             │ │   │
│  │  │ Name: John Doe              │ │  │  │ Company                     │ │   │
│  │  │ Email: john@example.com     │ │  │  │ ┌─────────────────────────┐ │ │   │
│  │  │ Phone: +1-555-0123          │ │  │  │ │ e.g. Google, Microsoft  │ │ │   │
│  │  │                             │ │  │  │ └─────────────────────────┘ │ │   │
│  │  │ EXPERIENCE:                 │ │  │  │                             │ │   │
│  │  │ • Senior Developer at...    │ │  │  │ Job Description            │ │   │
│  │  │ • Built React applications  │ │  │  │ ┌─────────────────────────┐ │ │   │
│  │  │ • Led team of 5 engineers   │ │  │  │ │ Paste full job posting  │ │ │   │
│  │  │                             │ │  │  │ │ here...                 │ │ │   │
│  │  │ SKILLS:                     │ │  │  │ │                         │ │ │   │
│  │  │ React, Node.js, Python...   │ │  │  │ │ Requirements:           │ │ │   │
│  │  └─────────────────────────────┘ │  │  │ │ • 5+ years experience   │ │ │   │
│  │                                 │  │  │ │ • React expertise       │ │ │   │
│  │  💡 Tip: Copy and paste your   │  │  │ │ • Team leadership       │ │ │   │
│  │     entire resume text here    │  │  │ └─────────────────────────┘ │ │   │
│  └─────────────────────────────────┘  │                               │ │   │
│                                       │  [🤖 Tailor with AI] 🚀        │ │   │
│                                       └─────────────────────────────────┘   │
│                                                                             │
│  🎯 AI RESPONSE SECTION (Conditional - Shows after processing)             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  ✨ AI-TAILORED RESUME                           Match: 87% [📊]       │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐│ │
│  │  │                                                                     ││ │
│  │  │  📄 Optimized Summary                                               ││ │
│  │  │  Senior Software Engineer with 5+ years of React and Node.js       ││ │
│  │  │  experience, specializing in scalable web applications and team    ││ │
│  │  │  leadership. Proven track record in agile development and...       ││ │
│  │  │                                                                     ││ │
│  │  │  🎯 Key Skills Highlighted        🔑 Keyword Matches               ││ │
│  │  │  [React] [Node.js] [Leadership]   [React] [Team Lead] [Agile]      ││ │
│  │  │  [Python] [API Design] [Testing]  [JavaScript] [Git] [CI/CD]       ││ │
│  │  │                                                                     ││ │
│  │  │  💡 AI Suggestions                                                  ││ │
│  │  │  • Add more specific metrics to experience bullets                 ││ │
│  │  │  • Include mention of microservices architecture                   ││ │
│  │  │  • Highlight cross-functional collaboration experience             ││ │
│  │  │                                                                     ││ │
│  │  │                              [Download PDF] 📥  [Save Version] 💾  ││ │
│  │  └─────────────────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  📚 SAVED RESUMES SECTION                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  📁 Saved Resumes                                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐│ │
│  │  │  📄 Senior Developer - Google        🕒 Jan 15, 2025  Match: 92%   ││ │
│  │  │                                      [📥 Download] [👁️ View]        ││ │
│  │  │─────────────────────────────────────────────────────────────────────││ │
│  │  │  📄 Full Stack Engineer - Meta       🕒 Jan 14, 2025  Match: 88%   ││ │
│  │  │                                      [📥 Download] [👁️ View]        ││ │
│  │  │─────────────────────────────────────────────────────────────────────││ │
│  │  │  📄 Software Architect - Amazon     🕒 Jan 12, 2025  Match: 85%   ││ │
│  │  │                                      [📥 Download] [👁️ View]        ││ │
│  │  └─────────────────────────────────────────────────────────────────────┘│ │
│  │                                                                         │ │
│  │  📊 Total saved resumes: 12                                           │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Mobile Dashboard Layout

```
┌─────────────────────────────────┐
│  🏠 AI Resume Tailor      [☰]  │
├─────────────────────────────────┤
│                                 │
│  📱 MOBILE STACK LAYOUT         │
│  ┌─────────────────────────────┐ │
│  │  📝 YOUR RESUME             │ │
│  │  [💾 Save]                  │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │ Paste your resume...    │ │ │
│  │  │                         │ │ │
│  │  │ (Collapsible/Expandable │ │ │
│  │  │  text area)             │ │ │
│  │  └─────────────────────────┘ │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  💼 JOB DESCRIPTION         │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │ Job Title               │ │ │
│  │  └─────────────────────────┘ │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │ Company                 │ │ │
│  │  └─────────────────────────┘ │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │ Job Description...      │ │ │
│  │  └─────────────────────────┘ │ │
│  │                             │ │
│  │  [🤖 Tailor with AI] 🚀    │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  ✨ AI RESULTS              │ │
│  │  (Appears after processing) │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │  📚 SAVED RESUMES           │ │
│  │  (Accordion/Tab interface)  │ │
│  └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

## Key Interactive Elements

### Form Controls
- **Resume Text Area:** Auto-expanding, syntax highlighting for structure
- **Save Button:** Shows loading state, success confirmation
- **Job Input Fields:** Auto-complete suggestions, validation
- **AI Process Button:** Loading animation, progress indication

### Results Display
- **Match Score:** Animated circular progress indicator
- **Keyword Tags:** Interactive hover effects showing context
- **Suggestions List:** Expandable with detailed explanations
- **Before/After Toggle:** Smooth transition between versions

### History Management
- **Saved Resumes List:** Sortable by date, match score, job title
- **Quick Actions:** Download, view, duplicate, delete
- **Search/Filter:** Find specific tailored versions
- **Pagination:** Load more as needed

## State Management

### Loading States
```
[Processing...] 
├── Analyzing job description... ✅
├── Extracting keywords... ⏳
├── Optimizing content... ⏳
└── Generating suggestions... ⏳
```

### Error States
- **Network Issues:** Retry mechanism with clear messaging
- **AI Service Down:** Fallback content with manual tips
- **Invalid Input:** Real-time validation with helpful guidance
- **Rate Limiting:** Clear explanation with wait time

### Empty States
- **No Resume Content:** Helpful placeholder with examples
- **No Saved Resumes:** Encouraging message with quick start guide
- **No Job Description:** Template examples and guidance

## Accessibility Features

### Keyboard Navigation
- **Tab Order:** Logical flow through all interactive elements
- **Skip Links:** Jump to main content, skip navigation
- **Focus Indicators:** Clear visual focus states
- **Keyboard Shortcuts:** Quick actions (Cmd+S for save, etc.)

### Screen Reader Support
- **ARIA Labels:** Descriptive labels for all controls
- **Live Regions:** Announce AI processing status
- **Semantic HTML:** Proper heading hierarchy and structure
- **Image Alt Text:** Descriptive text for all visual elements

### Visual Accessibility
- **High Contrast Mode:** Alternative color scheme
- **Font Size Controls:** User-adjustable text size
- **Reduced Motion:** Respect motion preferences
- **Color Independence:** Don't rely solely on color for meaning
