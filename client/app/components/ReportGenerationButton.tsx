"use client";

import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

/**
 * ReportGenerationButton – reusable button that generates (mock) PDF reports.
 * Currently stubs PDF generation by creating a simple Blob with plain text so no extra
 * dependencies are required. Swap `generateMockPdf` with a real API call or jsPDF
 * implementation when backend is ready.
 */
export default function ReportGenerationButton({
  filename = "report.pdf",
  className = "",
}: {
  /** suggested file name */
  filename?: string;
  /** additional tailwind classes */
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);

  const generateMockPdf = async () => {
    // In real implementation call API or use jsPDF.
    // This creates a minimal PDF header so the browser recognises it.
    const pdfHeader = `%PDF-1.3\n%����\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Mock Report) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000110 00000 n \n0000000210 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n310\n%%EOF`;
    return new Blob([pdfHeader], { type: "application/pdf" });
  };

  const handleClick = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const blob = await generateMockPdf();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Report generation failed", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${className}`}
      aria-label="Generate PDF report"
      disabled={downloading}
    >
      {downloading ? (
        <svg
          className="animate-spin h-5 w-5 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : (
        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
      )}
      {downloading ? "Preparing…" : "Generate Report"}
    </button>
  );
}
