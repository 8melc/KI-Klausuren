import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API-Endpoint zum Refreshen der Session nach Stripe Checkout
 * Wird vom Client aufgerufen, um sicherzustellen, dass die Session erhalten bleibt
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // Hole aktuelle Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json({ error: 'Session error' }, { status: 401 })
    }
    
    if (!session) {
      // Wenn keine Session, versuche zu refreshen
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshedSession) {
        console.error('Refresh error:', refreshError)
        return NextResponse.json({ error: 'No session found' }, { status: 401 })
      }
      
      return NextResponse.json({ 
        success: true, 
        session: {
          user: refreshedSession.user,
          expires_at: refreshedSession.expires_at
        }
      })
    }
    
    // Session existiert bereits
    return NextResponse.json({ 
      success: true, 
      session: {
        user: session.user,
        expires_at: session.expires_at
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

