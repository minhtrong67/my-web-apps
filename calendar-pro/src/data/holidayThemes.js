/**
 * Giao diện riêng cho các ngày đặc biệt (Giáng sinh, Halloween, Tết...). Màu cố định, không đổi theo màu chủ đạo của app,
 * vì mỗi ngày lễ có "màu nhận diện" riêng. Chữ luôn trắng trên nền đậm nên đọc rõ ở cả giao diện sáng và tối.
 *
 *  bg:      nền gradient của thẻ
 *  glow:    màu bóng đổ của thẻ
 *  strong:  màu chữ trên ô số (ô "ngày") nền trắng
 *  pattern: lớp hoa văn nhẹ phủ lên nền (radial-gradient chấm tròn)
 *  emojis:  các biểu tượng trang trí (vị trí, cỡ chữ, độ trễ animation)
 */
const dots = (c, a = 0.35) =>
  `radial-gradient(circle at 12% 22%, ${c} 0 ${a * 5}px, transparent ${a * 5 + 1}px),` +
  `radial-gradient(circle at 78% 14%, ${c} 0 ${a * 4}px, transparent ${a * 4 + 1}px),` +
  `radial-gradient(circle at 56% 62%, ${c} 0 ${a * 5}px, transparent ${a * 5 + 1}px),` +
  `radial-gradient(circle at 90% 78%, ${c} 0 ${a * 4}px, transparent ${a * 4 + 1}px),` +
  `radial-gradient(circle at 30% 86%, ${c} 0 ${a * 4}px, transparent ${a * 4 + 1}px)`

