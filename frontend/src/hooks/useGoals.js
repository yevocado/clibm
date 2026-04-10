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

export function useGoals(userId) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(
      collection(db, 'users', userId, 'goals'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setGoals(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addGoal = async (data) => {
    await addDoc(collection(db, 'users', userId, 'goals'), {
      ...data,
      achieved: false,
      createdAt: serverTimestamp(),
    })
  }

  const updateGoal = async (goalId, updates) => {
    await updateDoc(doc(db, 'users', userId, 'goals', goalId), updates)
  }

  const deleteGoal = async (goalId) => {
    await deleteDoc(doc(db, 'users', userId, 'goals', goalId))
  }

  return { goals, loading, addGoal, updateGoal, deleteGoal }
}
