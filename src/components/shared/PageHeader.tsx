
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:truncate"> {/* Applied H1 styles: text-3xl, text-foreground (Text Light) */}
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p> {/* Text Mid for description */}
        )}
      </div>
      {actions && <div className="mt-4 flex md:ml-4 md:mt-0">{actions}</div>}
    </div>
  );
}
