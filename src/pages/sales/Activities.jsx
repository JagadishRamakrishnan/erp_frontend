import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Avatar,
  Pagination,
  Grid,
  message,
  Spin,
  Popconfirm,
  Tag
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  WhatsAppOutlined,  EyeOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { Modal, Form, DatePicker } from "antd";
import { activityService, leadService, customerService, dealService } from "../../services";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import ResponsiveTable from "../../components/ResponsiveTable";
const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Activities() {
  const navigate = useNavigate();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [searchText, setSearchText] = useState("");
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [relatedType, setRelatedType] = useState(null);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    fetchActivities();
    fetchLeads();
    fetchCustomers();
    fetchDeals();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await activityService.getAll();
      if (response.success) {
        setActivities(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await leadService.getAll();
      if (response.success) {
        setLeads(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load leads');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load customers');
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await dealService.getAll();
      if (response.success) {
        setDeals(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load deals');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        activity_date: values.activity_date ? values.activity_date.toISOString() : new Date().toISOString()
      };

      const response = editingActivity
        ? await activityService.update(editingActivity.id, formattedValues)
        : await activityService.create(formattedValues);
      
      if (response.success) {
        message.success(editingActivity ? 'Activity updated successfully' : 'Activity created successfully');
        fetchActivities();
        setOpen(false);
        setEditingActivity(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setRelatedType(activity.related_type);
    form.setFieldsValue({
      type: activity.type,
      related_type: activity.related_type,
      related_id: activity.related_id,
      notes: activity.notes,
      activity_date: activity.activity_date ? dayjs(activity.activity_date) : null
    });
    setOpen(true);
  };
const handleView = (activity) => {
  setSelectedActivity(activity);
  setViewOpen(true);
};
  const handleDelete = async (id) => {
    try {
      const response = await activityService.delete(id);
      if (response.success) {
        message.success('Activity deleted successfully');
        fetchActivities();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleAddNew = () => {
    setEditingActivity(null);
    setRelatedType(null);
    form.resetFields();
    setOpen(true);
  };

  const handleRelatedTypeChange = (value) => {
    setRelatedType(value);
    form.setFieldsValue({ related_id: null }); // Reset related_id when type changes
  };

  const getRelatedOptions = () => {
    switch (relatedType) {
      case 'Lead':
        return leads.map(lead => ({
          value: lead.id,
          label: `${lead.name} (${lead.lead_code})`
        }));
      case 'Customer':
        return customers.map(customer => ({
          value: customer.id,
          label: `${customer.name} - ${customer.email || 'No email'}`
        }));
      case 'Deal':
        return deals.map(deal => ({
          value: deal.id,
          label: `${deal.deal_name} (${deal.stage})`
        }));
      default:
        return [];
    }
  };

  // Dutch specific styles mapping 
  const styles = {
    page: { padding: "8px 24px", minHeight: "100vh", width: "100%", background: "#f5f6f8" },
    roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)", border: "none" },
    filterCard: { borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff", padding: "16px 20px", marginBottom: 20 },
    primaryBtn: { borderRadius: 8, fontWeight: 500, height: 40, fontFamily: '"Inter", sans-serif' },
    secondaryBtn: { borderRadius: 8, fontWeight: 500, height: 40, border: "1px solid #d1d5db", background: "#ffffff", fontFamily: '"Inter", sans-serif', color: "#4b5563" },
    kpiCard: { 
      borderRadius: 14, 
      background: "#ffffff", 
      boxShadow: "0 10px 30px rgba(2,6,23,0.06)", 
      padding: "20px",
      border: "none",
      cursor: "pointer"
    }
  };

  // Framer Motion Animation Variants
  const cardAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const layoutAnimation = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } }
  };

  const iconMap = {
    Call: <PhoneOutlined style={{ fontSize: 18, color: "#10b981" }} />,
    Email: <MailOutlined style={{ fontSize: 18, color: "#3b82f6" }} />,
    Meeting: <CalendarOutlined style={{ fontSize: 18, color: "#6366f1" }} />,
    WhatsApp: <WhatsAppOutlined style={{ fontSize: 18, color: "#25d366" }} />
  };

  const bgMap = {
    Call: "#d1fae5",
    Email: "#dbeafe",
    Meeting: "#e0e7ff",
    WhatsApp: "#d1fae5"
  };

  const filteredActivities = activities.filter((item) => {
    const matchSearch = item.notes?.toLowerCase().includes(searchText.toLowerCase()) ||
                       item.type?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === "All" || item.type === filterType;
    return matchSearch && matchType;
  });

  const columns = [
  {
    title: "Type",
    dataIndex: "type",
    align: "center",
    render: (type) => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Avatar
          size={40}
          style={{
            background: bgMap[type],
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          icon={iconMap[type]}
        />
        <span style={{ fontWeight: 600, color: "#111827" }}>{type}</span>
      </div>
    ),
  },

  {
    title: "Notes",
    dataIndex: "notes",
    align: "center",
    render: (text) => (
      <span style={{ color: "#4b5563" }}>
        {text || "N/A"}
      </span>
    ),
  },

  {
    title: "Related To",
    key: "related",
    align: "center",
    render: (_, record) => (
      <span style={{ color: "#4b5563" }}>
        {record.related_type
          ? `${record.related_type} #${record.related_id}`
          : "N/A"}
      </span>
    ),
  },

  {
    title: "Date",
    dataIndex: "activity_date",
    align: "center",
    render: (date) => (
      <span style={{ color: "#4b5563" }}>
        {date
          ? dayjs(date).format("MMM DD, YYYY HH:mm")
          : "N/A"}
      </span>
    ),
  },

  {
    title: "Actions",
    key: "actions",
    align: "center",
    render: (_, record) => (
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        >
          View
        </Button>

        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>

        <Popconfirm
          title="Delete activity"
          description="Are you sure you want to delete this activity?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      </div>
    ),
  },
];
  return (
    <div style={styles.page}>
      {loading && !activities.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* ================= HEADER ================= */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
  <Col style={{ display: "flex", alignItems: "center", gap: 12 }}>
{/*     
    <Button
      type="default"
      onClick={() => navigate("/dashboard")}
      style={{ borderRadius: 8 }}
    >
      ← Back
    </Button> */}

    <div>
      <Title level={2} style={{ margin: 0 }}>
        Activities
      </Title>
      <Text type="secondary">
        Track and manage your daily tasks and meetings
      </Text>
    </div>

  </Col>

  <Col>
    <Button
      type="primary"
      icon={<PlusOutlined />}
      style={styles.primaryBtn}
      onClick={handleAddNew}
    >
      Add Activity
    </Button>
  </Col>
</Row>
          {/* ================= SUMMARY CARDS (Animated) ================= */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title: "Total", count: activities.length, color: "#1677ff", bg: "#1677ff" },
              { title: "Calls", count: activities.filter(a => a.type === 'Call').length, color: "#10b981", bg: "#10b981" },
              { title: "Emails", count: activities.filter(a => a.type === 'Email').length, color: "#3b82f6", bg: "#3b82f6" },
              { title: "Meetings", count: activities.filter(a => a.type === 'Meeting').length, color: "#8b5cf6", bg: "#8b5cf6" },
            ].map((item, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <motion.div
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6, boxShadow: "0 12px 35px rgba(2,6,23,0.12)" }}
                  variants={cardAnimation}
                  style={{ ...styles.kpiCard, borderTop: `4px solid ${item.bg}` }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: '"Inter", sans-serif' }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      marginTop: 10,
                      color: item.color,
                      lineHeight: 1,
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    {item.count}
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* ================= FILTER BAR ================= */}
          <Card variant="borderless" style={styles.filterCard} bodyStyle={{ padding: 0 }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={24} lg={16}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {["All", "Call", "Email", "Meeting", "WhatsApp"].map((type) => (
                    <Button
                      key={type}
                      style={{
                        ...styles.secondaryBtn,
                        ...(filterType === type ? { color: "#1677ff", borderColor: "#1677ff", background: "#f0f5ff" } : {})
                      }}
                      onClick={() => setFilterType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </Col>

              <Col xs={24} sm={24} lg={8} style={{ display: "flex", justifyContent: screens.lg ? "flex-end" : "flex-start" }}>
                <Input
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  placeholder="Search activities..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{
                    width: screens.xs ? "100%" : 280,
                    height: 40,
                    borderRadius: 8,
                    fontFamily: '"Inter", sans-serif'
                  }}
                />
              </Col>
            </Row>
          </Card>

          {/* ================= ACTIVITIES TABLE ================= */}
          <motion.div variants={layoutAnimation} initial="hidden" animate="visible">
            <Card
              variant="borderless"
              style={{ ...styles.roundedCard, padding: 0 }}
            >
              <div style={{ 
                padding: "20px 24px", 
                borderBottom: "1px solid #f0f0f0",
                fontSize: 16, 
                fontWeight: 600, 
                color: "#111827",
                fontFamily: '"Inter", sans-serif'
              }}>
                Activity Timeline ({filteredActivities.length})
              </div>
              <ResponsiveTable
                columns={columns}
                dataSource={filteredActivities}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                renderMobileCard={(record) => (
                  <div>
                    {/* Type with Icon */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <Avatar
                        size={40}
                        style={{
                          background: bgMap[record.type],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        icon={iconMap[record.type]}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
                          {record.type}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>
                          {record.activity_date ? dayjs(record.activity_date).format('MMM DD, YYYY HH:mm') : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: 12, paddingLeft: 8 }}>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Notes:</strong> {record.notes || 'N/A'}
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563" }}>
                        <strong>Related To:</strong> {record.related_type ? `${record.related_type} #${record.related_id}` : 'N/A'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                      >
                        View
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete activity"
                        description="Are you sure?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                          Delete
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>
                )}
              />
            </Card>
          </motion.div>
        </>
      )}

      {/* ================= ADD/EDIT MODAL ================= */}
      <Modal
        title={editingActivity ? "Edit Activity" : "Add Activity"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingActivity(null);
          setRelatedType(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={600}
        zIndex={2000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Activity Type"
                name="type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="Call">Call</Option>
                  <Option value="Email">Email</Option>
                  <Option value="Meeting">Meeting</Option>
                  <Option value="WhatsApp">WhatsApp</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Activity Date"
                name="activity_date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker 
                  showTime 
                  style={{ width: "100%" }} 
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <TextArea rows={4} placeholder="Enter activity notes" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Related To"
                name="related_type"
              >
                <Select 
                  placeholder="Select type" 
                  allowClear
                  onChange={handleRelatedTypeChange}
                >
                  <Option value="Lead">Lead</Option>
                  <Option value="Customer">Customer</Option>
                  <Option value="Deal">Deal</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Related Record"
                name="related_id"
              >
                <Select 
                  placeholder={relatedType ? `Select ${relatedType}` : "Select type first"}
                  disabled={!relatedType}
                  showSearch
                  optionFilterProp="label"
                  allowClear
                  options={getRelatedOptions()}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10}>
            <Col span={12}>
              <Button
                block
                onClick={() => {
                  setOpen(false);
                  setEditingActivity(null);
                  setRelatedType(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>

            <Col span={12}>
              <Button
                type="primary"
                block
                htmlType="submit"
              >
                {editingActivity ? 'Update' : 'Create'} Activity
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
  title="Activity Details"
  open={viewOpen}
  footer={null}
  onCancel={() => setViewOpen(false)}
  centered
>
  {selectedActivity && (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      
      <p><b>Type:</b> {selectedActivity.type}</p>

      <p><b>Notes:</b> {selectedActivity.notes || "N/A"}</p>

      <p>
        <b>Related To:</b>{" "}
        {selectedActivity.related_type
          ? `${selectedActivity.related_type} #${selectedActivity.related_id}`
          : "N/A"}
      </p>

      <p>
        <b>Date:</b>{" "}
        {selectedActivity.activity_date
          ? dayjs(selectedActivity.activity_date).format("MMM DD, YYYY HH:mm")
          : "N/A"}
      </p>

    </div>
  )}
</Modal>
    </div>
  );
}
