
"use client"; 

import PageHeader from '@/components/shared/PageHeader';
import {
  getManagedRoomOptions, 
  addManagedRoomOption,
  deleteManagedRoomOption, 
} from '@/lib/actions/itemActions';
import ManageOptionsSection from '@/components/settings/ManageOptionsSection';
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
      } catch {
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
      <div className="glass-card p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Rooms</h3>
          <p className="text-sm text-muted-foreground">Specify rooms or distinct physical areas.</p>
        </div>
        {loading ? <p>Loading rooms...</p> : (
          <ManageOptionsSection
            optionType="room" // Corrected from "Room"
            initialOptions={initialRooms}
            addOptionAction={addManagedRoomOption}
            deleteOptionAction={deleteManagedRoomOption}
          />
        )}
      </div>
    </>
  );
}
