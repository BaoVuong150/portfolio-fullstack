import { useEffect, useRef, useState } from 'react'

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const ele = ref.current
    if (!ele) return

    // Update arrows based on scroll position
    const handleScroll = () => {
      setCanScrollLeft(ele.scrollLeft > 0)
      setCanScrollRight(
        ele.scrollLeft < ele.scrollWidth - ele.clientWidth - 1 // -1 for subpixel precision
      )
    }

    // Call initially
    handleScroll()
    
    // Listen to scroll events
    ele.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll) // Re-check if window resized

    let isDown = false
    let startX: number
    let scrollLeft: number

    const mouseDownHandler = (e: MouseEvent) => {
      isDown = true
      ele.classList.add('active:cursor-grabbing')
      startX = e.pageX - ele.offsetLeft
      scrollLeft = ele.scrollLeft
    }

    const mouseLeaveHandler = () => {
      isDown = false
      ele.classList.remove('active:cursor-grabbing')
    }

    const mouseUpHandler = () => {
      isDown = false
      ele.classList.remove('active:cursor-grabbing')
    }

    const mouseMoveHandler = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - ele.offsetLeft
      const walk = (x - startX) * 2 // Scroll-fast
      ele.scrollLeft = scrollLeft - walk
    }

    ele.addEventListener('mousedown', mouseDownHandler)
    ele.addEventListener('mouseleave', mouseLeaveHandler)
    ele.addEventListener('mouseup', mouseUpHandler)
    ele.addEventListener('mousemove', mouseMoveHandler)

    return () => {
      ele.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      ele.removeEventListener('mousedown', mouseDownHandler)
      ele.removeEventListener('mouseleave', mouseLeaveHandler)
      ele.removeEventListener('mouseup', mouseUpHandler)
      ele.removeEventListener('mousemove', mouseMoveHandler)
    }
  }, [])

  const scrollBy = (offset: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return { ref, canScrollLeft, canScrollRight, scrollBy }
}
