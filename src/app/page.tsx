
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // With Supabase client-side auth, AppLayout handles auth checks.
  // Redirect to a default authenticated page, AppLayout will handle unauth.
  redirect('/dashboard');
  // The return null is technically unreachable but good practice for async components that redirect.
  return null;
}
