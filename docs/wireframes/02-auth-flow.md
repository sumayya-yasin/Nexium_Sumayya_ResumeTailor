
# Authentication Flow Wireframe

## Authentication States

### 1. Email Input State
```
┌─────────────────────────────────────────────┐
│  🔐 Sign In to AI Resume Tailor             │
├─────────────────────────────────────────────┤
│                                             │
│  📧 Email Address                           │
│  ┌─────────────────────────────────────────┐ │
│  │ Enter your email address...             │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  [Send Magic Link] 🔗                      │
│                                             │
│  ✨ We'll send you a secure link to log in │
│     No password required!                  │
│                                             │
│  ───────────── or ─────────────             │
│                                             │
│  [Continue with Google] 🔍                 │
│  [Continue with GitHub] 🐙                 │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Magic Link Sent State
```
┌─────────────────────────────────────────────┐
│  📮 Check Your Email                        │
├─────────────────────────────────────────────┤
│                                             │
│        [📧 Email Icon - Large]              │
│                                             │
│  We sent a magic link to:                  │
│  user@example.com                          │
│                                             │
│  Click the link in your email to continue  │
│                                             │
│  [Resend Link] 🔄      [Change Email] ✏️   │
│                                             │
│  ⏱️ Link expires in 10 minutes             │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. Email Verification Success
```
┌─────────────────────────────────────────────┐
│  ✅ Welcome to AI Resume Tailor!            │
├─────────────────────────────────────────────┤
│                                             │
│        [✅ Success Icon - Large]            │
│                                             │
│  Email verified successfully!              │
│                                             │
│  You're now signed in and ready to         │
│  start tailoring your resume with AI.      │
│                                             │
│  [Go to Dashboard] 🚀                      │
│                                             │
│  Auto-redirecting in 3 seconds...          │
│                                             │
└─────────────────────────────────────────────┘
```

### 4. Error States

#### Invalid/Expired Link
```
┌─────────────────────────────────────────────┐
│  ❌ Link Expired                            │
├─────────────────────────────────────────────┤
│                                             │
│        [❌ Error Icon - Large]              │
│                                             │
│  This magic link has expired or is invalid │
│                                             │
│  Please request a new link to continue     │
│                                             │
│  [Request New Link] 🔄                     │
│  [Back to Login] ⬅️                        │
│                                             │
└─────────────────────────────────────────────┘
```

## Flow Diagram

```
    [Landing Page]
          │
          ▼
    [Click "Login"]
          │
          ▼
   [Email Input Form] ──❌ Invalid Email ──➤ [Show Error]
          │                                      │
          ▼ Valid Email                          │
   [Send Magic Link]                             │
          │                                      │
          ▼                                      │
    [Link Sent State] ──────────────────────────┘
          │
          ▼
   [User Clicks Link in Email]
          │
          ├─── ✅ Valid Link ───▶ [Success State] ───▶ [Dashboard]
          │
          └─── ❌ Invalid/Expired ───▶ [Error State] ───▶ [Back to Email Input]
```

## User Experience Considerations

### Loading States
- **Button Loading:** Show spinner when processing
- **Email Sending:** Loading animation with progress indication  
- **Link Processing:** Show verification progress

### Error Handling
- **Network Errors:** Retry mechanism with user feedback
- **Invalid Email:** Real-time validation with helpful messages
- **Expired Sessions:** Clear messaging with recovery options

### Accessibility
- **Screen Reader Support:** Proper ARIA labels and descriptions
- **Keyboard Navigation:** Tab order and focus management
- **Color Contrast:** Ensure readability for all users
- **Error Announcements:** Screen reader notifications for errors

### Security Features
- **Rate Limiting:** Prevent spam/abuse of magic links
- **Link Expiration:** 10-minute timeout for security
- **Single Use:** Links become invalid after use
- **Domain Verification:** Only allow email addresses from valid domains

## Mobile Optimizations

### Touch-Friendly Design
- **Large Input Fields:** Easy typing on mobile keyboards
- **Big Buttons:** Minimum 44px touch targets
- **Proper Input Types:** Email keyboard for email fields

### Progressive Enhancement
- **Offline Support:** Basic functionality without network
- **Fast Loading:** Minimal assets for auth pages
- **Native Integration:** Support for password managers and autofill
