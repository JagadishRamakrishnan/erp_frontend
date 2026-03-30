import { useState, useEffect } from "react";
import { 
  Card, Input, Button, Modal, Form, Select, message, 
  Popconfirm, Row, Col, Spin, Tag, List, Checkbox, Divider, Tooltip
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  CustomerServiceOutlined, MessageOutlined, ClockCircleOutlined,
  AlertOutlined, CheckCircleOutlined, UserOutlined, SendOutlined
} from "@ant-design/icons";
import { WhatsAppOutlined, FacebookOutlined, InstagramOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { ticketService, customerService, userService } from "../services";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
import ResponsiveTable from "../components/ResponsiveTable";

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
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
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
      const sortedTickets = (response.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setTickets(sortedTickets);
    }
  } catch (error) {
    message.error("Failed to load tickets");
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
      priority: ticket.priority,
      assigned_to: ticket.assigned_to
    });
    setModalOpen(true);
  };

  const handleViewDetail = async (ticket) => {
    setLoading(true);
    try {
      const res = await ticketService.getById(ticket.id);
      if (res.success) {
        setSelectedTicket(res.data);
        setDetailVisible(true);
      }
    } catch (err) {
      message.error("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await ticketService.addComment(selectedTicket.id, {
        comment: commentText,
        is_internal: isInternal
      });
      if (res.success) {
        message.success("Comment added");
        setCommentText("");
        // Reload details
        const update = await ticketService.getById(selectedTicket.id);
        setSelectedTicket(update.data);
        fetchTickets(); 
      }
    } catch (err) {
      message.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
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

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'blue',
      'Medium': 'orange',
      'High': 'volcano',
      'Urgent': 'magenta'
    };
    return colors[priority] || 'default';
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
   align: "center",
  render: (_, record) => (
    <div style={{ textAlign: "center" }}>
      
      {/* Name */}
      <div style={{ fontWeight: 600, color: "#111827" }}>
        {record.customer?.name || 'N/A'}
      </div>

      {/* Email */}
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        {record.customer?.email || ''}
      </div>

      {/* SOCIAL ICONS */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${record.customer?.phone || ""}`}
          target="_blank"
        >
          <div style={{
            background: "#e6f7f0",
            padding: 6,
            borderRadius: "50%"
          }}>
            <WhatsAppOutlined style={{ color: "#25D366", fontSize: 16 }} />
          </div>
        </a>

        {/* Facebook */}
        <a href="#" target="_blank">
          <div style={{
            background: "#e6f0ff",
            padding: 6,
            borderRadius: "50%"
          }}>
            <FacebookOutlined style={{ color: "#1877F2", fontSize: 16 }} />
          </div>
        </a>

        {/* Instagram */}
        <a href="#" target="_blank">
          <div style={{
            background: "#ffe6f0",
            padding: 6,
            borderRadius: "50%"
          }}>
            <InstagramOutlined style={{ color: "#E1306C", fontSize: 16 }} />
          </div>
        </a>

      </div>
    </div>
  ),
},
    {
      title: "Priority",
      dataIndex: "priority",
      render: (priority) => <Tag color={getPriorityColor(priority)}>{priority}</Tag>,
    },
    {
      title: "Assigned To",
      key: "assigned",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserOutlined style={{ color: record.assignedTo ? '#1677ff' : '#9ca3af' }} />
          <span style={{ color: "#4b5563" }}>
            {record.assignedTo?.name || 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      title: "SLA",
      key: "sla",
      render: (_, record) => {
        if (record.status === 'Closed') return <Tag icon={<CheckCircleOutlined />} color="success">Resolved</Tag>;
        const now = dayjs();
        const due = dayjs(record.resolution_due_at);
        const isOverdue = now.isAfter(due);
        return (
          <Tooltip title={`Due by: ${due.format('MMM DD, HH:mm')}`}>
            <Tag icon={<ClockCircleOutlined />} color={isOverdue ? 'error' : 'warning'}>
              {isOverdue ? 'Overdue' : due.fromNow(true) + ' left'}
            </Tag>
          </Tooltip>
        );
      }
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
            icon={<MessageOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Reply
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete ticket"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
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
            <ResponsiveTable
              columns={columns}
              dataSource={filteredTickets}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              renderMobileCard={(record) => {
                const statusColors = {
                  'Open': 'error',
                  'In Progress': 'processing',
                  'Closed': 'success'
                };
                const now = dayjs();
                const due = dayjs(record.resolution_due_at);
                const isOverdue = now.isAfter(due) && record.status !== 'Closed';
                
                return (
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <CustomerServiceOutlined style={{ fontSize: 20 }} />
                        </div>
                        <div>
                          <div className="font-bold text-[15px] text-gray-900 leading-tight">{record.ticket_number}</div>
                          <Tag color={statusColors[record.status] || 'default'} style={{ margin: '4px 0 0 0', borderRadius: 4, fontSize: 10 }}>
                            {record.status}
                          </Tag>
                        </div>
                      </div>
                      <Tag color={getPriorityColor(record.priority)} style={{ borderRadius: 6, margin: 0 }}>
                        {record.priority}
                      </Tag>
                    </div>

                    {/* Subject */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="font-semibold text-[14px] text-gray-800 mb-1">{record.subject}</div>
                      <div className="text-[12px] text-gray-500 line-clamp-2">
                        {record.description || 'No description'}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Customer</div>
                        <div className="text-[12px] font-medium truncate">{record.customer?.name || 'N/A'}</div>
                        <div className="flex gap-2 mt-1">
                          {record.customer?.phone && (
                            <a href={`https://wa.me/${record.customer.phone}`} target="_blank" className="text-green-500"><WhatsAppOutlined size={14}/></a>
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-100">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">SLA Status</div>
                        {record.status === 'Closed' ? (
                          <div className="text-[12px] text-green-600 font-medium">Resolved</div>
                        ) : (
                          <div className={`text-[12px] font-bold ${isOverdue ? 'text-red-500' : 'text-amber-500'}`}>
                            {isOverdue ? 'OVERDUE' : due.fromNow(true) + ' left'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Button 
                        type="primary" 
                        block 
                        icon={<MessageOutlined />} 
                        onClick={(e) => { e.stopPropagation(); handleViewDetail(record); }}
                        className="h-10 rounded-lg font-semibold shadow-sm"
                      >
                        Reply & View
                      </Button>
                      <Button 
                         icon={<EditOutlined />} 
                         onClick={(e) => { e.stopPropagation(); handleEdit(record); }}
                         className="w-10 h-10 rounded-lg flex items-center justify-center border-gray-200"
                      />
                      <Popconfirm title="Delete ticket?" onConfirm={(e) => { e.stopPropagation(); handleDelete(record.id); }}>
                        <Button danger icon={<DeleteOutlined />} className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80" />
                      </Popconfirm>
                    </div>
                  </div>
                );
              }}
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
            <Col span={8}>
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
            <Col span={8}>
              <Form.Item 
                label="Priority" 
                name="priority" 
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Urgent">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Assigned To" name="assigned_to">
                <Select placeholder="Select user" showSearch optionFilterProp="children" allowClear>
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
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

      {/* TICKET DETAIL DRAWER / MODAL */}
      <Modal
        title={selectedTicket ? `Ticket Details: ${selectedTicket.ticket_number}` : 'Loading...'}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={750}
        centered
        style={{ borderRadius: 16 }}
      >
        {selectedTicket && (
          <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'start' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedTicket.subject}</Title>
                <div style={{ marginTop: 8 }}>
                  <Tag color={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Tag>
                  <Tag color={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Tag>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text type="secondary">Customer</Text>
                <div style={{ fontWeight: 600 }}>{selectedTicket.customer?.name}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedTicket.description || 'No description provided'}</Text>
            </div>

            <Divider orientation="left">Conversation</Divider>

            <div style={{ marginBottom: 24 }}>
              {selectedTicket.comments?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#9ca3af' }}>No comments yet.</div>
              ) : (
                selectedTicket.comments.map((comment, i) => (
                  <div 
                    key={comment.id} 
                    style={{ 
                      marginBottom: 16, 
                      padding: 12, 
                      borderRadius: 12, 
                      background: comment.is_internal ? '#fff7ed' : '#fff',
                      border: comment.is_internal ? '1px solid #ffedd5' : '1px solid #e5e7eb',
                      marginLeft: 0,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>
                        {comment.user?.name || 'Automated'} 
                        {comment.is_internal && <Tag color="orange" style={{ marginLeft: 8, fontSize: 10 }}>Internal</Tag>}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{dayjs(comment.created_at).fromNow()}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#374151' }}>{comment.comment}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <TextArea 
                placeholder="Type your reply here..." 
                rows={3} 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ marginBottom: 12, borderRadius: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Checkbox checked={isInternal} onChange={e => setIsInternal(e.target.checked)}>
                  Internal Note
                </Checkbox>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleAddComment}
                  loading={submittingComment}
                  disabled={!commentText.trim()}
                >
                  Post Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
