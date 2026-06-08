import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  statusLabel?: string;
  authoredAt?: string;
  description?: string;
  onSaveDraft?: () => void;
  onValidate?: () => void;
  onSubmit?: () => void;
}

export function PageHeader({
  breadcrumbs,
  title,
  statusLabel = 'Draft',
  authoredAt,
  description,
  onSaveDraft,
  onValidate,
  onSubmit,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.label} className="breadcrumb__item">
            {i > 0 && <span className="breadcrumb__sep">›</span>}
            <a className="breadcrumb__link">{crumb.label}</a>
          </span>
        ))}
      </nav>

      <div className="page-header__row">
        <div className="page-header__title-group">
          <h1 className="page-header__title">{title}</h1>
          <Badge label={statusLabel} variant="draft" />
          {authoredAt && <span className="page-header__meta">{authoredAt}</span>}
        </div>

        <div className="page-header__actions">
          <Button variant="outline" onClick={onSaveDraft}>Save Draft</Button>
          <Button variant="outline" onClick={onValidate}>Validate Data</Button>
          <Button variant="primary" onClick={onSubmit}>Submit to Buyer</Button>
        </div>
      </div>

      {description && <p className="page-header__desc">{description}</p>}
    </div>
  );
}
