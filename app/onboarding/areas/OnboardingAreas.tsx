"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveSelectedAreas } from "../../actions/onboarding";

const ALL_AREAS = [
  {
    id: "Money & Abundance",
    icon: "◈",
    description: "Your income, financial security, and relationship with having enough.",
  },
  {
    id: "Health & Body",
    icon: "◎",
    description: "Your energy, physical wellbeing, and how you feel in your body daily.",
  },
  {
    id: "Love & Relationships",
    icon: "◉",
    description: "Romantic partnership, intimacy, and being truly known by someone.",
  },
  {
    id: "Career & Purpose",
    icon: "◇",
    description: "Meaningful work, direction, and success that actually feels like yours.",
  },
  {
    id: "Family & Connections",
    icon: "◈",
    description: "Your family bonds, friendships, and the people you call your world.",
  },
  {
    id: "Personal Growth",
    icon: "◆",
    description:
      "Becoming. Healing old patterns. Expanding who you are and what you believe is possible for you.",
  },
] as const;

type AreaId = (typeof ALL_AREAS)[number]["id"];

function SortableItem({
  id,
  index,
  isPrimary,
}: {
  id: string;
  index: number;
  isPrimary: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "flex items-center gap-3 px-4 py-3 rounded-xl border " +
        (isPrimary
          ? "bg-surface-2 border-terracotta/50"
          : "bg-surface border-line")
      }
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-ink-muted hover:text-ink-soft px-1 py-1 touch-none"
        aria-label="Drag to reorder"
      >
        <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor">
          <circle cx="4" cy="4" r="2" />
          <circle cx="10" cy="4" r="2" />
          <circle cx="4" cy="10" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="4" cy="16" r="2" />
          <circle cx="10" cy="16" r="2" />
        </svg>
      </button>
      <span className="flex-1 text-[14px] text-ink">{id}</span>
      {isPrimary && (
        <span className="text-[9px] uppercase tracking-[0.2em] text-terracotta">
          Primary
        </span>
      )}
      <span className="text-[12px] text-ink-muted w-6 text-right">{index + 1}</span>
    </div>
  );
}

interface Props {
  defaultSelected: string[];
}

export function OnboardingAreas({ defaultSelected }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nudgeVisible, setNudgeVisible] = useState(false);

  // Selected areas (unordered toggle phase)
  const [selected, setSelected] = useState<Set<AreaId>>(
    new Set(defaultSelected as AreaId[])
  );

  // Ranked order (updated by drag-and-drop)
  const [ranked, setRanked] = useState<AreaId[]>(
    defaultSelected.length > 0
      ? (defaultSelected as AreaId[])
      : []
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function toggleArea(areaId: AreaId) {
    const next = new Set(selected);
    if (next.has(areaId)) {
      next.delete(areaId);
      setRanked((r) => r.filter((a) => a !== areaId));
    } else {
      if (next.size >= 5) {
        setNudgeVisible(true);
        setTimeout(() => setNudgeVisible(false), 4000);
        return;
      }
      next.add(areaId);
      setRanked((r) => [...r, areaId]);
    }
    setNudgeVisible(false);
    setSelected(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRanked((items) => {
        const oldIndex = items.indexOf(active.id as AreaId);
        const newIndex = items.indexOf(over.id as AreaId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function handleContinue() {
    if (ranked.length === 0 || isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        await saveSelectedAreas(ranked);
        router.push("/onboarding/questions");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col page-fade">
      {/* Progress */}
      <div className="px-8 pt-8 pb-0 max-w-2xl mx-auto w-full">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">
          Step 2 of 4
        </div>
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={
                "h-1 rounded-full flex-1 " +
                (n <= 2 ? "bg-terracotta" : "bg-line")
              }
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 pb-12 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-[38px] sm:text-[44px] text-ink leading-[1.05] mb-3">
          What do you want to shift?
        </h1>
        <p className="text-[15px] text-ink-muted mb-8">
          Pick the areas of your life you're ready to work on. Be honest about what actually matters — not what sounds good.
        </p>

        {/* Area cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          {ALL_AREAS.map((area) => {
            const isSelected = selected.has(area.id);
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleArea(area.id)}
                className={
                  "text-left p-5 rounded-xl border transition-all " +
                  (isSelected
                    ? "border-ochre bg-surface-2/80 shadow-sm"
                    : "border-line bg-surface hover:bg-surface-2/40 hover:border-line")
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    className={
                      "text-[18px] mt-0.5 " +
                      (isSelected ? "text-ochre" : "text-ink-muted")
                    }
                  >
                    {area.icon}
                  </span>
                  <div>
                    <div
                      className={
                        "font-display text-[16px] mb-1 " +
                        (isSelected ? "text-ink" : "text-ink-soft")
                      }
                    >
                      {area.id}
                    </div>
                    <p className="text-[12.5px] text-ink-muted leading-[1.5]">
                      {area.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Nudge message */}
        {nudgeVisible && (
          <p className="text-[12.5px] text-ochre mt-2 transition-opacity">
            The more focused you are, the faster things shift. Try to keep it to 5 or fewer.
          </p>
        )}

        {/* Ranking section */}
        {ranked.length > 0 && (
          <div className="mt-8 page-fade">
            <div className="divider-line mb-6" />
            <h2 className="font-display text-[22px] text-ink mb-1">
              Now put them in order.
            </h2>
            <p className="text-[13.5px] text-ink-muted mb-5">
              Drag the most important area to the top. Your #1 becomes your primary focus — everything in this program is built around it first.
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={ranked}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {ranked.map((areaId, index) => (
                    <SortableItem
                      key={areaId}
                      id={areaId}
                      index={index}
                      isPrimary={index === 0}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-sos/10 border border-sos/30 rounded-lg text-[13px] text-sos">
            {error}
          </div>
        )}

        <div className="mt-10 flex justify-between items-center">
          <button
            onClick={() => router.push("/onboarding/you")}
            className="text-[13px] text-ink-muted hover:text-ink-soft transition-colors"
          >
            ← back
          </button>
          <button
            onClick={handleContinue}
            disabled={ranked.length === 0 || isPending}
            className="px-8 py-3 rounded-full bg-ink text-surface text-[14px] hover:bg-ink-soft transition-colors disabled:opacity-30"
          >
            {isPending ? "Saving..." : "These are my areas →"}
          </button>
        </div>
      </div>
    </div>
  );
}
