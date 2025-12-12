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

  // Nach dem Erstellen des Supabase-Clients und vor dem Redirect zum Login:
  const { pathname } = request.nextUrl;

  // Stripe-Checkout-Success: Seite immer durchlassen, auch wenn getUser kurz null liefert
  const isStripeCheckoutSuccess =
    pathname === "/checkout/success";

  if (isStripeCheckoutSuccess) {
    return NextResponse.next();
  }

  // 🔥 WICHTIG: Auth-Callback nicht stören - lasse Route.ts den Code-Exchange machen
  if (request.nextUrl.pathname === '/auth/callback') {
    // Für Auth-Callback: Session refreshen, aber nicht blockieren
    await supabase.auth.getSession()
    return supabaseResponse
  }

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 🔥 WICHTIG: Nach Stripe Redirect Session refreshen
  // Prüfe ob Checkout-Parameter vorhanden sind
  const checkoutStatus = request.nextUrl.searchParams.get('checkout')
  const isCheckoutRedirect = checkoutStatus === 'success' && request.nextUrl.pathname.startsWith('/dashboard')
  
  // getUser() refresht automatisch die Session, wenn nötig
  // Kein manueller refreshSession() Aufruf nötig - das würde zu "Invalid Refresh Token" Fehlern führen

  return supabaseResponse

}



export const config = {

  matcher: [

    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',

  ],

}
