const ProductActionsSkeleton = () => {
  return (
    <div
      className="flex animate-pulse flex-col gap-y-4 rounded-md border border-gray-200 bg-white p-4"
      data-testid="product-actions-skeleton"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-5 w-32 rounded bg-gray-100" />
          <div className="mt-2 h-4 w-56 max-w-full rounded bg-gray-100" />
        </div>
        <div className="h-9 w-9 shrink-0 rounded-md bg-gray-100" />
      </div>

      <div className="rounded-md bg-gray-50 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100" />
          <div className="min-w-0 flex-1">
            <div className="h-4 w-36 rounded bg-gray-100" />
            <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
          </div>
        </div>
        <div className="mt-3 h-3 w-full rounded bg-gray-100" />
        <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
      </div>

      <div className="h-10 w-full rounded-md bg-gray-100" />

      <div className="rounded-md border border-ui-border-base p-4">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="mt-2 h-3 w-4/5 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export default ProductActionsSkeleton
