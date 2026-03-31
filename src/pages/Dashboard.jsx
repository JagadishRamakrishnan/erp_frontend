import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card, Row, Col, Tag, Spin, message, Button,
  Avatar, Progress, Typography, Grid,
  Pagination
} from "antd";
import { Phone, Users, IndianRupee, Percent, Mail, MessageCircle, FileText, BadgeAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  RightOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

import { activityService, dashboardService, taskService } from "../services";
import ResponsiveTable from "../components/ResponsiveTable";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const { Text } = Typography;
const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const iconAnimation = {
  animate: {
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  }
};
// Temporary icons (replace later with real images)
// const callIcon = "";
// const leadIcon = "";
// const revenueIcon = "";
// const conversionIcon = "";
const styles = {
  statGridCardWrap: {
    borderRadius: 12
  },

  statInner: {
    padding: 20,
    borderRadius: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff"
  },

  statLeft: {
    display: "flex",
    flexDirection: "column"
  },

  statTitle: {
    fontSize: 14
  },

  statValue: {
    fontSize: 24,
    fontWeight: "bold"
  },

  statMeta: {
    fontSize: 12,
    opacity: 0.8
  },

  statIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  statChevron: {
    marginTop: 6
  },

  roundedCard: {
    borderRadius: 12
  }
};

const getPriorityColor = (priority) => {
  const colors = {
    'Low': 'default',
    'Medium': 'warning',
    'High': 'error'
  };
  return colors[priority] || 'default';
};
const getStatusColor = (status) => {
  const colors = {
    'Pending': 'processing',
    'Completed': 'success'
  };
  return colors[status] || 'default';
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        border: '1px solid #f1f5f9',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)'
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          {payload[0].name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: payload[0].payload.fill || payload[0].color }} />
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#3b82f6' }}>
            {payload[0].value} <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Leads</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayActivities, setTodayActivities] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [overdueActivities, setOverdueActivities] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 2;

  const paginatedActivities = todayActivities?.slice(
    (activityPage - 1) * activityPageSize,
    activityPage * activityPageSize
  );

  // Fetch today tasks from backend
  const fetchTodayTasks = async () => {
    try {
      const res = await dashboardService.getTodayTasks();
      setTodayTasks(res.data);
    } catch (err) {
      message.error("Failed to load today's tasks");
    }
  };
  const fetchTodayActivities = async () => {
    try {
      const res = await dashboardService.getTodayActivities();
      setTodayActivities(res.data);
      console.log('Today activities:', res.data);
    } catch (err) {
      message.error("Failed to load today's tasks");
    }
  };
  useEffect(() => {
    fetchDashboardStats();
    fetchTodayActivities();
    fetchTodayTasks();
    fetchOverdueItems();
  }, []);
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getStats();
      if (response.success) {
        setStats(response.data);
        console.log(response.data)
      }
    } catch (error) {
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueItems = async () => {
    try {
      const now = dayjs();
      const [tasksRes, activitiesRes] = await Promise.allSettled([
        taskService.getAll(),
        activityService.getAll(),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value.success) {
        setOverdueTasks([]);
      }

      if (activitiesRes.status === 'fulfilled' && activitiesRes.value.success) {
        const overdue = (activitiesRes.value.data || []).filter(a =>
          a.activity_date && dayjs(a.activity_date).isBefore(now, 'minute')
        );
        setOverdueActivities(overdue);
      }
    } catch (err) {
      console.error('Failed to load overdue items', err);
    }
  };

  const columns = [
    {
      title: "DEAL NAME",
      dataIndex: "deal_name",
      key: "deal_name",
      width: 220,
      render: (text, record) => (
        <div style={{ fontWeight: 600, color: "#111827", fontSize: '12px' }}>
          {text || record.deal_name || 'N/A'}
        </div>
      )
    },
    {
      title: "CUSTOMER",
      key: "customer",
      render: (_, record) => (
        <div style={{ color: "#6b7280", fontSize: '12px', textTransform: "capitalize" }}>
          {record.customer?.name ? record.customer.name.charAt(0).toUpperCase() + record.customer.name.slice(1).toLowerCase() : 'N/A'}
        </div>
      )
    },
    {
      title: "STAGE",
      dataIndex: "stage",
      key: "stage",
      align: "center", // Center headers and content
      render: (stage) => {
        const colors = {
          'Lead': 'blue',
          'Qualified': 'cyan',
          'Proposal': 'orange',
          'Negotiation': 'purple',
          'Won': 'green',
          'Lost': 'red'
        };
        return (
          <Tag variant="filled" color={colors[stage] || 'default'} style={{ borderRadius: 6, fontWeight: 500 }}>
            {stage ? stage.toUpperCase() : 'N/A'}
          </Tag>
        );
      }
    },
    {
      title: "ASSIGNED TO",
      key: "assignedTo",
      align: "right",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ fontSize: '12px', color: '#4b5563' }}>{record.assignedTo?.name || 'Unassigned'}</span>
          <Avatar size={24} style={{ backgroundColor: '#f3f4f6' }} icon={<UserOutlined style={{ color: '#9ca3af' }} />} />
        </div>
      )
    }
  ];

  const taskColumns = [
    {
      title: "Task",
      dataIndex: "title",
      align: "left", // keep task left like customer avatar column
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {record.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },

    {
      title: "Priority",
      dataIndex: "priority",
      align: "center",
      render: (priority) => (
        <Tag variant="filled" color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <Tag variant="filled" color={getStatusColor(status)}>{status}</Tag>
      ),
    },

    {
      title: "Assigned To",
      align: "center",
      render: (_, record) => (
        <span>{record.assignedTo?.name || "Unassigned"}</span>
      ),
    },

    {
      title: "Related To",
      align: "center",
      render: (_, record) => (
        <span>
          {record.related_type
            ? `${record.related_type} #${record.related_id}`
            : "N/A"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: 24 }}>
        <p>Failed to load dashboard data</p>
      </div>
    );
  }

  const cardData = [
    {
      title: "Total Customers",
      value: stats.overview?.totalCustomers || 0,
      icon: <UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
      color: "#1890ff"
    },
    {
      title: "Pending Task",
      value: stats.overview?.totalLeads || 0,
      icon: <ShoppingOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
      color: "#52c41a"
    },
    {
      title: "Total Deals",
      value: stats.overview?.totalDeals || 0,
      icon: <RiseOutlined style={{ fontSize: 24, color: "#faad14" }} />,
      color: "#faad14"
    },
    {
      title: "Open Tickets",
      value: `₹${(stats.revenue?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: <IndianRupee style={{ fontSize: 24, color: "#f5222d" }} />,
      color: "#f5222d"
    }
  ];
  const data = stats?.recent?.deals || [];
  return (
    <div className="min-h-screen bg-[#f5f6f8] py-4 px-2 md:px-6">
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>Dashboard</h1>


      {/* KPI CARDS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            style={styles.statGridCardWrap}
            onClick={() => navigate("/activities")}
          >
            <div style={{ ...styles.statInner, background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
              <div style={styles.statLeft}>
                <div style={styles.statTitle}>Total Activities</div>
                <div style={styles.statValue}>{stats.overview?.totalActivities || 0}</div>
                <div style={styles.statMeta}>Total tracked activities</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                <div
                  style={{
                    ...styles.statIconCircle,
                    background: "transparent"
                  }}
                >
                  <motion.div animate={iconAnimation.animate}>
                    <Phone size={28} color="white" />
                  </motion.div>
                </div>
                <div style={styles.statChevron}>
                  <RightOutlined style={{ color: "rgba(255,255,255,0.9)" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            style={styles.statGridCardWrap}
            onClick={() => navigate("/products")}
          >
            <div style={{ ...styles.statInner, background: "linear-gradient(135deg,#ff8a00,#ff5e3a)" }}>
              <div style={styles.statLeft}>
                <div style={styles.statTitle}>Total Leads</div>
                <div style={styles.statValue}>{stats.overview?.totalLeads || 0}</div>
                <div style={styles.statMeta}>Total created</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>

                <div style={{ ...styles.statIconCircle, background: "rgba(255,138,0,0.25)" }}>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    <Users size={28} color="#fde68a" />
                  </motion.div>
                </div>

                <div style={styles.statChevron}>
                  <RightOutlined style={{ color: "rgba(255,255,255,0.9)" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            style={styles.statGridCardWrap}
            onClick={() => navigate("/invoices")}
          >
            <div style={{ ...styles.statInner, background: "linear-gradient(135deg,#1e3a8a,#3b82f6)" }}>
              <div style={styles.statLeft}>
                <div style={styles.statTitle}>Total Revenue</div>
                <div style={styles.statValue}>₹{((stats.revenue?.totalRevenue || 0) / 100000).toFixed(1)}L</div>
                <div style={styles.statMeta}>Closed deals amount</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                <div
                  style={{
                    ...styles.statIconCircle,
                    background: "transparent"
                  }}
                >
                  <motion.div animate={iconAnimation.animate}>
                    {/* <img
  src={revenueIcon}
  alt="activities"
  style={{
    width: 26,
    height: 26
  }}
/> */}
                    <IndianRupee size={28} color="#bfdbfe" />
                  </motion.div>
                </div>
                <div style={styles.statChevron}>
                  <RightOutlined style={{ color: "rgba(255,255,255,0.9)" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </Col>

        <Col xs={24} sm={12} md={12} lg={6}>
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.05 }}
            style={styles.statGridCardWrap}
            onClick={() => navigate("/reports")}
          >
            <div style={{ ...styles.statInner, background: "linear-gradient(135deg,#059669,#34d399)" }}>
              <div style={styles.statLeft}>
                <div style={styles.statTitle}>Conversion Rate</div>
                <div style={styles.statValue}>{stats.deals?.conversionRate || 0}%</div>
                <div style={styles.statMeta}>Deal conversion</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                <div
                  style={{
                    ...styles.statIconCircle,
                    background: "transparent"
                  }}
                >
                  <motion.div animate={iconAnimation.animate}>
                    {/* <img
  src={conversionIcon}
  alt="activities"
  style={{
    width: 26,
    height: 26
  }}
/> */}
                    <Percent size={28} color="#bbf7d0" />
                  </motion.div>
                </div>
                <div style={styles.statChevron}>
                  <RightOutlined style={{ color: "rgba(255,255,255,0.9)" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* SECOND ROW */}
      {/* <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={14}>
  <motion.div
    variants={cardAnimation}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -6 }}
  >
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                 <span style={{ fontSize: 16, fontWeight: 600 }}>Recent Deals</span>
              </div>
            }
            variant="borderless"
            style={styles.roundedCard}
            styles={{ header: { borderBottom: "1px solid #f0f0f0", padding: "16px 24px" } }}
          >
          
            {!screens.xs && !screens.sm && (
              <Table 
                columns={columns} 
                dataSource={data} 
                pagination={false} 
                size="small"
              />
            )}

            
            {(screens.xs || screens.sm) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      border: "1px solid #f1f5f9",
                      padding: 16,
                      borderRadius: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{item.company}</div>
                    <div style={{ marginTop: 8 }}>
                      <b>Stage:</b> {item.stage}
                    </div>
                    <div style={{ color: "#10b981", fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
</Col>

        <Col xs={24} lg={10}>
  <motion.div
    variants={cardAnimation}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -6 }}
  >
  <Card
             title={<span style={{ fontSize: 16, fontWeight: 600 }}>Sales Performance</span>}
            variant="borderless"
            style={styles.roundedCard}
            styles={{ header: { borderBottom: "1px solid #f0f0f0", padding: "16px 24px" } }}
          >
            <div style={{ marginBottom: 6 }}>
              <Text strong>Monthly Target</Text>
            </div>
            <Progress percent={72} status="active" />
            
            <div style={{ marginTop: 20, marginBottom: 6 }}>
              <Text strong>Customer Satisfaction</Text>
            </div>
            <Progress percent={85} strokeColor="#10b981" />
          </Card>
        </motion.div>
</Col>
      </Row> */}

      {/* THIRD ROW */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6 }}
          >
            {/* Recent Deals Table */}
            <Card
              title="Recent Deals"
              variant="borderless"
              style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            >
              <ResponsiveTable
                dataSource={stats.recent?.deals || []}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 3 }}
                renderMobileCard={(record) => {
                  const colors = {
                    'Lead': 'blue',
                    'Qualified': 'cyan',
                    'Proposal': 'orange',
                    'Negotiation': 'purple',
                    'Won': 'green',
                    'Lost': 'red'
                  };

                  return (
                    <div className="flex flex-col gap-3 py-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-[14px] text-gray-900 leading-tight uppercase mb-0.5">{record.deal_name}</div>
                          <div className="text-[12px] text-gray-400 font-medium">{record.customer?.name || 'No Customer'}</div>
                        </div>
                        <Tag variant="filled" color={colors[record.stage] || 'default'} style={{ borderRadius: 6, margin: 0, fontSize: 10 }}>
                          {record.stage?.toUpperCase()}
                        </Tag>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          <Avatar size={24} icon={<UserOutlined />} className="bg-gray-100 text-gray-400" />
                          <span className="text-[12px] text-gray-600 font-semibold">{record.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                        <div className="text-[16px] font-extrabold text-indigo-600">
                          ₹{(record.value || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </Card>

            {/* <Card
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Top Sales Agents</span>}
            variant="borderless"
            style={styles.roundedCard}
            styles={{ header: { borderBottom: "1px solid #f0f0f0", padding: "16px 24px" } }}
          >
            {stats.topSalesAgents && stats.topSalesAgents.length > 0 ? (
              stats.topSalesAgents.map((agent, idx) => (
                <div key={agent.userId} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: idx < stats.topSalesAgents.length - 1 ? "1px solid #f0f0f0" : "none" 
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                     <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                     <div>
                       <Text strong>{agent.name}</Text>
                       <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                         {agent.dealCount} {agent.dealCount === 1 ? 'deal' : 'deals'} closed
                       </div>
                     </div>
                  </div>
                  <Text strong>
                    ₹{(agent.totalValue / 1000).toFixed(0)}K
                  </Text>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                No sales data available
              </div>
            )}
          </Card> */}
          </motion.div>
        </Col>

        <Col xs={24} md={12}>
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            className="h-full"
            whileHover={{ y: -6 }}
          >
            <Card
              title={<span style={{ fontSize: 16, fontWeight: 600 }}>Today's Activities</span>}
              variant="borderless"
              className="h-full"
              style={styles.roundedCard}
              styles={{ header: { borderBottom: "1px solid #f0f0f0", padding: "16px 24px" } }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {todayActivities && todayActivities.length > 0 ? (
                  <>
                    {paginatedActivities.map((activity, index) => {
                      const icons = {
                        Call: <Phone size={18} />,
                        Email: <Mail size={18} />,
                        Meeting: <Users size={18} />,
                        WhatsApp: <MessageCircle size={18} />
                      };

                      const backgrounds = {
                        Call: '#fee2e2',
                        Email: '#e0f2fe',
                        Meeting: '#fef9c3',
                        WhatsApp: '#dcfce7'
                      };

                      return (
                        <div
                          key={activity.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#f9fafb",
                            padding: "12px 16px",
                            borderRadius: 12,
                            border: "1px solid #f1f5f9",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate("/activities")}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                            {/* Icon */}
                            <div
                              style={{
                                height: 36,
                                width: 36,
                                borderRadius: 10,
                                background: backgrounds[activity.type] || '#f3f4f6',
                                display: "flex",
                                alignItems: "center",
                                flexShrink: "0",
                                justifyContent: "center",
                                fontSize: 18,
                              }}
                            >
                              {icons[activity.type] || <FileText size={18} />}
                            </div>

                            {/* Content */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div style={{ fontWeight: 500 }}>
                                  {activity.type} - {activity.related_type} #{activity.related_id}
                                </div>

                                <div style={{ fontSize: 12, color: "gray" }}>
                                  {dayjs(activity.activity_date).format("DD MMM, hh:mm A")}
                                </div>
                              </div>

                              {activity.notes && (
                                <div style={{ fontSize: 12, color: "#6b7280" }}>
                                  {activity.notes.length > 60
                                    ? activity.notes.slice(0, 60) + "..."
                                    : activity.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "end",
                        marginTop: 12,
                      }}
                    >
                      <Pagination
                        current={activityPage}
                        pageSize={activityPageSize}
                        total={todayActivities.length}
                        onChange={(page) => setActivityPage(page)}
                        size="small"
                        showSizeChanger={false}
                        style={{
                          background: "#fff",
                          padding: "6px 12px",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </>

                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                    No activities for today, Call Leads
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
      {/* Forth ROW */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* Todays Task Card */}
        <Col xs={24} md={24}>
          <motion.div variants={cardAnimation} initial="hidden" animate="visible" whileHover={{ y: -6 }}>
            <Card
              title="Today's Tasks"
              style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
              variant="borderless"
            >
              <ResponsiveTable
                dataSource={todayTasks || []} // ✅ use todayTasks state
                columns={taskColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                renderMobileCard={(record) => {
                  const colors = {
                    'Lead': 'blue',
                    'Qualified': 'cyan',
                    'Proposal': 'orange',
                    'Negotiation': 'purple',
                    'Won': 'green',
                    'Lost': 'red'
                  };

                  return (
                    <div>
                      <div className="text-black" style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 8 }}>
                        {record.title}
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Assigned To:</strong> {record.assignedTo?.name || 'Unassigned'}
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Due Date:</strong> {new Date(record.due_date).toLocaleDateString('en-IN')}
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563" }}>
                        <strong>Status:</strong> {record.status}
                      </div>
                    </div>
                  );
                }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* DEAL STAGE SUMMARY */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            className="h-full"
            whileHover={{ y: -6 }}
          >

            <Card
              title={<span style={{ fontSize: 16, fontWeight: 600 }}>Deal Stage Overview</span>}
              variant="borderless"
              style={styles.roundedCard}
              className="h-full"
              styles={{ header: { borderBottom: "1px solid #f0f0f0", padding: "16px 24px" } }}
            >
              {stats.breakdown?.dealsByStage?.map((stage, index) => {
                const colors = {
                  'Lead': '#3b82f6',
                  'Qualified': '#8b5cf6',
                  'Proposal': '#f97316',
                  'Negotiation': '#f59e0b',
                  'Won': '#10b981',
                  'Lost': '#ef4444'
                };
                const totalDeals = stats.overview?.totalDeals || 1;
                const percent = Math.round((stage.count / totalDeals) * 100);

                return (
                  <div key={stage.stage}>
                    <div style={{ marginTop: index > 0 ? 12 : 0, marginBottom: 6 }}>
                      <Text strong>{stage.stage} ({stage.count})</Text>
                    </div>
                    <Progress percent={percent} strokeColor={colors[stage.stage] || '#3b82f6'} />
                  </div>
                );
              })}
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={12}>
          <motion.div
            variants={cardAnimation}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6 }}
          >
            <Card
              title={<span style={{ fontSize: 16, fontWeight: 600 }}>Lead Progress</span>}
              variant="borderless"
              style={styles.roundedCard}
              styles={{ header: { borderBottom: "1px solid #f0f0f0", padding: "16px 24px" }, body: { display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' } }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: screens.xs ? "column" : "row",
                  flexWrap: "wrap",
                  gap: 40,
                  padding: "10px 0"
                }}
              >
                {/* Multi-color Donut Chart */}
                <div style={{ width: 220, height: 220, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.breakdown?.leadsByStatus?.map((lead, index) => ({
                          name: lead.status,
                          value: lead.count
                        })) || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.breakdown?.leadsByStatus?.map((entry, index) => {
                          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: 28, fontWeight: '800', color: '#111827', lineHeight: 1 }}>
                      {stats.overview?.totalLeads || 0}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Leads
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    fontSize: 14,
                    justifyContent: "center",
                    minWidth: 160
                  }}
                >
                  {stats.breakdown?.leadsByStatus?.map((lead, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                    const totalLeads = stats.overview?.totalLeads || 1;
                    const percent = Math.round((lead.count / totalLeads) * 100);

                    return (
                      <div key={lead.status} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: colors[index % colors.length],
                          boxShadow: `0 0 10px ${colors[index % colors.length]}40`
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1, gap: 12 }}>
                          <span style={{ color: '#4b5563', fontWeight: 600 }}>{lead.status}</span>
                          <span style={{ color: '#9ca3af', fontWeight: 500 }}>{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
      {/* OVERDUE ALERTS */}
      {(overdueTasks.length > 0 || overdueActivities.length > 0) && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <motion.div variants={cardAnimation} initial="hidden" animate="visible">
              <Card
                variant="borderless"
                style={{
                  borderRadius: 14, border: '1px solid #ffffffff',
                  background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)',
                  boxShadow: '0 4px 20px rgba(239,68,68,0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: '#fef2f2', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0
                  }}>
                    <BadgeAlert style={{ color: '#ef4444', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                      Overdue Follow-ups
                      <span style={{
                        marginLeft: 10, background: '#ef4444', color: '#fff',
                        borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700
                      }}>{overdueActivities.length}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{overdueActivities.length} activities need your attention</div>
                  </div>
                  <Button
                    size="small"
                    type="link"
                    style={{ marginLeft: 'auto', color: '#ef4444' }}
                    onClick={() => navigate('/activities', { state: { activeTab: 'overdue' } })}
                  >
                    View All →
                  </Button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {overdueActivities.slice(0, 6).map(act => (
                    <div key={act.id} style={{
                      background: '#fff', border: '1px solid #fca5a5',
                      borderRadius: 10, padding: '8px 14px', fontSize: 13
                    }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}><Tag color="red" style={{ fontSize: 10, height: 18, lineHeight: '16px' }}>Act</Tag> {act.type}</div>
                      <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>
                        {dayjs(act.activity_date).fromNow()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24, marginTop: 16 }}>
        {cardData.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderLeft: `4px solid ${card.color}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, color: "#8c8c8c", fontSize: 14 }}>{card.title}</p>
                  <h2 style={{ margin: "8px 0 0 0", fontSize: 28, fontWeight: "bold" }}>
                    {card.value}
                  </h2>
                </div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: `${card.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {card.icon}
                </div>

              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Additional Stats Row */}
      {/* <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <p style={{ margin: 0, color: "#8c8c8c", fontSize: 14 }}>Pending Tasks</p>
            <h2 style={{ margin: "8px 0 0 0", fontSize: 28, fontWeight: "bold", color: "#faad14" }}>
              {stats.tasks?.pending || 0}
            </h2>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <p style={{ margin: 0, color: "#8c8c8c", fontSize: 14 }}>Open Tickets</p>
            <h2 style={{ margin: "8px 0 0 0", fontSize: 28, fontWeight: "bold", color: "#f5222d" }}>
              {stats.breakdown?.ticketsByStatus?.find(t => t.status === 'Open')?.count || 0}
            </h2>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <p style={{ margin: 0, color: "#8c8c8c", fontSize: 14 }}>Total Invoices</p>
            <h2 style={{ margin: "8px 0 0 0", fontSize: 28, fontWeight: "bold", color: "#722ed1" }}>
              {stats.overview?.totalInvoices || 0}
            </h2>
          </Card>
        </Col>
         <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <p style={{ margin: 0, color: "#8c8c8c", fontSize: 14 }}>Conversion Rate</p>
            <h2 style={{ margin: "8px 0 0 0", fontSize: 28, fontWeight: "bold", color: "#52c41a" }}>
              {stats.deals?.conversionRate || 0}%
            </h2>
          </Card>
        </Col> 
      </Row> */}

      {/* Recent Deals Table */}
      {/* <Card
        title="Recent Deals"
        style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <ResponsiveTable
          dataSource={stats.recent?.deals || []}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          renderMobileCard={(record) => {
            const colors = {
              'Lead': 'blue',
              'Qualified': 'cyan',
              'Proposal': 'orange',
              'Negotiation': 'purple',
              'Won': 'green',
              'Lost': 'red'
            };
            
            return (
              <div>
                
                <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 8 }}>
                  {record.deal_name}
                </div>

                
                <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                  <strong>Customer:</strong> {record.customer?.name || 'N/A'}
                </div>

                
                <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                  <strong>Value:</strong> ₹{(record.value || 0).toLocaleString('en-IN')}
                </div>

                
                <div style={{ marginBottom: 4 }}>
                  <strong style={{ fontSize: 13, color: "#4b5563" }}>Stage:</strong>{' '}
                  <Tag color={colors[record.stage] || 'default'} style={{ marginLeft: 4 }}>
                    {record.stage}
                  </Tag>
                </div>

               
                <div style={{ fontSize: 13, color: "#4b5563" }}>
                  <strong>Assigned To:</strong> {record.assignedTo?.name || 'Unassigned'}
                </div>
              </div>
            );
          }}
        />
      </Card> */}
    </div>
  );
}
