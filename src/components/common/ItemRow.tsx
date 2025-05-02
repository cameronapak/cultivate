import React, { useRef } from "react";
import { Task, Resource, Thought } from "wasp/entities";
import { TableRow, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Link2,
  Minus,
  Pencil,
  Trash,
  GripVertical,
  MoveRight,
  ExternalLink,
  BookOpen,
  Folder,
  PencilRuler,
  Archive,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { getFaviconFromUrl, isUrl } from "../../lib/utils";
import { Link } from "react-router-dom";
import { Combobox } from "../custom/ComboBox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type { Project } from "../../types";

// Define a discriminated union type for the item
export type DisplayItem =
  | (Task & { type: "task" })
  | (Resource & { type: "resource"; projects?: Project[] })
  | (Thought & { type: "thought"; title: string; projects?: Project[] });

interface ItemRowProps {
  item: DisplayItem;
  isEditing: boolean;
  isActive?: boolean;
  projects?: Project[];
  hideActions?: boolean;
  onEdit: (item: DisplayItem) => void;
  onSave: (item: DisplayItem, values: any) => Promise<void>;
  onCancelEdit: () => void;
  onDelete: (item: DisplayItem) => void;
  onStatusChange?: (item: Task, complete: boolean) => void;
  onMove?: (item: DisplayItem, projectId: number) => void;
  renderEditForm: (
    item: DisplayItem,
    onSave: (values: any) => void,
    onCancel: () => void
  ) => React.ReactNode;
  hideDragHandle?: boolean;
  onSendAway?: (item: DisplayItem) => void;
}

const removeUrlParamsWithoutPageRefresh = (params: string[]) => {
  const newUrl = new URL(window.location.href);
  params.forEach((param) => {
    newUrl.searchParams.delete(param);
  });
  window.history.replaceState({}, "", newUrl.toString());
};

export const ItemRow = React.forwardRef<HTMLTableRowElement, ItemRowProps>(
  (
    {
      item,
      isEditing,
      hideActions = false,
      isActive = false,
      projects,
      onEdit,
      onSave,
      onCancelEdit,
      onDelete,
      onStatusChange,
      onMove,
      renderEditForm,
      hideDragHandle = false,
      onSendAway,
    },
    ref
  ) => {
    const handleSave = async (values: any) => {
      try {
        await onSave(item, values);
        onCancelEdit();
      } catch (err) {
        console.error("Save failed from ItemRow", err);
      }
    };
    const rowRef = useRef<HTMLTableCellElement>(null);

    // Scroll to the row when it becomes active
    React.useEffect(() => {
      if (isActive && rowRef?.current?.scrollIntoView) {
        setTimeout(() => {
          rowRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          removeUrlParamsWithoutPageRefresh(["resource", "type"]);
        }, 250);
      }
    }, [isActive]);

    if (isEditing) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="bg-background p-0">
            {renderEditForm(item, handleSave, onCancelEdit)}
          </TableCell>
        </TableRow>
      );
    }

    const commonRowClasses = cn(
      "group items-center",
      hideDragHandle
        ? "grid grid-cols-[auto_1fr_auto]"
        : "grid grid-cols-[auto_auto_1fr_auto]",
      item.type === "task" && (item as Task).complete ? "completed" : "",
      isActive && "bg-muted/80 hover:bg-muted"
    );

    const renderItemContent = () => {
      // Function to detect and format URLs in text
      const formatTextWithUrls = (text: string) => {
        if (!text) return null;

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
          if (part.match(urlRegex)) {
            try {
              const url = new URL(part);
              return (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:underline inline-flex items-center gap-1"
                >
                  <img
                    src={getFaviconFromUrl(part)}
                    alt="Favicon"
                    className="grayscale w-3 h-3 rounded-xs bg-muted group-hover:grayscale-0 transition-all duration-300"
                  />
                  {url.hostname}
                </a>
              );
            } catch (e) {
              return part;
            }
          }
          return part;
        });
      };

      switch (item.type) {
        case "task":
          const taskContent = item.title;
          const taskDescription = item.description;

          return (
            <div className="flex flex-col">
              <label
                htmlFor={item.id.toString()}
                className={cn(
                  "text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  item.complete ? "line-through text-muted-foreground" : ""
                )}
              >
                {formatTextWithUrls(taskContent)}
              </label>
              {/* Only show description if NOT complete */}
              {taskDescription && !item.complete && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {formatTextWithUrls(taskDescription)}
                </p>
              )}
              {/* Show completion date if complete */}
              {item.complete && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  Completed{" "}
                  {new Date((item as Task).updatedAt).toLocaleDateString("en", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          );
        case "resource":
          if (!isUrl(item.url)) {
            return null;
          }

          const linkAsUrl = new URL(item.url);
          const isSameOrigin = linkAsUrl.origin === window.location.origin;

          const content = (
            <div className="grid grid-cols-1 items-center gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <img
                    src={getFaviconFromUrl(item.url)}
                    alt="Favicon"
                    className="grayscale bg-muted w-4 h-4 rounded-sm group-hover:grayscale-0 transition-all duration-300"
                  />
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {linkAsUrl.host}
                  </p>
                </div>
                <p className="text-sm hover:underline">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );

          return isSameOrigin ? (
            <Link to={item.url} className="flex items-center gap-2 w-full">
              {content}
            </Link>
          ) : (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full"
            >
              {content}
            </a>
          );
        case "thought":
          const thoughtContent = item.content;
          return (
            <p className="text-sm cursor-text">
              {formatTextWithUrls(thoughtContent)}
            </p>
          );
        default:
          return null;
      }
    };

    const renderItemIcon = () => {
      switch (item.type) {
        case "task":
          return (
            <Checkbox
              id={item.id.toString()}
              checked={item.complete}
              onCheckedChange={(checked) =>
                onStatusChange?.(item, checked === true)
              }
            />
          );
        case "resource": {
          const isSameOrigin = item.url.includes(window.location.origin);
          // let faviconUrl: string | null = null;
          // try {
          //   const urlObj = new URL(item.url);
          //   if (!isSameOrigin) {
          //     faviconUrl = getFaviconFromUrl(urlObj.origin, 64); // Size 16 for table row
          //   }
          // } catch (err) {
          //   /* ignore invalid urls */
          // }

          if (isSameOrigin) {
            if (item.url.includes("/documents/")) {
              return <BookOpen className="h-4 w-4 text-muted-foreground" />;
            } else if (item.url.includes("/projects/")) {
              return <Folder className="h-4 w-4 text-muted-foreground" />;
            } else if (item.url.includes("/canvas/")) {
              return <PencilRuler className="h-4 w-4 text-muted-foreground" />;
            }
          }

          return <Link2 className="h-4 w-4 text-muted-foreground" />;

          // if (!faviconUrl) {
          //   return <Link2 className="h-4 w-4 text-muted-foreground" />;
          // }

          // return <img src={faviconUrl} alt="Favicon" className="h-4 w-4" />;
        }
        case "thought":
          return <Minus className="h-4 w-4 text-muted-foreground" />;
        default:
          return null;
      }
    };

    return (
      <TableRow ref={ref} className={commonRowClasses} data-active={isActive}>
        {/* Drag Handle - Conditionally Rendered */}
        {!hideDragHandle && (
          <TableCell className="w-8 pr-0">
            <span className="drag-handle cursor-grab">
              <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
            </span>
          </TableCell>
        )}

        {/* Item Type Icon/Checkbox */}
        {/* Adjust padding if drag handle is hidden */}
        <TableCell className={cn("w-6 p-2 pl-0")} ref={rowRef}>
          {renderItemIcon()}
        </TableCell>

        {/* Item Content */}
        <TableCell className="py-2">{renderItemContent()}</TableCell>

        {/* Actions */}
        {hideActions ? null : (
          <TableCell className="text-right p-2 pl-0">
            <div className="flex opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 group-hover:pointer-events-auto justify-end gap-1">
              {/* External Link for Resources */}
              {item.type === "resource" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open Link</TooltipContent>
                </Tooltip>
              )}

              {/* Edit Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onEdit(item)}
                    variant="ghost"
                    size="icon"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit {item.type}</TooltipContent>
              </Tooltip>

              {/* Move Button (Optional) */}
              {onMove && projects && projects.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Wrapper div needed for Combobox trigger inside TooltipTrigger */}
                    <div>
                      <Combobox
                        button={
                          <Button variant="ghost" size="icon">
                            <MoveRight className="h-4 w-4" />
                          </Button>
                        }
                        options={projects.map((p) => ({
                          label: p.title,
                          value: p.id.toString(),
                        }))}
                        onChange={async (
                          _projectTitle: string,
                          projectId: string
                        ) => {
                          try {
                            const projectIdInt = parseInt(projectId, 10);
                            if (!isNaN(projectIdInt)) {
                              onMove(item, projectIdInt);
                            }
                          } catch (error) {
                            toast.error(`Failed to move ${item.type}`);
                          }
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Move to Project</TooltipContent>
                </Tooltip>
              )}

              {/* Delete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onDelete(item)}
                    variant="ghost"
                    size="icon"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete {item.type}</TooltipContent>
              </Tooltip>

              {/* Send Away Button */}
              {onSendAway && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onSendAway(item)}
                    >
                      <Archive className="h-4 w-4 mr-1" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send {item.type} Away</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  }
);

ItemRow.displayName = "ItemRow";
