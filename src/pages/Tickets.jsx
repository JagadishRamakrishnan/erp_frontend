import { useState, useEffect } from "react";
import { 
  Card, Table, Input, Button, Modal, Form, Select, message, 
  Popconfirm, Row, Col, Spin, Tag 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  CustomerServiceOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { ticketService, customerService, userService } from "../services";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTickets();
    fetchCustomers();
    fetchUsers();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getAll();
      if (response.success) {
        setTickets(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load tickets');
    } finally {
      setLoading(false);
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
      const response = editingTicket
        ? await ticketService.update(editingTicket.id, values)
        : await ticketService.create(values);
      
      if (response.success) {
        message.success(editingTicket ? 'Ticket updated successfully' : 'Ticket created successfully');
        fetchTickets();
        setModalOpen(false);
        setEditingTicket(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    form.setFieldsValue({
      customer_id: ticket.customer_id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      assigned_to: ticket.assigned_to
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await ticketService.delete(id);
      if (response.success) {
        message.success('Ticket deleted successfully');
        fetchTickets();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleAddNew = () => {
    setEditingTicket(null);
    form.resetFields();
    setModalOpen(true);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch = 
      ticket.ticket_number?.toLowerCase().includes(searchText.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
      ticket.customer?.name?.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === "All" || ticket.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'error',
      'In Progress': 'processing',
      'Closed': 'success'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "ticket_number",
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CustomerServiceOutlined style={{ color: "#1677ff" }} />
          <span style={{ fontWeight: 600, color: "#111827" }}>{text}</span>
        </div>
      )
    },
    {
      title: "Subject",
      dataIndex: "subject",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#111827" }}>{text}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {record.description ? record.description.substring(0, 50) + '...' : 'No description'}
          </div>
        </div>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#111827" }}>{record.customer?.name || 'N/A'}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{record.customer?.email || ''}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Assigned To",
      key: "assigned",
      render: (_, record) => (
        <span style={{ color: "#4b5563" }}>
          {record.assignedTo?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      render: (date) => (
        <span style={{ color: "#4b5563" }}>
          {date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete ticket"
            description="Are you sure you want to delete this ticket?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
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
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f5f6f8" }}>
      {loading && !tickets.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>Support Tickets</Title>
              <Text type="secondary">Manage customer support requests</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ height: 40, borderRadius: 8 }}
                onClick={handleAddNew}
              >
                Create Ticket
              </Button>
            </Col>
          </Row>

          {/* STATS */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title: "Total Tickets", count: tickets.length, color: "#1677ff" },
              { title: "Open", count: tickets.filter(t => t.status === 'Open').length, color: "#ef4444" },
              { title: "In Progress", count: tickets.filter(t => t.status === 'In Progress').length, color: "#f59e0b" },
              { title: "Closed", count: tickets.filter(t => t.status === 'Closed').length, color: "#10b981" },
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

          {/* FILTERS */}
          <Card style={{ borderRadius: 12, marginBottom: 20 }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={12}>
                <Input
                  placeholder="Search tickets..."
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  style={{ height: 40, borderRadius: 8 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {["All", "Open", "In Progress", "Closed"].map((status) => (
                    <Button
                      key={status}
                      type={filterStatus === status ? "primary" : "default"}
                      onClick={() => setFilterStatus(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>

          {/* TICKETS TABLE */}
          <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Ticket List ({filteredTickets.length})
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={filteredTickets}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </Card>
        </>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal
        title={editingTicket ? "Edit Ticket" : "Create Ticket"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTicket(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            label="Customer" 
            name="customer_id" 
            rules={[{ required: true, message: 'Please select customer' }]}
          >
            <Select placeholder="Select customer" showSearch optionFilterProp="children">
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            label="Subject" 
            name="subject" 
            rules={[{ required: true, message: 'Please enter subject' }]}
          >
            <Input placeholder="Enter ticket subject" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={4} placeholder="Enter detailed description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Status" 
                name="status" 
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="Open">Open</Option>
                  <Option value="In Progress">In Progress</Option>
                  <Option value="Closed">Closed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Assigned To" name="assigned_to">
                <Select placeholder="Select user" showSearch optionFilterProp="children" allowClear>
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
                  setEditingTicket(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingTicket ? 'Update' : 'Create'} Ticket
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
