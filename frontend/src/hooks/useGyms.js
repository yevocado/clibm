import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useGyms(userId) {
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(
      collection(db, 'users', userId, 'gyms'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setGyms(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addGym = async ({ name, defaultGradeSystem, colors }) => {
    await addDoc(collection(db, 'users', userId, 'gyms'), {
      name,
      defaultGradeSystem,
      colors,
      createdAt: serverTimestamp(),
    })
  }

  const updateGym = async (gymId, updates) => {
    await updateDoc(doc(db, 'users', userId, 'gyms', gymId), updates)
  }

  const deleteGym = async (gymId) => {
    await deleteDoc(doc(db, 'users', userId, 'gyms', gymId))
  }

  return { gyms, loading, addGym, updateGym, deleteGym }
}
