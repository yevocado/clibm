import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useVisits(userId) {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(
      collection(db, 'users', userId, 'visits'),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setVisits(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addVisit = (data) => {
    addDoc(collection(db, 'users', userId, 'visits'), {
      ...data,
      createdAt: serverTimestamp(),
    }).catch((err) => console.error('addVisit error:', err))
  }

  const deleteVisit = async (visitId) => {
    await deleteDoc(doc(db, 'users', userId, 'visits', visitId))
  }

  return { visits, loading, addVisit, deleteVisit }
}
