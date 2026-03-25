import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card, Row, Col, Tag, Spin, message, Button,
  Avatar, Progress, Typography, Grid
} from "antd";
import { Phone, Users, IndianRupee, Percent, Mail, MessageCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  RightOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";

import { dashboardService } from "../services";
import ResponsiveTable from "../components/ResponsiveTable";

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
export default function Dashboard() {
  const navigate = useNavigate();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayActivities, setTodayActivities] = useState([]);


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
    fetchTodayTasks(); // fetch today tasks
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
      <div style={{ color: "#6b7280", fontSize: '12px',textTransform:"capitalize" }}>
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
      icon: <DollarOutlined style={{ fontSize: 24, color: "#f5222d" }} />,
      color: "#f5222d"
    }
  ];
  const data = stats?.recent?.deals || [];
  return (
    <div style={{ padding: "24px 32px", background: "#f5f6f8", minHeight: "100vh" }}>
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
                    <div>
                      {/* Deal Name */}
                      <div style={{ fontWeight: 600, fontSize: 12, color: "#111827", marginBottom: 8 }}>
                        {record.deal_name}
                      </div>

                      {/* Customer */}
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4,textTransform:"capitalize" }}>
                        <strong>Customer:</strong> {record.customer?.name ? record.customer.name.charAt(0).toUpperCase() + record.customer.name.slice(1).toLowerCase() : 'N/A'}
                      </div>

                      {/* Value */}
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Value:</strong> ₹{(record.value || 0).toLocaleString('en-IN')}
                      </div>

                      {/* Stage */}
                      <div style={{ marginBottom: 4 }}>
                        <strong style={{ fontSize: 13, color: "#4b5563" }}>Stage:</strong>{' '}
                        <Tag variant="filled" color={colors[record.stage] || 'default'} style={{ marginLeft: 4 }}>
                          {record.stage}
                        </Tag>
                      </div>

                      {/* Assigned To */}
                      <div style={{ fontSize: 13, color: "#4b5563" }}>
                        <strong>Assigned To:</strong> {record.assignedTo?.name || 'Unassigned'}
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
            whileHover={{ y: -6 }}
          >
            <Card
              title={<span style={{ fontSize: 16, fontWeight: 600 }}>Today's Activities</span>}
              variant="borderless"
              style={styles.roundedCard}
              styles={{ header: { borderBottom: "1px solid #f0f0f0", padding: "16px 24px" } }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {todayActivities && todayActivities.length > 0 ? (
                  todayActivities.map((activity, index) => {
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
                        }}
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
                              justifyContent: "center",
                              fontSize: 18,
                            }}
                          >
                            {icons[activity.type] || <FileText size={18} />}
                          </div>

                          {/* Content */}
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {activity.type} - {activity.related_type} #{activity.related_id}
                            </div>

                            <div style={{ fontSize: 12, color: "gray" }}>
                              {dayjs(activity.activity_date).format("DD MMM, hh:mm A")}
                            </div>

                            {activity.notes && (
                              <div style={{ fontSize: 12, color: "#6b7280" }}>
                                {activity.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#8c8c8c' }}>
                    No activities for today
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
            whileHover={{ y: -6 }}
          >

            <Card
              title={<span style={{ fontSize: 16, fontWeight: 600 }}>Deal Stage Overview</span>}
              variant="borderless"
              style={styles.roundedCard}
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
              title={<span style={{ fontSize: 16, fontWeight: 600 }}>Lead Sources</span>}
              variant="borderless"
              style={styles.roundedCard}
              styles={{ header: { borderBottom: "1px solid #f0f0f0", padding: "16px 24px" }, body: { display: 'flex', flexDirection: 'column', justifyContent: 'center' } }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: screens.xs ? "column" : "row",
                  gap: 60,
                  padding: "10px 0"
                }}
              >
                {/* Donut Chart */}
                <Progress
                  type="circle"
                  percent={stats.breakdown?.leadsByStatus?.length > 0 ? 100 : 0}
                  strokeWidth={12}
                  strokeColor="#3b82f6"
                  format={() => stats.overview?.totalLeads || 0}
                  size={160}
                />
                {/* Legend */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    fontSize: 14,
                    justifyContent: "center"
                  }}
                >
                  {stats.breakdown?.leadsByStatus?.map((lead, index) => {
                    const colors = ['#3b82f6', '#ec4899', '#6366f1', '#f59e0b', '#10b981'];
                    const totalLeads = stats.overview?.totalLeads || 1;
                    const percent = Math.round((lead.count / totalLeads) * 100);

                    return (
                      <div key={lead.status}>
                        <span style={{ color: colors[index % colors.length], marginRight: 8, fontSize: 18 }}>●</span>
                        {lead.status} ({percent}%)
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24, marginTop: 44 }}>
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
