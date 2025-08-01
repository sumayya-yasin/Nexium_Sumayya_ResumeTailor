
# Landing Page Wireframe

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  🖥️ HEADER                                                   │
│  [Logo] AI Resume Tailor                            [Login] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 HERO SECTION                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              [⚡ AI-Powered Badge]                      ││
│  │                                                         ││
│  │         Tailor Your Resume to                           ││
│  │            Any Job Description                          ││
│  │                                                         ││
│  │    AI analyzes job descriptions and optimizes your     ││
│  │   resume content, keywords, and formatting to maximize ││
│  │          your chances of landing interviews.           ││
│  │                                                         ││
│  │              [Get Started Free] 🚀                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  📋 FEATURES SECTION                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  [🤖 AI]        [📊 Analytics]      [⚡ Fast]          ││
│  │  Smart          Match Score         Under 10s          ││
│  │  Optimization   Tracking            Processing         ││
│  │                                                         ││
│  │  [🎯 ATS]       [📝 Multiple]       [💾 Save]          ││
│  │  Compatible     Templates          Versions            ││
│  │  Formatting     Support            History             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  🔐 AUTH SECTION                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Sign Up / Log In                         ││
│  │                                                         ││
│  │  📧 [Email Input Field              ]                  ││
│  │                                                         ││
│  │     [Send Magic Link] or [Continue with Email]         ││
│  │                                                         ││
│  │  ✨ No password required - secure magic link login     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Key Elements

### Header
- **Logo + Brand Name:** "AI Resume Tailor" with document icon
- **Navigation:** Minimal - just "Login" button for existing users
- **Sticky positioning** on scroll

### Hero Section
- **Badge:** "⚡ AI-Powered Resume Optimization" with subtle glow
- **Headline:** Large, bold typography emphasizing the core value prop
- **Subtext:** Clear explanation of benefits in 2-3 lines
- **CTA Button:** Prominent "Get Started Free" with rocket emoji
- **Background:** Dark gradient with subtle tech-inspired patterns

### Features Grid
- **3x2 Grid Layout** on desktop, stacked on mobile
- **Icon + Title + Description** for each feature
- **Hover effects** with subtle animations
- **Icons:** Modern, consistent style (Lucide icons)

### Authentication Form
- **Integrated on landing page** to reduce friction
- **Email-first approach** with magic link option
- **Social auth options** (future enhancement)
- **Trust indicators** ("No password required", security icons)

## Responsive Behavior

### Desktop (1200px+)
- 3-column feature grid
- Hero content centered with max-width
- Form beside hero content

### Tablet (768px - 1199px)  
- 2-column feature grid
- Full-width hero section
- Form below hero

### Mobile (< 768px)
- Single column layout
- Stacked features
- Full-width form
- Larger touch targets

## Interactions

### Micro-animations
- **Button hover effects** with scale and glow
- **Feature cards** lift on hover
- **Form focus states** with smooth transitions
- **Loading states** during magic link sending

### Call-to-Actions
- **Primary CTA:** "Get Started Free" → Navigate to dashboard
- **Secondary CTA:** "Learn More" → Scroll to features
- **Auth CTA:** Magic link → Email verification flow
