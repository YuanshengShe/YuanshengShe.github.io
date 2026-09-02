/* ==========================================================================
   Categories 页面交互（仅 /categories/ 页面有 .cat-page 时生效）
   - 实时筛选分类卡片
   - 数字滚动（count-up）
   - 卡片 3D 悬停微倾斜
   ========================================================================== */
(function () {
  'use strict'

  const page = document.querySelector('.cat-page')
  if (!page) return

  const reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer =
    window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches

  /* ---------------- 筛选 ---------------- */
  const search = document.getElementById('catSearch')
  const cards = Array.prototype.slice.call(page.querySelectorAll('.cat-card'))
  const empty = page.querySelector('.cat-empty')

  if (search) {
    const applyFilter = function () {
      const q = search.value.trim().toLowerCase()
      let shown = 0
      cards.forEach(function (card) {
        const hay =
          ((card.getAttribute('data-name') || '') + ' ' + (card.getAttribute('data-desc') || '')).toLowerCase()
        const visible = !q || hay.indexOf(q) !== -1
        card.style.display = visible ? '' : 'none'
        if (visible) shown += 1
      })
      if (empty) empty.style.display = shown ? 'none' : ''
    }

    search.addEventListener('input', applyFilter)
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        search.value = ''
        applyFilter()
        search.blur()
      }
    })
  }

  /* ---------------- 数字滚动 ---------------- */
  const numEls = Array.prototype.slice.call(page.querySelectorAll('[data-count]'))

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  function fillAll() {
    numEls.forEach(function (el) {
      el.textContent = fmt(parseFloat(el.getAttribute('data-count')) || 0)
    })
  }

  function countUp(el) {
    const target = parseFloat(el.getAttribute('data-count')) || 0
    const dur = 900
    const start = performance.now()
    function step(now) {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = fmt(Math.round(target * eased))
      if (p < 1) window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }

  if (reduceMotion) {
    fillAll()
  } else if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            countUp(entry.target)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.4 }
    )
    numEls.forEach(function (el) {
      io.observe(el)
    })
  } else {
    fillAll()
  }

  /* ---------------- 3D 微倾斜 ---------------- */
  if (!reduceMotion && finePointer) {
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        card.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg')
        card.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg')
      })
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg')
        card.style.setProperty('--ry', '0deg')
      })
    })
  }
})()
