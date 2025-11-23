'use client'

import { createClient } from '@/lib/supabase/client'

import { useRouter } from 'next/navigation'

import { useState, useEffect } from 'react'



export default function AuthButton() {

  const [user, setUser] = useState<any>(null)

  const [loading, setLoading] = useState(true)

  const router = useRouter()

  const supabase = createClient()



  useEffect(() => {

    const getUser = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      setUser(user)

      setLoading(false)

    }



    getUser()



    const { data: { subscription } } = supabase.auth.onAuthStateChange(

      (event, session) => {

        if (event === 'SIGNED_IN') {

          setUser(session?.user ?? null)

          router.refresh()

        } else if (event === 'SIGNED_OUT') {

          setUser(null)

          router.refresh()

        }

      }

    )



    return () => subscription.unsubscribe()

  }, [router, supabase.auth])



  const handleSignIn = async () => {

    const { data, error } = await supabase.auth.signInWithOAuth({

      provider: 'google',

      options: {

        redirectTo: `${location.origin}/auth/callback`,

      },

    })

    if (error) {

      console.error('Error signing in:', error)

    }

  }



  const handleSignOut = async () => {

    await supabase.auth.signOut()

    router.push('/')

  }



  if (loading) {

    return <div className="px-4 py-2">Lädt...</div>

  }



  if (user) {

    return (

      <div className="flex items-center gap-4">

        <span className="text-sm text-gray-600">

          {user.email}

        </span>

        <button

          onClick={handleSignOut}

          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"

        >

          Abmelden

        </button>

      </div>

    )

  }



  return (

    <button

      onClick={handleSignIn}

      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

    >

      Mit Google anmelden

    </button>

  )

}

