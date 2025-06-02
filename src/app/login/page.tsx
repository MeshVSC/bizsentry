// This file is intentionally left blank as the login page is no longer needed
// after the removal of user authentication.
// It can be safely deleted from the project.
// Any redirects that previously pointed to /login should be updated or removed.
// For instance, the root page now redirects to /dashboard directly.
import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect to dashboard as login is no longer applicable
  redirect('/dashboard');
  return null;
}
