import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, FileText} from 'lucide-react'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage('Please enter your email')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email for the login link!')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <Card className="bg-slate-800 border-2 border-slate-600">
      <div className="bg-[#1e293b] border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-white">AI Resume Tailor</h1>
            </div>
          </div>
        </div>
      </div>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white">Welcome to Resume Tailor</CardTitle>
        <CardDescription className="text-slate-300">
          Sign in with your email to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-primary focus:border-primary"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send magic link
              </>
            )}
          </Button>

          {message && (
            <div className={`text-sm text-center p-3 rounded-md ${
              message.includes('Check your email') 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}