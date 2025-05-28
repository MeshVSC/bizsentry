
// This file is no longer used and its content has been moved to individual settings pages.
// It can be safely deleted.
// For now, it will redirect to the default application settings page.
import { redirect } from 'next/navigation';

export default function OldSettingsOptionsPage() {
  redirect('/settings/application');
  return null;
}
