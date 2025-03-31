import express from 'express'
import { supabase } from '../index'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ 
        success: false,
        error: 'SQL query is required',
        message: 'Please provide a SQL query'
      })
    }

    console.log('Executing query:', query)

    // Execute the query using Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: query })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Query result:', data)

    // Format the response
    const response = {
      success: true,
      data: data || [],
      message: 'Query executed successfully'
    }

    res.json(response)
  } catch (error: unknown) {
    console.error('SQL execution error:', error)
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('Only SELECT queries are allowed')) {
        res.status(400).json({ 
          success: false,
          error: error.message,
          message: 'Only SELECT queries are allowed for security reasons'
        })
      } else {
        res.status(500).json({ 
          success: false,
          error: error.message,
          message: 'Failed to execute SQL query'
        })
      }
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Unknown error',
        message: 'Failed to execute SQL query'
      })
    }
  }
})

export default router 