type BadgeVariant = 'draft' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{label}</span>;
}
