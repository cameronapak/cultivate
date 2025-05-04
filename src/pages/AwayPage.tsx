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
import { Undo2, PackageOpen, Search, Pencil, Footprints } from "lucide-react";
import { useCommandMenu } from "../components/custom/CommandMenu";
import { useSearchParams } from "react-router-dom";
import {
  EditTaskForm,
  EditResourceForm,
  EditThoughtForm,
} from "../components/ProjectView";
import { useQuery } from "wasp/client/operations";
import { AnimatePresence, motion } from "motion/react";

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
    <Button variant="outline" size="icon" onClick={openCommandMenu}>
      <Search className="h-4 w-4" />
      <span className="sr-only">Search</span>
    </Button>
  );
}

export function AwayPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeResourceId = searchParams.get("resource");
  const activeResourceType = searchParams.get("type");
  const [editingItemId, setEditingItemId] = useState<{
    id: string | number | null;
    type: string;
  } | null>(null);
  const [itemsByDate, setItemsByDate] = useState<Record<string, DisplayItem[]>>(
    {}
  );
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch the oldest Away item date
  const { data: oldestAwayDate, isLoading: isLoadingOldest } =
    useQuery(getOldestAwayDate);

  // Helper: get all dates from today back to untilDate (inclusive)
  const today = new Date();
  const untilParam = searchParams.get("until");
  const untilDate = untilParam ? new Date(untilParam) : today;

  const getDatesUntil = (untilDate: Date) => {
    const dates: string[] = [];
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    const until = new Date(untilDate);
    until.setHours(0, 0, 0, 0);
    while (d >= until) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
      d.setDate(d.getDate() - 1);
    }
    return dates;
  };

  const loadedDates = getDatesUntil(untilDate);

  // Load the most recent days on mount, but only after oldestAwayDate is loaded
  useEffect(() => {
    if (isInitialLoading && !isLoadingOldest && oldestAwayDate !== undefined) {
      // If no until param, set it to today
      if (!untilParam) {
        setSearchParams({ ...Object.fromEntries(searchParams), until: today.toISOString().slice(0, 10) });
      }
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
      return;
    }
    const oldestDate = new Date(oldestAwayDate);
    oldestDate.setHours(0, 0, 0, 0);
    const currentUntil = untilParam ? new Date(untilParam) : today;
    currentUntil.setHours(0, 0, 0, 0);
    // Go back 3 more days from current untilDate
    const newUntil = new Date(currentUntil);
    newUntil.setDate(newUntil.getDate() - 3);
    // If newUntil is before oldestDate, clamp to oldestDate
    if (newUntil < oldestDate) {
      newUntil.setTime(oldestDate.getTime());
    }
    setSearchParams({ ...Object.fromEntries(searchParams), until: newUntil.toISOString().slice(0, 10) });
  };

  // Update hasMore based on untilDate and oldestAwayDate
  useEffect(() => {
    if (!oldestAwayDate) return;
    const oldest = new Date(oldestAwayDate);
    oldest.setHours(0, 0, 0, 0);
    const until = new Date(untilDate);
    until.setHours(0, 0, 0, 0);
    if (until <= oldest) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [oldestAwayDate, untilDate]);

  // Fetch items for all loadedDates
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoadingDates(new Set(loadedDates));
      for (const date of loadedDates) {
        // Only fetch if not already loaded
        if (itemsByDate[date]) continue;
        const [tasksRes, resourcesRes, thoughtsRes] = await Promise.all([
          getAwayTasksByDate({ date }),
          getAwayResourcesByDate({ date }),
          getAwayThoughtsByDate({ date }),
        ]);
        if (cancelled) return;
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
        setLoadingDates((prev) => {
          const newSet = new Set(prev);
          newSet.delete(date);
          return newSet;
        });
      }
    };
    if (loadedDates.length > 0) {
      fetchAll();
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedDates.join(",")]);

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
            <AnimatePresence mode="wait">
              {sortedDates.map((dateKey) => {
                const itemsForDate = grouped[dateKey] || [];
                if (itemsForDate.length === 0) return null;
                return (
                  <motion.tbody
                    className="w-full"
                    key={dateKey}
                    initial={{
                      position: "absolute",
                      width: "100%",
                      top: 0,
                      left: 0,
                      opacity: 0.2,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                      position: "relative",
                      filter: "blur(0px)",
                    }}
                    exit={{
                      position: "absolute",
                      width: "100%",
                      top: 0,
                      left: 0,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: "easeInOut",
                    }}
                  >
                    <TableRow className="w-full">
                      <TableCell
                        colSpan={3}
                        className="w-full bg-muted/50 py-1 px-4 text-xs font-semibold text-muted-foreground"
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
                  </motion.tbody>
                );
              })}
            </AnimatePresence>
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
            <Button
              onClick={loadMoreDays}
              disabled={Array.from(loadingDates).length > 0}
              variant="outline"
            >
              {Array.from(loadingDates).length > 0 ? (
                <span className="flex items-center">
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />{" "}
                  Loading...
                </span>
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
              Icon={<Footprints />}
              title="The end"
              description="Or, the beginning?"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AwayPage;
