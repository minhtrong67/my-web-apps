/**
 * Loading indicator của Material 3 Expressive: một hình biến hình liên tục (cookie → flower → sunny → clover → scallop)
 * trong lúc xoay. Thay cho vòng quay tròn thông thường. Hình được định nghĩa bằng clip-path (scripts/generate-theme.mjs).
 */
export default function Loader({ size = 40, tone = 'primary', label = 'Đang tải', className = '' }) {
  return (
    <span role="status" aria-label={label} className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <span className="loader-shape block h-full w-full" data-tone={tone === 'container' ? 'container' : undefined} />
    </span>
  )
}
