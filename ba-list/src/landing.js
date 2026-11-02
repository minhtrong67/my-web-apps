import './index.css'
import { fontStack, loadFont, normalizeFont } from './lib/fonts.js'
import { motionOn, scrollToTop, smoothScrollTo } from './lib/scroll.js'
import { applyScheme } from './lib/theme.js'

/* ───────── Từ điển English (tiếng Việt nằm sẵn trong HTML để SEO) ───────── */
const EN = {
  skip: 'Skip navigation', 'nav.features': 'Features', 'nav.search': 'Search', 'nav.showcase': 'Design', 'nav.faq': 'FAQ',
  'cta.open': 'Open the app', 'cta.explore': 'Explore features', 'cta.title': 'Ready to look someone up?', 'cta.sub': 'Open BA List and find the student you need in seconds.',
  'hero.badge': 'Fan-made · 278 students',
  'hero.title': 'Look up <span class="relative whitespace-nowrap text-primary">Blue Archive<i class="slant absolute -bottom-1 left-0 -z-10 h-3 w-full bg-hl/80 [--s:8px]"></i></span> students fast, clean, beautiful',
  'hero.sub': 'BA List puts every student in one place: smart search, multi-criteria filters, detailed profiles and favorites. Free, no sign-in, and it works offline too.',
  'trust.1': 'No ads · no tracking', 'trust.2': 'Fast, runs right in your browser', 'trust.3': 'Works offline',
  'stat.0': 'Students', 'stat.1': 'Filter groups', 'stat.2': 'Sort options', 'stat.3': 'Typefaces',
  'feat.eyebrow': 'Features', 'feat.title': 'Everything you need to find the right student', 'feat.sub': 'From a quick name lookup to filtering a whole squad, BA List keeps every step short.',
  'feat.t0': 'Smart search', 'feat.d0': 'Accent-insensitive, typo-tolerant, ranked by relevance, with advanced syntax such as school:abydos or age>16.',
  'feat.t1': 'Multi-criteria filters', 'feat.d1': '15 groups: school, role, position, attack and armor type, weapon, rarity, terrain, birth month… pick several values at once.',
  'feat.t2': 'Detailed profiles', 'feat.d2': 'Combat stats, S–D terrain grades, personal info, voice actor, illustrator, JP/Global release dates and the other versions of the same character.',
  'feat.t3': 'Favorites & data', 'feat.d3': 'Save favorite students on your device and export/import JSON to move between devices. Your data never leaves the browser.',
  'feat.t4': 'Make it yours', 'feat.d4': 'Light/dark, 12 theme colors plus any custom color, 7 typefaces, text size, Vietnamese or English.',
  'feat.t5': 'Offline & installable', 'feat.d5': 'Install it to your home screen like a real app (PWA). Data and images you have seen are cached for use without a connection.',
  'sr.eyebrow': 'Search', 'sr.title': 'Type less, find exactly who you need', 'sr.sub': 'The search box understands unaccented Vietnamese, tolerates typos and lets you add conditions right in the query.',
  'sr.b1': 'Accent- and case-insensitive', 'sr.b2': 'Typos still match, with "Did you mean…" suggestions', 'sr.b3': 'Mix keywords with conditions; press / to focus the search box',
  'sr.0': 'students from Abydos', 'sr.1': 'healers using SMG', 'sr.2': 'numeric comparison: age, height', 'sr.3': 'a typo still finds Akane',
  'sc.eyebrow': 'Design', 'sc.title': 'Blue Archive style, recolored your way', 'sc.sub': 'Slanted shapes, diagonal stripes and italic type. Pick a theme color, light or dark, and your own typeface. Settings are shared with the app.',
  'sc.try': 'Try a theme color right here', 'sc.cap1': 'Dark mode · detail sheet',
  'faq.eyebrow': 'FAQ', 'faq.title': 'Frequently asked questions', 'faq.sub': 'Cannot find your answer? Open the app and try it, everything runs in your own browser.',
  'faq.q0': 'Is BA List free, and do I need to sign in?', 'faq.a0': 'It is completely free, has no ads and needs no account. Just open the site and use it.',
  'faq.q1': 'Where does the student data come from, and is it complete?', 'faq.a1': 'Data for 278 students (including outfit variants) is compiled from bluearchive.wiki: school, role, position, attack/armor type, weapon, terrain, JP/Global release dates, voice actor and illustrator.',
  'faq.q2': 'Can I use it without an internet connection?', 'faq.a2': 'Yes. BA List is a PWA: after the first visit, the code, data and images you have viewed are stored for offline use.',
  'faq.q3': 'How do I install BA List as an app?', 'faq.a3': 'On Chrome/Edge, click the install icon in the address bar or go to Settings → Install app. On iPhone, open it in Safari and choose Share → Add to Home Screen.',
  'faq.q4': 'Where are my favorites stored?', 'faq.a4': 'Only in your own browser (localStorage); nothing is sent to any server. Export/import a JSON file in Settings to move to another device.',
  'faq.q5': 'Is BA List an official NEXON or Yostar product?', 'faq.a5': 'No. It is a non-commercial fan project. Blue Archive and its character artwork belong to their respective owners.',
  'ft.disc': 'BA List is a non-commercial fan project and is not affiliated with NEXON Games or Yostar. Blue Archive and its character artwork belong to their respective owners. Data is referenced from bluearchive.wiki.',
  'ft.links': 'Links', 'ft.project': 'Project', 'ft.src': 'Source code', 'ft.rights': 'Non-commercial',
}
const EN_META = {
  title: 'BA List – Blue Archive student database: fast, beautiful, offline',
  desc: 'BA List is a lookup site for 278 Blue Archive students: smart search, filters by school, role, weapon and terrain, detailed profiles and favorites. Free and works offline.',
}

