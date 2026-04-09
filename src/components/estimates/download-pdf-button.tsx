"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PdfItem {
  name: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  currency: string;
  wattPerUnit: string | null;
  pricePerWatt: string | null;
  totalAmount: string;
}

interface PdfPayment {
  date: string;
  amount: string;
  currency: string;
  note: string | null;
}

interface DownloadPdfButtonProps {
  estimateName: string;
  clientName: string;
  clientPhone: string | null;
  clientAddress: string | null;
  projectName: string | null;
  createdByName: string;
  createdAt: string;
  items: PdfItem[];
  payments: PdfPayment[];
  totalByCurrency: Record<string, number>;
  paidByCurrency: Record<string, number>;
  debtByCurrency: Record<string, number>;
}

function fmtNum(n: number, decimals = 0): string {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

function fmtCur(amount: number | string, currency: string): string {
  const num = typeof amount === "number" ? amount : Number(amount);
  switch (currency) {
    case "USD":
      return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    case "EUR":
      return "€" + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    case "RUB":
      return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(num) + " ₽";
    default:
      return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(num) + " so'm";
  }
}

export function DownloadPdfButton(props: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const [{ jsPDF }, autoTableModule, ratesRes] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
        fetch("/api/exchange-rate"),
      ]);

      // Apply autotable plugin
      const autoTable = autoTableModule.default;

      const rates: Record<string, number> = { UZS: 1 };
      if (ratesRes.ok) {
        const ratesData = await ratesRes.json();
        rates.USD = ratesData.USD || 12800;
        rates.EUR = ratesData.EUR || 14000;
        rates.RUB = ratesData.RUB || 140;
      }

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(props.estimateName, margin, y);
      y += 8;

      // Date
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      const dateStr = new Date(props.createdAt).toLocaleDateString("uz-UZ");
      doc.text(`Sana: ${dateStr}`, margin, y);
      y += 6;

      // Client info
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Mijoz:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(props.clientName, margin + 15, y);
      y += 5;

      if (props.clientPhone) {
        doc.setFont("helvetica", "bold");
        doc.text("Tel:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(props.clientPhone, margin + 15, y);
        y += 5;
      }

      if (props.clientAddress) {
        doc.setFont("helvetica", "bold");
        doc.text("Manzil:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(props.clientAddress, margin + 18, y);
        y += 5;
      }

      if (props.projectName) {
        doc.setFont("helvetica", "bold");
        doc.text("Loyiha:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(props.projectName, margin + 18, y);
        y += 5;
      }

      y += 4;

      // Line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Table header
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Smeta", margin, y);
      y += 6;

      // Items table
      const tableData: string[][] = [];
      for (let i = 0; i < props.items.length; i++) {
        const item = props.items[i];
        const qty = Number(item.quantity);
        const hasWatt = item.wattPerUnit && item.pricePerWatt;
        const watt = Number(item.wattPerUnit || 0);
        const totalWatt = qty * watt;

        let detail: string;
        if (hasWatt) {
          // Hide per-watt price! Only show: quantity, watt, total kW
          const kw = totalWatt / 1000;
          detail = `${fmtNum(qty)} ${item.unit} x ${watt}W = ${fmtNum(totalWatt)}W (${fmtNum(kw, 1)} kW)`;
        } else {
          detail = `${fmtNum(qty)} ${item.unit} x ${fmtCur(item.unitPrice, item.currency)}`;
        }

        tableData.push([
          String(i + 1),
          item.name,
          detail,
          fmtCur(item.totalAmount, item.currency),
        ]);
      }

      autoTable(doc, {
        startY: y,
        head: [["#", "Nomi", "Miqdori", "Summa"]],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          font: "helvetica",
        },
        headStyles: {
          fillColor: [41, 98, 255],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 55 },
          2: { cellWidth: 65 },
          3: { cellWidth: 40, halign: "right", fontStyle: "bold" },
        },
        margin: { left: margin, right: margin },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 6;

      // Totals per currency
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      for (const [cur, val] of Object.entries(props.totalByCurrency)) {
        doc.text(`Jami (${cur}):`, margin, y);
        doc.text(fmtCur(val, cur), pageWidth - margin, y, { align: "right" });
        y += 6;
      }

      // Combined total at today's rate
      const currencies = Object.keys(props.totalByCurrency);
      if (currencies.length > 1 || (currencies.length === 1 && currencies[0] !== "UZS")) {
        y += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Bugungi kurs bo'yicha:", margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        let totalUzs = 0;

        for (const [cur, val] of Object.entries(props.totalByCurrency)) {
          const rate = rates[cur] || 1;
          const uzsVal = val * rate;
          totalUzs += uzsVal;

          if (cur !== "UZS") {
            doc.text(
              `${fmtCur(val, cur)} x ${fmtNum(rate, 0)} = ${fmtCur(uzsVal, "UZS")}`,
              margin + 4,
              y
            );
            y += 5;
          } else {
            doc.text(`${fmtCur(val, "UZS")}`, margin + 4, y);
            y += 5;
          }
        }

        y += 2;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Jami (UZS):", margin, y);
        doc.text(fmtCur(totalUzs, "UZS"), pageWidth - margin, y, { align: "right" });
        y += 8;
      }

      // Payments section
      if (props.payments.length > 0) {
        y += 2;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("To'lovlar", margin, y);
        y += 6;

        const paymentData: string[][] = props.payments.map((p) => [
          new Date(p.date).toLocaleDateString("uz-UZ"),
          p.note || "",
          "+" + fmtCur(p.amount, p.currency),
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Sana", "Izoh", "Summa"]],
          body: paymentData,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 2.5, font: "helvetica" },
          headStyles: {
            fillColor: [34, 139, 34],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 90 },
            2: { cellWidth: 40, halign: "right", fontStyle: "bold" },
          },
          margin: { left: margin, right: margin },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        y = (doc as any).lastAutoTable.finalY + 5;

        // Paid totals
        for (const [cur, val] of Object.entries(props.paidByCurrency)) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(34, 139, 34);
          doc.text(`To'langan (${cur}): ${fmtCur(val, cur)}`, margin, y);
          y += 5;
        }

        doc.setTextColor(0, 0, 0);

        // Debt
        const debtEntries = Object.entries(props.debtByCurrency);
        if (debtEntries.length > 0) {
          y += 3;
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          for (const [cur, val] of debtEntries) {
            if (val > 0) {
              doc.setTextColor(220, 120, 0);
              doc.text(`Qarz: ${fmtCur(val, cur)}`, margin, y);
            } else {
              doc.setTextColor(34, 139, 34);
              doc.text(`To'liq to'langan`, margin, y);
            }
            y += 6;
          }
          doc.setTextColor(0, 0, 0);
        }
      }

      // Footer
      y = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(`Tuzuvchi: ${props.createdByName}`, margin, y);
      doc.text(`CRM Tizimi`, pageWidth - margin, y, { align: "right" });

      // Download
      const fileName = props.estimateName.replace(/[^a-zA-Z0-9\u0400-\u04FF\s-]/g, "").replace(/\s+/g, "_");
      doc.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("PDF xatolik:", err);
      toast.error("PDF yaratishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
      {loading ? "Yuklanmoqda..." : "PDF yuklash"}
    </Button>
  );
}
