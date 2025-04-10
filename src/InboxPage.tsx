import { Task } from 'wasp/entities'
import { getInboxTasks, useQuery } from 'wasp/client/operations'
import { createTask, updateTaskStatus, deleteTask, moveTask } from 'wasp/client/operations'
import { useState } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Checkbox } from './components/ui/checkbox'
import { Trash2, MoveRight } from 'lucide-react'
import { getProjects } from 'wasp/client/operations'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu'
import { useSearchParams } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/custom/AppSidebar'
import { CommandMenu } from './components/custom/CommandMenu'
import { Folder } from 'lucide-react'
import { Separator } from './components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from './components/ui/breadcrumb'

export function InboxPage() {
  const { data: tasks, isLoading, error } = useQuery(getInboxTasks)
  const { data: projects } = useQuery(getProjects)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [searchParams] = useSearchParams()
  const hideSidebar = searchParams.get('hideSidebar') === 'true'

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return
    try {
      await createTask({
        title: newTaskTitle,
        // No projectId means it goes to inbox
      })
      setNewTaskTitle('')
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateTask()
    }
  }

  const handleToggleTask = async (taskId: number, currentStatus: boolean) => {
    try {
      await updateTaskStatus({
        id: taskId,
        complete: !currentStatus
      })
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask({ id: taskId })
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleMoveTask = async (taskId: number, projectId: number) => {
    try {
      await moveTask({
        taskId,
        projectId
      })
    } catch (error) {
      console.error('Failed to move task:', error)
    }
  }

  return (
    <SidebarProvider open={!hideSidebar}>
      <CommandMenu />
      <AppSidebar
        items={[
          {
            isActive: true,
            title: "Projects",
            icon: Folder,
            items:
              projects?.map((project) => ({
                title: project.title,
                url: `/projects/${project.id}`,
              })) || [],
          },
        ]}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Inbox</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto p-6">
          <div>
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold">Inbox Tasks</h2>
            </div>
            <div>
              <div className="flex gap-2 mb-6">
                <Input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button onClick={handleCreateTask}>Add Task</Button>
              </div>

              {isLoading && <div>Loading...</div>}
              {error && <div className="text-red-500">Error: {error.message}</div>}

              <div className="space-y-4">
                {tasks?.map((task: Task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.complete}
                        onCheckedChange={() => handleToggleTask(task.id, task.complete)}
                      />
                      <span className={task.complete ? 'line-through text-gray-500' : ''}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoveRight className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {projects?.map((project) => (
                            <DropdownMenuItem
                              key={project.id}
                              onClick={() => handleMoveTask(task.id, project.id)}
                            >
                              Move to {project.title}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {tasks?.length === 0 && !isLoading && (
                  <div className="text-center text-gray-500">No tasks in inbox</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 