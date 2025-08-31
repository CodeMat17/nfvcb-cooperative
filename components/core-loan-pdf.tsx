"use client";

import { Button } from "@/components/ui/button";
import { CoreLoan, User } from "@/types";
import dayjs from "dayjs";
import { Download } from "lucide-react";
import { useRef } from "react";

interface CoreLoanPDFProps {
  loan: CoreLoan;
  user: User;
}

export function CoreLoanPDF({ loan, user }: CoreLoanPDFProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    console.log("Print function called");

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow || !printRef.current) {
      console.error("Failed to open print window or printRef is null");
      return;
    }

    // Clone the content to avoid modifying the original
    const printElement = printRef.current.cloneNode(true) as HTMLElement;

    // Remove any elements with no-print class
    const noPrintElements = printElement.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => el.remove());

    const printContent = printElement.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Core Loan Application - ${user.name}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 8mm;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 10px;
                line-height: 1.3;
                color: #000;
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
              .page-break {
                page-break-before: always;
              }
              .header {
                text-align: center;
                margin-bottom: 15px;
                border-bottom: 2px solid #000;
                padding-bottom: 8px;
              }
              .section {
                margin-bottom: 12px;
              }
              .section-title {
                font-weight: bold;
                font-size: 13px;
                margin-bottom: 6px;
                background-color: #f3f4f6;
                padding: 4px 8px;
                border-left: 3px solid #3b82f6;
              }
              .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 6px;
                margin-bottom: 6px;
              }
              .form-field {
                margin-bottom: 4px;
                display: flex;
                align-items: center;
              }
              .field-label {
                font-weight: bold;
                color: #374151;
                min-width: 90px;
                margin-right: 8px;
                font-size: 10px;
              }
              .field-value {
                border-bottom: 1px solid #d1d5db;
                padding: 3px 0;
                min-height: 18px;
                flex: 1;
                font-size: 10px;
              }
              .guarantor-section {
                border: 1px solid #d1d5db;
                padding: 8px;
                margin-top: 6px;
                margin-bottom: 8px;
              }
              .status-badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              }
              .status-processing { background-color: #fef3c7; color: #92400e; }
              .status-approved { background-color: #d1fae5; color: #065f46; }
              .status-rejected { background-color: #fee2e2; color: #991b1b; }
              .status-cleared { background-color: #dbeafe; color: #1e40af; }
              .footer {
                margin-top: 15px;
                text-align: center;
                font-size: 9px;
                color: #6b7280;
                border-top: 1px solid #d1d5db;
                padding-top: 8px;
              }
              h1 { font-size: 18px; margin: 0; }
              h4 { font-size: 11px; margin: 0 0 5px 0; }
              p { margin: 3px 0; }
              .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 32px;
                font-weight: bold;
                color: rgba(0,0,0,0.03);
                letter-spacing: 3px;
                text-transform: uppercase;
                z-index: -1;
                pointer-events: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="watermark">NFVCB COOP</div>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownload = async () => {
    console.log("Download function called");
    if (!printRef.current) {
      console.log("printRef.current is null");
      return;
    }

    try {
      console.log("Starting PDF generation via print dialog...");

      // Create a new window for PDF generation
      const pdfWindow = window.open("", "_blank");
      if (!pdfWindow) {
        throw new Error("Failed to open PDF window");
      }

      // Clone the content to avoid modifying the original
      const pdfElement = printRef.current.cloneNode(true) as HTMLElement;

      // Remove any elements with no-print class
      const noPrintElements = pdfElement.querySelectorAll(".no-print");
      noPrintElements.forEach((el) => el.remove());

      const pdfContent = pdfElement.innerHTML;

      // Write the content to the new window with clean CSS
      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Core Loan Application - ${user.name}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 11px;
                line-height: 1.3;
                color: #000000;
                background-color: #ffffff;
                margin: 0;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 12px;
                border-bottom: 2px solid #000000;
                padding-bottom: 6px;
              }
              .section {
                margin-bottom: 8px;
              }
              .section-title {
                font-weight: bold;
                font-size: 13px;
                margin-bottom: 4px;
                background-color: #f3f4f6;
                padding: 3px 6px;
                border-left: 3px solid #3b82f6;
              }
              .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 6px;
                margin-bottom: 6px;
              }
              .form-field {
                margin-bottom: 4px;
                display: flex;
                align-items: center;
              }
              .field-label {
                font-weight: bold;
                color: #374151;
                min-width: 80px;
                margin-right: 6px;
                font-size: 10px;
              }
              .field-value {
                border-bottom: 1px solid #d1d5db;
                padding: 2px 0;
                min-height: 16px;
                flex: 1;
                font-size: 10px;
              }
              .guarantor-section {
                border: 1px solid #d1d5db;
                padding: 6px;
                margin-top: 4px;
                margin-bottom: 6px;
              }
              .status-badge {
                display: inline-block;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 9px;
                font-weight: bold;
                text-transform: uppercase;
              }
              .status-processing { background-color: #fef3c7; color: #92400e; }
              .status-approved { background-color: #d1fae5; color: #065f46; }
              .status-rejected { background-color: #fee2e2; color: #991b1b; }
              .status-cleared { background-color: #dbeafe; color: #1e40af; }
              h1 { font-size: 16px; margin: 0; }
              h4 { font-size: 11px; margin: 0 0 4px 0; }
              p { margin: 2px 0; font-size: 10px; }
              .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 32px;
                font-weight: bold;
                color: rgba(0,0,0,0.03);
                letter-spacing: 3px;
                text-transform: uppercase;
                z-index: -1;
                pointer-events: none;
              }
            </style>
          </head>
          <body>
            <div class="watermark">NFVCB COOP</div>
            ${pdfContent}
          </body>
        </html>
      `);

      pdfWindow.document.close();

      // Wait for content to load
      await new Promise((resolve) => {
        pdfWindow.onload = resolve;
        setTimeout(resolve, 1000); // Fallback timeout
      });

      console.log("Content loaded, starting PDF generation...");

      // Use window.print() to generate PDF
      pdfWindow.focus();
      pdfWindow.print();

      // Close the window after a delay
      setTimeout(() => {
        pdfWindow.close();
      }, 2000);

      console.log("PDF generation initiated via print dialog");
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback: open in new window for printing
      console.log("Falling back to print function...");
      handlePrint();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "status-processing";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "cleared":
        return "status-cleared";
      default:
        return "status-processing";
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Core Loan Application</h3>
        <div className='flex gap-2'>
          <Button size={"icon"} onClick={handleDownload} className='no-print'>
            <Download className='h-6 w-6 ' />
          </Button>
        </div>
      </div>

      <div
        ref={printRef}
        className='bg-white p-8 border rounded-lg relative'
        style={{ fontSize: "12px", lineHeight: "1.4" }}>
        {/* Watermark */}
        <div
          className='absolute inset-0 pointer-events-none select-none'
          style={{
            zIndex: 1,
          }}>
          <div
            className='absolute inset-0 flex items-center justify-center'
            style={{
              transform: "rotate(-45deg)",
              fontSize: "32px",
              fontWeight: "bold",
              color: "rgba(0,0,0,0.03)",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}>
            NFVCB COOP
          </div>
        </div>
        <div className='relative z-10'>
          {/* Header */}
          <div className='header mb-6'>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: "0" }}>
              NFVCB MULTIPURPOSE COOPERATIVE SOCIETY
            </h1>
            <p style={{ fontSize: "14px", margin: "4px 0", color: "#6b7280" }}>
              Core Loan Application Form
            </p>
            <p style={{ fontSize: "11px", margin: "3px 0", color: "#6b7280" }}>
              Generated on: {dayjs().format("MMMM DD, YYYY")}
            </p>
          </div>

          {/* Application Status */}
          <div className='section' style={{ marginBottom: "16px" }}>
            <div className='form-grid'>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    color: "#374151",
                    marginRight: "10px",
                    fontSize: "10px",
                  }}>
                  Status:
                </div>
                <div
                  className='field-value'
                  style={{
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  <span
                    className={`status-badge ${getStatusColor(loan.status)}`}>
                    {loan.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    color: "#374151",
                    marginRight: "10px",
                    fontSize: "10px",
                  }}>
                  Application Date:
                </div>
                <div
                  className='field-value'
                  style={{
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  {dayjs(loan.dateApplied).format("MMM DD, YYYY")}
                </div>
              </div>
            </div>
          </div>

          {/* Member Information */}
          <div className='section' style={{ marginBottom: "16px" }}>
            <div
              className='section-title'
              style={{
                fontSize: "13px",
                marginBottom: "4px",
                marginTop: "8px",
                fontWeight: "bold",
              }}>
              Member Information
            </div>
            <div className='form-grid'>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginRight: "10px",
                  }}>
                  Full Name:
                </div>
                <div
                  className='field-value'
                  style={{
                    padding: "2px 0",
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  {user.name}
                </div>
              </div>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginRight: "10px",
                  }}>
                  IPPIS Number:
                </div>
                <div
                  className='field-value'
                  style={{
                    padding: "2px 0",
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  {user.ippis}
                </div>
              </div>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginRight: "10px",
                  }}>
                  Mobile Number:
                </div>
                <div
                  className='field-value'
                  style={{
                    padding: "2px 0",
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  {loan.mobileNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className='section' style={{ marginBottom: "16px" }}>
            <div
              className='section-title'
              style={{
                fontSize: "13px",
                marginTop: "8px",
                fontWeight: "bold",
              }}>
              Loan Details
            </div>
            <div className='form-grid'>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginRight: "10px",
                  }}>
                  Amount Requested:
                </div>
                <div
                  className='field-value'
                  style={{
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  ₦{loan.amountRequested.toLocaleString()}
                </div>
              </div>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginRight: "10px",
                  }}>
                  Existing Loan:
                </div>
                <div
                  className='field-value'
                  style={{
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  {loan.existingLoan}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className='section' style={{ marginBottom: "16px" }}>
            <div
              className='section-title'
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                marginTop: "8px",
                marginBottom: "4px",
              }}>
              Bank Account Details
            </div>
            <div className='form-grid'>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginRight: "10px",
                  }}>
                  Account Number:
                </div>
                <div
                  className='field-value'
                  style={{
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  {loan.accountNumber}
                </div>
              </div>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginRight: "10px",
                  }}>
                  Account Name:
                </div>
                <div
                  className='field-value'
                  style={{
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  {loan.accountName}
                </div>
              </div>
              <div
                className='form-field'
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}>
                <div
                  className='field-label'
                  style={{
                    fontSize: "10px",
                    color: "#374151",
                    marginRight: "10px",
                  }}>
                  Bank Name:
                </div>
                <div
                  className='field-value'
                  style={{
                    flex: 1,
                    fontSize: "10px",
                  }}>
                  {loan.bank}
                </div>
              </div>
            </div>
          </div>

          {/* Guarantors */}
          <div className='section' style={{ marginBottom: "16px" }}>
            <div
              className='section-title'
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                marginTop: "8px",
                marginBottom: "4px",
              }}>
              Guarantors Information
            </div>

            <div className='guarantor-section'>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#374151",
                }}>
                First Guarantor
              </h4>
              <div className='form-grid'>
                <div
                  className='form-field'
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}>
                  <div
                    className='field-label'
                    style={{
                      fontSize: "10px",
                      color: "#374151",
                      marginRight: "10px",
                    }}>
                    Full Name:
                  </div>
                  <div
                    className='field-value'
                    style={{
                      flex: 1,
                      fontSize: "10px",
                    }}>
                    {loan.guarantor1Name}
                  </div>
                </div>
                <div
                  className='form-field'
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}>
                  <div
                    className='field-label'
                    style={{
                      fontSize: "10px",
                      color: "#374151",
                      marginRight: "10px",
                    }}>
                    Phone Number:
                  </div>
                  <div
                    className='field-value'
                    style={{
                      flex: 1,
                      fontSize: "10px",
                    }}>
                    {loan.guarantor1Phone}
                  </div>
                </div>
              </div>
            </div>

            <div className='guarantor-section'>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#374151",
                }}>
                Second Guarantor
              </h4>
              <div className='form-grid'>
                <div
                  className='form-field'
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}>
                  <div
                    className='field-label'
                    style={{
                      fontSize: "10px",
                      color: "#374151",
                      marginRight: "10px",
                    }}>
                    Full Name:
                  </div>
                  <div
                    className='field-value'
                    style={{
                      flex: 1,
                      fontSize: "10px",
                    }}>
                    {loan.guarantor2Name}
                  </div>
                </div>
                <div
                  className='form-field'
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}>
                  <div
                    className='field-label'
                    style={{
                      fontSize: "10px",
                      color: "#374151",
                      marginRight: "10px",
                    }}>
                    Phone Number:
                  </div>
                  <div
                    className='field-value'
                    style={{
                      flex: 1,
                      fontSize: "10px",
                    }}>
                    {loan.guarantor2Phone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* For Official Use Only */}
          <div className='section' style={{ marginBottom: "16px" }}>
            <div
              className='section-title'
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}>
              FOR OFFICIAL USE ONLY
            </div>

            {/* Member's Contribution Line */}
            <div
              className='form-field'
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
              }}>
              <div
                className='field-label'
                style={{
                  fontSize: "10px",
                  color: "#374151",
                  marginRight: "8px",
                }}>
                Member&apos;s contribution:
              </div>
              <div
                className='field-value'
                style={{
                  borderBottom: "1px solid #d1d5db",
                  flex: 1,
                  fontSize: "10px",
                }}>
                ₦{user.totalContribution?.toLocaleString() || "0"}
              </div>
              <div
                className='field-label'
                style={{
                  fontSize: "10px",
                  color: "#374151",
                  marginRight: "8px",
                }}>
                as at:
              </div>
              <div
                className='field-value'
                style={{
                  borderBottom: "1px solid #d1d5db",
                  fontSize: "10px",
                }}>
                {dayjs().format("MMM DD, YYYY")}
              </div>
            </div>

            {/* New Loan and Old Loan Sections */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
              {/* New Loan Section */}
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#374151",
                  }}>
                  New Loan
                </h4>
                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: "1.3",
                    color: "#6b7280",
                  }}>
                  <p style={{ margin: "3px 0" }}>
                    Loan amount approved: _________________
                  </p>
                  <p style={{ margin: "3px 0" }}>
                    Interest charged: 8%( ) 10%( ) 22%( )
                  </p>
                  <p style={{ margin: "3px 0" }}>
                    Amount approved: _________________
                  </p>
                  <p style={{ margin: "3px 0" }}>Balance: _________________</p>
                  <p style={{ margin: "3px 0" }}>
                    Less old loan balance if any: _________________
                  </p>
                  <p style={{ margin: "3px 0" }}>
                    Grand Total Paid: _________________
                  </p>
                </div>
              </div>

              {/* Old Loan Section */}
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    margin: "0 0 4px 0",
                    color: "#374151",
                  }}>
                  Old Loan
                </h4>
                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: "1.3",
                    color: "#6b7280",
                  }}>
                  <p style={{ margin: "3px 0" }}>
                    Last loan amount: _________________
                  </p>
                  <p style={{ margin: "3px 0" }}>
                    Duration/Start month: _________________
                  </p>
                  <p style={{ margin: "3px 0" }}>
                    Monthly deduction/Duration paid: _________________
                  </p>
                  <p style={{ margin: "3px 0" }}>
                    Total amount paid from loan: _________________
                  </p>
                  <p style={{ margin: "3px 0" }}>
                    Balance loan amount: _________________
                  </p>
                </div>
              </div>
            </div>

            {/* Loan Deduction Details */}
            <div>
              <h4
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  margin: "0 0 4px 0",
                  color: "#374151",
                }}>
                Loan Deduction Details:
              </h4>
              <div
                style={{
                  fontSize: "9px",
                  lineHeight: "1.3",
                  color: "#6b7280",
                }}>
                <p style={{ margin: "3px 0" }}>
                  Add or Less Old balance if any: _________________
                </p>
                <p style={{ margin: "3px 0" }}>
                  New loan deduction amount: _________________
                </p>
                <p style={{ margin: "3px 0" }}>Duration: _________________</p>
                <p style={{ margin: "3px 0" }}>
                  Monthly deduction: _________________
                </p>
                <p style={{ margin: "3px 0" }}>Start date: _________________</p>
                <p style={{ margin: "3px 0" }}>End date: _________________</p>
                <p style={{ margin: "3px 0" }}>Remark: _________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
