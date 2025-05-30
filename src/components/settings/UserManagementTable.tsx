
"use client";

import type { UserRole, UserView } from "@/types/user";
import { updateUserRole, deleteUser } from "@/lib/actions/userActions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserManagementTableProps {
  initialUsers: UserView[];
}

const userRoles: UserRole[] = ["admin", "manager", "viewer"]; 

export default function UserManagementTable({ initialUsers }: UserManagementTableProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserView[]>(initialUsers);
  const [isPendingMap, setIsPendingMap] = useState<Record<string, boolean>>({});
  const [_, startTransition] = useTransition(); // Renamed to avoid conflict if startTransition is used elsewhere


  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setIsPendingMap(prev => ({ ...prev, [userId]: true }));
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success && result.user) {
        setUsers(currentUsers => currentUsers.map(u => (u.id === userId ? result.user! : u)));
        toast({ title: "Success", description: result.message });
      } else {
        toast({ title: "Error", description: result.message || "Failed to update role.", variant: "destructive" });
      }
      setIsPendingMap(prev => ({ ...prev, [userId]: false }));
    });
  };

  const handleDeleteUser = (userId: string) => {
    setIsPendingMap(prev => ({ ...prev, [`delete-${userId}`]: true }));
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
        toast({ title: "Success", description: result.message });
      } else {
        toast({ title: "Error", description: result.message || "Failed to delete user.", variant: "destructive" });
      }
      setIsPendingMap(prev => ({ ...prev, [`delete-${userId}`]: false }));
    });
  };

  if (users.length === 0) {
    return <p className="text-muted-foreground">No users found. Add one above.</p>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Existing Users ({users.length})</h3>
      <ScrollArea className="h-72 w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell> 
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}
                    disabled={isPendingMap[user.id]}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role} value={role} className="text-xs">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  {isPendingMap[user.id] || isPendingMap[`delete-${user.id}`] ? (
                     <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Delete user ${user.username}`} disabled={isPendingMap[`delete-${user.id}`]}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user "{user.username}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isPendingMap[`delete-${user.id}`]}>Cancel</AlertDialogCancel>
                          <Button variant="destructive" onClick={() => handleDeleteUser(user.id)} disabled={isPendingMap[`delete-${user.id}`]}>
                            {isPendingMap[`delete-${user.id}`] ? "Deleting..." : "Delete User"}
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                   )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
