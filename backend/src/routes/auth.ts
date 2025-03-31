import express from 'express'
import { supabase } from '../index'

const router = express.Router()

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router 