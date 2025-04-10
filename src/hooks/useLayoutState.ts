import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

type TabType = 'tasks' | 'resources' | 'about'

export function useLayoutState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab = searchParams.get('tab') as TabType || 'tasks'
  const isSidebarHidden = searchParams.get('hideSidebar') === 'true'
  const hideCompletedTasks = searchParams.get('hideCompleted') === 'true'

  const setTab = useCallback((tab: TabType) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('tab', tab)
      return newParams
    }, { replace: true })
  }, [setSearchParams])

  const toggleSidebar = useCallback(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      // Preserve the current tab when toggling sidebar
      const currentTab = prev.get('tab') || 'tasks'
      newParams.set('tab', currentTab)
      newParams.set('hideSidebar', (!isSidebarHidden).toString())
      return newParams
    }, { replace: true })
  }, [isSidebarHidden, setSearchParams])

  const toggleHideCompleted = useCallback(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      newParams.set('hideCompleted', (!hideCompletedTasks).toString())
      return newParams
    }, { replace: true })
  }, [hideCompletedTasks, setSearchParams])

  return {
    currentTab,
    isSidebarHidden,
    hideCompletedTasks,
    setTab,
    toggleSidebar,
    toggleHideCompleted
  }
} 