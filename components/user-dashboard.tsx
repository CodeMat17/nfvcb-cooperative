"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { User as UserType } from "@/types";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface UserDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [showQuickLoanForm, setShowQuickLoanForm] = useState(false);
  const [showCoreLoanForm, setShowCoreLoanForm] = useState(false);
  const [quickLoanAmount, setQuickLoanAmount] = useState<string>("");
  const [pinConfirmation, setPinConfirmation] = useState<string>("");
  const [quickLoanPage, setQuickLoanPage] = useState(1);
  const [coreLoanPage, setCoreLoanPage] = useState(1);
  const [coreLoanForm, setCoreLoanForm] = useState({
    mobileNumber: "",
    amountRequested: "",
    accountNumber: "",
    accountName: "",
    bank: "",
    guarantor1Name: "",
    guarantor1Phone: "",
    guarantor2Name: "",
    guarantor2Phone: "",
  });

  const userLoans = useQuery(api.loans.getUserLoans, {
    userId: user._id as Id<"users">,
  });
  const activityHistory = useQuery(api.activity.getUserActivityHistory, {
    userId: user._id as Id<"users">,
  });

  const applyQuickLoan = useMutation(api.loans.applyQuickLoan);
  const applyCoreLoan = useMutation(api.loans.applyCoreLoan);

  const quickLoanAmounts = [
    { value: "10000", label: "₦10,000" },
    { value: "20000", label: "₦20,000" },
    { value: "30000", label: "₦30,000" },
    { value: "40000", label: "₦40,000" },
    { value: "50000", label: "₦50,000" },
    { value: "60000", label: "₦60,000" },
    { value: "70000", label: "₦70,000" },
    { value: "80000", label: "₦80,000" },
    { value: "90000", label: "₦90,000" },
    { value: "100000", label: "₦100,000" },
    { value: "110000", label: "₦110,000" },
    { value: "120000", label: "₦120,000" },
    { value: "130000", label: "₦130,000" },
    { value: "140000", label: "₦140,000" },
    { value: "150000", label: "₦150,000" },
  ];

  const hasActiveQuickLoan = userLoans?.quickLoans?.some(
    (loan) => loan.status === "processing" || loan.status === "approved"
  );

  const currentQuickLoan = userLoans?.quickLoans?.find(
    (loan) => loan.status === "processing" || loan.status === "approved"
  );

  // Pagination logic
  const loansPerPage = 10;
  const quickLoansToShow = userLoans?.quickLoans?.slice(
    (quickLoanPage - 1) * loansPerPage,
    quickLoanPage * loansPerPage
  );
  const coreLoansToShow = userLoans?.coreLoans?.slice(
    (coreLoanPage - 1) * loansPerPage,
    coreLoanPage * loansPerPage
  );
  const totalQuickLoanPages = Math.ceil(
    (userLoans?.quickLoans?.length || 0) / loansPerPage
  );
  const totalCoreLoanPages = Math.ceil(
    (userLoans?.coreLoans?.length || 0) / loansPerPage
  );

  const hasActiveCoreLoan = userLoans?.coreLoans?.some(
    (loan) => loan.status === "processing" || loan.status === "approved"
  );

  const handleQuickLoanSubmit = async () => {
    if (!quickLoanAmount) {
      toast.error("Please select a loan amount");
      return;
    }

    if (pinConfirmation !== user.pin) {
      toast.error("PIN confirmation is incorrect");
      return;
    }

    try {
      await applyQuickLoan({
        userId: user._id as Id<"users">,
        amount: parseInt(quickLoanAmount),
      });

      toast.success("Quick loan application submitted successfully!");
      setShowQuickLoanForm(false);
      setQuickLoanAmount("");
      setPinConfirmation("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    }
  };

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const validateAmount = (amount: string): boolean => {
    return /^\d+$/.test(amount) && parseInt(amount) > 0;
  };

  const validateAccountNumber = (accountNumber: string): boolean => {
    return /^\d{10}$/.test(accountNumber);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 7;
  };

  const handleCoreLoanSubmit = async () => {
    const requiredFields = [
      "mobileNumber",
      "amountRequested",
      "accountNumber",
      "accountName",
      "bank",
      "guarantor1Name",
      "guarantor1Phone",
      "guarantor2Name",
      "guarantor2Phone",
    ];

    // Check if all required fields are filled
    for (const field of requiredFields) {
      if (!coreLoanForm[field as keyof typeof coreLoanForm]) {
        toast.error(
          `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return;
      }
    }

    // Validate mobile number
    if (!validatePhoneNumber(coreLoanForm.mobileNumber)) {
      toast.error(
        "Please enter a valid Nigerian mobile number (e.g., 08012345678 or +2348012345678)"
      );
      return;
    }

    // Validate amount
    if (!validateAmount(coreLoanForm.amountRequested)) {
      toast.error("Please enter a valid amount (numbers only)");
      return;
    }

    // Validate account number
    if (!validateAccountNumber(coreLoanForm.accountNumber)) {
      toast.error("Please enter a valid 10-digit account number");
      return;
    }

    // Validate guarantor names
    if (!validateName(coreLoanForm.guarantor1Name)) {
      toast.error("Guarantor 1 name must be at least 7 characters long");
      return;
    }

    if (!validateName(coreLoanForm.guarantor2Name)) {
      toast.error("Guarantor 2 name must be at least 7 characters long");
      return;
    }

    // Validate guarantor phone numbers
    if (!validatePhoneNumber(coreLoanForm.guarantor1Phone)) {
      toast.error("Please enter a valid phone number for Guarantor 1");
      return;
    }

    if (!validatePhoneNumber(coreLoanForm.guarantor2Phone)) {
      toast.error("Please enter a valid phone number for Guarantor 2");
      return;
    }

    try {
      await applyCoreLoan({
        userId: user._id as Id<"users">,
        loanDate: dayjs().format("YYYY-MM-DD"),
        mobileNumber: coreLoanForm.mobileNumber,
        amountRequested: parseInt(coreLoanForm.amountRequested),
        accountNumber: coreLoanForm.accountNumber,
        accountName: coreLoanForm.accountName,
        bank: coreLoanForm.bank,
        existingLoan: hasActiveCoreLoan ? "yes" : "no",
        guarantor1Name: coreLoanForm.guarantor1Name,
        guarantor1Phone: coreLoanForm.guarantor1Phone,
        guarantor2Name: coreLoanForm.guarantor2Name,
        guarantor2Phone: coreLoanForm.guarantor2Phone,
      });

      toast.success("Core loan application submitted successfully!");
      setShowCoreLoanForm(false);
      setCoreLoanForm({
        mobileNumber: "",
        amountRequested: "",
        accountNumber: "",
        accountName: "",
        bank: "",
        guarantor1Name: "",
        guarantor1Phone: "",
        guarantor2Name: "",
        guarantor2Phone: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "cleared":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 '>
      <div className='max-w-7xl mx-auto px-4 p-12'>
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='mb-8'>
          <div className='mb-4 flex justify-end gap-3 items-center'>
            <Button onClick={onLogout}>Logout</Button>

            {(user.pin === process.env.NEXT_PUBLIC_ADMIN_PIN_1 ||
              user.pin === process.env.NEXT_PUBLIC_ADMIN_PIN_2 ||
              user.pin === process.env.NEXT_PUBLIC_ADMIN_PIN_3) && (
              <Button>
                <Link href='/sign-in'>Admin Page</Link>
              </Button>
            )}
          </div>

          <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center'>
                {/* <User className='h-5 w-5' /> */}
                <div className='flex flex-col gap-1 '>
                  <span className='font-normal '>Welcome back! 👋</span>

                  <span className='uppercase text-lg'>{user.name}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='mt-0'>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4'>
                <div>
                  <Label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Date Joined
                  </Label>
                  <p className='font-semibold'>
                    {dayjs(user.dateJoined).format("MMM DD, YYYY")}
                  </p>
                </div>

                <div className=''>
                  <Label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Monthly Contribution
                  </Label>
                  <p className='font-semibold text-green-600 dark:text-green-400'>
                    ₦{user.monthlyContribution?.toLocaleString() || "0"}
                  </p>
                </div>

                <div className=''>
                  <Label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Total Contributions
                  </Label>
                  <p className='font-semibold text-blue-600 dark:text-blue-400'>
                    ₦{user.totalContribution?.toLocaleString() || "0"}
                  </p>
                  {user.lastContributionUpdate && (
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                      Last updated:{" "}
                      {dayjs(user.lastContributionUpdate).format("MMM D, YYYY")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue='overview' className='space-y-4 sm:space-y-6'>
          <TabsList className='grid w-full grid-cols-3 gap-2 sm:gap-8'>
            <TabsTrigger
              value='overview'
              className='border border-gray-200 dark:border-gray-700'>
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='loans'
              className='border border-gray-200 dark:border-gray-700'>
              <span className='hidden sm:block'>Loan</span> Applications
            </TabsTrigger>
            <TabsTrigger
              value='history'
              className='border border-gray-200 dark:border-gray-700'>
              <span className='hidden sm:block'>Activity</span> History
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='overview'
            className='grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 lg:gap-12'>
            {/* Quick Loan Section */}
            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <TrendingUp className='h-5 w-5 text-blue-600' />
                  <span>Quick Loan</span>
                </CardTitle>
                <CardDescription>
                  6 months duration • 5% interest rate • Fast processing
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {hasActiveQuickLoan ? (
                  currentQuickLoan?.status === "processing" ? (
                    <Alert>
                      <Clock className='h-4 w-4' />
                      <AlertDescription>
                        You have an active quick loan application. Please wait
                        for approval.
                      </AlertDescription>
                    </Alert>
                  ) : currentQuickLoan?.status === "approved" ? (
                    <div className='space-y-4'>
                      {(() => {
                        const isExpired = dayjs(
                          currentQuickLoan.expiryDate
                        ).isBefore(dayjs(), "day");
                        return (
                          <>
                            <Alert
                              className={
                                isExpired
                                  ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                                  : ""
                              }>
                              <CheckCircle
                                className={`h-4 w-4 ${isExpired ? "text-red-600 dark:text-red-400" : ""}`}
                              />
                              <AlertDescription
                                className={
                                  isExpired
                                    ? "text-red-800 dark:text-red-200"
                                    : ""
                                }>
                                {isExpired
                                  ? "Your quick loan has expired and requires immediate attention!"
                                  : currentQuickLoan?.disbursed
                                    ? "Your quick loan application has been approved and disbursed."
                                    : "Your quick loan application has been approved, awaiting disbursement."}
                              </AlertDescription>
                            </Alert>
                            <div
                              className={`${
                                isExpired
                                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                                  : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                              } border rounded-lg p-4 space-y-3`}>
                              <div className='flex justify-between items-center'>
                                <span
                                  className={`font-medium ${
                                    isExpired
                                      ? "text-red-800 dark:text-red-200"
                                      : "text-green-800 dark:text-green-200"
                                  }`}>
                                  Loan Amount:
                                </span>
                                <span
                                  className={`font-bold ${
                                    isExpired
                                      ? "text-red-800 dark:text-red-200"
                                      : "text-green-800 dark:text-green-200"
                                  }`}>
                                  ₦
                                  {currentQuickLoan.amount?.toLocaleString() ||
                                    "N/A"}
                                </span>
                              </div>
                              <div className='flex justify-between items-center'>
                                <span
                                  className={`font-medium ${
                                    isExpired
                                      ? "text-red-800 dark:text-red-200"
                                      : "text-green-800 dark:text-green-200"
                                  }`}>
                                  Total Repayment Amount:
                                </span>
                                <span
                                  className={`font-bold ${
                                    isExpired
                                      ? "text-red-800 dark:text-red-200"
                                      : "text-green-800 dark:text-green-200"
                                  }`}>
                                  ₦
                                  {currentQuickLoan.totalRepayment?.toLocaleString() ||
                                    "N/A"}
                                </span>
                              </div>
                              <div
                                className={`text-sm ${
                                  isExpired
                                    ? "text-red-700 dark:text-red-300"
                                    : "text-green-700 dark:text-green-300"
                                }`}>
                                <p>
                                  <strong>Interest Rate:</strong> 5%
                                </p>
                                <p className={isExpired ? "font-medium" : ""}>
                                  <strong>Expiry Date:</strong>{" "}
                                  {dayjs(currentQuickLoan.expiryDate).format(
                                    "MMM DD, YYYY"
                                  )}
                                  {isExpired && " (EXPIRED)"}
                                </p>
                              </div>
                              <div className='bg-white dark:bg-gray-800 rounded p-3 border'>
                                <p className='font-medium text-sm mb-2'>
                                  Bank Details for Repayment:
                                </p>
                                <p className='text-sm text-gray-600 dark:text-gray-400'>
                                  <strong>Bank:</strong> Zenith Bank
                                  <br />
                                  <strong>Account Number:</strong> 1229203111
                                  <br />
                                  <strong>Account Name:</strong> NFVCB STAFF CO
                                  SOC LTD
                                  <br />
                                  <strong>Narration:</strong> Quick Loan
                                  Repayment - {user.name}
                                </p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <Alert>
                      <AlertTriangle className='h-4 w-4' />
                      <AlertDescription>
                        You have an active quick loan application. Please wait
                        for approval or clear existing loan.
                      </AlertDescription>
                    </Alert>
                  )
                ) : (
                  <Button
                    onClick={() => setShowQuickLoanForm(true)}
                    className='w-full'>
                    Apply for Quick Loan
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Core Loan Section */}
            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Building2 className='h-5 w-5 text-purple-600' />
                  <span>Core Loan</span>
                </CardTitle>
                <CardDescription>
                  2 years duration • Comprehensive application process
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const processingCoreLoan = userLoans?.coreLoans?.find(
                    (loan) => loan.status === "processing"
                  );
                  const activeCoreLoan = userLoans?.coreLoans?.find(
                    (loan) => loan.status === "approved"
                  );

                  if (processingCoreLoan) {
                    return (
                      <Alert>
                        <Clock className='h-4 w-4' />
                        <AlertDescription>
                          Your core loan application has been received and is
                          currently being processed. Please wait for approval
                          notification.
                        </AlertDescription>
                      </Alert>
                    );
                  }

                  if (activeCoreLoan) {
                    return (
                      <div className='space-y-3'>
                        <Alert>
                          <CheckCircle className='h-4 w-4 text-green-600' />
                          <AlertDescription>
                            You have an active core loan. You can apply for
                            another loan.
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={() => setShowCoreLoanForm(true)}
                          // variant='outline'
                          className='w-full'>
                          Apply for Another Core Loan
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <Button
                      onClick={() => setShowCoreLoanForm(true)}
                      // variant='outline'
                      className='w-full'>
                      Apply for Core Loan
                    </Button>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='loans' className='space-y-4 sm:space-y-6'>
            {/* Repayment Bank Details */}
            <div className='flex flex-col lg:flex-row gap-4'>
              <Alert className='flex-1'>
                <CreditCard className='h-4 w-4' />
                <AlertDescription>
                  <strong>Quick Loan Repayment Details:</strong>
                  <br />
                  Account: 1229203111
                  <br />
                  Bank: Zenith Bank
                  <br />
                  Account Name: NFVCB STAFF CO SOC LTD
                </AlertDescription>
              </Alert>
              <Alert className='flex-1'>
                <CreditCard className='h-4 w-4' />
                <AlertDescription>
                  <strong>Core Loan Repayment Details:</strong>
                  <br />
                  Account: 1229203111
                  <br />
                  Bank: Zenith Bank
                  <br />
                  Account Name: NFVCB STAFF CO SOC LTD
                </AlertDescription>
              </Alert>
            </div>

            {/* Active Loans */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              {/* Quick Loans */}
              <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
                <CardHeader>
                  <CardTitle>Quick Loans</CardTitle>
                </CardHeader>
                <CardContent>
                  {userLoans?.quickLoans?.length === 0 ? (
                    <p className='text-gray-500 dark:text-gray-400'>
                      You do not have an active quick loan.
                    </p>
                  ) : (
                    <div className='space-y-4'>
                      {quickLoansToShow?.map((loan) => (
                        <div
                          key={loan._id}
                          className='border rounded-lg p-4 space-y-2'>
                          <div className='flex flex-col sm:flex-row justify-between items-start gap-3'>
                            <div className='min-w-0 flex-1'>
                              <p className='font-semibold'>
                                ₦{loan.amount.toLocaleString()}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-500'>
                                Applied:{" "}
                                {dayjs(loan.dateApplied).format("MMM DD, YYYY")}
                              </p>
                              {loan.dateApproved && (
                                <p className='text-xs sm:text-sm text-gray-500'>
                                  Approved:{" "}
                                  {dayjs(loan.dateApproved).format(
                                    "MMM DD, YYYY"
                                  )}
                                </p>
                              )}
                              {loan.expiryDate && (
                                <p className='text-xs sm:text-sm text-gray-500'>
                                  Expires:{" "}
                                  {dayjs(loan.expiryDate).format(
                                    "MMM DD, YYYY"
                                  )}
                                </p>
                              )}
                              {loan.totalRepayment && (
                                <p className='text-xs sm:text-sm text-green-600 font-medium'>
                                  Total Repayment: ₦
                                  {loan.totalRepayment.toLocaleString()}
                                </p>
                              )}
                            </div>
                            <Badge className={getStatusColor(loan.status)}>
                              {getStatusIcon(loan.status)}
                              <span className='ml-1 capitalize'>
                                {loan.status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      ))}

                      {/* Quick Loans Pagination */}
                      {totalQuickLoanPages > 1 && (
                        <div className='flex justify-center items-center gap-2 mt-4 pt-4 border-t'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              setQuickLoanPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={quickLoanPage === 1}>
                            Previous
                          </Button>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Page {quickLoanPage} of {totalQuickLoanPages}
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              setQuickLoanPage((prev) =>
                                Math.min(totalQuickLoanPages, prev + 1)
                              )
                            }
                            disabled={quickLoanPage === totalQuickLoanPages}>
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Core Loans */}
              <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
                <CardHeader>
                  <CardTitle>Core Loans</CardTitle>
                </CardHeader>
                <CardContent>
                  {userLoans?.coreLoans?.length === 0 ? (
                    <p className='text-gray-500 dark:text-gray-400'>
                      No core loans found
                    </p>
                  ) : (
                    <div className='space-y-4'>
                      {coreLoansToShow?.map((loan) => (
                        <div
                          key={loan._id}
                          className='border rounded-lg p-4 space-y-2'>
                          <div className='flex flex-col sm:flex-row justify-between items-start gap-3'>
                            <div className='min-w-0 flex-1'>
                              <p className='font-semibold'>
                                ₦{loan.amountRequested.toLocaleString()}
                              </p>
                              <p className='text-xs sm:text-sm text-gray-500'>
                                Applied:{" "}
                                {dayjs(loan.dateApplied).format("MMM DD, YYYY")}
                              </p>
                              {loan.dateApproved && (
                                <p className='text-xs sm:text-sm text-gray-500'>
                                  Approved:{" "}
                                  {dayjs(loan.dateApproved).format(
                                    "MMM DD, YYYY"
                                  )}
                                </p>
                              )}
                              {loan.expiryDate && (
                                <p className='text-xs sm:text-sm text-gray-500'>
                                  Expires:{" "}
                                  {dayjs(loan.expiryDate).format(
                                    "MMM DD, YYYY"
                                  )}
                                </p>
                              )}
                            </div>
                            <Badge className={getStatusColor(loan.status)}>
                              {getStatusIcon(loan.status)}
                              <span className='ml-1 capitalize'>
                                {loan.status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      ))}

                      {/* Core Loans Pagination */}
                      {totalCoreLoanPages > 1 && (
                        <div className='flex justify-center items-center gap-2 mt-4 pt-4 border-t'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              setCoreLoanPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={coreLoanPage === 1}>
                            Previous
                          </Button>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Page {coreLoanPage} of {totalCoreLoanPages}
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              setCoreLoanPage((prev) =>
                                Math.min(totalCoreLoanPages, prev + 1)
                              )
                            }
                            disabled={coreLoanPage === totalCoreLoanPages}>
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='history' className='space-y-4 sm:space-y-6'>
            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                {activityHistory?.length === 0 ? (
                  <p className='text-gray-500 dark:text-gray-400'>
                    No activity history found
                  </p>
                ) : (
                  <div className='space-y-4'>
                    {activityHistory?.map((activity) => (
                      <div
                        key={activity._id}
                        className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg'>
                        <div className='flex items-center space-x-3 w-full sm:w-auto'>
                          <div className='flex-shrink-0'>
                            <Badge className={getStatusColor(activity.status)}>
                              {getStatusIcon(activity.status)}
                            </Badge>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium truncate'>
                              {activity.action}
                            </p>
                            <p className='text-xs sm:text-sm text-gray-500'>
                              {dayjs(activity.date).format(
                                "MMM DD, YYYY HH:mm"
                              )}
                            </p>
                            {activity.loanAmount ? (
                              <p className='text-xs sm:text-sm font-medium text-green-600 dark:text-green-400'>
                                ₦{activity.loanAmount.toLocaleString()}
                              </p>
                            ) : (
                              <p className='text-xs sm:text-sm text-gray-400'>
                                Amount not available
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant='outline'
                          className='capitalize shrink-0'>
                          {activity.loanType} Loan
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Loan Application Modal */}
        {showQuickLoanForm && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto mx-4'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold'>Quick Loan Application</h2>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowQuickLoanForm(false)}>
                  ✕
                </Button>
              </div>

              <div className='space-y-4'>
                <Alert>
                  <FileText className='h-4 w-4' />
                  <AlertDescription>
                    <strong>Terms & Conditions:</strong>
                    <br />
                    • 5% interest rate on the principal amount
                    <br />
                    • Repayment period: 6 months
                    <br />• Defaulting will result in blacklisting from future
                    loans
                  </AlertDescription>
                </Alert>

                <div className='space-y-2'>
                  <Label>Select Loan Amount</Label>
                  <Select
                    value={quickLoanAmount}
                    onValueChange={setQuickLoanAmount}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Choose amount' />
                    </SelectTrigger>
                    <SelectContent>
                      {quickLoanAmounts.map((amount) => (
                        <SelectItem key={amount.value} value={amount.value}>
                          {amount.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label>Confirm PIN</Label>
                  <Input
                    type='password'
                    placeholder='Enter your 6-digit PIN'
                    value={pinConfirmation}
                    onChange={(e) => setPinConfirmation(e.target.value)}
                    maxLength={6}
                  />
                </div>

                <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2'>
                  <Button
                    onClick={handleQuickLoanSubmit}
                    className='flex-1'
                    disabled={!quickLoanAmount || pinConfirmation.length !== 6}>
                    Submit Application
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setShowQuickLoanForm(false)}
                    className='flex-1'>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Core Loan Application Modal */}
        {showCoreLoanForm && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold'>Core Loan Application</h2>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowCoreLoanForm(false)}>
                  ✕
                </Button>
              </div>

              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Name</Label>
                    <Input value={user.name} disabled />
                  </div>
                  <div className='space-y-2'>
                    <Label>IPPIS</Label>
                    <Input value={user.ippis} disabled />
                  </div>
                  <div className='space-y-2'>
                    <Label>Loan Date</Label>
                    <Input value={dayjs().format("YYYY-MM-DD")} disabled />
                  </div>
                  <div className='space-y-2'>
                    <Label>Mobile Number *</Label>
                    <Input
                      type='tel'
                      placeholder='Enter mobile number (e.g., 08012345678)'
                      value={coreLoanForm.mobileNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9+]/g, "");
                        setCoreLoanForm({
                          ...coreLoanForm,
                          mobileNumber: value,
                        });
                      }}
                      minLength={11}
                      maxLength={14}
                      pattern='^(\+234|0)[789][01]\d{8}$'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Amount Requested *</Label>
                    <Input
                      type='number'
                      placeholder='Enter amount'
                      value={coreLoanForm.amountRequested}
                      onChange={(e) =>
                        setCoreLoanForm({
                          ...coreLoanForm,
                          amountRequested: e.target.value,
                        })
                      }
                      min='1'
                      step='1'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Account Number *</Label>
                    <Input
                      placeholder='Enter 10-digit account number'
                      value={coreLoanForm.accountNumber}
                      onChange={(e) =>
                        setCoreLoanForm({
                          ...coreLoanForm,
                          accountNumber: e.target.value,
                        })
                      }
                      minLength={10}
                      maxLength={10}
                      pattern='^\d{10}$'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Account Name *</Label>
                    <Input
                      placeholder='Enter account name'
                      value={coreLoanForm.accountName}
                      onChange={(e) =>
                        setCoreLoanForm({
                          ...coreLoanForm,
                          accountName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Bank *</Label>
                    <Input
                      placeholder='Enter bank name'
                      value={coreLoanForm.bank}
                      onChange={(e) =>
                        setCoreLoanForm({
                          ...coreLoanForm,
                          bank: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Existing Loan</Label>
                    <Input value={hasActiveCoreLoan ? "Yes" : "No"} disabled />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className='font-semibold mb-4'>Guarantors</h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                    <div className='space-y-2'>
                      <Label>Guarantor 1 Name *</Label>
                      <Input
                        placeholder='Enter guarantor 1 name (min 7 characters)'
                        value={coreLoanForm.guarantor1Name}
                        onChange={(e) =>
                          setCoreLoanForm({
                            ...coreLoanForm,
                            guarantor1Name: e.target.value,
                          })
                        }
                        minLength={7}
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Guarantor 1 Phone *</Label>
                      <Input
                        type='tel'
                        placeholder='Enter guarantor 1 phone (e.g., 08012345678)'
                        value={coreLoanForm.guarantor1Phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9+]/g, "");
                          setCoreLoanForm({
                            ...coreLoanForm,
                            guarantor1Phone: value,
                          });
                        }}
                        minLength={11}
                        maxLength={14}
                        pattern='^(\+234|0)[789][01]\d{8}$'
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Guarantor 2 Name *</Label>
                      <Input
                        placeholder='Enter guarantor 2 name (min 7 characters)'
                        value={coreLoanForm.guarantor2Name}
                        onChange={(e) =>
                          setCoreLoanForm({
                            ...coreLoanForm,
                            guarantor2Name: e.target.value,
                          })
                        }
                        minLength={7}
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Guarantor 2 Phone *</Label>
                      <Input
                        type='tel'
                        placeholder='Enter guarantor 2 phone (e.g., 08012345678)'
                        value={coreLoanForm.guarantor2Phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9+]/g, "");
                          setCoreLoanForm({
                            ...coreLoanForm,
                            guarantor2Phone: value,
                          });
                        }}
                        minLength={11}
                        maxLength={14}
                        pattern='^(\+234|0)[789][01]\d{8}$'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2'>
                  <Button onClick={handleCoreLoanSubmit} className='flex-1'>
                    Submit Application
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setShowCoreLoanForm(false)}
                    className='flex-1'>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
