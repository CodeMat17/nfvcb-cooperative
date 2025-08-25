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
import { Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

interface LoanApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanType: "quick" | "core";
  onSubmit: (amount: number) => void;
}

export function LoanApplicationDialog({
  open,
  onOpenChange,
  loanType,
  onSubmit,
}: LoanApplicationDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(numAmount);
      setAmount("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loanInfo = {
    quick: {
      title: "Quick Loan Application",
      description: "Apply for a quick loan with 6 months duration",
      icon: TrendingUp,
      duration: "6 months",
      maxAmount: "₦500,000",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    core: {
      title: "Core Loan Application",
      description: "Apply for a core loan with 2 years duration",
      icon: Users,
      duration: "2 years",
      maxAmount: "₦2,000,000",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  };

  const info = loanInfo[loanType];
  const IconComponent = info.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center space-x-3'>
            <div className={`p-2 rounded-lg ${info.bgColor}`}>
              <IconComponent className={`h-6 w-6 ${info.color}`} />
            </div>
            <div>
              <DialogTitle>{info.title}</DialogTitle>
              <DialogDescription>{info.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className={`p-4 rounded-lg ${info.bgColor}`}>
                <div className='flex items-center space-x-2'>
                  <Clock className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Duration
                  </span>
                </div>
                <p className='text-lg font-bold text-gray-900 dark:text-white mt-1'>
                  {info.duration}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${info.bgColor}`}>
                <div className='flex items-center space-x-2'>
                  <DollarSign className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Max Amount
                  </span>
                </div>
                <p className='text-lg font-bold text-gray-900 dark:text-white mt-1'>
                  {info.maxAmount}
                </p>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='amount'>Loan Amount (₦)</Label>
              <Input
                id='amount'
                type='number'
                placeholder='Enter loan amount'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min='1000'
                max={loanType === "quick" ? "500000" : "2000000"}
                step='1000'
                required
                className='text-lg'
              />
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Minimum: ₦1,000 | Maximum: {info.maxAmount}
              </p>
            </div>
          </div>

          <div className='flex justify-end space-x-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className={
                loanType === "quick"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }>
              {isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

