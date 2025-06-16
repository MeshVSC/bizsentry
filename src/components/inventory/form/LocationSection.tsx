"use client";

import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface LocationSectionProps {
  control: Control;
  availableStorageLocations: string[];
  availableBinLocations: string[];
  availableRooms: string[];
  availableProjects: string[];
}

export default function LocationSection({
  control,
  availableStorageLocations,
  availableBinLocations,
  availableRooms,
  availableProjects,
}: LocationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location & Association</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="storageLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select storage location" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {availableStorageLocations.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="binLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bin Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select bin location" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {availableBinLocations.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="room"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {availableRooms.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="project"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger></FormControl>
                <SelectContent>
                  {availableProjects.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}