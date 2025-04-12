import { Task } from 'wasp/entities'
import { getInboxTasks, useQuery } from 'wasp/client/operations'
import { createTask, updateTaskStatus, deleteTask, moveTask } from 'wasp/client/operations'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Checkbox } from '../components/ui/checkbox'
import { Trash2, MoveRight } from 'lucide-react'
import { getProjects } from 'wasp/client/operations'
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '../components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Layout } from '../components/Layout'
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip'

export function InboxPage() {
  const { data: tasks, isLoading, error } = useQuery(getInboxTasks)
  const { data: projects } = useQuery(getProjects)
  const [newTaskTitle, setNewTaskTitle] = useState('')

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

  const getDaysAgo = (date: Date) => {
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Layout breadcrumbItems={[{ title: 'Inbox' }]}>
      <div>
        <div className="flex flex-col gap-2 items-start mb-4">
          <h2 className="text-2xl font-medium">Inbox</h2>
          <p className="text-sm text-muted-foreground">Tasks fade away the longer they sit in the inbox</p>
        </div>
        <div>
          <div className="flex gap-4 mb-6">
            <Input
              autoFocus={true}
              type="text"
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button variant="outline" onClick={handleCreateTask}>Add Task</Button>
          </div>

          {isLoading && <div>Loading...</div>}
          {error && <div className="text-red-500">Error: {error.message}</div>}

          <div>
            <Table>
              <TableBody>
                {tasks?.map((task: Task) => (
                  <TableRow key={task.id} style={{ opacity: Math.max(0.1, 1 - (getDaysAgo(task.createdAt) * 0.33)) }}>
                    <TableCell className="w-8">
                      <Checkbox
                        checked={task.complete}
                        onCheckedChange={() => handleToggleTask(task.id, task.complete)}
                      />
                    </TableCell>
                    <TableCell>
                      <span className={`mr-2 ${task.complete ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      <span className="text-xs text-muted-foreground">  
                        {getDaysAgo(task.createdAt) ? getDaysAgo(task.createdAt) + ' day' + (getDaysAgo(task.createdAt) > 1 ? 's' : '') + ' ago' : 'new'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoveRight className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Move to a project
                              </TooltipContent>
                            </Tooltip>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {projects?.length ? projects?.map((project) => (
                              <DropdownMenuItem
                                key={project.id}
                                onClick={() => handleMoveTask(task.id, project.id)}
                              >
                                Move to {project.title}
                              </DropdownMenuItem>
                            )) : (
                              <DropdownMenuItem className="text-muted-foreground">
                                No projects found
                              </DropdownMenuItem>
                            )}
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
                    </TableCell>
                  </TableRow>
                ))}
                {tasks?.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      You've reached Inbox Zero 🍹
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  )
} 