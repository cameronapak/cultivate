import React, { useMemo, useState } from "react";
import { useQuery, getAwayTasks, getAwayResources, getAwayThoughts, returnTaskFromAway, returnResourceFromAway, returnThoughtFromAway, updateTask, updateResource, updateThought } from "wasp/client/operations";
import type { Task, Resource, Thought, Project } from "wasp/entities";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableRow, TableCell } from "../components/ui/table";
import { Layout } from "../components/Layout";
import { ItemRow, type DisplayItem } from "../components/common/ItemRow";
import { EmptyStateView } from "../components/custom/EmptyStateView";
import { Coffee, Undo2, Archive, Package, PackageOpen, Search, Pencil } from "lucide-react";
import { Input } from "../components/ui/input";
import { Kbd } from "../components/custom/Kbd";
import { useCommandMenu } from "../components/custom/CommandMenu";
import { useSearchParams } from "react-router-dom";
import { EditTaskForm, EditResourceForm, EditThoughtForm } from "../components/ProjectView";

// Helper for date grouping
const formatDate = (date: Date) => date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

type DateString = string;

type GroupedItems = { [key: DateString]: DisplayItem[] };

// I have to do this because the useCommandMenu hook is
// not available until inside the Layout component.
function SearchButton() {
  const { openCommandMenu } = useCommandMenu();
  return (
    <Button variant="outline" size="sm" className="w-full max-w-md" onClick={openCommandMenu}>  
      <Search className="h-4 w-4 mr-2" />
      Search
      <Kbd className="ml-2 bg-secondary text-foreground rounded-md px-1.5 py-0.5 relative">⌘ + k</Kbd>
    </Button>
  );
}

export function AwayPage() {
  const { data: tasksRaw = [], isLoading: loadingTasks } = useQuery(getAwayTasks);
  const { data: resourcesRaw = [], isLoading: loadingResources } = useQuery(getAwayResources);
  const { data: thoughtsRaw = [], isLoading: loadingThoughts } = useQuery(getAwayThoughts);
  const tasks = tasksRaw as Task[];
  const resources = resourcesRaw as Resource[];
  const thoughts = thoughtsRaw as Thought[];
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const activeResourceId = searchParams.get("resource");
  const activeResourceType = searchParams.get("type");
  const [editingItemId, setEditingItemId] = useState<{ id: string | number | null, type: string } | null>(null);

  // Combine and filter items
  const awayItems: DisplayItem[] = useMemo(() => {
    const all = [
      ...tasks.map((t: Task) => ({ ...t, type: "task" as const })),
      ...resources.map((r: Resource) => ({ ...r, type: "resource" as const })),
      ...thoughts.map((th: Thought) => ({ ...th, type: "thought" as const, title: th.content.slice(0, 60) + (th.content.length > 60 ? "..." : "") })),
    ];
    if (!search.trim()) return all;
    const s = search.toLowerCase();
    return all.filter((item) => {
      if (item.type === "task" && (item.title?.toLowerCase().includes(s) || (item as Task).description?.toLowerCase().includes(s))) return true;
      if (item.type === "resource" && ((item.title?.toLowerCase().includes(s) || (item as Resource).description?.toLowerCase().includes(s) || (item as Resource).url?.toLowerCase().includes(s)))) return true;
      if (item.type === "thought" && (item.title?.toLowerCase().includes(s) || (item as Thought).content?.toLowerCase().includes(s))) return true;
      return false;
    });
  }, [tasks, resources, thoughts, search]);

  // Group by date
  const grouped: GroupedItems = useMemo(() => {
    const g: GroupedItems = {};
    awayItems.forEach((item) => {
      const date = new Date(item.createdAt);
      const key = date.toISOString().slice(0, 10);
      if (!g[key]) g[key] = [];
      g[key].push(item);
    });
    return g;
  }, [awayItems]);

  const sortedDates = Object.keys(grouped).sort().reverse();

  // Edit handlers
  const handleEdit = (item: DisplayItem) => {
    setEditingItemId({ id: item.id, type: item.type });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSave = async (item: DisplayItem, values: any) => {
    try {
      if (item.type === "task") {
        await updateTask({
          id: item.id as number,
          title: values.title,
          description: values.description,
        });
      } else if (item.type === "resource") {
        await updateResource({
          id: item.id as number,
          title: values.title,
          url: values.url,
          description: values.description,
        });
      } else if (item.type === "thought") {
        await updateThought({
          id: item.id as string,
          content: values.content,
        });
      }
      setEditingItemId(null);
    } catch (error) {
      // Optionally show a toast
      setEditingItemId(null);
    }
  };

  const renderEditForm = (
    item: DisplayItem,
    onSave: (values: any) => void,
    onCancel: () => void
  ) => {
    if (item.type === "task") {
      return <EditTaskForm task={item as Task} onSave={onSave} onCancel={onCancel} />;
    } else if (item.type === "resource") {
      return <EditResourceForm resource={item as Resource} onSave={onSave} onCancel={onCancel} />;
    } else if (item.type === "thought") {
      return <EditThoughtForm thought={item as Thought} onSave={onSave} onCancel={onCancel} />;
    }
    return null;
  };

  return (
    <Layout
      isLoading={loadingTasks || loadingResources || loadingThoughts}
      breadcrumbItems={[{ title: "Away" }]}
      ctaButton={null}
    >
      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-8 flex flex-col items-center">
          <EmptyStateView
            Icon={<PackageOpen className="h-10 w-10 text-muted-foreground mb-2" />}
            title="Away"
            description="Send items 'Away' for safe storage, like a digital junk drawer. It's easy to search, reflect on, or restore them to your daily flow."
            action={
              <SearchButton />
            }
          />
        </div>
        <div>
          {awayItems.length ? (
            <Table>
              <TableBody>
                {sortedDates.length > 0 ? (
                  sortedDates.map((dateKey) => (
                    <React.Fragment key={dateKey}>
                      <TableRow>
                        <TableCell colSpan={3} className="bg-muted/50 py-1 px-4 text-xs font-semibold text-muted-foreground">
                          {formatDate(new Date(dateKey))}
                        </TableCell>
                      </TableRow>
                      {grouped[dateKey].map((item) => (
                        <ItemRow
                          hideDragHandle={true}
                          key={item.id}
                          item={item}
                          isActive={`${activeResourceId}` === `${item.id}` && `${activeResourceType}` === `${item.type}`}
                          isEditing={editingItemId?.id === item.id && editingItemId?.type === item.type}
                          renderEditForm={(item, onSave, onCancel) => renderEditForm(item, (values) => handleSave(item, values), onCancel)}
                          onEdit={handleEdit}
                          onCancelEdit={handleCancelEdit}
                          actions={[
                            {
                              icon: <Pencil className="w-4 h-4" />,
                              label: "Refine",
                              tooltip: "Refine",
                              onClick: () => handleEdit(item),
                            },
                            {
                              icon: <Undo2 className="h-4 w-4" />,
                              label: "Restore to Inbox",
                              tooltip: "Restore to Inbox",
                              onClick: async () => {
                                if (item.type === "task") await returnTaskFromAway({ id: item.id as number });
                                if (item.type === "resource") await returnResourceFromAway({ id: item.id as number });
                                if (item.type === "thought") await returnThoughtFromAway({ id: item.id as string });
                              },
                            },
                          ]}
                        />
                      ))}
                    </React.Fragment>
                  ))
                ) : null}
              </TableBody>
            </Table>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

export default AwayPage; 