export const HOLIDAY_THEMES = {
  christmas: {
    name: 'christmas',
    bg: 'linear-gradient(145deg, #7f1020 0%, #b8202f 42%, #0e5a3a 100%)',
    glow: 'rgba(184, 32, 47, 0.45)',
    strong: '#7f1020',
    accent: '#ffe08a',
    pattern: dots('rgba(255,255,255,0.55)'),
    emojis: [
      { e: '❄️', top: '6%', right: '8%', size: 2.1, delay: 0 },
      { e: '🎄', bottom: '8%', right: '6%', size: 2.8, delay: 0.6 },
      { e: '⭐', top: '40%', right: '30%', size: 1.1, delay: 1.2 },
      { e: '🎁', bottom: '10%', right: '34%', size: 1.5, delay: 1.8 }
    ]
  },
  halloween: {
    name: 'halloween',
    bg: 'linear-gradient(145deg, #1a0b2e 0%, #4a1d7a 48%, #e8650c 130%)',
    glow: 'rgba(138, 63, 214, 0.5)',
    strong: '#2a0f4a',
    accent: '#ffb35c',
    pattern: dots('rgba(255,179,92,0.4)', 0.3),
    emojis: [
      { e: '🎃', bottom: '6%', right: '6%', size: 3, delay: 0 },
      { e: '🦇', top: '8%', right: '10%', size: 1.8, delay: 0.5 },
      { e: '👻', top: '38%', right: '32%', size: 1.4, delay: 1.1 },
      { e: '🕸️', top: '6%', right: '34%', size: 1.4, delay: 1.7 }
    ]
  },
  tet: {
    name: 'tet',
    bg: 'linear-gradient(145deg, #a50019 0%, #d9301f 52%, #f2a413 140%)',
    glow: 'rgba(217, 48, 31, 0.5)',
    strong: '#a50019',
    accent: '#ffe27a',
    pattern: dots('rgba(255,226,122,0.5)'),
    emojis: [
      { e: '🌸', top: '6%', right: '8%', size: 2.2, delay: 0 },
      { e: '🏮', bottom: '8%', right: '7%', size: 2.6, delay: 0.6 },
      { e: '🧧', top: '40%', right: '30%', size: 1.5, delay: 1.2 },
      { e: '✨', top: '8%', right: '36%', size: 1.2, delay: 1.8 }
    ]
  },
  newyear: {
    name: 'newyear',
    bg: 'linear-gradient(145deg, #0b1230 0%, #2a1a6e 55%, #8a2fb5 120%)',
    glow: 'rgba(90, 60, 200, 0.5)',
    strong: '#0b1230',
    accent: '#ffd966',
    pattern: dots('rgba(255,217,102,0.55)', 0.3),
    emojis: [
      { e: '🎆', top: '6%', right: '8%', size: 2.4, delay: 0 },
      { e: '🥂', bottom: '8%', right: '8%', size: 2.3, delay: 0.7 },
      { e: '✨', top: '38%', right: '30%', size: 1.3, delay: 1.2 },
      { e: '🎉', bottom: '10%', right: '34%', size: 1.5, delay: 1.8 }
    ]
  },
  valentine: {
    name: 'valentine',
    bg: 'linear-gradient(145deg, #a3124f 0%, #e02e74 55%, #ff8fb1 130%)',
    glow: 'rgba(224, 46, 116, 0.45)',
    strong: '#a3124f',
    accent: '#ffe0ec',
    pattern: dots('rgba(255,255,255,0.45)'),
    emojis: [
      { e: '💖', top: '8%', right: '9%', size: 2.2, delay: 0 },
      { e: '🌹', bottom: '8%', right: '7%', size: 2.6, delay: 0.6 },
      { e: '💘', top: '40%', right: '30%', size: 1.4, delay: 1.2 },
      { e: '💕', bottom: '10%', right: '34%', size: 1.3, delay: 1.8 }
    ]
  },
  midautumn: {
    name: 'midautumn',
    bg: 'linear-gradient(145deg, #0a1c44 0%, #1f3a8a 55%, #e8a317 150%)',
    glow: 'rgba(58, 96, 200, 0.5)',
    strong: '#0a1c44',
    accent: '#ffe27a',
    pattern: dots('rgba(255,226,122,0.5)', 0.3),
    emojis: [
      { e: '🌕', top: '6%', right: '8%', size: 2.6, delay: 0 },
      { e: '🏮', bottom: '8%', right: '8%', size: 2.4, delay: 0.7 },
      { e: '🥮', bottom: '10%', right: '36%', size: 1.5, delay: 1.3 },
      { e: '🐇', top: '40%', right: '30%', size: 1.3, delay: 1.9 }
    ]
  },
  vietnam: {
    name: 'vietnam',
    bg: 'linear-gradient(145deg, #a50f12 0%, #da251d 55%, #f0b400 150%)',
    glow: 'rgba(218, 37, 29, 0.5)',
    strong: '#a50f12',
    accent: '#ffe066',
    pattern: dots('rgba(255,224,102,0.5)'),
    emojis: [
      { e: '⭐', top: '6%', right: '8%', size: 2.6, delay: 0 },
      { e: '🎆', bottom: '8%', right: '7%', size: 2.4, delay: 0.7 },
      { e: '🇻🇳', top: '40%', right: '30%', size: 1.5, delay: 1.3 }
    ]
  },
  women: {
    name: 'women',
    bg: 'linear-gradient(145deg, #8b1a6b 0%, #d4358f 52%, #ff9a7a 140%)',
    glow: 'rgba(212, 53, 143, 0.45)',
    strong: '#8b1a6b',
    accent: '#ffe4ef',
    pattern: dots('rgba(255,255,255,0.45)'),
    emojis: [
      { e: '🌷', top: '8%', right: '9%', size: 2.2, delay: 0 },
      { e: '💐', bottom: '8%', right: '7%', size: 2.6, delay: 0.6 },
      { e: '🌸', top: '40%', right: '30%', size: 1.4, delay: 1.2 }
    ]
  },
  children: {
    name: 'children',
    bg: 'linear-gradient(145deg, #ff3d81 0%, #ff8a3d 38%, #7c4dff 100%)',
    glow: 'rgba(255, 90, 120, 0.5)',
    strong: '#c2185b',
    accent: '#fff3a0',
    pattern: dots('rgba(255,255,255,0.55)', 0.4),
    emojis: [
      { e: '🎈', top: '6%', right: '9%', size: 2.4, delay: 0 },
      { e: '🧸', bottom: '8%', right: '7%', size: 2.6, delay: 0.6 },
      { e: '🌈', top: '40%', right: '30%', size: 1.5, delay: 1.2 },
      { e: '🎠', bottom: '10%', right: '34%', size: 1.5, delay: 1.8 }
    ]
  },
  hungkings: {
    name: 'hungkings',
    bg: 'linear-gradient(145deg, #3d0a0a 0%, #861b1b 52%, #c88a2e 135%)',
    glow: 'rgba(134, 27, 27, 0.55)',
    strong: '#5a0f0f',
    accent: '#f5d58a',
    pattern: dots('rgba(245,213,138,0.5)', 0.3),
    emojis: [
      { e: '🐉', top: '6%', right: '8%', size: 2.5, delay: 0 },
      { e: '🏔️', bottom: '8%', right: '7%', size: 2.5, delay: 0.7 },
      { e: '🌾', top: '40%', right: '30%', size: 1.4, delay: 1.3 },
      { e: '✨', bottom: '10%', right: '36%', size: 1.2, delay: 1.9 }
    ]
  },
  teachers: {
    name: 'teachers',
    bg: 'linear-gradient(145deg, #0b3b2c 0%, #17694e 52%, #e0a526 140%)',
    glow: 'rgba(23, 105, 78, 0.5)',
    strong: '#0b3b2c',
    accent: '#ffe08a',
    pattern: dots('rgba(255,255,255,0.4)', 0.3),
    emojis: [
      { e: '📚', top: '6%', right: '8%', size: 2.3, delay: 0 },
      { e: '🌻', bottom: '8%', right: '7%', size: 2.6, delay: 0.6 },
      { e: '✏️', top: '40%', right: '30%', size: 1.4, delay: 1.2 },
      { e: '🍎', bottom: '10%', right: '34%', size: 1.4, delay: 1.8 }
    ]
  },
  labor: {
    name: 'labor',
    bg: 'linear-gradient(145deg, #10233b 0%, #1f4e79 52%, #f28c28 140%)',
    glow: 'rgba(31, 78, 121, 0.5)',
    strong: '#10233b',
    accent: '#ffd08a',
    pattern: dots('rgba(255,208,138,0.45)', 0.3),
    emojis: [
      { e: '⚙️', top: '6%', right: '8%', size: 2.3, delay: 0 },
      { e: '🛠️', bottom: '8%', right: '7%', size: 2.5, delay: 0.6 },
      { e: '👷', top: '40%', right: '30%', size: 1.5, delay: 1.2 },
      { e: '🔧', bottom: '10%', right: '34%', size: 1.3, delay: 1.8 }
    ]
  }
}

/** id ngày lễ (data/holidays.js) → chủ đề. Ngày không có trong bảng dùng thẻ mặc định theo màu chủ đạo của app. */
const THEME_OF_HOLIDAY = {
  'giang-sinh': 'christmas',
  halloween: 'halloween',
  'tet-nguyen-dan': 'tet',
  'mung-2-tet': 'tet',
  'mung-3-tet': 'tet',
  'giao-thua': 'tet',
  'ong-cong-ong-tao': 'tet',
  'tet-duong': 'newyear',
  valentine: 'valentine',
  'trung-thu': 'midautumn',
  'quoc-khanh': 'vietnam',
  'giai-phong': 'vietnam',
  'phu-nu-vn': 'women',
  'phu-nu-vietnam': 'women',
  'quoc-te-thieu-nhi': 'children',
  'gio-to-hung-vuong': 'hungkings',
  'nha-giao': 'teachers',
  'quoc-te-lao-dong': 'labor'
}

export function getHolidayTheme(holidayId) {
  const key = THEME_OF_HOLIDAY[holidayId]
  return key ? HOLIDAY_THEMES[key] : null
}
