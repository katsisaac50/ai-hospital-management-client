"use client"
import { useRef, useState, useEffect, ReactNode } from "react"

interface CarouselItem {
  content: ReactNode
  mode?: "section" | "card"
}

interface CarouselProps {
  items: CarouselItem[]
  interval?: number
}

export default function Carousel({ items, interval = 5000 }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const scrollToSlide = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: index * containerRef.current.clientWidth,
        behavior: "smooth",
      })
      setActiveIndex(index)
    }
  }

  // Auto slide
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null
    if (!paused) {
      timer = setInterval(() => {
        const next = (activeIndex + 1) % items.length
        scrollToSlide(next)
      }, interval)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [activeIndex, paused, items.length, interval])

  // Manual scroll detection
  const handleScroll = () => {
    if (!containerRef.current) return
    const index = Math.round(
      containerRef.current.scrollLeft / containerRef.current.clientWidth
    )
    setActiveIndex(index)
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="snap-start w-full flex-shrink-0 px-4"
            style={{ scrollSnapAlign: "center" }}
          >
            {item.mode === "card" ? (
              <div className="flex space-x-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                {item.content}
              </div>
            ) : (
              item.content
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-3 gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToSlide(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              activeIndex === i ? "bg-blue-500 scale-110" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  )
}






// "use client"

// import { useEffect, useRef, useState } from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"
// import { cn } from "@/lib/utils"

// export default function CarouselWrapper({
//   children,
//   interval = 5000,
//   theme = "light", // "light" | "dark" | "morpho"
//   showArrows = true,
//   showDots = true,
//   autoPlay = true,
// }: {
//   children: React.ReactNode
//   interval?: number
//   theme?: "light" | "dark" | "morpho"
//   showArrows?: boolean
//   showDots?: boolean
//   autoPlay?: boolean
// }) {
//   const containerRef = useRef<HTMLDivElement>(null)
//   const [activeIndex, setActiveIndex] = useState(0)
//   const [paused, setPaused] = useState(false)
//   const [touchStartX, setTouchStartX] = useState<number | null>(null)
//   const [touchStartTime, setTouchStartTime] = useState<number>(0)
//   const [slideWidth, setSlideWidth] = useState(0)
//   const [isTransitioning, setIsTransitioning] = useState(false)

//   const slides = Array.isArray(children) ? children : [children]
//   const totalSlides = slides.length

//   // Create cloned slides for infinite loop
//   const extendedSlides = [
//     slides[totalSlides - 1], // clone last at start
//     ...slides,
//     slides[0], // clone first at end
//   ]

//   // Handle window resize to update slide width
//   useEffect(() => {
//     const handleResize = () => {
//       if (containerRef.current) {
//         setSlideWidth(containerRef.current.offsetWidth)
//       }
//     }

//     handleResize()
//     window.addEventListener('resize', handleResize)
    
//     return () => window.removeEventListener('resize', handleResize)
//   }, [])

//   // Initialize scroll position to the first real slide
//   useEffect(() => {
//     if (containerRef.current && slideWidth > 0) {
//       containerRef.current.scrollTo({ left: slideWidth, behavior: 'auto' })
//       setActiveIndex(0)
//     }
//   }, [slideWidth])

//   // Auto-slide with pause
//   useEffect(() => {
//     if (paused || !autoPlay || isTransitioning) return
    
//     const timer = setInterval(() => {
//       handleNext()
//     }, interval)
    
//     return () => clearInterval(timer)
//   }, [activeIndex, paused, autoPlay, isTransitioning, interval])

//   const handlePrev = () => {
//     if (!containerRef.current || isTransitioning) return
//     setIsTransitioning(true)
    
//     const newIndex = activeIndex - 1
//     setActiveIndex(newIndex)
//     containerRef.current.scrollBy({ left: -slideWidth, behavior: 'smooth' })
    
//     setTimeout(() => setIsTransitioning(false), 500)
//   }

//   const handleNext = () => {
//     if (!containerRef.current || isTransitioning) return
//     setIsTransitioning(true)
    
//     const newIndex = activeIndex + 1
//     setActiveIndex(newIndex)
//     containerRef.current.scrollBy({ left: slideWidth, behavior: 'smooth' })
    
//     setTimeout(() => setIsTransitioning(false), 500)
//   }

//   // Infinite loop effect
//   const handleScroll = () => {
//     if (!containerRef.current || isTransitioning) return
    
//     const scrollLeft = containerRef.current.scrollLeft
//     const threshold = 50 // pixels threshold for snap detection
    
//     if (scrollLeft <= threshold) {
//       // Snap to the last real slide when at the beginning of cloned slide
//       containerRef.current.scrollTo({ left: slideWidth * totalSlides, behavior: 'auto' })
//       setActiveIndex(totalSlides - 1)
//     } else if (scrollLeft >= slideWidth * (totalSlides + 1) - threshold) {
//       // Snap to the first real slide when at the end of cloned slide
//       containerRef.current.scrollTo({ left: slideWidth, behavior: 'auto' })
//       setActiveIndex(0)
//     }
//   }

//   // Touch/swipe handlers with momentum
//   const handleTouchStart = (e: React.TouchEvent) => {
//     setTouchStartX(e.touches[0].clientX)
//     setTouchStartTime(Date.now())
//     setPaused(true)
//   }

//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (!containerRef.current || touchStartX === null) return
    
//     const currentX = e.touches[0].clientX
//     const deltaX = touchStartX - currentX
    
//     // Prevent vertical scrolling when horizontally swiping
//     if (Math.abs(deltaX) > 10) {
//       e.preventDefault()
//     }
    
//     containerRef.current.scrollLeft += deltaX
//     setTouchStartX(currentX)
//   }

//   const handleTouchEnd = (e: React.TouchEvent) => {
//     if (!touchStartX || !containerRef.current) return
    
//     const endX = e.changedTouches[0].clientX
//     const deltaX = touchStartX - endX
//     const deltaTime = Date.now() - touchStartTime
//     const velocity = Math.abs(deltaX) / deltaTime

//     // Determine if swipe was intentional based on distance or velocity
//     if (Math.abs(deltaX) > slideWidth / 4 || velocity > 0.3) {
//       if (deltaX > 0) {
//         handleNext()
//       } else {
//         handlePrev()
//       }
//     } else {
//       // Snap back to current slide if swipe was not sufficient
//       containerRef.current.scrollTo({
//         left: slideWidth * (activeIndex + 1),
//         behavior: 'smooth'
//       })
//     }

//     setTouchStartX(null)
//     setTimeout(() => setPaused(false), interval)
//   }

//   // Handle keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowLeft') {
//         handlePrev()
//       } else if (e.key === 'ArrowRight') {
//         handleNext()
//       }
//     }

//     window.addEventListener('keydown', handleKeyDown)
//     return () => window.removeEventListener('keydown', handleKeyDown)
//   }, [activeIndex, slideWidth])

//   // Dot color logic
//   const getDotClasses = (isActive: boolean) => {
//     if (theme === "dark") return isActive ? "bg-cyan-400 scale-110" : "bg-gray-600"
//     if (theme === "morpho") return isActive ? "bg-purple-400 scale-110" : "bg-white/30"
//     return isActive ? "bg-blue-500 scale-110" : "bg-gray-400/50"
//   }

//   // Arrow button styles
//   const getArrowClasses = () => {
//     if (theme === "dark") return "bg-gray-800/70 hover:bg-gray-700 text-cyan-300 shadow-lg"
//     if (theme === "morpho") return "bg-white/20 backdrop-blur-lg hover:bg-white/30 text-purple-300 shadow-lg"
//     return "bg-gray-200/80 hover:bg-gray-300 text-blue-600 shadow-lg"
//   }

//   // Container background based on theme
//   const getContainerClasses = () => {
//     if (theme === "dark") return "bg-gray-900"
//     if (theme === "morpho") return "bg-gradient-to-br from-purple-100 to-blue-100"
//     return "bg-white"
//   }

//   return (
//     <div
//       className={cn("relative w-full group overflow-hidden rounded-lg", getContainerClasses())}
//       onMouseEnter={() => setPaused(true)}
//       onMouseLeave={() => setPaused(false)}
//       onTouchStart={handleTouchStart}
//       onTouchMove={handleTouchMove}
//       onTouchEnd={handleTouchEnd}
//       role="region"
//       aria-roledescription="carousel"
//       aria-label="Image carousel"
//     >
//       {/* Slides */}
//       <div
//         ref={containerRef}
//         className="flex overflow-x-hidden snap-x snap-mandatory scroll-smooth"
//         style={{ scrollSnapType: "x mandatory" }}
//         onScroll={handleScroll}
//         aria-live={paused ? "polite" : "off"}
//       >
//         {extendedSlides.map((child, index) => (
//           <div 
//             key={index} 
//             className="w-full flex-shrink-0 snap-center"
//             aria-hidden={index !== activeIndex + 1}
//             aria-label={`Slide ${index + 1} of ${totalSlides}`}
//           >
//             {child}
//           </div>
//         ))}
//       </div>

//       {/* Arrows */}
//       {showArrows && totalSlides > 1 && (
//         <>
//           <button
//             onClick={handlePrev}
//             className={cn(
//               "absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none",
//               getArrowClasses()
//             )}
//             aria-label="Previous slide"
//           >
//             <ChevronLeft className="w-5 h-5" />
//           </button>
//           <button
//             onClick={handleNext}
//             className={cn(
//               "absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none",
//               getArrowClasses()
//             )}
//             aria-label="Next slide"
//           >
//             <ChevronRight className="w-5 h-5" />
//           </button>
//         </>
//       )}

//       {/* Pagination dots */}
//       {showDots && totalSlides > 1 && (
//         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-black/20 backdrop-blur-sm">
//           {slides.map((_, i) => (
//             <button
//               key={i}
//               onClick={() => {
//                 if (!containerRef.current || isTransitioning) return
//                 setIsTransitioning(true)
//                 setActiveIndex(i)
//                 containerRef.current.scrollTo({ 
//                   left: slideWidth * (i + 1), 
//                   behavior: 'smooth' 
//                 })
//                 setTimeout(() => setIsTransitioning(false), 500)
//               }}
//               className={cn(
//                 "w-3 h-3 rounded-full transition-all duration-300",
//                 getDotClasses(i === activeIndex)
//               )}
//               aria-label={`Go to slide ${i + 1}`}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }