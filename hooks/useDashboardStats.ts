// hooks/useDashboardStats.ts
"use client"

// import { useState, useEffect } from "react"
import useSWR from 'swr'
import axios from "axios"

const fetcher = (url: string) => axios.get(url).then((res) => res.data)
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useDashboardStats = () => {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_URL}/dashboard-stats`,
    fetcher,
    {
      revalidateOnFocus: false,  // don’t refetch every time user switches tabs
      dedupingInterval: 60000,   // cache results for 1 minute
    }
  )
  // const { data, isLoading } = useSWR(`${API_URL}/dashboard-stats`, fetcher)
  // const [stats, setStats] = useState(null)
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState(null)

  // useEffect(() => {
  //   fetch(`${API_URL}/dashboard-stats`)
  //     .then(res => res.json())
  //     .then(data => {
  //       setStats(data)
  //       setLoading(false)
  //     })
  //     .catch(err => {
  //       console.error(err)
  //       setError(err)
  //       setLoading(false)
  //     })
  // }, [])
  // console.log('stats data', data)
  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  }
}
