"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useRef, useState } from "react"
import type { ReactNode } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  actions?: ReactNode
}

const ImageGallery = ({ images, actions }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const slideRefs = useRef<Array<HTMLDivElement | null>>([])

  const selectImage = (index: number) => {
    setActiveIndex(index)
    slideRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    })
  }

  const handleScroll = () => {
    const track = trackRef.current

    if (!track || track.clientWidth === 0) {
      return
    }

    const nextIndex = Math.round(track.scrollLeft / track.clientWidth)
    setActiveIndex(Math.min(Math.max(nextIndex, 0), images.length - 1))
  }

  if (!images.length) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-ui-bg-subtle">
        {actions && <div className="absolute right-3 top-3 z-10">{actions}</div>}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="relative">
        {actions && <div className="absolute right-3 top-3 z-10">{actions}</div>}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-md"
          aria-label="Listing images"
        >
          {images.map((image, index) => {
            return (
              <div
                key={image.id}
                ref={(element) => {
                  slideRefs.current[index] = element
                }}
                className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden rounded-md bg-ui-bg-subtle"
                id={image.id}
              >
                {!!image.url && (
                  <Image
                    src={image.url}
                    priority={index === 0}
                    className="absolute inset-0"
                    alt={`Listing image ${index + 1}`}
                    fill
                    sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {images.length > 1 && (
        <div
          className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
          aria-label="Choose listing image"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => selectImage(index)}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-md border transition-colors ${
                activeIndex === index
                  ? "border-ui-fg-base"
                  : "border-ui-border-base hover:border-ui-fg-subtle"
              }`}
              aria-label={`Show listing image ${index + 1}`}
              aria-current={activeIndex === index}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  alt={`Listing thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
