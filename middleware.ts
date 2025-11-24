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

  await supabase.auth.getUser()



  return supabaseResponse

}



export const config = {

  matcher: [

    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',

  ],

}
