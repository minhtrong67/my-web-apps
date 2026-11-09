const P = {
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1', close: 'M6 6l12 12M18 6 6 18', check: 'm5 12 5 5 9-10',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', list: 'M4 6h16M4 12h16M4 18h16',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3', filter: 'M3 5h18l-7 8v6l-4-2v-4z',
  up: 'M12 19V5M5 12l7-7 7 7', heart: 'M12 20.5S3.500 15.500 3.500 9.500A4.500 4.500 0 0 1 12 7.200 4.500 4.500 0 0 1 20.500 9.500c0 6-8.500 11-8.500 11z', compare: 'M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4', download: 'M12 4v12M6 11l6 6 6-6M5 20h14', left: 'm15 5-7 7 7 7', right: 'm9 5 7 7-7 7', zoom: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3M11 8v6M8 11h6', refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  alert: 'M12 3 2 21h20zM12 10v5M12 18v.01', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.01',
  ok: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6', err: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6M15 9l-6 6',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
}
export default function Ic({ n, className = 'h-5 w-5', fill }) {
  return <svg className={className} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>
}
