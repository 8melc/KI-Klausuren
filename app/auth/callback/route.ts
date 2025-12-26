import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    
    // Erstelle Supabase Client direkt in der Route für besseres Cookie-Handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // In Route Handlers können wir Cookies direkt setzen
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Tausche Code gegen Session (code_verifier wird automatisch aus Cookies gelesen)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: code.substring(0, 10) + '...',
      })
      // Redirect to home with error
      const errorUrl = new URL('/', requestUrl.origin)
      errorUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(errorUrl)
    }

    // Prüfe, ob es sich um einen Password Recovery Flow handelt
    // Wenn next === '/reset-password', dann ist es ein Password Recovery
    const isPasswordRecovery = next === '/reset-password' || next.includes('reset-password')
    
    // Success - redirect to dashboard or next parameter
    // Bei Password Recovery immer zu /reset-password weiterleiten
    const redirectUrl = new URL(isPasswordRecovery ? '/reset-password' : next, requestUrl.origin)
    
    // Check if user is new (first session) for welcome banner
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', user.id)
          .single()

        if (userProfile) {
          const createdAt = new Date(userProfile.created_at)
          const now = new Date()
          const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60
          
          if (diffMinutes < 1) {
            redirectUrl.searchParams.set('welcome', 'true')
          }
        }
      }
    } catch (err) {
      // Ignore errors in welcome check
      console.error('Error checking welcome status:', err)
    }
    
    // Erstelle Response mit Cookies (werden automatisch von cookieStore gesetzt)
    const response = NextResponse.redirect(redirectUrl)
    
    // Kopiere alle Cookies in die Response
    cookieStore.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value)
    })
    
    return response
  }

  // No code parameter - redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
