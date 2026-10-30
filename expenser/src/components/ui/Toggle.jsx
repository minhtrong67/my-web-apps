import Icon from './Icon';

/** M3 switch: 52x32 track, thumb grows when pressed and shows a check when on. */
export default function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group relative h-8 w-[3.25rem] shrink-0 rounded-full border-2 transition-colors duration-200 ${
        checked ? 'border-primary bg-primary' : 'border-outline bg-surface-container-highest'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <span
        className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full transition-[left,width,height,background-color] duration-300 ease-spatial-fast group-active:h-7 group-active:w-7 ${
          checked ? 'left-[1.375rem] h-6 w-6 bg-on-primary text-primary group-active:left-[1.125rem]' : 'left-1 h-4 w-4 bg-outline group-active:left-0.5'
        }`}
      >
        {checked && <Icon name="check" size={16} />}
      </span>
    </button>
  );
}
