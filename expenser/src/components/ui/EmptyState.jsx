import Icon from './Icon';
import Button from './Button';

export default function EmptyState({ icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-secondary-container text-on-secondary-container">
        <Icon name={icon} size={36} />
      </span>
      <p className="max-w-xs text-body-md text-on-surface-variant">{text}</p>
      {action && (
        <Button variant="tonal" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
