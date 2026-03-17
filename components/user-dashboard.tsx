"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { User as UserType } from "@/types";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface UserDashboardProps {
  user: UserType;
  onLogout: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20, stiffness: 280 } },
};

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
      "mobileNumber", "amountRequested", "accountNumber", "accountName",
      "bank", "guarantor1Name", "guarantor1Phone", "guarantor2Name", "guarantor2Phone",
    ];
    for (const field of requiredFields) {
      if (!coreLoanForm[field as keyof typeof coreLoanForm]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`);
        return;
      }
    }
    if (!validatePhoneNumber(coreLoanForm.mobileNumber)) {
      toast.error("Please enter a valid Nigerian mobile number (e.g., 08012345678 or +2348012345678)");
      return;
    }
    if (!validateAmount(coreLoanForm.amountRequested)) {
      toast.error("Please enter a valid amount (numbers only)");
      return;
    }
    if (!validateAccountNumber(coreLoanForm.accountNumber)) {
      toast.error("Please enter a valid 10-digit account number");
      return;
    }
    if (!validateName(coreLoanForm.guarantor1Name)) {
      toast.error("Guarantor 1 name must be at least 7 characters long");
      return;
    }
    if (!validateName(coreLoanForm.guarantor2Name)) {
      toast.error("Guarantor 2 name must be at least 7 characters long");
      return;
    }
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
        mobileNumber: "", amountRequested: "", accountNumber: "",
        accountName: "", bank: "", guarantor1Name: "", guarantor1Phone: "",
        guarantor2Name: "", guarantor2Phone: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "processing":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50",
          dot: "bg-amber-500",
          icon: <Clock className='h-3.5 w-3.5' />,
          border: "border-l-amber-500",
        };
      case "approved":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50",
          dot: "bg-emerald-500",
          icon: <CheckCircle className='h-3.5 w-3.5' />,
          border: "border-l-emerald-500",
        };
      case "rejected":
        return {
          color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50",
          dot: "bg-rose-500",
          icon: <XCircle className='h-3.5 w-3.5' />,
          border: "border-l-rose-500",
        };
      case "cleared":
        return {
          color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/50",
          dot: "bg-indigo-500",
          icon: <CheckCircle className='h-3.5 w-3.5' />,
          border: "border-l-indigo-500",
        };
      default:
        return {
          color: "bg-muted text-muted-foreground border-border",
          dot: "bg-muted-foreground",
          icon: <AlertTriangle className='h-3.5 w-3.5' />,
          border: "border-l-muted-foreground",
        };
    }
  };

  const isAdmin =
    user.pin === process.env.NEXT_PUBLIC_ADMIN_PIN_1 ||
    user.pin === process.env.NEXT_PUBLIC_ADMIN_PIN_2 ||
    user.pin === process.env.NEXT_PUBLIC_ADMIN_PIN_3 ||
    user.pin === process.env.NEXT_PUBLIC_ADMIN_PIN_4;

  const userInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className='min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/20 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6'>

        {/* ── Hero Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 200 }}>
          <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20'>
            {/* Decorative circles */}
            <div className='absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/8 pointer-events-none' />
            <div className='absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none' />
            <div className='absolute top-4 right-24 w-20 h-20 rounded-full bg-white/5 pointer-events-none' />

            <div className='relative flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              {/* Left: Avatar + Name */}
              <div className='flex items-center gap-4'>
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 14, stiffness: 260, delay: 0.1 }}
                  className='w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-xl font-bold shadow-lg shrink-0'>
                  {userInitials}
                </motion.div>
                <div>
                  <p className='text-white/70 text-sm font-medium'>Welcome back</p>
                  <h1 className='text-lg sm:text-xl font-bold uppercase tracking-wide leading-tight'>
                    {user.name}
                  </h1>
                </div>
              </div>

              {/* Right: Actions */}
              <div className='flex items-center gap-2 shrink-0'>
                {isAdmin && (
                  <Link href='/sign-in'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='text-white/90 hover:text-white hover:bg-white/15 border border-white/25 gap-1.5 text-xs'>
                      <ExternalLink className='w-3.5 h-3.5' />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  size='sm'
                  onClick={onLogout}
                  className='bg-white/15 hover:bg-white/25 text-white border border-white/25 gap-1.5 text-xs backdrop-blur-sm'>
                  <LogOut className='w-3.5 h-3.5' />
                  Logout
                </Button>
              </div>
            </div>

            {/* Stats row */}
            <div className='relative mt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-white/20 pt-5'>
              <div className='text-center sm:text-left'>
                <div className='flex items-center justify-center sm:justify-start gap-1.5 text-white/60 text-xs mb-1'>
                  <Calendar className='w-3 h-3' />
                  <span>Date Joined</span>
                </div>
                <p className='font-semibold text-sm sm:text-base'>
                  {dayjs(user.dateJoined).format("MMM YYYY")}
                </p>
              </div>
              <div className='text-center sm:text-left'>
                <div className='flex items-center justify-center sm:justify-start gap-1.5 text-white/60 text-xs mb-1'>
                  <TrendingUp className='w-3 h-3' />
                  <span>Monthly</span>
                </div>
                <p className='font-semibold text-sm sm:text-base'>
                  ₦{user.monthlyContribution?.toLocaleString() || "0"}
                </p>
              </div>
              <div className='text-center sm:text-left'>
                <div className='flex items-center justify-center sm:justify-start gap-1.5 text-white/60 text-xs mb-1'>
                  <Wallet className='w-3 h-3' />
                  <span>Total Saved</span>
                </div>
                <p className='font-semibold text-sm sm:text-base'>
                  ₦{user.totalContribution?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <Tabs defaultValue='overview' className='space-y-5'>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}>
            <TabsList className='w-full grid grid-cols-3 h-auto p-1 gap-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm'>
              {[
                { value: "overview", label: "Overview", short: "Overview", icon: LayoutDashboard },
                { value: "loans", label: "Applications", short: "Loans", icon: FileText },
                { value: "history", label: "History", short: "History", icon: History },
              ].map(({ value, label, short, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className='flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all duration-200'>
                  <Icon className='w-3.5 h-3.5' />
                  <span className='hidden sm:inline'>{label}</span>
                  <span className='sm:hidden'>{short}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {/* ── Overview Tab ── */}
          <TabsContent value='overview' className='mt-0'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>

              {/* Quick Loan Card */}
              <motion.div variants={itemVariants}>
                <div className='h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm overflow-hidden'>
                  {/* Card accent top */}
                  <div className='h-1 bg-gradient-to-r from-indigo-500 to-blue-500' />
                  <div className='p-5 sm:p-6'>
                    <div className='flex items-start gap-3 mb-4'>
                      <div className='w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shrink-0'>
                        <TrendingUp className='w-5 h-5 text-indigo-600 dark:text-indigo-400' />
                      </div>
                      <div>
                        <h3 className='font-bold text-foreground'>Quick Loan</h3>
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          6 months • 5% interest • Fast approval
                        </p>
                      </div>
                    </div>

                    {hasActiveQuickLoan ? (
                      currentQuickLoan?.status === "processing" ? (
                        <StatusBanner
                          type='warning'
                          icon={<Clock className='w-4 h-4' />}
                          message='Your application is being reviewed. You will be notified upon approval.'
                        />
                      ) : currentQuickLoan?.status === "approved" ? (
                        <ApprovedLoanCard loan={currentQuickLoan} userName={user.name} />
                      ) : (
                        <StatusBanner
                          type='warning'
                          icon={<AlertTriangle className='w-4 h-4' />}
                          message='You have an active application. Please wait or clear your existing loan.'
                        />
                      )
                    ) : (
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          onClick={() => setShowQuickLoanForm(true)}
                          className='w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white border-0 shadow-md shadow-indigo-500/20 gap-2'>
                          Apply for Quick Loan
                          <ArrowRight className='w-4 h-4' />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Core Loan Card */}
              <motion.div variants={itemVariants}>
                <div className='h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm overflow-hidden'>
                  <div className='h-1 bg-gradient-to-r from-violet-500 to-purple-500' />
                  <div className='p-5 sm:p-6'>
                    <div className='flex items-start gap-3 mb-4'>
                      <div className='w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50 flex items-center justify-center shrink-0'>
                        <Building2 className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                      </div>
                      <div>
                        <h3 className='font-bold text-foreground'>Core Loan</h3>
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          2 years duration • Comprehensive application
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const processingCoreLoan = userLoans?.coreLoans?.find(
                        (loan) => loan.status === "processing"
                      );
                      const activeCoreLoan = userLoans?.coreLoans?.find(
                        (loan) => loan.status === "approved"
                      );

                      if (processingCoreLoan) {
                        return (
                          <StatusBanner
                            type='warning'
                            icon={<Clock className='w-4 h-4' />}
                            message='Your core loan application is being processed. Please wait for approval.'
                          />
                        );
                      }
                      if (activeCoreLoan) {
                        return (
                          <div className='space-y-3'>
                            <StatusBanner
                              type='success'
                              icon={<CheckCircle className='w-4 h-4' />}
                              message='You have an active core loan. You may apply for another.'
                            />
                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <Button
                                onClick={() => setShowCoreLoanForm(true)}
                                className='w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-md shadow-violet-500/20 gap-2'>
                                Apply for Another Loan
                                <ArrowRight className='w-4 h-4' />
                              </Button>
                            </motion.div>
                          </div>
                        );
                      }
                      return (
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            onClick={() => setShowCoreLoanForm(true)}
                            className='w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-md shadow-violet-500/20 gap-2'>
                            Apply for Core Loan
                            <ArrowRight className='w-4 h-4' />
                          </Button>
                        </motion.div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ── Loans Tab ── */}
          <TabsContent value='loans' className='mt-0'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-5'>

              {/* Repayment Info */}
              <motion.div variants={itemVariants}>
                <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm p-5'>
                  <div className='flex items-center gap-2 mb-3'>
                    <CreditCard className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
                    <h3 className='font-semibold text-sm'>Repayment Bank Details</h3>
                  </div>
                  <div className='grid sm:grid-cols-2 gap-3'>
                    {["Quick Loan", "Core Loan"].map((type) => (
                      <div
                        key={type}
                        className='bg-muted/50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-border/40'>
                        <p className='text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2'>
                          {type} Repayment
                        </p>
                        <div className='space-y-0.5 text-xs text-muted-foreground'>
                          <p><span className='font-medium text-foreground'>Bank:</span> Zenith Bank</p>
                          <p><span className='font-medium text-foreground'>Account:</span> 1229203111</p>
                          <p><span className='font-medium text-foreground'>Name:</span> NFVCB STAFF CO SOC LTD</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Loan Lists */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5'>
                {/* Quick Loans */}
                <motion.div variants={itemVariants}>
                  <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm overflow-hidden'>
                    <div className='h-1 bg-gradient-to-r from-indigo-500 to-blue-500' />
                    <div className='p-5'>
                      <div className='flex items-center gap-2 mb-4'>
                        <TrendingUp className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
                        <h3 className='font-semibold'>Quick Loans</h3>
                        {userLoans?.quickLoans?.length ? (
                          <span className='ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5'>
                            {userLoans.quickLoans.length}
                          </span>
                        ) : null}
                      </div>

                      {!userLoans?.quickLoans?.length ? (
                        <EmptyState message='No quick loans yet' />
                      ) : (
                        <div className='space-y-2.5'>
                          {quickLoansToShow?.map((loan, i) => {
                            const cfg = getStatusConfig(loan.status);
                            return (
                              <motion.div
                                key={loan._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`border-l-4 ${cfg.border} bg-muted/30 dark:bg-slate-800/40 rounded-r-xl p-3.5 space-y-1`}>
                                <div className='flex items-center justify-between gap-2'>
                                  <p className='font-bold text-sm'>₦{loan.amount.toLocaleString()}</p>
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                                    {cfg.icon}
                                    <span className='capitalize'>{loan.status}</span>
                                  </span>
                                </div>
                                <div className='grid grid-cols-2 gap-x-3 text-[11px] text-muted-foreground'>
                                  <span>Applied: {dayjs(loan.dateApplied).format("MMM D, YYYY")}</span>
                                  {loan.dateApproved && <span>Approved: {dayjs(loan.dateApproved).format("MMM D, YYYY")}</span>}
                                  {loan.expiryDate && <span>Expires: {dayjs(loan.expiryDate).format("MMM D, YYYY")}</span>}
                                  {loan.totalRepayment && (
                                    <span className='text-emerald-600 dark:text-emerald-400 font-medium'>
                                      Repay: ₦{loan.totalRepayment.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                          <PaginationControls
                            page={quickLoanPage}
                            total={totalQuickLoanPages}
                            onPrev={() => setQuickLoanPage((p) => Math.max(1, p - 1))}
                            onNext={() => setQuickLoanPage((p) => Math.min(totalQuickLoanPages, p + 1))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Core Loans */}
                <motion.div variants={itemVariants}>
                  <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm overflow-hidden'>
                    <div className='h-1 bg-gradient-to-r from-violet-500 to-purple-500' />
                    <div className='p-5'>
                      <div className='flex items-center gap-2 mb-4'>
                        <Building2 className='w-4 h-4 text-violet-600 dark:text-violet-400' />
                        <h3 className='font-semibold'>Core Loans</h3>
                        {userLoans?.coreLoans?.length ? (
                          <span className='ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5'>
                            {userLoans.coreLoans.length}
                          </span>
                        ) : null}
                      </div>

                      {!userLoans?.coreLoans?.length ? (
                        <EmptyState message='No core loans yet' />
                      ) : (
                        <div className='space-y-2.5'>
                          {coreLoansToShow?.map((loan, i) => {
                            const cfg = getStatusConfig(loan.status);
                            return (
                              <motion.div
                                key={loan._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`border-l-4 ${cfg.border} bg-muted/30 dark:bg-slate-800/40 rounded-r-xl p-3.5 space-y-1`}>
                                <div className='flex items-center justify-between gap-2'>
                                  <p className='font-bold text-sm'>₦{loan.amountRequested.toLocaleString()}</p>
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                                    {cfg.icon}
                                    <span className='capitalize'>{loan.status}</span>
                                  </span>
                                </div>
                                <div className='grid grid-cols-2 gap-x-3 text-[11px] text-muted-foreground'>
                                  <span>Applied: {dayjs(loan.dateApplied).format("MMM D, YYYY")}</span>
                                  {loan.dateApproved && <span>Approved: {dayjs(loan.dateApproved).format("MMM D, YYYY")}</span>}
                                  {loan.expiryDate && <span>Expires: {dayjs(loan.expiryDate).format("MMM D, YYYY")}</span>}
                                </div>
                              </motion.div>
                            );
                          })}
                          <PaginationControls
                            page={coreLoanPage}
                            total={totalCoreLoanPages}
                            onPrev={() => setCoreLoanPage((p) => Math.max(1, p - 1))}
                            onNext={() => setCoreLoanPage((p) => Math.min(totalCoreLoanPages, p + 1))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ── History Tab ── */}
          <TabsContent value='history' className='mt-0'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'>
              <motion.div variants={itemVariants}>
                <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-border/60 shadow-sm p-5 sm:p-6'>
                  <div className='flex items-center gap-2 mb-5'>
                    <History className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
                    <h3 className='font-semibold'>Activity History</h3>
                    {activityHistory?.length ? (
                      <span className='ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5'>
                        {activityHistory.length} events
                      </span>
                    ) : null}
                  </div>

                  {!activityHistory?.length ? (
                    <EmptyState message='No activity history yet' />
                  ) : (
                    <div className='space-y-0'>
                      {activityHistory.map((activity, i) => {
                        const cfg = getStatusConfig(activity.status);
                        const isLast = i === activityHistory.length - 1;
                        return (
                          <motion.div
                            key={activity._id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className='flex gap-3 sm:gap-4'>
                            {/* Timeline connector */}
                            <div className='flex flex-col items-center'>
                              <div className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center shrink-0 ${cfg.color.split(' ').slice(0, 2).join(' ')}`}>
                                {cfg.icon}
                              </div>
                              {!isLast && (
                                <div className='w-px flex-1 bg-border/60 my-1' />
                              )}
                            </div>

                            {/* Content */}
                            <div className={`flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
                              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-1'>
                                <p className='font-medium text-sm'>{activity.action}</p>
                                <Badge variant='outline' className='text-[10px] capitalize w-fit'>
                                  {activity.loanType} Loan
                                </Badge>
                              </div>
                              <div className='flex items-center gap-3 mt-0.5'>
                                <p className='text-xs text-muted-foreground'>
                                  {dayjs(activity.date).format("MMM D, YYYY · HH:mm")}
                                </p>
                                {activity.loanAmount ? (
                                  <p className='text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                                    ₦{activity.loanAmount.toLocaleString()}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Quick Loan Sheet ── */}
      <Sheet open={showQuickLoanForm} onOpenChange={setShowQuickLoanForm}>
        <SheetContent side='right' showCloseButton={false} className='w-full sm:max-w-md overflow-y-auto p-0'>
          <SheetHeader className='border-b border-border/40 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center'>
                  <TrendingUp className='w-4 h-4 text-indigo-600 dark:text-indigo-400' />
                </div>
                <SheetTitle className='text-lg font-bold'>Quick Loan Application</SheetTitle>
              </div>
              <CloseButton onClick={() => setShowQuickLoanForm(false)} />
            </div>
          </SheetHeader>

          <div className='p-6 space-y-4'>
            {/* Terms */}
            <div className='bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4'>
              <div className='flex items-start gap-2'>
                <FileText className='w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0' />
                <div className='text-xs text-indigo-900 dark:text-indigo-200 space-y-1'>
                  <p className='font-semibold text-sm mb-1.5'>Terms & Conditions</p>
                  <p>• 5% interest rate on the principal amount</p>
                  <p>• Repayment period: 6 months from disbursement</p>
                  <p>• Defaulting will result in blacklisting from future loans</p>
                </div>
              </div>
            </div>

            <FormField label='Select Loan Amount'>
              <Select value={quickLoanAmount} onValueChange={setQuickLoanAmount}>
                <SelectTrigger className='rounded-xl border-border/60 focus:ring-indigo-500/20 focus:border-indigo-400'>
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
            </FormField>

            {quickLoanAmount && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className='bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 grid grid-cols-2 gap-2'>
                <div>
                  <span className='text-muted-foreground'>Principal:</span>{" "}
                  <strong>₦{parseInt(quickLoanAmount).toLocaleString()}</strong>
                </div>
                <div>
                  <span className='text-muted-foreground'>Interest (5%):</span>{" "}
                  <strong>₦{(parseInt(quickLoanAmount) * 0.05).toLocaleString()}</strong>
                </div>
                <div className='col-span-2'>
                  <span className='text-muted-foreground'>Total repayment:</span>{" "}
                  <strong className='text-base'>₦{(parseInt(quickLoanAmount) * 1.05).toLocaleString()}</strong>
                </div>
              </motion.div>
            )}

            <FormField label='Confirm PIN'>
              <Input
                type='password'
                placeholder='Enter your 6-digit PIN'
                value={pinConfirmation}
                onChange={(e) => setPinConfirmation(e.target.value)}
                maxLength={6}
                className='rounded-xl border-border/60 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-400'
              />
            </FormField>

            <div className='flex gap-2.5 pt-1'>
              <Button
                variant='outline'
                onClick={() => setShowQuickLoanForm(false)}
                className='flex-1 rounded-xl border-border/60'>
                Cancel
              </Button>
              <Button
                onClick={handleQuickLoanSubmit}
                disabled={!quickLoanAmount || pinConfirmation.length !== 6}
                className='flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white border-0 shadow-md shadow-indigo-500/20'>
                Submit Application
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Core Loan Sheet ── */}
      <Sheet open={showCoreLoanForm} onOpenChange={setShowCoreLoanForm}>
        <SheetContent side='right' showCloseButton={false} className='w-full sm:max-w-2xl overflow-y-auto p-0'>
          <SheetHeader className='border-b border-border/40 pb-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center'>
                  <Building2 className='w-4 h-4 text-violet-600 dark:text-violet-400' />
                </div>
                <SheetTitle className='text-lg font-bold'>Core Loan Application</SheetTitle>
              </div>
              <CloseButton onClick={() => setShowCoreLoanForm(false)} />
            </div>
          </SheetHeader>

          <div className='p-6 space-y-5'>
            {/* Auto-filled info */}
            <div>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                Your Information
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <FormField label='Full Name'>
                  <Input value={user.name} disabled className='rounded-xl bg-muted/50 border-border/40' />
                </FormField>
                <FormField label='IPPIS'>
                  <Input value={user.ippis} disabled className='rounded-xl bg-muted/50 border-border/40' />
                </FormField>
                <FormField label='Loan Date'>
                  <Input value={dayjs().format("YYYY-MM-DD")} disabled className='rounded-xl bg-muted/50 border-border/40' />
                </FormField>
              </div>
            </div>

            <Separator className='opacity-50' />

            {/* Loan details */}
            <div>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                Loan Details
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <FormField label='Mobile Number *'>
                  <Input
                    type='tel'
                    placeholder='e.g., 08012345678'
                    value={coreLoanForm.mobileNumber}
                    onChange={(e) => setCoreLoanForm({ ...coreLoanForm, mobileNumber: e.target.value.replace(/[^0-9+]/g, "") })}
                    minLength={11} maxLength={14}
                    className='rounded-xl border-border/60 focus-visible:ring-violet-500/20 focus-visible:border-violet-400'
                  />
                </FormField>
                <FormField label='Amount Requested *'>
                  <Input
                    type='number'
                    placeholder='Enter amount in Naira'
                    value={coreLoanForm.amountRequested}
                    onChange={(e) => setCoreLoanForm({ ...coreLoanForm, amountRequested: e.target.value })}
                    min='1'
                    className='rounded-xl border-border/60 focus-visible:ring-violet-500/20 focus-visible:border-violet-400'
                  />
                </FormField>
                <FormField label='Account Number *'>
                  <Input
                    placeholder='10-digit account number'
                    value={coreLoanForm.accountNumber}
                    onChange={(e) => setCoreLoanForm({ ...coreLoanForm, accountNumber: e.target.value })}
                    minLength={10} maxLength={10}
                    className='rounded-xl border-border/60 focus-visible:ring-violet-500/20 focus-visible:border-violet-400'
                  />
                </FormField>
                <FormField label='Account Name *'>
                  <Input
                    placeholder='Account holder name'
                    value={coreLoanForm.accountName}
                    onChange={(e) => setCoreLoanForm({ ...coreLoanForm, accountName: e.target.value })}
                    className='rounded-xl border-border/60 focus-visible:ring-violet-500/20 focus-visible:border-violet-400'
                  />
                </FormField>
                <FormField label='Bank *'>
                  <Input
                    placeholder='Bank name'
                    value={coreLoanForm.bank}
                    onChange={(e) => setCoreLoanForm({ ...coreLoanForm, bank: e.target.value })}
                    className='rounded-xl border-border/60 focus-visible:ring-violet-500/20 focus-visible:border-violet-400'
                  />
                </FormField>
                <FormField label='Existing Loan'>
                  <Input value={hasActiveCoreLoan ? "Yes" : "No"} disabled className='rounded-xl bg-muted/50 border-border/40' />
                </FormField>
              </div>
            </div>

            <Separator className='opacity-50' />

            {/* Guarantors */}
            <div>
              <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3'>
                Guarantors (2 required)
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {[1, 2].map((n) => (
                  <div key={n} className='bg-muted/30 dark:bg-slate-800/40 rounded-xl p-3.5 space-y-3'>
                    <p className='text-xs font-semibold text-muted-foreground'>Guarantor {n}</p>
                    <FormField label='Full Name *'>
                      <Input
                        placeholder='Min. 7 characters'
                        value={coreLoanForm[`guarantor${n}Name` as keyof typeof coreLoanForm]}
                        onChange={(e) => setCoreLoanForm({ ...coreLoanForm, [`guarantor${n}Name`]: e.target.value })}
                        minLength={7}
                        className='rounded-lg border-border/60 focus-visible:ring-violet-500/20 focus-visible:border-violet-400 bg-background'
                      />
                    </FormField>
                    <FormField label='Phone Number *'>
                      <Input
                        type='tel'
                        placeholder='e.g., 08012345678'
                        value={coreLoanForm[`guarantor${n}Phone` as keyof typeof coreLoanForm]}
                        onChange={(e) => setCoreLoanForm({ ...coreLoanForm, [`guarantor${n}Phone`]: e.target.value.replace(/[^0-9+]/g, "") })}
                        minLength={11} maxLength={14}
                        className='rounded-lg border-border/60 focus-visible:ring-violet-500/20 focus-visible:border-violet-400 bg-background'
                      />
                    </FormField>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex gap-2.5 pt-1'>
              <Button
                variant='outline'
                onClick={() => setShowCoreLoanForm(false)}
                className='flex-1 rounded-xl border-border/60'>
                Cancel
              </Button>
              <Button
                onClick={handleCoreLoanSubmit}
                className='flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-md shadow-violet-500/20'>
                Submit Application
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function StatusBanner({
  type,
  icon,
  message,
}: {
  type: "warning" | "success" | "info";
  icon: React.ReactNode;
  message: string;
}) {
  const styles = {
    warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300",
    success: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300",
    info: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40 text-indigo-800 dark:text-indigo-300",
  };
  return (
    <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm ${styles[type]}`}>
      <span className='shrink-0 mt-0.5'>{icon}</span>
      <p>{message}</p>
    </div>
  );
}

