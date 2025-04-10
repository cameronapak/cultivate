import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

type TabType = 'tasks' | 'resources' | 'about'

export function useLayoutState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab = searchParams.get('tab') as TabType || 'tasks'
  const isSidebarHidden = searchParams.get('hideSidebar') === 'true'
  const hideCompletedTasks = searchParams.get('hideCompleted') === 'true'

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

  const toggleSidebar = useCallback(() => {
    updateParams({
      hideSidebar: (!isSidebarHidden).toString(),
      // Preserve current tab
      tab: currentTab
    })
  }, [isSidebarHidden, currentTab, updateParams])

  const toggleHideCompleted = useCallback(() => {
    updateParams({
      hideCompleted: (!hideCompletedTasks).toString()
    })
  }, [hideCompletedTasks, updateParams])

  return {
    currentTab,
    isSidebarHidden,
    hideCompletedTasks,
    setTab,
    toggleSidebar,
    toggleHideCompleted
  }
} 