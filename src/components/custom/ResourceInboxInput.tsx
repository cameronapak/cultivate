"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, CheckSquare, FileText, Link } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import { isUrl } from "../../lib/utils"

type ItemType = "task" | "note" | "link"

export default function ResourceInboxInput() {
  const [content, setContent] = useState("")
  const [itemType, setItemType] = useState<ItemType>("task")
  const [detectedUrls, setDetectedUrls] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Detect URLs in the input content
  useEffect(() => {
    if (isUrl(content)) {
      setDetectedUrls([content])
    } else {
      setDetectedUrls([])
    }
  }, [content])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    // Create the inbox item
    const newItem = {
      id: Date.now(),
      content,
      type: itemType,
      urls: detectedUrls,
      createdAt: new Date().toISOString(),
    }

    console.log("Added to inbox:", newItem)

    // Reset the input
    setContent("")
    inputRef.current?.focus()
  }

  const handleTypeChange = (value: string) => {
    if (value) {
      setItemType(value as ItemType)

      // If switching to link mode and no content yet, add https:// prefix
      if (value === "link" && !content && inputRef.current) {
        setContent("https://")
        // Use setTimeout to ensure the input is focused after the state update
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.setSelectionRange(8, 8)
        }, 0)
      }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <ToggleGroup type="single" value={itemType} onValueChange={handleTypeChange}>
                <ToggleGroupItem value="task" aria-label="Task" className="gap-1">
                  <CheckSquare className="h-4 w-4" />
                  <span>Task</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="note" aria-label="Note" className="gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Note</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="link" aria-label="Link" className="gap-1">
                  <Link className="h-4 w-4" />
                  <span>Link</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  placeholder={
                    itemType === "task" ? "Add a task..." : itemType === "note" ? "Add a note..." : "Add a link..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Add to inbox</span>
              </Button>
            </div>

            {detectedUrls.length > 0 && (
              <div className="text-sm">
                <p className="font-medium text-muted-foreground mb-1">Detected URLs:</p>
                <div className="flex flex-wrap gap-2">
                  {detectedUrls.map((url, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs flex items-center"
                    >
                      <span className="truncate max-w-[200px]">{url}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