function ApprovedLoanCard({ loan, userName }: { loan: { amount: number; totalRepayment?: number; expiryDate?: string; disbursed?: boolean }; userName: string }) {
  const isExpired = dayjs(loan.expiryDate).isBefore(dayjs(), "day");
  return (
    <div className='space-y-3'>
      <StatusBanner
        type={isExpired ? "warning" : "success"}
        icon={isExpired ? <AlertTriangle className='w-4 h-4' /> : <CheckCircle className='w-4 h-4' />}
        message={
          isExpired
            ? "Your quick loan has expired and requires immediate attention!"
            : loan.disbursed
              ? "Your loan has been approved and disbursed."
              : "Your loan is approved and awaiting disbursement."
        }
      />
      <div className={`rounded-xl p-3.5 border ${isExpired ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40" : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"}`}>
        <div className='grid grid-cols-2 gap-2 text-xs mb-3'>
          <div>
            <p className='text-muted-foreground mb-0.5'>Loan Amount</p>
            <p className='font-bold text-sm'>₦{loan.amount?.toLocaleString()}</p>
          </div>
          <div>
            <p className='text-muted-foreground mb-0.5'>Total Repayment</p>
            <p className='font-bold text-sm'>₦{loan.totalRepayment?.toLocaleString()}</p>
          </div>
          <div>
            <p className='text-muted-foreground mb-0.5'>Interest Rate</p>
            <p className='font-semibold'>5%</p>
          </div>
          <div>
            <p className='text-muted-foreground mb-0.5'>Expiry Date</p>
            <p className={`font-semibold ${isExpired ? "text-rose-600 dark:text-rose-400" : ""}`}>
              {dayjs(loan.expiryDate).format("MMM D, YYYY")}
              {isExpired && " (EXPIRED)"}
            </p>
          </div>
        </div>
        <div className='bg-background rounded-lg p-2.5 border border-border/50 text-xs'>
          <p className='font-semibold mb-1'>Repayment Details:</p>
          <p className='text-muted-foreground'>
            Bank: <span className='text-foreground font-medium'>Zenith Bank</span> ·{" "}
            Acct: <span className='text-foreground font-medium'>1229203111</span> ·{" "}
            Name: <span className='text-foreground font-medium'>NFVCB STAFF CO SOC LTD</span>
          </p>
          <p className='text-muted-foreground mt-1'>
            Narration: <span className='text-foreground font-medium'>Quick Loan Repayment - {userName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-8 text-center gap-2'>
      <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center'>
        <FileText className='w-5 h-5 text-muted-foreground' />
      </div>
      <p className='text-sm text-muted-foreground'>{message}</p>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-xs font-medium text-muted-foreground'>{label}</Label>
      {children}
    </div>
  );
}

function PaginationControls({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (total <= 1) return null;
  return (
    <div className='flex items-center justify-between pt-3 border-t border-border/40'>
      <Button variant='ghost' size='sm' onClick={onPrev} disabled={page === 1} className='gap-1 text-xs'>
        <ChevronLeft className='w-3.5 h-3.5' /> Prev
      </Button>
      <span className='text-xs text-muted-foreground'>{page} / {total}</span>
      <Button variant='ghost' size='sm' onClick={onNext} disabled={page === total} className='gap-1 text-xs'>
        Next <ChevronRight className='w-3.5 h-3.5' />
      </Button>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'>
      <XCircle className='w-4 h-4' />
    </button>
  );
}
