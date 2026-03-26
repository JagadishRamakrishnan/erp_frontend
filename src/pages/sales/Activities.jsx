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
  WhatsAppOutlined, EyeOutlined, TrophyOutlined, FileTextOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { Modal, Form, DatePicker } from "antd";
import { activityService, leadService, customerService, dealService } from "../../services";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import ResponsiveTable from "../../components/ResponsiveTable";
import LeadDetailsModal from "../../components/LeadDetailsModal";

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
  const [bulkOpen, setBulkOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedLeadForModal, setSelectedLeadForModal] = useState(null);
  const [leadLoading, setLeadLoading] = useState(false);

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
        const sorted = (response.data || []).sort(
          (a, b) => new Date(b.activity_date) - new Date(a.activity_date)
        );
        setActivities(sorted);
      }
    } catch (error) {
      message.error("Failed to load activities");
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

  const handleView = async (activity) => {
    if (activity.related_type === 'Lead' && activity.related_id) {
      setLeadLoading(true);
      try {
        const resp = await leadService.getById(activity.related_id);
        if (resp.success) {
          setSelectedLeadForModal(resp.data);
          setLeadModalOpen(true);
        } else {
          message.warning("Could not load lead details");
          setSelectedActivity(activity);
          setViewOpen(true);
        }
      } catch (err) {
        console.error(err);
        setSelectedActivity(activity);
        setViewOpen(true);
      } finally {
        setLeadLoading(false);
      }
    } else {
      setSelectedActivity(activity);
      setViewOpen(true);
    }
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
    form.setFieldsValue({ related_id: null });
  };

  const handleLeadDelete = async (id) => {
    try {
      const resp = await leadService.delete(id);
      if (resp.success) {
        message.success("Lead deleted successfully");
        fetchActivities();
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to delete lead");
    }
  };

  const handleActionRedirect = (lead, action) => {
    message.loading({ content: `Redirecting to leads for ${action}...`, key: 'redir' });
    navigate("/leads", { state: { autoAction: action, autoLeadId: lead.id } });
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
    Call: <PhoneOutlined style={{ fontSize: 16, color: "#10b981" }} />,
    Email: <MailOutlined style={{ fontSize: 16, color: "#3b82f6" }} />,
    Meeting: <CalendarOutlined style={{ fontSize: 16, color: "#f59e0b", marginTop: "-2px" }} />,
    WhatsApp: <WhatsAppOutlined style={{ fontSize: 16, color: "#25d366" }} />,
    'Stage Change': <TrophyOutlined style={{ fontSize: 16, color: "#6366f1" }} />,
    Note: <FileTextOutlined style={{ fontSize: 16, color: "#6b7280" }} />,
    Task: <CheckCircleOutlined style={{ fontSize: 16, color: "#8b5cf6" }} />
  };

  const bgMap = {
    Call: "#ecfdf5",
    Email: "#eff6ff",
    Meeting: "#fffbeb",
    WhatsApp: "#ecfdf5",
    'Stage Change': "#eef2ff",
    Note: "#f9fafb",
    Task: "#f5f3ff"
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
      render: (type) => {
        let color = "default";
        if (type === "Call") color = "green";
        if (type === "Meeting") color = "gold";
        if (type === "Email") color = "blue";
        if (type === "WhatsApp") color = "lime";
        if (type === 'Stage Change') color = 'blue';
        if (type === 'Note') color = 'default';
        if (type === 'Task') color = 'purple';
        return <Tag color={color} style={{ fontWeight: 600, padding: "4px 12px", borderRadius: 8, fontSize: 13 }}>{type}</Tag>;
      }
    },
    {
      title: "Notes",
      dataIndex: "notes",
      align: "center",
      render: (text) => <span style={{ color: "#4b5563" }}>{text || "N/A"}</span>
    },
    {
      title: "Related To",
      key: "related",
      align: "center",
      render: (_, record) => <span style={{ color: "#4b5563" }}>{record.related_type ? `${record.related_type} #${record.related_id}` : "N/A"}</span>
    },
    {
      title: "Date",
      dataIndex: "activity_date",
      align: "center",
      render: (date) => <span style={{ color: "#4b5563" }}>{date ? dayjs(date).format("MMM DD, YYYY HH:mm") : "N/A"}</span>
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>View</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm title="Delete activity" description="Are you sure?" onConfirm={() => handleDelete(record.id)}><Button type="link" danger icon={<DeleteOutlined />}>Delete</Button></Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div style={styles.page}>
      {loading && !activities.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><Spin size="large" /></div>
      ) : (
        <>
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>Activities</Title>
              <Text type="secondary">Track and manage your daily tasks and meetings</Text>
            </Col>
            <Col style={{ display: "flex", gap: 10 }}>
              <Button type="primary" icon={<PlusOutlined />} style={styles.primaryBtn} onClick={handleAddNew}>Add Activity</Button>
              <Button icon={<UploadOutlined />} style={styles.secondaryBtn} onClick={() => setBulkOpen(true)}>Bulk Upload</Button>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title: "Total", count: activities.length, color: "#8B4513", bg: "#8B4513" },
              { title: "Calls", count: activities.filter(a => a.type === 'Call').length, color: "#10b981", bg: "#10b981" },
              { title: "Emails", count: activities.filter(a => a.type === 'Email').length, color: "#3b82f6", bg: "#3b82f6" },
              { title: "Meetings", count: activities.filter(a => a.type === 'Meeting').length, color: "#f59e0b", bg: "#f59e0b" },
            ].map((item, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <motion.div custom={index} initial="hidden" animate="visible" whileHover={{ y: -6 }} variants={cardAnimation} style={{ ...styles.kpiCard, borderTop: `4px solid ${item.bg}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>{item.title}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10, color: item.color }}>{item.count}</div>
                </motion.div>
              </Col>
            ))}
          </Row>

          <Card variant="borderless" style={styles.filterCard}>
            <Row justify="space-between" align="middle">
              <Col>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["All", "Call", "Email", "Meeting", "WhatsApp"].map((type) => (
                    <Button key={type} style={{ ...styles.secondaryBtn, ...(filterType === type ? { color: "#1677ff", background: "#f0f5ff" } : {}) }} onClick={() => setFilterType(type)}>{type}</Button>
                  ))}
                </div>
              </Col>
              <Col><Input prefix={<SearchOutlined />} placeholder="Search activities..." value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 280, height: 40 }} /></Col>
            </Row>
          </Card>

          <motion.div variants={layoutAnimation} initial="hidden" animate="visible">
            <Card variant="borderless" style={styles.roundedCard}>
              <ResponsiveTable columns={columns} dataSource={filteredActivities} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
            </Card>
          </motion.div>
        </>
      )}

      {/* MODALS */}
      <Modal title={editingActivity ? "Edit Activity" : "Add Activity"} open={open} onCancel={() => setOpen(false)} footer={null} centered width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Type" name="type" rules={[{ required: true }]}><Select options={[{ value: 'Call' }, { value: 'Email' }, { value: 'Meeting' }, { value: 'WhatsApp' }]} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Date" name="activity_date" rules={[{ required: true }]}><DatePicker showTime style={{ width: "100%" }} /></Form.Item></Col>
          </Row>
          <Form.Item label="Notes" name="notes"><TextArea rows={4} /></Form.Item>
          <Row gutter={12}>
            <Col span={12}><Form.Item label="Related To" name="related_type"><Select options={[{ value: 'Lead' }, { value: 'Customer' }, { value: 'Deal' }]} onChange={handleRelatedTypeChange} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Record" name="related_id"><Select disabled={!relatedType} options={getRelatedOptions()} /></Form.Item></Col>
          </Row>
          <div className="flex justify-end gap-2"><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="primary" htmlType="submit">Submit</Button></div>
        </Form>
      </Modal>

      <Modal title="Activity Details" open={viewOpen} onCancel={() => setViewOpen(false)} footer={null} centered width={600}>
        {selectedActivity && (
          <div className="p-4">
            <h3 className="font-bold text-xl mb-4">{selectedActivity.type}</h3>
            <p><strong>Date:</strong> {dayjs(selectedActivity.activity_date).format("MMM DD, YYYY HH:mm")}</p>
            <p><strong>Notes:</strong> {selectedActivity.notes || "N/A"}</p>
            <p><strong>Related:</strong> {selectedActivity.related_type} #{selectedActivity.related_id}</p>
          </div>
        )}
      </Modal>

      <Modal title="Bulk Upload" open={bulkOpen} onCancel={() => setBulkOpen(false)} footer={null} centered width={600}>
        <div className="p-4 text-center">
          <UploadOutlined style={{ fontSize: 40 }} />
          <p className="mt-4">Download template and upload your activity data.</p>
          <Button type="primary" className="mb-4">Download Template</Button>
          <input type="file" className="block w-full mt-4" />
        </div>
      </Modal>

      <LeadDetailsModal
        open={leadModalOpen}
        lead={selectedLeadForModal}
        onClose={() => { setLeadModalOpen(false); setSelectedLeadForModal(null); }}
        onLeadUpdate={() => { fetchActivities(); fetchLeads(); }}
        onDelete={handleLeadDelete}
        onEdit={(lead) => handleActionRedirect(lead, 'edit')}
        onConvert={(lead) => handleActionRedirect(lead, 'convert')}
      />
    </div>
  );
}
