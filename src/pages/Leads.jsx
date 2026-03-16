import { useState, useEffect } from "react";
import { Card, Table, Input, Button, Modal, Form, Select, Tag, Avatar, message, Popconfirm, Row, Col, Spin } from "antd";
import { SearchOutlined, PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { leadService, userService } from "../services";
import { useNavigate } from "react-router-dom";
import BulkUploadModal from "../components/BulkUploadModal";
import ResponsiveTable from "../components/ResponsiveTable";

const { Option } = Select;


export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadService.getAll();
      if (response.success) {
        setLeads((response.data || []).reverse());
      }
    } catch (error) {
      message.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = editingLead
        ? await leadService.update(editingLead.id, values)
        : await leadService.create(values);
      
      if (response.success) {
        message.success(editingLead ? 'Lead updated successfully' : 'Lead created successfully');
        fetchLeads();
        setModalOpen(false);
        setEditingLead(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    form.setFieldsValue({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      status: lead.status,
      assigned_to: lead.assigned_to
    });
    setModalOpen(true);
  };
 const handleView = (lead) => {
  setSelectedLead(lead);
  setViewModalOpen(true);
};
  const handleDelete = async (id) => {
    try {
      const response = await leadService.delete(id);
      if (response.success) {
        message.success('Lead deleted successfully');
        fetchLeads();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleConvert = async (lead) => {
    Modal.confirm({
      title: 'Convert Lead to Customer',
      content: `Are you sure you want to convert "${lead.name}" to a customer? This will create a new customer record and mark the lead as Won.`,
      okText: 'Yes, Convert',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await leadService.convertToCustomer(lead.id);
          if (response.success) {
            if (response.data.alreadyConverted) {
              message.warning('This lead has already been converted to a customer');
            } else {
              message.success(`Lead converted successfully! Customer "${response.data.customer.name}" has been created.`);
            }
            fetchLeads();
          }
        } catch (error) {
          message.error('Failed to convert lead');
        }
      }
    });
  };

  const handleAddNew = () => {
    setEditingLead(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleBulkUpload = async (formData) => {
    try {
      const response = await leadService.bulkUpload(formData);
      if (response.success) {
        fetchLeads(); // Refresh the list
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-be-giqy.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/leads/template/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      throw error;
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'New': 'blue',
      'Contacted': 'cyan',
      'Qualified': 'green',
      'Proposal': 'orange',
      'Won': 'success',
      'Lost': 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
  {
    title: "Lead",
    dataIndex: "name",
    align: "left",   // keep left like customer avatar column
    render: (text, record) => (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar
  src={
    record.email
      ? `https://logo.clearbit.com/${record.email.split("@")[1]}`
      : null
  }
  style={{ backgroundColor: "#ff8a00", color: "#fff" }}
  icon={<UserOutlined />}
>
  {!record.email && text?.charAt(0)}
</Avatar>

        <div>
          <div style={{ fontWeight: 600, color: "#111827" }}>{text}</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{record.lead_code}</div>
        </div>
      </div>
    ),
  },

  {
    title: "Contact",
    key: "contact",
    align: "center",
    render: (_, record) => (
      <div>
        {record.email && (
          <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {record.email}
          </div>
        )}
        {record.phone && (
          <div style={{ fontSize: 13, color: "#4b5563" }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {record.phone}
          </div>
        )}
      </div>
    ),
  },

  {
    title: "Company",
    dataIndex: "company",
    align: "center",
    render: (text) => <span>{text || "N/A"}</span>,
  },

  {
    title: "Source",
    dataIndex: "source",
    align: "center",
    render: (text) => <span>{text || "N/A"}</span>,
  },

  {
    title: "Status",
    dataIndex: "status",
    align: "center",
    render: (status) => (
      <Tag color={getStatusColor(status)}>
        {status}
      </Tag>
    ),
  },

  {
    title: "Assigned To",
    dataIndex: "assigned_to",
    align: "center",
    render: (_, record) => (
      <span>
        {record.assignedTo?.name || "Unassigned"}
      </span>
    ),
  },

  {
    title: "Actions",
    key: "actions",
    align: "center",
    render: (_, record) => (
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {record.status !== "Won" && (
          <Button
            type="primary"
            size="small"
            onClick={() => handleConvert(record)}
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
          >
            Convert
          </Button>
        )}

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
          title="Delete lead"
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

  const cardAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f5f6f8"}}>
      {loading && !leads.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>Leads</div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Manage and track all leads
              </div>
            </Col>
            <Col>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ height: 40, borderRadius: 8 }}
                  onClick={handleAddNew}
                >
                  Add Lead
                </Button>
                <Button
                  type="default"
                  icon={<UploadOutlined />}
                  style={{ height: 40, borderRadius: 8 }}
                  onClick={() => setShowBulkUpload(true)}
                >
                  Bulk Upload
                </Button>
              </div>
            </Col>
          </Row>

          {/* STATS */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title: "Total Leads", count: leads.length, color: "#ff8a00" },
              { title: "New", count: leads.filter(l => l.status === 'New').length, color: "#1677ff" },
              { title: "Qualified", count: leads.filter(l => l.status === 'Qualified').length, color: "#52c41a" },
              { title: "Won", count: leads.filter(l => l.status === 'Won').length, color: "#10b981" },
            ].map((item, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <motion.div
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardAnimation}
                >
                  <Card style={{ borderRadius: 12, borderTop: `4px solid ${item.color}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, color: "#111827" }}>
                      {item.count}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* SEARCH */}
          <Card style={{ borderRadius: 12, marginBottom: 20 }}>
            <Input
              placeholder="Search leads by name, email, or company..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              style={{ height: 40, borderRadius: 8 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Card>

          {/* LEADS TABLE */}
          <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Lead Directory ({filteredLeads.length})
              </span>
            </div>
            <ResponsiveTable
              columns={columns}
              dataSource={filteredLeads}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              renderMobileCard={(record) => (
                <div>
                  {/* Header with Avatar and Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <Avatar 
                      style={{ backgroundColor: "#ff8a00", color: "#fff" }} 
                      icon={<UserOutlined />}
                    >
                      {record.name?.charAt(0)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
                        {record.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {record.lead_code}
                      </div>
                    </div>
                    <Tag color={getStatusColor(record.status)}>
                      {record.status}
                    </Tag>
                  </div>

                  {/* Contact Info */}
                  <div style={{ marginBottom: 12, paddingLeft: 8 }}>
                    {record.email && (
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <MailOutlined style={{ marginRight: 6 }} />
                        {record.email}
                      </div>
                    )}
                    {record.phone && (
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <PhoneOutlined style={{ marginRight: 6 }} />
                        {record.phone}
                      </div>
                    )}
                    {record.company && (
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Company:</strong> {record.company}
                      </div>
                    )}
                    {record.source && (
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Source:</strong> {record.source}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      <strong>Assigned:</strong> {record.assignedTo?.name || 'Unassigned'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                    {record.status !== 'Won' && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleConvert(record)}
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                      >
                        Convert
                      </Button>
                    )}
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
                      title="Delete lead"
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
        </>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal
        title={editingLead ? "Edit Lead" : "Add Lead"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingLead(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            label="Name" 
            name="name" 
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Email" 
                name="email" 
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="Enter phone" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Company" name="company">
                <Input placeholder="Enter company" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Source" name="source">
                <Input placeholder="e.g., Website, Referral" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Status" 
                name="status" 
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="New">New</Option>
                  <Option value="Contacted">Contacted</Option>
                  <Option value="Qualified">Qualified</Option>
                  <Option value="Proposal">Proposal</Option>
                  <Option value="Won">Won</Option>
                  <Option value="Lost">Lost</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Assigned To" name="assigned_to">
                <Select 
                  placeholder="Select user" 
                  showSearch 
                  optionFilterProp="children"
                  allowClear
                >
                  <Option value={null}>Unassigned</Option>
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10}>
            <Col span={12}>
              <Button 
                block 
                onClick={() => {
                  setModalOpen(false);
                  setEditingLead(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingLead ? 'Update' : 'Create'} Lead
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
     <Modal
title="Lead Details"
open={viewModalOpen}
footer={null}
onCancel={() => setViewModalOpen(false)}
centered
width={800}

>

{selectedLead && (
<div style={{ padding: 20 }}>

```
  {/* HEADER */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 20
    }}
  >
    <Avatar
  size={70}
  src={
    selectedLead.email
      ? `https://logo.clearbit.com/${selectedLead.email.split("@")[1]}`
      : null
  }
  style={{ background: "#ff8a00" }}
  icon={<UserOutlined />}
>
  {!selectedLead.email && selectedLead.name?.charAt(0)}
</Avatar>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>
        {selectedLead.name}
      </div>

      <Tag color="blue">{selectedLead.status}</Tag>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
  <img
  src={`https://logo.clearbit.com/${selectedLead.email?.split("@")[1]}`}
  alt="logo"
  style={{ width: 20, height: 20 }}
  onError={(e) => {
    e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  }}
/>
  <span style={{ color: "#6b7280" }}>
    {selectedLead.company || "No Company"}
  </span>
</div>
    </div>
  </div>

  {/* DETAILS CARD */}
  <Card bordered style={{ borderRadius: 10 }}>
    <Row gutter={[20, 20]}>

      <Col span={12}>
        <div style={{ fontWeight: 600 }}>Email</div>
        <div>
          <MailOutlined /> {selectedLead.email || "N/A"}
        </div>
      </Col>

      <Col span={12}>
        <div style={{ fontWeight: 600 }}>Phone</div>
        <div>
          <PhoneOutlined /> {selectedLead.phone || "N/A"}
        </div>
      </Col>

      <Col span={12}>
        <div style={{ fontWeight: 600 }}>Company</div>
        <div>{selectedLead.company || "N/A"}</div>
      </Col>

      <Col span={12}>
        <div style={{ fontWeight: 600 }}>Source</div>
        <div>{selectedLead.source || "N/A"}</div>
      </Col>

      <Col span={12}>
        <div style={{ fontWeight: 600 }}>Lead Code</div>
        <div>{selectedLead.lead_code}</div>
      </Col>

      <Col span={12}>
        <div style={{ fontWeight: 600 }}>Assigned To</div>
        <div>{selectedLead.assignedTo?.name || "Unassigned"}</div>
      </Col>

    </Row>
  </Card>

</div>

)} </Modal>

      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUpload={handleBulkUpload}
        onDownloadTemplate={handleDownloadTemplate}
        moduleName="Leads"
        templateFields={['name', 'email', 'phone', 'company', 'source', 'status', 'assigned_to']}
      />
    </div>
  );
}
