import ICON_MAP from './iconMap';

/**
 * Material Symbols Rounded. `fill` switches to the filled glyph when the icon has one
 * (navigation / selected states); otherwise the outlined glyph is used.
 */
export default function Icon({ name, className = '', fill = false, size = 20, style, ...rest }) {
  const glyph = ICON_MAP[name] || ICON_MAP.help;
  const path = fill && glyph[1] ? glyph[1] : glyph[0];
  return (
    <svg
      viewBox="0 -960 960 960"
      width={size}
      height={size}
      fill="currentColor"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      focusable="false"
      style={style}
      {...rest}
    >
      <path d={path} />
    </svg>
  );
}
