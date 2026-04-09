import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext(null)

async function upsertUser(firebaseUser) {
  await setDoc(
    doc(db, 'users', firebaseUser.uid),
    {
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 리다이렉트 로그인 후 결과 처리
    getRedirectResult(auth).catch((err) => {
      console.error('redirect result error:', err)
    })

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await upsertUser(firebaseUser)
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
