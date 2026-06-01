import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@modules/common/components/ui"

const Hero = () => {
  const categories = [
    "Produce",
    "Livestock",
    "Seeds",
    "Fertilizer",
    "Equipment",
    "Tools",
  ]

  return (
    <section className="border-b border-ui-border-base bg-white">
      <div className="content-container py-8 small:py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h1 className="text-3xl leading-10 text-ui-fg-base small:text-[42px] small:leading-[50px]">
            Find farming products near you
          </h1>
          <p className="mt-3 max-w-2xl text-base-regular leading-7 text-ui-fg-subtle">
            Browse fresh produce, livestock, seeds, tools, supplies, and
            equipment from local farmers.
          </p>

          <form
            action="store"
            className="mt-7 w-full rounded-full border border-gray-200 bg-white p-2 shadow-[0_8px_28px_rgba(15,23,42,0.10)]"
          >
            <div className="grid gap-2 small:grid-cols-[1fr_1fr_1fr_auto] small:items-center">
              <label className="px-5 py-2 text-left">
                <div className="text-[11px] font-semibold text-ui-fg-base">
                  What
                </div>
                <input
                  name="q"
                  placeholder="Produce, tools, equipment"
                  className="mt-1 w-full bg-transparent text-small-regular text-ui-fg-subtle outline-none placeholder:text-ui-fg-muted"
                />
              </label>
              <label className="border-gray-200 px-5 py-2 text-left small:border-l">
                <div className="text-[11px] font-semibold text-ui-fg-base">
                  Where
                </div>
                <input
                  name="location"
                  placeholder="Province, district, farm"
                  className="mt-1 w-full bg-transparent text-small-regular text-ui-fg-subtle outline-none placeholder:text-ui-fg-muted"
                />
              </label>
              <div className="border-gray-200 px-5 py-2 text-left small:border-l">
                <div className="text-[11px] font-semibold text-ui-fg-base">
                  Seller
                </div>
                <div className="text-small-regular text-ui-fg-subtle">
                  Farmers and suppliers
                </div>
              </div>
              <Button className="h-12 w-full rounded-full bg-[#ff385c] px-6 text-white hover:bg-[#e83152] small:w-auto">
                Search
              </Button>
            </div>
          </form>

          <div className="mt-8 flex w-full gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <LocalizedClientLink
                key={category}
                href={`/store?category=${encodeURIComponent(category)}`}
                className="min-w-fit rounded-full border border-gray-200 px-5 py-3 text-small-semi text-ui-fg-base transition-colors hover:border-gray-400"
              >
                {category}
              </LocalizedClientLink>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LocalizedClientLink href="/account/listings">
              <Button variant="secondary" className="rounded-full">
                Post a listing
              </Button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
