"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { User } from "@/types";
import { useMutation } from "convex/react";
import { Save, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    ippis: user.ippis,
    pin: user.pin,
    monthlyContribution: user.monthlyContribution,
    totalContribution: user.totalContribution,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      name: user.name,
      ippis: user.ippis,
      pin: user.pin,
      monthlyContribution: user.monthlyContribution,
      totalContribution: user.totalContribution,
    });
  }, [user]);

  const updateUser = useMutation(api.users.updateUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUser({
        userId: user._id as Id<"users">,
        name: formData.name,
        ippis: formData.ippis,
        pin: formData.pin,
        monthlyContribution: formData.monthlyContribution,
        totalContribution: formData.totalContribution,
      });

      toast.success("User information updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.log("Error Msg: ", error);
      toast.error("Failed to update user information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
              <Users className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <DialogTitle>Edit Member Information</DialogTitle>
              <DialogDescription>
                Update member details and contributions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ippis'>IPPIS Number</Label>
            <Input
              id='ippis'
              value={formData.ippis}
              onChange={(e) => handleInputChange("ippis", e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='pin'>PIN</Label>
            <Input
              id='pin'
              value={formData.pin}
              onChange={(e) => handleInputChange("pin", e.target.value)}
              maxLength={6}
              pattern='[0-9]{6}'
              required
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='monthlyContribution'>
                Monthly Contribution (₦)
              </Label>
              <Input
                id='monthlyContribution'
                type='number'
                value={formData.monthlyContribution}
                onChange={(e) =>
                  handleInputChange(
                    "monthlyContribution",
                    parseFloat(e.target.value) || 0
                  )
                }
                min='0'
              
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='totalContribution'>Total Contribution (₦)</Label>
              <Input
                id='totalContribution'
                type='number'
                value={formData.totalContribution}
                onChange={(e) =>
                  handleInputChange(
                    "totalContribution",
                    parseFloat(e.target.value) || 0
                  )
                }
                min='0'
              
                required
              />
            </div>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>
              <X className='h-4 w-4 mr-2' />
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-blue-600 hover:bg-blue-700'>
              {isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Update Member
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
