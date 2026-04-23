'use client'

import { useState, useEffect } from 'react'

interface CarouselSlide {
  id: number
  src: string
  alt: string
  title?: string
}

interface LogoCarouselProps {
  slides: CarouselSlide[]
  autoPlayInterval?: number // milliseconds
  className?: string
}

export default function LogoCarousel({ 
  slides, 
  autoPlayInterval = 4000, 
  className = "" 
}: LogoCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-play functionality
  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [slides.length, autoPlayInterval])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  if (slides.length === 0) return null

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Slide container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="min-w-full flex items-center justify-center"
          >
            <div className="relative">
              <img loading="lazy" decoding="async"
                src={slide.src}
                alt={slide.alt}
                width="280"
                height="280"
                className="h-auto w-auto object-contain filter drop-shadow-[0_0_20px_rgba(255,212,0,0.3)] transition-transform hover:scale-110"
              />
              {/* Subtle glow effect behind logo */}
              <div className="absolute inset-0 -z-10 rounded-full bg-[#ffd400]/10 blur-[50px] scale-150" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      {slides.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                index === currentSlide
                  ? 'bg-[#ffd400]'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Optional slide title */}
      {slides[currentSlide].title && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-bold text-[#ffd400]">
            {slides[currentSlide].title}
          </h3>
        </div>
      )}

      {/* Navigation arrows (optional, hidden by default) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white opacity-0 transition-opacity hover:bg-black/40 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white opacity-0 transition-opacity hover:bg-black/40 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}