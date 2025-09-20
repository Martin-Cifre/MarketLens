import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Position, Alert, Watch, Recommendation } from '@prisma/client'

interface UserStore {
  user: User | null
  positions: Position[]
  alerts: Alert[]
  watches: Watch[]
  recommendations: Recommendation[]
  setUser: (user: User | null) => void
  setPositions: (positions: Position[]) => void
  setAlerts: (alerts: Alert[]) => void
  setWatches: (watches: Watch[]) => void
  setRecommendations: (recommendations: Recommendation[]) => void
  addPosition: (position: Position) => void
  updatePosition: (id: string, updates: Partial<Position>) => void
  removePosition: (id: string) => void
  addAlert: (alert: Alert) => void
  updateAlert: (id: string, updates: Partial<Alert>) => void
  removeAlert: (id: string) => void
  addWatch: (watch: Watch) => void
  removeWatch: (id: string) => void
  clearUserData: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      positions: [],
      alerts: [],
      watches: [],
      recommendations: [],
      
      setUser: (user) => set({ user }),
      
      setPositions: (positions) => set({ positions }),
      
      setAlerts: (alerts) => set({ alerts }),
      
      setWatches: (watches) => set({ watches }),
      
      setRecommendations: (recommendations) => set({ recommendations }),
      
      addPosition: (position) => set((state) => ({
        positions: [...state.positions, position]
      })),
      
      updatePosition: (id, updates) => set((state) => ({
        positions: state.positions.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      removePosition: (id) => set((state) => ({
        positions: state.positions.filter(p => p.id !== id)
      })),
      
      addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, alert]
      })),
      
      updateAlert: (id, updates) => set((state) => ({
        alerts: state.alerts.map(a => 
          a.id === id ? { ...a, ...updates } : a
        )
      })),
      
      removeAlert: (id) => set((state) => ({
        alerts: state.alerts.filter(a => a.id !== id)
      })),
      
      addWatch: (watch) => set((state) => ({
        watches: [...state.watches, watch]
      })),
      
      removeWatch: (id) => set((state) => ({
        watches: state.watches.filter(w => w.id !== id)
      })),
      
      clearUserData: () => set({
        user: null,
        positions: [],
        alerts: [],
        watches: [],
        recommendations: []
      })
    }),
    {
      name: 'user-storage',
    }
  )
)