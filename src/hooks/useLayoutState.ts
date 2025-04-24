import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export type TabType = "task" | "resource" | "about" | "notes";

export function useLayoutState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab = searchParams.get('tab') || 'task' as TabType;
  const [hideCompletedTasks, setHideCompletedTasks] = useState(JSON.parse(localStorage.getItem("hideCompletedTasks") || "false"));

  // Helper to preserve all existing params when updating
  const updateParams = useCallback((updates: Record<string, string>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      // Apply all updates
      Object.entries(updates).forEach(([key, value]) => {
        newParams.set(key, value)
      })
      return newParams
    }, { replace: true })
  }, [setSearchParams])

  const setTab = useCallback((tab: TabType) => {
    updateParams({ tab })
  }, [updateParams])

  const toggleHideCompleted = useCallback(() => {
    setHideCompletedTasks((prev: boolean) => {
      localStorage.setItem("hideCompletedTasks", (!prev).toString());
      return !prev;
    });
  }, [setHideCompletedTasks])

  return {
    currentTab,
    hideCompletedTasks,
    setTab,
    toggleHideCompleted
  }
} 