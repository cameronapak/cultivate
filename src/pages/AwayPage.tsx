import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  getAwayTasksByDate,
  getAwayResourcesByDate,
  getAwayThoughtsByDate,
  returnTaskFromAway,
  returnResourceFromAway,
  returnThoughtFromAway,
  updateTask,
  updateResource,
  updateThought,
  getOldestAwayDate,
} from "wasp/client/operations";
import type { Task, Resource, Thought } from "wasp/entities";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableRow, TableCell } from "../components/ui/table";
import { Layout } from "../components/Layout";
import { ItemRow, type DisplayItem } from "../components/common/ItemRow";
import { EmptyStateView } from "../components/custom/EmptyStateView";
import { Coffee, Undo2, PackageOpen, Search, Pencil } from "lucide-react";
import { Kbd } from "../components/custom/Kbd";
import { useCommandMenu } from "../components/custom/CommandMenu";
import { useSearchParams } from "react-router-dom";
import {
  EditTaskForm,
  EditResourceForm,
  EditThoughtForm,
} from "../components/ProjectView";
import { useQuery } from "wasp/client/operations";

// Helper for date grouping
const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

type DateString = string;

type GroupedItems = { [key: DateString]: DisplayItem[] };

// I have to do this because the useCommandMenu hook is
// not available until inside the Layout component.
function SearchButton() {
  const { openCommandMenu } = useCommandMenu();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={openCommandMenu}
    >
      <Search className="h-4 w-4 mr-2" />
      Search
      <Kbd className="ml-2 bg-secondary text-foreground rounded-md px-1.5 py-0.5 relative">
        ⌘ + k
      </Kbd>
    </Button>
  );
}

