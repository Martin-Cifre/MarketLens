import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useUserStore } from "@/store/user"

export function useUserData() {
  const { data: session } = useSession()
  const {
    setUser,
    setPositions,
    setAlerts,
    setWatches,
    setRecommendations,
    clearUserData
  } = useUserStore()

  useEffect(() => {
    if (session?.user) {
      // Fetch user data from API
      fetchUserData()
    } else {
      clearUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/data")
      if (response.ok) {
        const data = await response.json()
        setPositions(data.positions)
        setAlerts(data.alerts)
        setWatches(data.watches)
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  return { refreshUserData: fetchUserData }
}