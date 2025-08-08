// hooks/useDashboardStats.ts
"use client"

import { useState, useEffect } from "react"
import useSWR from 'swr'
import axios from "axios"

const fetcher = (url: string) => axios.get(url).then((res) => res.data)
const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

export const useDashboardStats = () => {
  const { data, isLoading } = useSWR(`${API_URL}/dashboard-stats`, fetcher)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/dashboard-stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(err)
        setLoading(false)
      })
  }, [])
  console.log('stats data', data)
  return {
    data,
    error,
    isLoading,
  }
}
