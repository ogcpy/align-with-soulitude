import { cn } from "../../lib/utils";

export function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-md border p-6 shadow-sm">
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ServicesSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="rounded-md border p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AvailabilitySlotsSkeleton() {
  return (
    <div className="space-y-3">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ConsultationsSkeleton() {
  return (
    <div className="space-y-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="rounded-md border p-4 shadow-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DiscountCodesSkeleton() {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-x-2 flex">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array(7).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(35).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

export function BookingsSkeleton({ viewMode }) {
  if (viewMode === 'calendar') {
    return <CalendarSkeleton />;
  }
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="p-4 border-b">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="p-2">
          <div className="grid grid-cols-4 gap-4 p-4 border-b">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}