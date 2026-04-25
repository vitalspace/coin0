let scrollPercentage = 0

export function getScrollPercentage() {
  return scrollPercentage
}

export function initScrollListener() {
  if (typeof window === 'undefined') return () => {}

  const update = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollPercentage = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
  }

  window.addEventListener('scroll', update, { passive: true })
  update()

  return () => window.removeEventListener('scroll', update)
}