/* Link cũ dạng ".../#Tên-học-sinh" (trước khi ứng dụng chuyển sang /app/) → chuyển thẳng vào ứng dụng */
{
  let h = ''
  try { h = decodeURIComponent(location.hash.slice(1)) } catch { /* bỏ qua */ }
  if (h && !document.getElementById(h)) location.replace('app/' + location.hash)
}

/* ───────── Tiện ích ───────── */
const root = document.documentElement
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const readCfg = () => { try { return JSON.parse(localStorage.getItem('ba-cfg') || '{}') } catch { return {} } }
const saveCfg = (p) => { try { localStorage.setItem('ba-cfg', JSON.stringify({ ...readCfg(), ...p })) } catch { /* bỏ qua */ } }
let cfg = readCfg()
let lang = cfg.lang === 'vi' || cfg.lang === 'en' ? cfg.lang : (navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en'
const isDark = () => cfg.theme === 'dark' || ((cfg.theme || 'system') === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
const withTransition = (fn) => { if (motionOn() && document.startViewTransition) document.startViewTransition(fn); else fn() }

function applyTheme() {
  const d = isDark()
  root.dataset.theme = d ? 'dark' : 'light'
  applyScheme(cfg.ac || '#128cff', d ? 'dark' : 'light')
  $$('.swatch').forEach((b) => b.setAttribute('aria-pressed', String((cfg.ac || '#128cff').toLowerCase() === b.dataset.ac)))
  root.style.setProperty('--ff', fontStack(normalizeFont(cfg.ff)))
  if (cfg.fs) root.style.fontSize = `${(cfg.fs / 15) * 16}px`
}

function applyLang() {
  root.lang = lang
  $('#lang-label').textContent = lang.toUpperCase()
  $$('[data-i18n]').forEach((el) => {
    if (el.dataset.vi === undefined) el.dataset.vi = el.textContent
    el.textContent = lang === 'en' ? (EN[el.dataset.i18n] ?? el.dataset.vi) : el.dataset.vi
  })
  $$('[data-i18n-html]').forEach((el) => {
    if (el.dataset.vi === undefined) el.dataset.vi = el.innerHTML
    el.innerHTML = lang === 'en' ? (EN[el.dataset.i18nHtml] ?? el.dataset.vi) : el.dataset.vi
  })
  if (!document.documentElement.dataset.viTitle) { root.dataset.viTitle = document.title; root.dataset.viDesc = $('meta[name="description"]').content }
  document.title = lang === 'en' ? EN_META.title : root.dataset.viTitle
  $('meta[name="description"]').content = lang === 'en' ? EN_META.desc : root.dataset.viDesc
  $('#theme').title = lang === 'en' ? 'Toggle light/dark' : 'Đổi sáng/tối'
  $('#to-top').setAttribute('aria-label', lang === 'en' ? 'Back to top' : 'Lên đầu trang')
}

applyTheme()
loadFont(normalizeFont(cfg.ff))
applyLang()

/* ───────── Nút đổi ngôn ngữ / theme / màu chủ đề ───────── */
$('#lang').addEventListener('click', () => { lang = lang === 'vi' ? 'en' : 'vi'; saveCfg({ lang }); withTransition(applyLang) })
$('#theme').addEventListener('click', () => { cfg = { ...cfg, theme: isDark() ? 'light' : 'dark' }; saveCfg({ theme: cfg.theme }); withTransition(applyTheme) })
$$('.swatch').forEach((b) => b.addEventListener('click', () => { cfg = { ...cfg, ac: b.dataset.ac }; saveCfg({ ac: cfg.ac }); withTransition(applyTheme) }))
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if ((cfg.theme || 'system') === 'system') applyTheme() })

