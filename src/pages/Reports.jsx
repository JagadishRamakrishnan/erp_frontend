import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel,
  LabelList, Legend
} from "recharts";
import { Target, TrendingUp, Users, IndianRupee, ArrowUp, Activity, Download, Timer, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Typography, Spin, message, Tag, Progress, Button } from "antd";
import { reportsService } from "../services";
import ResponsiveTable from "../components/ResponsiveTable";

const { Title, Text } = Typography;

const ACTIVITY_COLORS = {
  Call: "#10b981", Email: "#3b82f6", Meeting: "#f59e0b",
  WhatsApp: "#25D366", Note: "#6b7280", Task: "#8b5cf6"
};

const cardAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" } })
};

const layoutAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut", delay: 0.2 } }
};

const FUNNEL_COLORS = ["#6366f1", "#3b82f6", "#f59e0b", "#8b5cf6", "#10b981", "#ef4444"];

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => { fetchReportsData(); }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const response = await reportsService.getReports();
      if (response.success) setData(response.data);
    } catch (err) {
      message.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const blob = await reportsService.export(type);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success(`${type} report downloaded`);
    } catch (err) {
      message.error("Export failed");
    }
  };

  const kpi = data?.kpiMetrics || {};
  const revenueData = data?.revenueTrend || [];
  const dealData = data?.dealsTrend || [];
  const topPerformers = data?.topPerformers || [];
  const funnel = data?.conversionFunnel || [];
  const activityBreakdown = data?.activityBreakdown || [];
  const leadSources = data?.leadSourceAnalysis || [];

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}><Spin size="large" /></div>;
  }

  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ background: "#f5f6f8" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Reports & Analytics</Title>
        <Text type="secondary">Track your sales performance, conversions, and team activity</Text>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 w-full">
          {[
            { title: "Win Rate", value: kpi.winRate || "0%", icon: <Target size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
            { title: "Avg Deal", value: kpi.avgDealSize || "₹0K", icon: <IndianRupee size={18} />, color: "text-violet-600", bg: "bg-violet-50" },
            { title: "Cycle", value: kpi.salesCycle || "0 days", icon: <Timer size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Conv Rate", value: kpi.conversionRate || "0%", icon: <Zap size={18} />, color: "text-amber-600", bg: "bg-amber-50" },
            { title: "Active", value: kpi.activeLeads || "0", icon: <Users size={18} />, color: "text-orange-600", bg: "bg-orange-50" },
            { title: "Revenue", value: kpi.totalRevenue || "₹0L", icon: <Activity size={18} />, color: "text-green-600", bg: "bg-green-50" },
          ].map((item, i) => (
            <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={cardAnimation}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className={`${item.bg} ${item.color} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>{item.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{item.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>{item.title}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* REVENUE + DEALS CHARTS */}
      <motion.div initial="hidden" animate="visible" variants={layoutAnimation}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Revenue Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3}
                dot={{ r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Deals Won vs Lost (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dealData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Legend />
              <Bar dataKey="won" name="Won" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="lost" name="Lost" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* CONVERSION FUNNEL + ACTIVITY BREAKDOWN */}
      <motion.div initial="hidden" animate="visible" variants={layoutAnimation}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* LEAD CONVERSION FUNNEL */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Lead Conversion Funnel</h3>
            <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, background: "#f0fdf4", padding: "2px 8px", borderRadius: 12 }}>
              Avg {data?.conversionAnalysis?.avgDaysToConvert} Days to Win
            </div>
          </div>
          {funnel.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>No data available</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {funnel.map((stage, i) => {
                const maxCount = Math.max(...funnel.map(f => f.count)) || 1;
                const pct = Math.round((stage.count / maxCount) * 100);
                return (
                  <div key={stage.stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>{stage.stage}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}>
                        {stage.count}
                      </span>
                    </div>
                    <Progress
                      percent={pct}
                      strokeColor={FUNNEL_COLORS[i % FUNNEL_COLORS.length]}
                      showInfo={false}
                      strokeWidth={8}
                      style={{ margin: 0 }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVITY BREAKDOWN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Activity Breakdown (This Month)</h3>
          {activityBreakdown.every(a => a.count === 0) ? (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>No activities recorded this month</div>
          ) : (
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={activityBreakdown.filter(a => a.count > 0)} cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70} dataKey="count" stroke="none">
                    {activityBreakdown.map((a, i) => (
                      <Cell key={i} fill={ACTIVITY_COLORS[a.type] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [`${val} (${activityBreakdown.find(a => a.type === name)?.pct}%)`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {activityBreakdown.map((a, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: ACTIVITY_COLORS[a.type] || "#6b7280" }} />
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{a.type}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>{a.count} ({a.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ACTIVITY REPORT TABLE + EXPORTS */}
      <motion.div initial="hidden" animate="visible" variants={layoutAnimation}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Team Activity Report</h3>
            <Tag color="blue" icon={<Activity size={12} />} style={{ borderRadius: 6 }}>All Users</Tag>
          </div>
          <ResponsiveTable
            columns={[
              {
                title: "Member",
                dataIndex: "name",
                render: (name) => <span className="font-bold text-gray-800 text-sm">{name}</span>
              },
              {
                title: "Calls",
                dataIndex: "calls",
                align: "center",
                render: (v) => <span className="text-gray-600 font-medium">{v}</span>
              },
              {
                title: "Emails",
                dataIndex: "emails",
                align: "center",
                render: (v) => <span className="text-gray-600 font-medium">{v}</span>
              },
              {
                title: "Meetings",
                dataIndex: "meetings",
                align: "center",
                render: (v) => <span className="text-gray-600 font-medium">{v}</span>
              },
              {
                title: "Total",
                dataIndex: "total",
                align: "right",
                render: (v) => <Tag color="purple" style={{ borderRadius: 6, margin: 0 }}>{v}</Tag>
              }
            ]}
            dataSource={data?.activityReport || []}
            rowKey="name"
            pagination={{ pageSize: 5 }}
            renderMobileCard={(user) => (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-[15px]">{user.name}</span>
                  <Tag color="purple" style={{ borderRadius: 6, margin: 0, fontWeight: 800 }}>{user.total} TOTAL</Tag>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Calls</div>
                    <div className="text-[13px] font-bold text-emerald-600">{user.calls}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Emails</div>
                    <div className="text-[13px] font-bold text-blue-600">{user.emails}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center border border-gray-100">
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Meetings</div>
                    <div className="text-[13px] font-bold text-amber-600">{user.meetings}</div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Export Reports</h3>
          <div className="flex flex-col gap-3">
            <Button icon={<Download size={16} />} block size="large" onClick={() => handleExport('deals')}>
              Download Deals CSV
            </Button>
            <Button icon={<Download size={16} />} block size="large" onClick={() => handleExport('leads')}>
              Download Leads CSV
            </Button>
            <Button icon={<Download size={16} />} block size="large" onClick={() => handleExport('revenue')}>
              Download Revenue CSV
            </Button>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Zap size={16} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Pro Tip</span>
            </div>
            <Text style={{ fontSize: 12, color: "#3b82f6", lineHeight: 1.5 }}>
              Weekly reports are automatically sent to your email every Monday at 9:00 AM.
            </Text>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
