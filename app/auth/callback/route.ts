import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Prüfe ob User neu ist (erste Session)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Prüfe ob User-Eintrag existiert (neu registriert)
        const { data: userProfile } = await supabase
          .from('users')
          .select('created_at')
          .eq('id', user.id)
          .single()

        // Wenn User-Eintrag sehr neu ist (< 1 Minute), zeige Welcome-Banner
        if (userProfile) {
          const createdAt = new Date(userProfile.created_at)
          const now = new Date()
          const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60
          
          if (diffMinutes < 1) {
            // Neuer User - zeige Welcome-Banner
            return NextResponse.redirect(`${origin}/dashboard?welcome=true`)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}