/* ───────── Menu mobile ───────── */
const menu = $('#menu'), mnav = $('#mobile-nav')
const setMenu = (open) => {
  mnav.classList.toggle('grid-rows-[1fr]', open); mnav.classList.toggle('grid-rows-[0fr]', !open)
  mnav.inert = !open; menu.setAttribute('aria-expanded', String(open))
  $('#menu-ic').setAttribute('href', open ? '#i-x' : '#i-menu')
}
setMenu(false)
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'))
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false) })
matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) setMenu(false) })

/* ───────── Cuộn mượt khi bấm navlink (có bù chiều cao header) + scroll-spy + thanh tiến độ ───────── */
const header = $('#top')
const offset = () => header.offsetHeight + 8
$$('a[data-nav]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href')
  const target = id === '#home' ? null : $(id)
  e.preventDefault()
  setMenu(false)
  const y = target ? target.getBoundingClientRect().top + scrollY - offset() + 1 : 0
  smoothScrollTo(y).then(() => { if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }) } })
  try { history.replaceState(null, '', id === '#home' ? location.pathname + location.search : id) } catch { /* bỏ qua */ }
}))

const sections = ['features', 'search', 'showcase', 'faq'].map((id) => $('#' + id))
const links = $$('a.nav-link')
const prog = $('#progress'), totop = $('#to-top')
let ticking = false
function onScroll() {
  ticking = false
  const max = document.documentElement.scrollHeight - innerHeight
  prog.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`
  const on = scrollY > 700
  totop.classList.toggle('opacity-0', !on); totop.classList.toggle('pointer-events-none', !on); totop.classList.toggle('translate-y-6', !on)
  let cur = ''
  for (const s of sections) if (s.getBoundingClientRect().top - offset() - 40 <= 0) cur = '#' + s.id
  links.forEach((l) => l.toggleAttribute('aria-current', l.getAttribute('href') === cur))
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll) } }, { passive: true })
addEventListener('resize', onScroll)
onScroll()
totop.addEventListener('click', scrollToTop)
if (location.hash && $(location.hash)) setTimeout(() => smoothScrollTo($(location.hash).getBoundingClientRect().top + scrollY - offset() + 1), 60)

/* ───────── Hiệu ứng xuất hiện khi cuộn, đếm số, gõ chữ ───────── */
const animate = motionOn() && 'IntersectionObserver' in window
if (animate) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
  $$('.reveal').forEach((el) => io.observe(el))
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return
    cio.unobserve(e.target)
    const n = +e.target.dataset.count, t0 = performance.now()
    const step = (now) => { const p = Math.min(1, (now - t0) / 1100); e.target.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step) }
    requestAnimationFrame(step)
  }), { threshold: 0.6 })
  $$('[data-count]').forEach((el) => cio.observe(el))
} else $$('.reveal').forEach((el) => el.classList.add('in'))

const typed = $('#typed')
if (typed && animate) {
  const qs = ['school:abydos', 'role:healer weapon:smg', 'age>16 height<=155', 'akanne']
  let qi = 0, ci = 0, del = false
  const tick = () => {
    const q = qs[qi]
    typed.textContent = q.slice(0, ci)
    if (!del && ci < q.length) { ci++; setTimeout(tick, 70) }
    else if (!del) { del = true; setTimeout(tick, 1500) }
    else if (ci > 0) { ci--; setTimeout(tick, 28) }
    else { del = false; qi = (qi + 1) % qs.length; setTimeout(tick, 260) }
  }
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); ci = 0; tick() } }).observe(typed)
}

/* ───────── FAQ: đóng/mở mượt ───────── */
$$('details.faq').forEach((d) => {
  const body = $('.faq-body', d)
  $('summary', d).addEventListener('click', (e) => {
    if (!motionOn() || !body.animate) return
    e.preventDefault()
    if (d.open) {
      const h = body.offsetHeight
      body.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = () => { d.open = false }
    } else {
      d.open = true
      const h = body.offsetHeight
      body.animate([{ height: '0px' }, { height: h + 'px' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' })
    }
  })
})
