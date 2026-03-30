import React, { useState, useEffect } from "react";
import {
  Modal, Tabs, Tag, Avatar, Spin, Empty, Table, Timeline,
  Button, Descriptions, Statistic, Row, Col
} from "antd";
import {
  UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined,
  FileTextOutlined, DollarOutlined, ShoppingOutlined, CalendarOutlined,
  WhatsAppOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, TrophyOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { quotationService, invoiceService, dealService, activityService, noteService, paymentService } from "../services";

dayjs.extend(relativeTime);

const STAGE_COLOR = {
  "Qualification": "#6366f1",
  "Proposal/Price Quote": "#f59e0b",
  "Negotiation/Review": "#ea580c",
  "Closed Won": "#10b981",
  "Closed Lost": "#ef4444",
};

const ACTIVITY_ICON = {
  Call: <PhoneOutlined style={{ color: "#10b981" }} />,
  Email: <MailOutlined style={{ color: "#3b82f6" }} />,
  Meeting: <CalendarOutlined style={{ color: "#f59e0b" }} />,
  WhatsApp: <WhatsAppOutlined style={{ color: "#25D366" }} />,
  "Stage Change": <TrophyOutlined style={{ color: "#6366f1" }} />,
  Note: <FileTextOutlined style={{ color: "#6b7280" }} />,
  Task: <CheckCircleOutlined style={{ color: "#8b5cf6" }} />,
};

export default function CustomerDetailModal({ open, onClose, customer }) {
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activities, setActivities] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (open && customer?.id) {
      loadCustomerData(customer.id);
    }
  }, [open, customer?.id]);

  const loadCustomerData = async (customerId) => {
    setLoading(true);
    try {
      const [dealsRes, quotesRes, invoicesRes, activitiesRes] = await Promise.allSettled([
        dealService.getAll(),
        quotationService.getAll(),
        invoiceService.getAll(),
        activityService.getAll(),
      ]);

      if (dealsRes.status === "fulfilled" && dealsRes.value.success) {
        setDeals((dealsRes.value.data || []).filter(d => d.customer_id === customerId));
      }
      if (quotesRes.status === "fulfilled" && quotesRes.value.success) {
        setQuotes((quotesRes.value.data || []).filter(q => q.customer_id === customerId));
      }
      if (invoicesRes.status === "fulfilled" && invoicesRes.value.success) {
        setInvoices((invoicesRes.value.data || []).filter(inv => inv.customer_id === customerId));
      }
      if (activitiesRes.status === "fulfilled" && activitiesRes.value.success) {
        setActivities((activitiesRes.value.data || []).filter(a =>
          a.related_type === "Customer" && a.related_id === customerId
        ).sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date)));
      }
    } catch (err) {
      console.error("Failed to load customer data", err);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  // Stats
  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const openDeals = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage)).length;
  const wonDeals = deals.filter(d => d.stage === "Closed Won").length;

  const tabItems = [
    {
      key: "overview",
      label: "Overview",
      children: (
        <div>
          {/* Stats bar */}
          <Row gutter={16} style={{ marginBottom: 20 }}>
            {[
              { label: "Total Deals", value: deals.length, color: "#6366f1" },
              { label: "Won", value: wonDeals, color: "#10b981" },
              { label: "Open Deals", value: openDeals, color: "#f59e0b" },
              { label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, color: "#2563eb" },
              { label: "Quotes", value: quotes.length, color: "#7c3aed" },
              { label: "Invoices", value: invoices.length, color: "#ea580c" },
            ].map((s, i) => (
              <Col key={i} xs={12} sm={8} md={4}>
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 16px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Contact details */}
          <Descriptions column={2} bordered size="small" style={{ borderRadius: 12, overflow: "hidden" }}>
            <Descriptions.Item label={<><MailOutlined /> Email</>}>{customer.email || "—"}</Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>{customer.phone || "—"}</Descriptions.Item>
            <Descriptions.Item label={<><ShoppingOutlined /> Company</>}>{customer.company || "—"}</Descriptions.Item>
            <Descriptions.Item label={<><EnvironmentOutlined /> Location</>}>
              {[customer.city, customer.state, customer.country].filter(Boolean).join(", ") || "—"}
            </Descriptions.Item>
            {customer.address && (
              <Descriptions.Item label="Address" span={2}>{customer.address}</Descriptions.Item>
            )}
            <Descriptions.Item label="Customer Since">
              {customer.created_at ? dayjs(customer.created_at).format("DD MMM YYYY") : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Customer Code">{customer.customer_code || "—"}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: "deals",
      label: `Deals (${deals.length})`,
      children: deals.length === 0 ? <Empty description="No deals found" /> : (
        <Table
          dataSource={deals}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            {
              title: "Deal", dataIndex: "deal_name",
              render: (t, r) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{t}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>₹{Number(r.value || 0).toLocaleString("en-IN")}</div>
                </div>
              )
            },
            {
              title: "Stage", dataIndex: "stage",
              render: s => <Tag color={STAGE_COLOR[s] || "default"} style={{ borderRadius: 8, fontSize: 11 }}>{s}</Tag>
            },
            {
              title: "Close Date", dataIndex: "expected_close_date",
              render: d => d ? dayjs(d).format("DD MMM YYYY") : "—"
            },
          ]}
        />
      ),
    },
    {
      key: "quotes",
      label: `Quotes (${quotes.length})`,
      children: quotes.length === 0 ? <Empty description="No quotations found" /> : (
        <Table
          dataSource={quotes}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: "Quote #", dataIndex: "quotation_number", render: t => <span style={{ fontWeight: 600 }}>#{t}</span> },
            {
              title: "Amount", dataIndex: "total_amount",
              render: v => <span style={{ fontWeight: 700, color: "#10b981" }}>₹{Number(v).toLocaleString("en-IN")}</span>
            },
            {
              title: "Status", dataIndex: "status",
              render: s => {
                const colors = { Draft: "default", Sent: "processing", Approved: "success", Rejected: "error" };
                return <Tag color={colors[s]}>{s}</Tag>;
              }
            },
            { title: "Date", dataIndex: "created_at", render: d => dayjs(d).format("DD MMM YYYY") },
          ]}
        />
      ),
    },
    {
      key: "invoices",
      label: `Invoices (${invoices.length})`,
      children: invoices.length === 0 ? <Empty description="No invoices found" /> : (
        <Table
          dataSource={invoices}
          rowKey="id"
          size="small"
          pagination={false}
          columns={[
            { title: "Invoice #", dataIndex: "invoice_number", render: t => <span style={{ fontWeight: 600 }}>#{t}</span> },
            {
              title: "Amount", dataIndex: "total_amount",
              render: v => <span style={{ fontWeight: 700, color: "#7c3aed" }}>₹{Number(v).toLocaleString("en-IN")}</span>
            },
            {
              title: "Status", dataIndex: "status",
              render: s => {
                const colors = { Pending: "warning", Partial: "processing", Paid: "success", Overdue: "error" };
                return <Tag color={colors[s] || "default"}>{s}</Tag>;
              }
            },
            {
              title: "Balance Due", dataIndex: "due_amount",
              render: v => <span style={{ color: Number(v) > 0 ? "#ef4444" : "#10b981", fontWeight: 600 }}>
                ₹{Number(v || 0).toLocaleString("en-IN")}
              </span>
            },
            { title: "Date", dataIndex: "created_at", render: d => dayjs(d).format("DD MMM YYYY") },
          ]}
        />
      ),
    },
    {
      key: "activity",
      label: `Activity (${activities.length})`,
      children: activities.length === 0 ? <Empty description="No activities recorded" /> : (
        <Timeline
          items={activities.map(a => ({
            dot: <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "#f0f2f5", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>{ACTIVITY_ICON[a.type] || <ClockCircleOutlined />}</div>,
            children: (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{a.type}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{dayjs(a.activity_date).fromNow()}</span>
                </div>
                {a.notes && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{a.notes}</div>}
              </div>
            )
          }))}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      title={null}
      style={{ borderRadius: 16 }}
      styles={{ body: { padding: 0 } }}
    >
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        padding: "24px 28px", display: "flex", alignItems: "center", gap: 16, borderRadius: "14px 14px 0 0"
      }}>
        <Avatar
          size={64}
          style={{ backgroundColor: "rgba(255,255,255,0.2)", fontSize: 24, fontWeight: 800, flexShrink: 0 }}
          src={customer.email ? `https://logo.clearbit.com/${customer.email.split("@")[1]}` : null}
        >
          {customer.name?.charAt(0)}
        </Avatar>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{customer.name}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
            {customer.company && <span>{customer.company}</span>}
            {customer.city && <span> · {customer.city}</span>}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {customer.phone && (
              <a href={`https://wa.me/${customer.phone}`} target="_blank" rel="noreferrer"
                style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 12px", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <WhatsAppOutlined /> WhatsApp
              </a>
            )}
            {customer.email && (
              <a href={`mailto:${customer.email}`}
                style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "3px 12px", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <MailOutlined /> Email
              </a>
            )}
          </div>
        </div>
        {/* <div style={{ marginLeft: "auto" }}>
          <Button onClick={onClose} style={{ borderRadius: 8, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff" }}>
            Close
          </Button>
        </div> */}
      </div>

      {/* Content */}
      <div style={{ padding: "0 8px" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}><Spin size="large" /></div>
        ) : (
          <Tabs defaultActiveKey="overview" items={tabItems} style={{ padding: "0 20px" }} />
        )}
      </div>
    </Modal>
  );
}
