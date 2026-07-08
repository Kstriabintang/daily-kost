// v-reveal: fade + slide element into view when it enters the viewport.
// Usage: v-reveal  |  v-reveal="150" (delay ms)  |  v-reveal="{ delay: 100, y: 40 }"
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in')
        io.unobserve(entry.target)
      }
    }
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
)

export default {
  mounted(el, binding) {
    const opt = binding.value || {}
    const delay = typeof opt === 'number' ? opt : opt.delay || 0
    const y = typeof opt === 'object' && opt.y != null ? opt.y : 24
    el.classList.add('reveal')
    el.style.setProperty('--reveal-y', y + 'px')
    if (delay) el.style.transitionDelay = delay + 'ms'
    io.observe(el)
  },
  unmounted(el) {
    io.unobserve(el)
  },
}
