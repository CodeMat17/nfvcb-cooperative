export interface User {
  _id: string;
  _creationTime: number;
  name: string;
  dateJoined: string;
  ippis: string;
  pin: string;
  monthlyContribution: number;
  totalContribution: number;
}

export interface QuickLoan {
  _id: string;
  _creationTime: number;
  userId: string;
  amount: number;
  status: "processing" | "approved" | "rejected" | "cleared";
  dateApplied: string;
  dateApproved?: string;
  expiryDate?: string;
  clearedDate?: string;
  interestRate: number;
  totalRepayment?: number;
  disbursed?: boolean;
  dateDisbursed?: string;
}

export interface CoreLoan {
  _id: string;
  _creationTime: number;
  userId: string;
  loanDate: string;
  mobileNumber: string;
  amountRequested: number;
  accountNumber: string;
  accountName: string;
  bank: string;
  existingLoan: string;
  guarantor1Name: string;
  guarantor1Phone: string;
  guarantor2Name: string;
  guarantor2Phone: string;
  status: "processing" | "approved" | "rejected" | "cleared";
  dateApplied: string;
  dateApproved?: string;
  expiryDate?: string;
  clearedDate?: string;
}

export interface ActivityHistory {
  _id: string;
  _creationTime: number;
  userId: string;
  loanType: "quick" | "core";
  loanId: string;
  action: string;
  status: "processing" | "approved" | "rejected" | "cleared";
  date: string;
  createdAt: number;
  loanAmount?: number;
}
