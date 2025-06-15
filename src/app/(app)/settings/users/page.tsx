// This file is intentionally left blank as the User Management settings page
// is no longer needed after the removal of user authentication and management features.
// It can be safely deleted from the project.
// The link to this page should also be removed from the sidebar navigation.
import PageHeader from '@/components/shared/PageHeader';
import { AlertTriangle } from 'lucide-react';

export default function UserSettingsPage() {
  return (
    <>
      <PageHeader
        title="User Management"
        description="This feature has been removed."
      />
      <div className="glass-card p-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertTriangle className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground">Feature Not Available</h1>
          <p className="text-muted-foreground text-center">
            User management functionality has been removed from the application.
          </p>
        </div>
      </div>
    </>
  );
}
