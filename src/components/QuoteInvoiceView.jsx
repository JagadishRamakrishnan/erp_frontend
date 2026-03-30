import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, message } from "antd";
import { PrinterOutlined, MailOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, SwapOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import companyService from "../services/companyService";
import invoiceService from "../services/invoiceService";

const STATUS_CONFIG = {
  Draft:    { color: "#6b7280", bg: "#f3f4f6", icon: <ClockCircleOutlined /> },
  Sent:     { color: "#2563eb", bg: "#eff6ff", icon: <MailOutlined /> },
  Approved: { color: "#16a34a", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
  Rejected: { color: "#dc2626", bg: "#fef2f2", icon: <CloseCircleOutlined /> },
  Pending:  { color: "#d97706", bg: "#fffbeb", icon: <ClockCircleOutlined /> },
  Partial:  { color: "#7c3aed", bg: "#f5f3ff", icon: <ClockCircleOutlined /> },
  Paid:     { color: "#16a34a", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
};

export default function QuoteInvoiceView({ open, onClose, record, type = "quote", directPrint = false }) {
  const printRef = useRef();
  const [company, setCompany] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    companyService.getAll().then((res) => {
      if (res.success && res.data?.length > 0) setCompany(res.data[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (directPrint && record && company && open) {
      // Small timeout to ensure the ref is populated
      setTimeout(() => {
        handlePrint();
        onClose();
      }, 500);
    }
  }, [directPrint, record, company, open]);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Print</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',Arial,sans-serif;background:#fff;color:#111827;padding:40px}
        .doc{max-width:780px;margin:0 auto}
        table{width:100%;border-collapse:collapse}
        @media print{body{padding:20px}}
      </style></head>
      <body><div class="doc">${content}</div></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const handleConvertToInvoice = async () => {
    setIsConverting(true);
    try {
      const resp = await invoiceService.generateFromQuotation(record.id);
      if (resp.success) {
        message.success("Invoice generated successfully!");
        onClose();
      } else {
        message.error(resp.message || "Conversion failed");
      }
    } catch (err) {
      message.error("Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  if (!record) return null;

  const isInvoice = type === "invoice";
  const docNumber = isInvoice ? record.invoice_number : record.quotation_number;
  const status = record.status;
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  const customer = record.customer || {};
  const subtotal = Number(record.total_amount || 0);
  const tax = Number(record.tax_amount || 0);
  const paid = Number(record.paid_amount || 0);
  const due = Number(record.due_amount ?? (subtotal - paid));
  const grandTotal = isInvoice ? subtotal : subtotal + tax;
  const accentColor = isInvoice ? "#7c3aed" : "#2563eb";
  const accentGrad = isInvoice
    ? "linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)"
    : "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)";

  const mainContent = (
    <div ref={printRef} style={{
      padding: "28px 32px", background: "#fff",
      fontFamily: '"Inter", Arial, sans-serif', maxHeight: directPrint ? "none" : "80vh", overflowY: "auto"
    }}>

      {/* GRADIENT HEADER BAND */}
      <div style={{
        background: accentGrad, borderRadius: 14, padding: "24px 28px",
        marginBottom: 24, display: "flex", justifyContent: "space-between",
        alignItems: "center", color: "#fff"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {company?.logo_url ? (
            <img src={company.logo_url} alt="logo" style={{
              width: 52, height: 52, objectFit: "contain", borderRadius: 10,
              background: "#fff", padding: 4
            }} />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: 10,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 800
            }}>
              {(company?.name || "C")[0].toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{company?.name || "Your Company"}</div>
            {company?.email && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{company.email}</div>}
            {company?.phone && <div style={{ fontSize: 12, opacity: 0.8 }}>{company.phone}</div>}
            {company?.gst_number && <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>GST: {company.gst_number}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 3 }}>
            {isInvoice ? "INVOICE" : "QUOTATION"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>#{docNumber}</div>
          <div style={{ fontSize: 12, opacity: 0.65 }}>{dayjs(record.created_at).format("DD MMMM YYYY")}</div>
        </div>
      </div>

      {/* BILL TO + DETAILS */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{
          flex: 1, background: "#f8fafc", borderRadius: 12,
          padding: "16px 18px", border: "1px solid #e5e7eb"
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Bill To</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 3 }}>{customer.name || "—"}</div>
          {customer.company && <div style={{ fontSize: 12, color: "#6b7280" }}>{customer.company}</div>}
          {customer.email && <div style={{ fontSize: 12, color: "#6b7280" }}>{customer.email}</div>}
          {customer.phone && <div style={{ fontSize: 12, color: "#6b7280" }}>{customer.phone}</div>}
          {customer.address && <div style={{ fontSize: 12, color: "#6b7280" }}>{customer.address}{customer.city ? `, ${customer.city}` : ""}</div>}
        </div>
        <div style={{
          width: 210, background: "#f8fafc", borderRadius: 12,
          padding: "16px 18px", border: "1px solid #e5e7eb"
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Details</div>
          {[
            { label: "Number", value: `#${docNumber}` },
            { label: "Date", value: dayjs(record.created_at).format("DD MMM YYYY") },
            { label: "Status", value: status, color: statusCfg.color },
            record.deal?.deal_name && { label: "Deal", value: record.deal.deal_name },
          ].filter(Boolean).map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: "#9ca3af" }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: row.color || "#111827", textAlign: "right", maxWidth: 110 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#111827" }}>
              {["#", "Description", "Qty", "Unit Price", "Tax %", "Amount"].map((h, i) => (
                <th key={i} style={{
                  padding: "11px 16px", fontSize: 11, color: "#9ca3af",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                  textAlign: i === 0 ? "left" : i >= 2 ? "right" : "left",
                  width: i === 0 ? 36 : i === 2 ? 60 : i === 3 ? 100 : i === 4 ? 70 : "auto"
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {record.items?.length > 0 ? record.items.map((item, i) => {
              const qty = Number(item.quantity || item.qty || 1);
              const unitPrice = Number(item.price || item.unit_price || 0);
              const taxPct = Number(item.tax_percent || 0);
              const lineTotal = Number(item.total || item.amount || (qty * unitPrice));
              const name = item.product_name || item.item_name || "Service";
              const desc = item.description;
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "11px 16px", fontSize: 13, color: "#9ca3af", borderBottom: "1px solid #f0f0f0" }}>{i + 1}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{name}</div>
                    {desc && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{desc}</div>}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, textAlign: "right", color: "#4b5563", borderBottom: "1px solid #f0f0f0" }}>{qty}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, textAlign: "right", color: "#4b5563", borderBottom: "1px solid #f0f0f0" }}>₹{unitPrice.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, textAlign: "right", color: "#4b5563", borderBottom: "1px solid #f0f0f0" }}>{taxPct > 0 ? `${taxPct}%` : "—"}</td>
                  <td style={{ padding: "11px 16px", fontSize: 13, textAlign: "right", fontWeight: 700, color: "#111827", borderBottom: "1px solid #f0f0f0" }}>
                    ₹{lineTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
              );
            }) : (
              <tr style={{ background: "#fff" }}>
                <td style={{ padding: "11px 16px", fontSize: 13, color: "#9ca3af", borderBottom: "1px solid #f0f0f0" }}>1</td>
                <td colSpan={4} style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: "#111827", borderBottom: "1px solid #f0f0f0" }}>
                  {isInvoice ? "Invoice" : "Quotation"} — {record.deal?.deal_name || "Professional Services"}
                </td>
                <td style={{ padding: "11px 16px", fontSize: 13, textAlign: "right", fontWeight: 700, color: "#111827", borderBottom: "1px solid #f0f0f0" }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TOTALS + FOOTER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
        <div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>Thank you for your business 🙏</div>
          {company?.pan_number && <div style={{ fontSize: 11, color: "#9ca3af" }}>PAN: {company.pan_number}</div>}
          {company?.website && <div style={{ fontSize: 11, color: "#9ca3af" }}>{company.website}</div>}
          <div style={{ marginTop: 24, textAlign: "center" }}>
            <div style={{ height: 36, borderBottom: "1px solid #374151", width: 150, marginBottom: 5 }} />
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Authorized Signature</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginTop: 2 }}>{company?.name || ""}</div>
          </div>
        </div>

        <div style={{ width: 270, borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          {[
            { label: "Subtotal", value: `₹${subtotal.toLocaleString("en-IN")}`, show: true },
            { label: "Tax", value: `₹${tax.toLocaleString("en-IN")}`, show: !isInvoice && tax > 0, color: "#374151" },
            { label: "Paid", value: `₹${paid.toLocaleString("en-IN")}`, show: isInvoice && paid > 0, color: "#16a34a" },
            { label: "Balance Due", value: `₹${due.toLocaleString("en-IN")}`, show: isInvoice && due > 0, color: "#dc2626" },
          ].filter(r => r.show).map((r, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 16px", fontSize: 13,
              borderBottom: "1px solid #e5e7eb", color: r.color || "#374151"
            }}>
              <span>{r.label}</span>
              <span style={{ fontWeight: 600 }}>{r.value}</span>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "14px 16px", background: accentGrad,
            color: "#fff", fontSize: 15, fontWeight: 800
          }}>
            <span>Grand Total</span>
            <span>₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

    </div>
  );

  if (directPrint) {
    return (
      <div style={{ 
        position: 'absolute', 
        left: -9999, 
        top: -9999,
        width: 800,
        height: 'auto',
        visibility: 'hidden'
      }}>
        {mainContent}
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      centered
      title={null}
      zIndex={2200}
      styles={{ body: { padding: 0, borderRadius: 16, overflow: "hidden" } }}
      style={{ borderRadius: 16 }}
    >
      {/* ACTION BAR */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            padding: "3px 10px", borderRadius: 20,
            background: statusCfg.bg, color: statusCfg.color,
            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5
          }}>
            {statusCfg.icon} {status}
          </div>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>#{docNumber}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={onClose} size="small" style={{ borderRadius: 8 }}>Close</Button>
          {!isInvoice && status === 'Approved' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<SwapOutlined />} 
              loading={isConverting}
              onClick={handleConvertToInvoice}
              style={{ borderRadius: 8, background: "#7c3aed", borderColor: "#7c3aed" }}>
              Convert to Invoice
            </Button>
          )}
          <Button type="primary" size="small" icon={<PrinterOutlined />} onClick={handlePrint}
            style={{ borderRadius: 8, background: accentColor, borderColor: accentColor }}>
            Print / PDF
          </Button>
        </div>
      </div>

      {/* DOCUMENT BODY */}
      {mainContent}
    </Modal>
  );
}
