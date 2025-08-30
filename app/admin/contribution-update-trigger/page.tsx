"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UpdateResult {
  success: boolean;
  message: string;
  updatedUsers?: number;
  totalUsers?: number;
  errors?: string[];
}

interface UserUpdate {
  name: string;
  pin: string;
  status: "processing" | "completed" | "error";
  previousTotal: number;
  newTotal: number;
  increment: number;
  error?: string;
}

interface UserData {
  id: string;
  name: string;
  pin: string;
  monthlyContribution: number;
  totalContribution: number;
  nextIncrement: number;
}

interface UserResult {
  userId: string;
  userName: string;
  userPin: string;
  previousTotal: number;
  newTotal: number;
  increment: number;
  success: boolean;
  error?: string;
}

export default function ContributionUpdateTrigger() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [userUpdates, setUserUpdates] = useState<UserUpdate[]>([]);
  const [currentProcessingUser, setCurrentProcessingUser] =
    useState<string>("");

  const router = useRouter();

  const handleUpdateContributions = async () => {
    setIsUpdating(true);
    setUpdateResult(null);
    setProgress(0);
    setUserUpdates([]);
    setCurrentProcessingUser("");

    try {
      // First, get all users to show them in the list
      const usersResponse = await fetch("/api/monthly-contribution", {
        method: "GET",
      });

      const usersData = await usersResponse.json();

      if (usersData.success && usersData.status?.users) {
        const initialUserUpdates: UserUpdate[] = usersData.status.users.map(
          (user: UserData) => ({
            name: user.name,
            pin: user.pin,
            status: "processing" as const,
            previousTotal: user.totalContribution,
            newTotal: user.totalContribution + user.monthlyContribution,
            increment: user.monthlyContribution,
          })
        );

        setUserUpdates(initialUserUpdates);

        // Simulate real-time updates by processing users one by one
        const totalUsers = initialUserUpdates.length;

        for (let i = 0; i < totalUsers; i++) {
          const user = initialUserUpdates[i];
          setCurrentProcessingUser(user.name);

          // Update progress
          const currentProgress = Math.round(((i + 1) / totalUsers) * 100);
          setProgress(currentProgress);

          // Simulate processing time
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Update the user status to completed
          setUserUpdates((prev) =>
            prev.map((u, index) =>
              index === i ? { ...u, status: "completed" as const } : u
            )
          );
        }
      }

      // Start the actual update process
      const response = await fetch("/api/monthly-contribution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update the user list with final results
        if (result.results) {
          const updatedUserList = result.results.map(
            (userResult: UserResult) => ({
              name: userResult.userName,
              pin: userResult.userPin,
              status: userResult.success
                ? ("completed" as const)
                : ("error" as const),
              previousTotal: userResult.previousTotal || 0,
              newTotal: userResult.newTotal || userResult.previousTotal || 0,
              increment: userResult.increment || 0,
              error: userResult.error,
            })
          );
          setUserUpdates(updatedUserList);
        }

        setProgress(100);
        setUpdateResult({
          success: true,
          message:
            result.message || "Contribution update completed successfully",
          updatedUsers: result.updatedUsers,
          totalUsers: result.totalUsers,
        });
        toast.success("Contribution update completed successfully!");
      } else {
        setProgress(100);
        setUpdateResult({
          success: false,
          message: result.message || "Failed to update contributions",
          errors: result.errors,
        });
        toast.error("Failed to update contributions");
      }
    } catch (error) {
      setProgress(100);
      setUpdateResult({
        success: false,
        message: "An error occurred while updating contributions",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
      toast.error("An error occurred while updating contributions");
    } finally {
      setIsUpdating(false);
      setCurrentProcessingUser("");
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Contribution Update Trigger
          </h1>
          <p className='text-muted-foreground'>
            Manually trigger monthly contribution updates for all users
          </p>
        </div>

        {/* Main Card */}
        <Card className='w-full'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Monthly Contribution Update
            </CardTitle>
            <CardDescription>
              This will increment each user&apos;s total contribution by their
              monthly contribution amount. This action affects all users in the
              system.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Progress Section */}
            {isUpdating && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    Updating contributions...
                  </span>
                  <Badge
                    variant='secondary'
                    className='flex items-center gap-1'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    {progress}%
                  </Badge>
                </div>
                <div className='w-full bg-secondary rounded-full h-2'>
                  <div
                    className='bg-primary h-2 rounded-full transition-all duration-300 ease-out'
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  {currentProcessingUser
                    ? `Processing: ${currentProcessingUser}`
                    : "Processing user data..."}
                </div>
              </div>
            )}

            {/* User Updates List */}
            {userUpdates.length > 0 && (
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold'>User Updates</h3>
                <div className='max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50'>
                  <div className='space-y-2'>
                    {userUpdates.map((user, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                          user.status === "completed"
                            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                            : user.status === "error"
                              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                              : currentProcessingUser === user.name
                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-md"
                                : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
                        }`}>
                        <div className='flex items-center gap-2 flex-1 min-w-0 text-sm'>
                          {/* <div className='flex-shrink-0'>
                            {user.status === "completed" ? (
                              <CheckCircle className='h-5 w-5 text-green-600' />
                            ) : user.status === "error" ? (
                              <AlertCircle className='h-5 w-5 text-red-600' />
                            ) : currentProcessingUser === user.name ? (
                              <Loader2 className='h-5 w-5 text-blue-600 animate-spin' />
                            ) : (
                              <Loader2 className='h-5 w-5 text-yellow-600 animate-spin' />
                            )}
                          </div> */}
                          <div className='min-w-0 flex-1'>
                            <p className='font-medium text-gray-900 dark:text-white truncate'>
                              {user.name}
                            </p>
                            {/* <p className='text-sm text-gray-600 dark:text-gray-400'>
                              PIN: {user.pin}
                            </p> */}

                            <div className='text-sm'>
                              <div className='flex items-center gap-2'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  ₦{user.previousTotal.toLocaleString()}
                                </span>
                                <span className='text-gray-400'>→</span>
                                <span className='font-medium text-gray-900 dark:text-white'>
                                  ₦{user.newTotal.toLocaleString()}
                                </span>
                              </div>
                              <p className='text-xs text-green-600 dark:text-green-400'>
                                +₦{user.increment.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                  <div className='text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
                    <p className='font-semibold text-blue-600 dark:text-blue-400'>
                      {
                        userUpdates.filter((u) => u.status === "processing")
                          .length
                      }
                    </p>
                    <p className='text-gray-600 dark:text-gray-400'>
                      Processing
                    </p>
                  </div>
                  <div className='text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg'>
                    <p className='font-semibold text-green-600 dark:text-green-400'>
                      {
                        userUpdates.filter((u) => u.status === "completed")
                          .length
                      }
                    </p>
                    <p className='text-gray-600 dark:text-gray-400'>
                      Completed
                    </p>
                  </div>
                  <div className='text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg'>
                    <p className='font-semibold text-red-600 dark:text-red-400'>
                      {userUpdates.filter((u) => u.status === "error").length}
                    </p>
                    <p className='text-gray-600 dark:text-gray-400'>Errors</p>
                  </div>
                  <div className='text-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg'>
                    <p className='font-semibold text-gray-600 dark:text-gray-400'>
                      {userUpdates.length}
                    </p>
                    <p className='text-gray-600 dark:text-gray-400'>Total</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Section */}
            {updateResult && (
              <Card
                className={`border-2 ${updateResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <CardContent>
                  <div className='flex items-start'>
                    <div className='space-y-1 flex-1'>
                      <h3
                        className={`font-semibold ${updateResult.success ? "text-green-800" : "text-red-800"}`}>
                        {updateResult.success
                          ? "Update Completed Successfully"
                          : "Update Failed"}
                      </h3>
                      <p
                        className={`text-sm ${updateResult.success ? "text-green-700" : "text-red-700"}`}>
                        {updateResult.message}
                      </p>

                      {updateResult.success &&
                        updateResult.updatedUsers !== undefined && (
                          <div className='flex items-center gap-2 text-sm text-green-700'>
                            <Users className='h-4 w-4' />
                            <span>
                              Updated {updateResult.updatedUsers} out of{" "}
                              {updateResult.totalUsers} users
                            </span>
                          </div>
                        )}

                      {updateResult.errors &&
                        updateResult.errors.length > 0 && (
                          <div className='mt-3'>
                            <h4 className='text-sm font-medium text-red-800 mb-2'>
                              Errors:
                            </h4>
                            <ul className='text-sm text-red-700 space-y-1'>
                              {updateResult.errors.map((error, index) => (
                                <li
                                  key={index}
                                  className='flex items-start gap-2'>
                                  <span className='text-red-500'>•</span>
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <div className='flex justify-center'>
              <Button
                onClick={handleUpdateContributions}
                disabled={isUpdating}
                size='lg'
                className='min-w-[200px]'>
                {isUpdating ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  <>
                    <TrendingUp className='mr-2 h-4 w-4' />
                    Update All Contributions
                  </>
                )}
              </Button>
            </div>
            <div className='flex justify-center'>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>

            {/* Warning */}
            {/* <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='h-5 w-5 text-yellow-600 mt-0.5' />
                <div className='text-sm text-yellow-800'>
                  <p className='font-medium mb-1'>Important:</p>
                  <ul className='space-y-1'>
                    <li>
                      • This action will permanently update all users&apos;
                      total contributions
                    </li>
                    <li>
                      • The update adds each user&apos;s monthly contribution to
                      their total
                    </li>
                    <li>• This action cannot be undone automatically</li>
                    <li>
                      • Only use this when you&apos;re sure it&apos;s the
                      correct time for monthly updates
                    </li>
                  </ul>
                </div>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
