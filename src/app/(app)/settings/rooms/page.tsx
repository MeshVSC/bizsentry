
"use client"; // This page is now a Client Component

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedRoomOptions, // Server action
  addManagedRoomOption,  // Server action
  deleteManagedRoomOption, // Server action
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Use client-side context
import { useEffect, useState } from 'react';

export default function RoomsSettingsPage() {
  const { currentUser } = useAuth();
  const [initialRooms, setInitialRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
        try {
          setLoading(true);
          const options = await getManagedRoomOptions();
          setInitialRooms(options);
        } catch (error) {
          console.error("Failed to fetch room options:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchOptions();
  }, [currentUser]);

  const userRole = currentUser?.role?.trim().toLowerCase();

  if (!currentUser || (userRole !== 'admin' && userRole !== 'manager')) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground text-center">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Manage Rooms"
        description="Define rooms or areas where items are located."
      />
      <Card>
        <CardHeader>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>Specify rooms or distinct physical areas.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? <p>Loading rooms...</p> : (
            <ManageOptionsSection
              optionType="Room"
              initialOptions={initialRooms}
              addOptionAction={addManagedRoomOption}
              deleteOptionAction={deleteManagedRoomOption}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
