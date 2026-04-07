"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTeamMemberAction, deleteTeamMemberAction } from "@/lib/actions/staff";
import { users } from "@/db/schema";
export type TeamMember = typeof users.$inferSelect;

export default function EditTeamMemberDialog({ member }: { member: TeamMember }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      await updateTeamMemberAction(formData);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update team member", error);
    }
  }

  async function handleDelete() {
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        await deleteTeamMemberAction(member.id);
        setOpen(false);
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="focus:outline-none">
        <div className="text-sm font-medium h-8 px-3 rounded-md text-on-surface-variant hover:text-primary transition-colors border-none hover:bg-transparent flex items-center justify-center">
            Edit
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update role and contact details for {member.firstName}.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <input type="hidden" name="id" value={member.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`firstName-${member.id}`}>First Name</Label>
              <Input id={`firstName-${member.id}`} name="firstName" defaultValue={member.firstName || ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`lastName-${member.id}`}>Last Name</Label>
              <Input id={`lastName-${member.id}`} name="lastName" defaultValue={member.lastName || ""} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`role-${member.id}`}>Role</Label>
            <Input id={`role-${member.id}`} name="role" defaultValue={member.role || ""} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`phoneNumber-${member.id}`}>Phone Number</Label>
            <Input id={`phoneNumber-${member.id}`} name="phoneNumber" defaultValue={member.phoneNumber || ""} />
          </div>
          
          <DialogFooter className="pt-4 flex justify-between sm:justify-between w-full">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Remove
            </Button>
            <div className="space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
