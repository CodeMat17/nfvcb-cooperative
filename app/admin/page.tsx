"use client";

import { CoreLoanPDF } from "@/components/core-loan-pdf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserEditDialog } from "@/components/user-edit-dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ActivityHistory, CoreLoan, QuickLoan, User } from "@/types";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Loader2,
  Search,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [quickLoanSearchTerm, setQuickLoanSearchTerm] = useState<string>("");
  const [coreLoanSearchTerm, setCoreLoanSearchTerm] = useState<string>("");
  const [clearedQuickLoanSearchTerm, setClearedQuickLoanSearchTerm] =
    useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("members");
  const [showUserEdit, setShowUserEdit] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewingLoan, setViewingLoan] = useState<{
    loan: CoreLoan;
    user: User;
  } | null>(null);

  // Queries
  const users = useQuery(api.users.getAllUsers);
  const quickLoans = useQuery(api.loans.getAllQuickLoans);
  const coreLoans = useQuery(api.loans.getAllCoreLoans);
  const processingQuickLoans = useQuery(api.loans.getQuickLoansByStatus, {
    status: "processing",
  });
  const approvedQuickLoans = useQuery(api.loans.getQuickLoansByStatus, {
    status: "approved",
  });
  const processingCoreLoans = useQuery(api.loans.getCoreLoansByStatus, {
    status: "processing",
  });
  const approvedCoreLoans = useQuery(api.loans.getCoreLoansByStatus, {
    status: "approved",
  });
  const clearedQuickLoans = useQuery(api.loans.getQuickLoansByStatus, {
    status: "cleared",
  });
  const activityHistory = useQuery(api.activity.getAllActivityHistory);

  // Mutations
  const approveQuickLoan = useMutation(api.loans.approveQuickLoan);
  const approveCoreLoan = useMutation(api.loans.approveCoreLoan);
  const rejectLoan = useMutation(api.loans.rejectLoan);
  const clearLoan = useMutation(api.loans.clearLoan);
  // const migrateLoans = useMutation(api.migrations.migrateLoansToQuickLoans);

  const filteredUsers =
    users?.filter(
      (user: User) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.ippis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.pin.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleApproveLoan = async (
    loanId: string,
    loanType: "quick" | "core"
  ) => {
    try {
      if (loanType === "quick") {
        await approveQuickLoan({ loanId: loanId as Id<"quickLoans"> });
        toast.success("Quick loan approved successfully!");
      } else {
        await approveCoreLoan({ loanId: loanId as Id<"coreLoans"> });
        toast.success("Core loan approved successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve loan");
    }
  };

  const handleRejectLoan = async (
    loanId: string,
    loanType: "quick" | "core"
  ) => {
    try {
      await rejectLoan({
        loanId:
          loanType === "quick"
            ? (loanId as Id<"quickLoans">)
            : (loanId as Id<"coreLoans">),
        loanType,
      });
      toast.success(
        `${loanType === "quick" ? "Quick" : "Core"} loan rejected successfully`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject loan");
    }
  };

  const handleClearLoan = async (
    loanId: string,
    loanType: "quick" | "core"
  ) => {
    try {
      await clearLoan({
        loanId:
          loanType === "quick"
            ? (loanId as Id<"quickLoans">)
            : (loanId as Id<"coreLoans">),
        loanType,
      });
      toast.success(
        `${loanType === "quick" ? "Quick" : "Core"} loan cleared successfully`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear loan");
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserEdit(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cleared":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Clock className='h-4 w-4' />;
      case "approved":
        return <CheckCircle className='h-4 w-4' />;
      case "rejected":
        return <XCircle className='h-4 w-4' />;
      case "cleared":
        return <CheckCircle className='h-4 w-4' />;
      default:
        return <AlertTriangle className='h-4 w-4' />;
    }
  };

  const getUserById = (userId: string): User | undefined => {
    return users?.find((user: User) => user._id === userId);
  };

  const getLoanUser = useCallback(
    (userId: string): User | undefined => {
      return users?.find((user: User) => user._id === userId);
    },
    [users]
  );

  const filteredApprovedQuickLoans = useMemo(() => {
    if (!approvedQuickLoans || !quickLoanSearchTerm.trim()) {
      return approvedQuickLoans || [];
    }

    const searchLower = quickLoanSearchTerm.toLowerCase().trim();
    return approvedQuickLoans.filter((loan: QuickLoan) => {
      const user = getLoanUser(loan.userId);
      return (
        user?.name.toLowerCase().includes(searchLower) ||
        loan.amount.toString().includes(searchLower) ||
        dayjs(loan.expiryDate)
          .format("MMM DD, YYYY")
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [approvedQuickLoans, quickLoanSearchTerm, getLoanUser]);

  const handleQuickLoanSearch = useCallback((value: string) => {
    setQuickLoanSearchTerm(value);
  }, []);

  const filteredProcessingCoreLoans = useMemo(() => {
    if (!processingCoreLoans || !coreLoanSearchTerm.trim()) {
      return processingCoreLoans || [];
    }

    const searchLower = coreLoanSearchTerm.toLowerCase().trim();
    return processingCoreLoans.filter((loan: CoreLoan) => {
      const user = getLoanUser(loan.userId);
      return (
        user?.name.toLowerCase().includes(searchLower) ||
        loan.amountRequested.toString().includes(searchLower) ||
        dayjs(loan.dateApplied)
          .format("MMM DD, YYYY")
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [processingCoreLoans, coreLoanSearchTerm, getLoanUser]);

  const handleCoreLoanSearch = useCallback((value: string) => {
    setCoreLoanSearchTerm(value);
  }, []);

  const filteredClearedQuickLoans = useMemo(() => {
    if (!clearedQuickLoans || !clearedQuickLoanSearchTerm.trim()) {
      return clearedQuickLoans || [];
    }

    const searchLower = clearedQuickLoanSearchTerm.toLowerCase().trim();
    return clearedQuickLoans.filter((loan: QuickLoan) => {
      const user = getLoanUser(loan.userId);
      return (
        user?.name.toLowerCase().includes(searchLower) ||
        loan.amount.toString().includes(searchLower) ||
        dayjs(loan.clearedDate || loan.dateApproved || loan.dateApplied)
          .format("MMM DD, YYYY")
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [clearedQuickLoans, clearedQuickLoanSearchTerm, getLoanUser]);

  const handleClearedQuickLoanSearch = useCallback((value: string) => {
    setClearedQuickLoanSearchTerm(value);
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12'>
      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4'>
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8'>
          <Card>
            <CardContent className='px-6 py-4'>
              <div className='flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-3'>
                <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
                  {users === undefined ? (
                    <Loader2 className='h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin' />
                  ) : (
                    <Users className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  )}
                </div>
                <div>
                  <p className='text-sm text-gray-600 text-center sm:text-left dark:text-gray-400'>
                    Total Members
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left'>
                    {users === undefined ? "..." : users?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='px-6 py-4'>
              <div className='flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-3'>
                <div className='p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg'>
                  {processingQuickLoans === undefined ? (
                    <Loader2 className='h-6 w-6 text-yellow-600 dark:text-yellow-400 animate-spin' />
                  ) : (
                    <Clock className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
                  )}
                </div>
                <div>
                  <p className='text-sm text-gray-600 text-center sm:text-left dark:text-gray-400'>
                    Pending Quick Loans
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left'>
                    {processingQuickLoans === undefined
                      ? "..."
                      : processingQuickLoans?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='px-6 py-4'>
              <div className='flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-3'>
                <div className='p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg'>
                  {processingCoreLoans === undefined ? (
                    <Loader2 className='h-6 w-6 text-purple-600 dark:text-purple-400 animate-spin' />
                  ) : (
                    <Clock className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                  )}
                </div>
                <div>
                  <p className='text-sm text-gray-600 text-center sm:text-left dark:text-gray-400'>
                    Pending Core Loans
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left'>
                    {processingCoreLoans === undefined
                      ? "..."
                      : processingCoreLoans?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='px-6 py-4'>
              <div className='flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-3'>
                <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
                  {approvedQuickLoans === undefined ||
                  approvedCoreLoans === undefined ? (
                    <Loader2 className='h-6 w-6 text-green-600 dark:text-green-400 animate-spin' />
                  ) : (
                    <CheckCircle className='h-6 w-6 text-green-600 dark:text-green-400' />
                  )}
                </div>
                <div>
                  <p className='text-sm text-gray-600 text-center sm:text-left dark:text-gray-400'>
                    Active Loans
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left'>
                    {approvedQuickLoans === undefined ||
                    approvedCoreLoans === undefined
                      ? "..."
                      : (approvedQuickLoans?.length || 0) +
                        (approvedCoreLoans?.length || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className='space-y-6'>
            <TabsList className='grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'>
              <TabsTrigger value='members'>Members</TabsTrigger>
              <TabsTrigger value='quick-loans'>Quick Loans</TabsTrigger>
              <TabsTrigger value='core-loans'>Core Loans</TabsTrigger>
              <TabsTrigger value='activity'>Activity</TabsTrigger>
              <TabsTrigger value='cleared-quick-loans'>
                Cleared Quick Loans
              </TabsTrigger>
            </TabsList>

            {/* Members Tab */}
            <TabsContent value='members' className='space-y-6'>
              <Card>
                <CardHeader>
                  <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                    <div>
                      <CardTitle>Cooperative Members</CardTitle>
                      <CardDescription>
                        Manage all cooperative members and their information
                      </CardDescription>
                    </div>
                    <div className='relative w-full sm:w-auto'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        placeholder='Search members...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-10 w-full sm:w-64'
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {filteredUsers.map((user: User) => (
                      <div
                        key={user._id}
                        className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg gap-3'>
                        <div className='flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto'>
                          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center shrink-0'>
                            <Users className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='font-medium text-gray-900 dark:text-white truncate'>
                              {user.name}
                            </p>
                            <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                              IPPIS: {user.ippis}
                            </p>
                            <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                              PIN: {user.pin}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto'>
                          <div className='text-left sm:text-right'>
                            <p className='text-xs sm:text-sm font-medium text-gray-900 dark:text-white'>
                              ₦{user.monthlyContribution.toLocaleString()}
                              /month
                            </p>
                            <p className='text-xs text-gray-600 dark:text-gray-400'>
                              Total: ₦{user.totalContribution.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEditUser(user)}>
                            <Edit className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && (
                      <p className='text-center text-gray-600 dark:text-gray-400 py-8'>
                        No members found.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quick Loans Tab */}
            <TabsContent value='quick-loans' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Loan Applications</CardTitle>
                  <CardDescription>
                    Review and manage quick loan applications (6 months
                    duration)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Search Filter for Approved Quick Loans */}
                    <div className='flex items-center space-x-2'>
                      <div className='relative flex-1 max-w-sm'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='Search approved loans...'
                          value={quickLoanSearchTerm}
                          onChange={(e) =>
                            handleQuickLoanSearch(e.target.value)
                          }
                          className='pl-10'
                        />
                      </div>
                    </div>

                    {processingQuickLoans?.map((loan: QuickLoan) => {
                      const user = getLoanUser(loan.userId);
                      return (
                        <div
                          key={loan._id}
                          className='p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
                          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                              <p className='font-medium text-gray-900 dark:text-white truncate'>
                                {user?.name}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Amount: ₦{loan.amount.toLocaleString()}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Applied:{" "}
                                {dayjs(loan.dateApplied).format("MMM DD, YYYY")}
                              </p>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                              <Button
                                size='sm'
                                onClick={() =>
                                  handleApproveLoan(loan._id, "quick")
                                }
                                className='bg-green-600 hover:bg-green-700'>
                                <Check className='h-4 w-4 mr-1' />
                                Approve
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  handleRejectLoan(loan._id, "quick")
                                }>
                                <Ban className='h-4 w-4 mr-1' />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredApprovedQuickLoans?.map((loan: QuickLoan) => {
                      const user = getLoanUser(loan.userId);
                      const isExpired = dayjs(loan.expiryDate).isBefore(
                        dayjs(),
                        "day"
                      );
                      return (
                        <div
                          key={loan._id}
                          className={`p-4 rounded-lg border ${
                            isExpired
                              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                              : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          }`}>
                          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                              <p className='font-medium text-gray-900 dark:text-white truncate'>
                                {user?.name}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Amount: ₦{loan.amount.toLocaleString()}
                              </p>
                              <p
                                className={`text-xs sm:text-sm ${
                                  isExpired
                                    ? "text-red-600 dark:text-red-400 font-medium"
                                    : "text-gray-600 dark:text-gray-400"
                                }`}>
                                Expires:{" "}
                                {dayjs(loan.expiryDate).format("MMM DD, YYYY")}
                                {isExpired && " (EXPIRED)"}
                              </p>
                            </div>
                            <div className='flex items-center flex-wrap gap-2'>
                              <Badge
                                className={
                                  isExpired
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                }>
                                {isExpired ? "Expired" : "Approved"}
                              </Badge>
                              <Button
                                size='sm'
                                onClick={() =>
                                  handleClearLoan(loan._id, "quick")
                                }
                                className={
                                  isExpired
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }>
                                <CheckCircle className='h-4 w-4 mr-1' />
                                Clear
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!processingQuickLoans ||
                      processingQuickLoans.length === 0) &&
                      (!filteredApprovedQuickLoans ||
                        filteredApprovedQuickLoans.length === 0) && (
                        <p className='text-center text-gray-600 dark:text-gray-400 py-8'>
                          {quickLoanSearchTerm
                            ? "No approved loans match your search."
                            : "No quick loan applications found."}
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Core Loans Tab */}
            <TabsContent value='core-loans' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Core Loan Applications</CardTitle>
                  <CardDescription>
                    Review and manage core loan applications (2 years duration)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Search Filter for Processing Core Loans */}
                    <div className='flex items-center space-x-2'>
                      <div className='relative flex-1 max-w-sm'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='Search processing core loans...'
                          value={coreLoanSearchTerm}
                          onChange={(e) => handleCoreLoanSearch(e.target.value)}
                          className='pl-10'
                        />
                      </div>
                    </div>

                    {filteredProcessingCoreLoans?.map((loan: CoreLoan) => {
                      const user = getLoanUser(loan.userId);
                      return (
                        <div
                          key={loan._id}
                          className='p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
                          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                              <p className='font-medium text-gray-900 dark:text-white truncate'>
                                {user?.name}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Amount: ₦{loan.amountRequested.toLocaleString()}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Applied:{" "}
                                {dayjs(loan.dateApplied).format("MMM DD, YYYY")}
                              </p>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                              <Button
                                size='sm'
                                onClick={() =>
                                  handleApproveLoan(loan._id, "core")
                                }
                                className='bg-green-600 hover:bg-green-700'>
                                <Check className='h-4 w-4 mr-1' />
                                Approve
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  handleRejectLoan(loan._id, "core")
                                }>
                                <Ban className='h-4 w-4 mr-1' />
                                Reject
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  setViewingLoan({ loan, user: user! })
                                }>
                                <FileText className='h-4 w-4 mr-1' />
                                Print
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {approvedCoreLoans?.map((loan: CoreLoan) => {
                      const user = getLoanUser(loan.userId);
                      return (
                        <div
                          key={loan._id}
                          className='p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800'>
                          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                              <p className='font-medium text-gray-900 dark:text-white truncate'>
                                {user?.name}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Amount: ₦{loan.amountRequested.toLocaleString()}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Expires:{" "}
                                {dayjs(loan.expiryDate).format("MMM DD, YYYY")}
                              </p>
                            </div>
                            <div className='flex items-center flex-wrap gap-2'>
                              <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'>
                                Approved
                              </Badge>
                              <Button
                                size='sm'
                                onClick={() =>
                                  handleClearLoan(loan._id, "core")
                                }
                                className='bg-blue-600 hover:bg-blue-700'>
                                <CheckCircle className='h-4 w-4 mr-1' />
                                Clear
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  setViewingLoan({ loan, user: user! })
                                }>
                                <FileText className='h-4 w-4 mr-1' />
                                Print
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!filteredProcessingCoreLoans ||
                      filteredProcessingCoreLoans.length === 0) &&
                      (!approvedCoreLoans ||
                        approvedCoreLoans.length === 0) && (
                        <p className='text-center text-gray-600 dark:text-gray-400 py-8'>
                          {coreLoanSearchTerm
                            ? "No processing core loans match your search."
                            : "No core loan applications found."}
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value='activity' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>System Activity</CardTitle>
                  <CardDescription>
                    Recent loan activities and system events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {quickLoans?.slice(0, 10).map((loan: QuickLoan) => {
                      const user = getLoanUser(loan.userId);
                      return (
                        <div
                          key={loan._id}
                          className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg gap-3'>
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                loan.status === "approved"
                                  ? "bg-green-100 dark:bg-green-900/20"
                                  : loan.status === "rejected"
                                    ? "bg-red-100 dark:bg-red-900/20"
                                    : loan.status === "processing"
                                      ? "bg-yellow-100 dark:bg-yellow-900/20"
                                      : "bg-blue-100 dark:bg-blue-900/20"
                              }`}>
                              <TrendingUp className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                            </div>
                            <div>
                              <p className='font-medium text-gray-900 dark:text-white'>
                                Quick Loan - {user?.name}
                              </p>
                              <p className='text-sm text-gray-600 dark:text-gray-400'>
                                Amount: ₦{loan.amount.toLocaleString()} |
                                Applied:{" "}
                                {dayjs(loan.dateApplied).format("MMM DD, YYYY")}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(loan.status)}>
                            {loan.status}
                          </Badge>
                        </div>
                      );
                    })}
                    {coreLoans?.slice(0, 10).map((loan: CoreLoan) => {
                      const user = getLoanUser(loan.userId);
                      return (
                        <div
                          key={loan._id}
                          className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg gap-3'>
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`p-2 rounded-lg ${
                                loan.status === "approved"
                                  ? "bg-green-100 dark:bg-green-900/20"
                                  : loan.status === "rejected"
                                    ? "bg-red-100 dark:bg-red-900/20"
                                    : loan.status === "processing"
                                      ? "bg-yellow-100 dark:bg-yellow-900/20"
                                      : "bg-blue-100 dark:bg-blue-900/20"
                              }`}>
                              <Users className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                            </div>
                            <div>
                              <p className='font-medium text-gray-900 dark:text-white'>
                                Core Loan - {user?.name}
                              </p>
                              <p className='text-sm text-gray-600 dark:text-gray-400'>
                                Amount: ₦{loan.amountRequested.toLocaleString()}{" "}
                                | Applied:{" "}
                                {dayjs(loan.dateApplied).format("MMM DD, YYYY")}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center flex-wrap gap-2'>
                            <Badge className={getStatusColor(loan.status)}>
                              {loan.status}
                            </Badge>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                setViewingLoan({ loan, user: user! })
                              }>
                              <FileText className='h-4 w-4 mr-1' />
                              Print
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {activityHistory
                      ?.slice(0, 10)
                      .map((activity: ActivityHistory) => {
                        const user = getUserById(activity.userId);
                        return (
                          <div
                            key={activity._id}
                            className='flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg'>
                            <div className='flex-shrink-0'>
                              <Badge
                                className={getStatusColor(activity.status)}>
                                {getStatusIcon(activity.status)}
                              </Badge>
                            </div>
                            <div className='flex-1'>
                              <p className='font-medium'>{activity.action}</p>
                              <p className='text-sm text-gray-500'>
                                {user?.name} •{" "}
                                {dayjs(activity.date).format(
                                  "MMM DD, YYYY HH:mm"
                                )}
                              </p>
                            </div>
                            <Badge variant='outline' className='capitalize'>
                              {activity.loanType} Loan
                            </Badge>
                          </div>
                        );
                      })}
                    {(!quickLoans || quickLoans.length === 0) &&
                      (!coreLoans || coreLoans.length === 0) &&
                      (!activityHistory || activityHistory.length === 0) && (
                        <p className='text-center text-gray-600 dark:text-gray-400 py-8'>
                          No activity found.
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cleared Quick Loans Tab */}
            <TabsContent value='cleared-quick-loans' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Cleared Quick Loans</CardTitle>
                  <CardDescription>
                    View all cleared quick loan applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Search Filter for Cleared Quick Loans */}
                    <div className='flex items-center space-x-2'>
                      <div className='relative flex-1 max-w-sm'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder='Search cleared quick loans...'
                          value={clearedQuickLoanSearchTerm}
                          onChange={(e) =>
                            handleClearedQuickLoanSearch(e.target.value)
                          }
                          className='pl-10'
                        />
                      </div>
                    </div>

                    {filteredClearedQuickLoans?.map((loan: QuickLoan) => {
                      const user = getLoanUser(loan.userId);
                      return (
                        <div
                          key={loan._id}
                          className='p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                              <p className='font-medium text-gray-900 dark:text-white truncate'>
                                {user?.name}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Amount: ₦{loan.amount.toLocaleString()}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Applied:{" "}
                                {dayjs(loan.dateApplied).format("MMM DD, YYYY")}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                                Cleared:{" "}
                                {dayjs(
                                  loan.clearedDate || loan.dateApproved
                                ).format("MMM DD, YYYY")}
                              </p>
                            </div>
                            <div className='flex items-center flex-wrap gap-2'>
                              <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>
                                Cleared
                              </Badge>
                              {loan.totalRepayment && (
                                <Badge variant='outline' className='text-xs'>
                                  Repaid: ₦
                                  {loan.totalRepayment.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {(!filteredClearedQuickLoans ||
                      filteredClearedQuickLoans.length === 0) && (
                      <p className='text-center text-gray-600 dark:text-gray-400 py-8'>
                        {clearedQuickLoanSearchTerm
                          ? "No cleared quick loans match your search."
                          : "No cleared quick loans found."}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Migration Section */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='mt-8'>
            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <AlertTriangle className='h-5 w-5 text-orange-600' />
                  <span>Database Migration</span>
                </CardTitle>
                <CardDescription>
                  Migrate data from old loans table to quickLoans table
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={async () => {
                    try {
                      const result = await migrateLoans();
                      toast.success(result.message);
                    } catch (error) {
                      console.log(error);
                      toast.error("Migration failed");
                    }
                  }}
                  variant='outline'
                  className='w-full'>
                  Migrate Loans to QuickLoans
                </Button>
              </CardContent>
            </Card>
          </motion.div> */}
        </motion.div>
      </main>

      {/* User Edit Dialog */}
      {selectedUser && (
        <UserEditDialog
          open={showUserEdit}
          onOpenChange={setShowUserEdit}
          user={selectedUser}
        />
      )}

      {/* Core Loan PDF Modal */}
      {viewingLoan && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-end mb-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setViewingLoan(null)}>
                ✕
              </Button>
            </div>
            <CoreLoanPDF loan={viewingLoan.loan} user={viewingLoan.user} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
