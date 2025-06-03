
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedRoomOptions, 
  addManagedRoomOption,
  deleteManagedRoomOption, 
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// AlertTriangle and useAuth removed
import { useEffect, useState } from 'react';

export default function RoomsSettingsPage() {
  // Auth checks removed
  const [initialRooms, setInitialRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoading(true);
        const options = await getManagedRoomOptions();
        setInitialRooms(options);
      } catch (error) {
        // console.error("Failed to fetch room options:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // Access denied section removed.

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
              optionType="room" // Corrected from "Room"
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
