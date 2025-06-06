
"use server";

import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from 'next/cache';

export interface AppSettings {
  defaultItemsPerPage: number;
}

// Initialize global store for app settings if it doesn't exist
if (typeof globalThis._appSettingsStore === 'undefined') {
  globalThis._appSettingsStore = {
    defaultItemsPerPage: 5, // Default value
  };
}

export async function getAppSettings(): Promise<AppSettings> {
  noStore(); // Opt out of caching for this function to ensure fresh reads
  // The setTimeout was for simulation and isn't needed for functionality.
  // await new Promise(resolve => setTimeout(resolve, 50)); 
  return JSON.parse(JSON.stringify(globalThis._appSettingsStore));
}

export async function updateDefaultItemsPerPage(value: number): Promise<{ success: boolean; settings?: AppSettings; message?: string }> {
  noStore(); // Ensure this action also operates with fresh data if it reads before writing
  if (typeof value !== 'number' || value < 1 || value > 100) {
    return { success: false, message: "Items per page must be a number between 1 and 100." };
  }
  
  globalThis._appSettingsStore.defaultItemsPerPage = value;
  
  // Revalidate paths that depend on this setting
  revalidatePath("/inventory", "layout");
  revalidatePath("/settings/application", "page"); // Revalidate the settings page itself

  return { 
    success: true, 
    message: "Default items per page updated successfully.",
    settings: JSON.parse(JSON.stringify(globalThis._appSettingsStore))
  };
}

