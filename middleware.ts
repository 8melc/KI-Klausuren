import { createServerClient } from '@supabase/ssr'

import { NextResponse, type NextRequest } from 'next/server'



export async function middleware(request: NextRequest) {

  // Prüfe ob Supabase-Konfiguration vorhanden ist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Wenn Supabase nicht konfiguriert ist, einfach weiterleiten
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({

    request,

  })



  const supabase = createServerClient(

    supabaseUrl,

    supabaseAnonKey,

    {

      cookies: {

        getAll() {

          return request.cookies.getAll()

        },

        setAll(cookiesToSet) {

          cookiesToSet.forEach((cookie) => request.cookies.set(cookie.name, cookie.value))

          supabaseResponse = NextResponse.next({

            request,

          })

          cookiesToSet.forEach((cookie) =>

            supabaseResponse.cookies.set(cookie.name, cookie.value, cookie.options)

          )

        },

      },

    }

  )



  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 🔥 WICHTIG: Nach Stripe Redirect Session refreshen
  // Prüfe ob Checkout-Parameter vorhanden sind
  const checkoutStatus = request.nextUrl.searchParams.get('checkout')
  const isCheckoutRedirect = checkoutStatus === 'success' && request.nextUrl.pathname.startsWith('/dashboard')
  
  if (isCheckoutRedirect || (!user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/checkout/success')))) {
    try {
      // Versuche Session zu holen
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error in middleware:', sessionError)
      }
      
      if (session) {
        // Session existiert, versuche zu refreshen
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError) {
          console.error('Session refresh error in middleware:', refreshError)
        } else if (refreshedSession) {
          console.log('✅ Session in middleware refreshed nach Checkout')
        }
      } else if (!user) {
        // Keine Session gefunden - könnte nach Stripe Redirect sein
        // Versuche explizit zu refreshen
        try {
          const { data: { session: newSession } } = await supabase.auth.refreshSession()
          if (newSession) {
            console.log('✅ Neue Session in middleware erstellt nach Checkout')
          }
        } catch (error) {
          console.error('Error creating new session in middleware:', error)
        }
      }
    } catch (error) {
      // Ignoriere Fehler beim Refresh
      console.error('Unexpected error in middleware session refresh:', error)
    }
  }

  return supabaseResponse

}



export const config = {

  matcher: [

    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',

  ],

}