export function AwayPage() {
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const activeResourceId = searchParams.get("resource");
  const activeResourceType = searchParams.get("type");
  const [editingItemId, setEditingItemId] = useState<{
    id: string | number | null;
    type: string;
  } | null>(null);
  const [loadedDates, setLoadedDates] = useState<string[]>([]); // YYYY-MM-DD
  const [itemsByDate, setItemsByDate] = useState<Record<string, DisplayItem[]>>(
    {}
  );
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch the oldest Away item date
  const { data: oldestAwayDate, isLoading: isLoadingOldest } = useQuery(getOldestAwayDate);

  // Helper: get the last N days as YYYY-MM-DD strings
  const getLastNDates = (n: number, offset: number = 0) => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = offset; i < n + offset; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return dates;
  };

  // Load the most recent 3 days on mount, but only after oldestAwayDate is loaded
  useEffect(() => {
    if (isInitialLoading && !isLoadingOldest && oldestAwayDate !== undefined) {
      loadMoreDays();
      setIsInitialLoading(false);
    }
    // eslint-disable-next-line
  }, [isInitialLoading, isLoadingOldest, oldestAwayDate]);

  // Auto-load more days when the button is in view
  useEffect(() => {
    if (!hasMore) return;
    const node = loadMoreRef.current;
    if (!node) return;
    let didCancel = false;
    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasMore &&
          loadingDates.size === 0 &&
          !isInitialLoading
        ) {
          loadMoreDays();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );
    observer.observe(node);
    return () => {
      didCancel = true;
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingDates.size, isInitialLoading]);

  // Function to load more days (paged)
  const loadMoreDays = async () => {
    if (!oldestAwayDate) {
      setHasMore(false);
      return;
    }
    const oldestDate = new Date(oldestAwayDate);
    const nextDates = getLastNDates(3, loadedDates.length)
      .filter((d) => !loadedDates.includes(d))
      .filter((d) => new Date(d) >= oldestDate);
    if (nextDates.length === 0) {
      setHasMore(false);
      return;
    }
    setLoadingDates((prev) => new Set([...prev, ...nextDates]));
    for (const date of nextDates) {
      // Fetch all three types for this date
      const [tasksRes, resourcesRes, thoughtsRes] = await Promise.all([
        getAwayTasksByDate({ date }),
        getAwayResourcesByDate({ date }),
        getAwayThoughtsByDate({ date }),
      ]);
      const items: DisplayItem[] = [
        ...(tasksRes.items || []).map((t: Task) => ({
          ...t,
          type: "task" as const,
        })),
        ...(resourcesRes.items || []).map((r: Resource) => ({
          ...r,
          type: "resource" as const,
        })),
        ...(thoughtsRes.items || []).map((th: Thought) => ({
          ...th,
          type: "thought" as const,
          title:
            th.content.slice(0, 60) + (th.content.length > 60 ? "..." : ""),
        })),
      ];
      setItemsByDate((prev) => ({
        ...prev,
        [date]: items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }));
      setLoadedDates((prev) => Array.from(new Set([...prev, date])));
      setLoadingDates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(date);
        return newSet;
      });
    }
    // If the last date loaded is the oldest date, stop loading more
    const lastLoaded = nextDates[nextDates.length - 1];
    if (lastLoaded && new Date(lastLoaded).getTime() === oldestDate.setHours(0,0,0,0)) {
      setHasMore(false);
    }
  };

  // Combine and filter items for search
  const awayItems: DisplayItem[] = useMemo(() => {
    const all = loadedDates.flatMap((date) => itemsByDate[date] || []);
    if (!search.trim()) return all;
    const s = search.toLowerCase();
    return all.filter((item) => {
      if (
        item.type === "task" &&
        (item.title?.toLowerCase().includes(s) ||
          (item as Task).description?.toLowerCase().includes(s))
      )
        return true;
      if (
        item.type === "resource" &&
        (item.title?.toLowerCase().includes(s) ||
          (item as Resource).description?.toLowerCase().includes(s) ||
          (item as Resource).url?.toLowerCase().includes(s))
      )
        return true;
      if (
        item.type === "thought" &&
        (item.title?.toLowerCase().includes(s) ||
          (item as Thought).content?.toLowerCase().includes(s))
      )
        return true;
      return false;
    });
  }, [loadedDates, itemsByDate, search]);

  // Group by date (only loaded dates)
  const grouped: GroupedItems = useMemo(() => {
    const g: GroupedItems = {};
    loadedDates.forEach((date) => {
      g[date] = itemsByDate[date] || [];
    });
    return g;
  }, [loadedDates, itemsByDate]);

  const sortedDates = [...loadedDates].sort().reverse();

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
      return (
        <EditTaskForm task={item as Task} onSave={onSave} onCancel={onCancel} />
      );
    } else if (item.type === "resource") {
      return (
        <EditResourceForm
          resource={item as Resource}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    } else if (item.type === "thought") {
      return (
        <EditThoughtForm
          thought={item as Thought}
          onSave={onSave}
          onCancel={onCancel}
        />
      );
    }
    return null;
  };

  return (
    <Layout
      isLoading={isInitialLoading}
      breadcrumbItems={[{ title: "Away" }]}
      ctaButton={<SearchButton />}
    >
      <div className="max-w-2xl mx-auto">
        {sortedDates.length > 0 ? (
          <Table>
            <TableBody>
              {sortedDates.map((dateKey) => {
                const itemsForDate = grouped[dateKey] || [];
                if (itemsForDate.length === 0) return null;
                return (
                  <React.Fragment key={dateKey}>
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="bg-muted/50 py-1 px-4 text-xs font-semibold text-muted-foreground"
                      >
                        {formatDate(new Date(dateKey))}
                        {loadingDates.has(dateKey) && (
                          <span className="ml-2 animate-spin inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full align-middle" />
                        )}
                      </TableCell>
                    </TableRow>
                    {itemsForDate.map((item) => (
                      <ItemRow
                        hideDragHandle={true}
                        key={`${item.id}-${item.type}`}
                        item={item}
                        isActive={
                          `${activeResourceId}` === `${item.id}` &&
                          `${activeResourceType}` === `${item.type}`
                        }
                        isEditing={
                          editingItemId?.id === item.id &&
                          editingItemId?.type === item.type
                        }
                        renderEditForm={(item, onSave, onCancel) =>
                          renderEditForm(
                            item,
                            (values) => handleSave(item, values),
                            onCancel
                          )
                        }
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
                              if (item.type === "task")
                                await returnTaskFromAway({
                                  id: item.id as number,
                                });
                              if (item.type === "resource")
                                await returnResourceFromAway({
                                  id: item.id as number,
                                });
                              if (item.type === "thought")
                                await returnThoughtFromAway({
                                  id: item.id as string,
                                });
                            },
                          },
                        ]}
                      />
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center items-center h-full">
            <EmptyStateView
              Icon={
                <PackageOpen className="h-10 w-10 text-muted-foreground mb-2" />
              }
              title="Away"
              description="Send items 'Away' for safe storage, like a digital junk drawer. It's easy to search, reflect on, or restore them to your daily flow."
            />
          </div>
        )}
        {hasMore && (
            <div className="flex justify-center mt-4" ref={loadMoreRef}>
              <Button onClick={loadMoreDays} disabled={Array.from(loadingDates).length > 0} variant="outline">
                {Array.from(loadingDates).length > 0 ? (
                  <span className="flex items-center"><span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" /> Loading...</span>
                ) : (
                  "Load More Days"
                )}
              </Button>
            </div>
          )}
        {/* End of list message */}
        {!hasMore && sortedDates.length > 0 && (
          <div className="flex justify-center mt-8">
            <EmptyStateView
              Icon={<Coffee />}
              title="All done!"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AwayPage;
