import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useClimbs(userId) {
  const [climbs, setClimbs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(
      collection(db, 'users', userId, 'climbs'),
      orderBy('date', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setClimbs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addClimb = (data) => {
    addDoc(collection(db, 'users', userId, 'climbs'), {
      ...data,
      createdAt: serverTimestamp(),
    }).catch((err) => console.error('addClimb error:', err))
  }

  const deleteClimb = async (climbId) => {
    await deleteDoc(doc(db, 'users', userId, 'climbs', climbId))
  }

  const updateClimb = async (climbId, updates) => {
    await updateDoc(doc(db, 'users', userId, 'climbs', climbId), updates)
  }

  return { climbs, loading, addClimb, deleteClimb, updateClimb }
}
