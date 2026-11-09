export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <div className="h-2.5 w-24 animate-pulse rounded bg-line" />
        <div className="h-7 w-56 animate-pulse rounded bg-line" />
        <div className="h-3 w-80 max-w-full animate-pulse rounded bg-line" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[104px] animate-pulse rounded-xl border border-line bg-surface" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-[320px] animate-pulse rounded-xl border border-line bg-surface" />
        <div className="h-[320px] animate-pulse rounded-xl border border-line bg-surface" />
      </div>
    </div>
  );
}
