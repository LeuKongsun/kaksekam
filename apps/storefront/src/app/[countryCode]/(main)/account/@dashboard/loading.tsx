const SkeletonBlock = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
)

export default function Loading() {
  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="p-4 small:p-5">
          <div className="flex flex-col gap-4 small:flex-row small:items-start small:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <SkeletonBlock className="h-16 w-16 shrink-0 rounded-full small:h-20 small:w-20" />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-7 w-48 max-w-full" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <SkeletonBlock className="h-7 w-44 rounded-full" />
                  <SkeletonBlock className="h-7 w-28 rounded-full" />
                  <SkeletonBlock className="h-7 w-32 rounded-full" />
                </div>
                <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <SkeletonBlock className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 small:px-5">
          <div className="flex items-center gap-6">
            <SkeletonBlock className="h-12 w-24 rounded-none border-b-2 border-gray-300 bg-transparent" />
            <SkeletonBlock className="h-12 w-28 rounded-none border-b-2 border-gray-300 bg-transparent" />
            <SkeletonBlock className="h-12 w-20 rounded-none border-b-2 border-gray-300 bg-transparent" />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="mt-2 h-4 w-56" />
          </div>
          <SkeletonBlock className="h-10 w-28" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 small:grid-cols-2 medium:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-md border border-gray-200 bg-white"
            >
              <SkeletonBlock className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-3 p-3">
                <SkeletonBlock className="h-5 w-4/5" />
                <SkeletonBlock className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
