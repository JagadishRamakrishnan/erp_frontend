import { useState, useEffect } from "react";
import { 
  Card, Input, Button, Modal, Form, Select, message, 
  Popconfirm, Row, Col, Spin, Tag, DatePicker 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { taskService, userService, leadService, customerService, dealService } from "../services";
import dayjs from "dayjs";
import ResponsiveTable from "../components/ResponsiveTable";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [relatedType, setRelatedType] = useState(null);
  const [form] = Form.useForm();
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpForm] = Form.useForm();
  const [completingTask, setCompletingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchLeads();
    fetchCustomers();
    fetchDeals();
  }, []);

  const fetchTasks = async () => {
  setLoading(true);
  try {
    const response = await taskService.getAll();
    console.log(response)
    if (response.success) {
      const sortedTasks = (response.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setTasks(sortedTasks);
    }
  } catch (error) {
    message.error("Failed to load tasks");
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
        due_date: values.due_date ? values.due_date.toISOString() : null
      };

      const response = editingTask
        ? await taskService.update(editingTask.id, formattedValues)
        : await taskService.create(formattedValues);
      
      if (response.success) {
        message.success(editingTask ? 'Task updated successfully' : 'Task created successfully');
        fetchTasks();
        setModalOpen(false);
        setEditingTask(null);
        setRelatedType(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setRelatedType(task.related_type);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      related_type: task.related_type,
      related_id: task.related_id,
      assigned_to: task.assigned_to,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? dayjs(task.due_date) : null
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await taskService.delete(id);
      if (response.success) {
        message.success('Task deleted successfully');
        fetchTasks();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      
      // If marking as complete, ask if they want to create follow-up
      if (newStatus === 'Completed') {
        setCompletingTask(task);
        Modal.confirm({
          title: 'Task Completed!',
          content: 'Do you want to create a follow-up task or activity?',
          okText: 'Yes, Create Follow-up',
          cancelText: 'No, Just Complete',
          onOk: () => {
            // Mark as complete first
            taskService.update(task.id, { status: 'Completed' }).then(() => {
              fetchTasks();
              // Open follow-up modal
              setFollowUpModalOpen(true);
              followUpForm.setFieldsValue({
                related_type: task.related_type,
                related_id: task.related_id,
                title: `Follow-up: ${task.title}`,
                due_date: dayjs().add(1, 'day'),
                priority: task.priority,
                assigned_to: task.assigned_to
              });
              setRelatedType(task.related_type);
            });
          },
          onCancel: () => {
            // Just mark as complete
            taskService.update(task.id, { status: 'Completed' }).then(() => {
              message.success('Task marked as Completed');
              fetchTasks();
            });
          }
        });
      } else {
        // Marking as pending
        const response = await taskService.update(task.id, { status: newStatus });
        if (response.success) {
          message.success(`Task marked as ${newStatus}`);
          fetchTasks();
        }
      }
    } catch (error) {
      message.error('Failed to update task status');
    }
  };

  const handleFollowUpSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        status: 'Pending'
      };

      const response = await taskService.create(formattedValues);
      
      if (response.success) {
        message.success('Follow-up task created successfully');
        fetchTasks();
        setFollowUpModalOpen(false);
        setCompletingTask(null);
        setRelatedType(null);
        followUpForm.resetFields();
      }
    } catch (error) {
      message.error('Failed to create follow-up task');
    }
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setRelatedType(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleRelatedTypeChange = (value) => {
    setRelatedType(value);
    form.setFieldsValue({ related_id: null });
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

  const filteredTasks = tasks.filter((task) => {
    const matchSearch = 
      task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = filterStatus === "All" || task.status === filterStatus;
    return matchSearch && matchStatus;
  });

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

  const columns = [
  {
    title: "Task",
    dataIndex: "title",
    align: "left", // keep task left like customer avatar column
    render: (text, record) => (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button
          type={record.status === "Completed" ? "default" : "primary"}
          shape="circle"
          size="small"
          icon={record.status === "Completed" ? <CheckCircleOutlined /> : null}
          onClick={() => handleToggleComplete(record)}
        />
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
      <Tag color={getPriorityColor(priority)}>{priority}</Tag>
    ),
  },

  {
    title: "Status",
    dataIndex: "status",
    align: "center",
    render: (status) => (
      <Tag color={getStatusColor(status)}>{status}</Tag>
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

  {
    title: "Due Date",
    dataIndex: "due_date",
    align: "center",
    render: (date) => (
      <span>
        {date ? dayjs(date).format("MMM DD, YYYY") : "N/A"}
      </span>
    ),
  },

  {
    title: "Actions",
    align: "center",
    render: (_, record) => (
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>

        <Popconfirm
          title="Delete task"
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
    <div style={{ padding: "24px", minHeight: "100vh",  background: "#f5f6f8" }}>
      {loading && !tasks.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>Tasks</Title>
              <Text type="secondary">Manage and track all tasks</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ height: 40, borderRadius: 8 }}
                onClick={handleAddNew}
              >
                Add Task
              </Button>
            </Col>
          </Row>

          {/* STATS */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title: "Total Tasks", count: tasks.length, color: "#1677ff", icon: <CheckCircleOutlined /> },
              { title: "Pending", count: tasks.filter(t => t.status === 'Pending').length, color: "#f59e0b", icon: <ClockCircleOutlined /> },
              { title: "Completed", count: tasks.filter(t => t.status === 'Completed').length, color: "#10b981", icon: <CheckCircleOutlined /> },
              { title: "High Priority", count: tasks.filter(t => t.priority === 'High').length, color: "#ef4444", icon: <CheckCircleOutlined /> },
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
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap"
    }}
  >
    
    {/* SEARCH */}
    <Input
      placeholder="Search tasks..."
      prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
      style={{
        height: 40,
        borderRadius: 8,
        width: 320
      }}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
    />

    {/* STATUS TABS */}
    <div
      style={{
        display: "flex",
        gap: 8,
        marginLeft: "auto"
      }}
    >
      {["All", "Pending", "Completed"].map((status) => (
        <Button
          key={status}
          type={filterStatus === status ? "primary" : "default"}
          onClick={() => setFilterStatus(status)}
        >
          {status}
        </Button>
      ))}
    </div>

  </div>
</Card>

          {/* TASKS TABLE */}
          <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Task List ({filteredTasks.length})
              </span>
            </div>
            <ResponsiveTable
              columns={columns}
              dataSource={filteredTasks}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              renderMobileCard={(record) => (
                <div>
                  {/* Task Header with Complete Button */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <Button
                      type={record.status === 'Completed' ? 'default' : 'primary'}
                      shape="circle"
                      size="small"
                      icon={record.status === 'Completed' ? <CheckCircleOutlined /> : null}
                      onClick={() => handleToggleComplete(record)}
                      style={{
                        background: record.status === 'Completed' ? '#10b981' : '#fff',
                        borderColor: record.status === 'Completed' ? '#10b981' : '#d9d9d9',
                        color: record.status === 'Completed' ? '#fff' : '#666',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: 15,
                        color: "#111827",
                        textDecoration: record.status === 'Completed' ? 'line-through' : 'none',
                        opacity: record.status === 'Completed' ? 0.6 : 1,
                        marginBottom: 4
                      }}>
                        {record.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {record.description || 'No description'}
                      </div>
                    </div>
                  </div>

                  {/* Task Details */}
                  <div style={{ marginBottom: 12, paddingLeft: 8 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <Tag color={getPriorityColor(record.priority)}>{record.priority}</Tag>
                      <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
                    </div>
                    <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                      <strong>Assigned:</strong> {record.assignedTo?.name || 'Unassigned'}
                    </div>
                    <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                      <strong>Related:</strong> {record.related_type ? `${record.related_type} #${record.related_id}` : 'N/A'}
                    </div>
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      <strong>Due:</strong> {record.due_date ? dayjs(record.due_date).format('MMM DD, YYYY') : 'N/A'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete task"
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
        title={editingTask ? "Edit Task" : "Add Task"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTask(null);
          setRelatedType(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            label="Title" 
            name="title" 
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Enter description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Priority" 
                name="priority" 
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Status" 
                name="status" 
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="Pending">Pending</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
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
            <Col span={12}>
              <Form.Item label="Due Date" name="due_date">
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Related To" name="related_type">
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
              <Form.Item label="Related Record" name="related_id">
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
                  setModalOpen(false);
                  setEditingTask(null);
                  setRelatedType(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingTask ? 'Update' : 'Create'} Task
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* FOLLOW-UP TASK MODAL */}
      <Modal
        title="Create Follow-up Task"
        open={followUpModalOpen}
        onCancel={() => {
          setFollowUpModalOpen(false);
          setCompletingTask(null);
          setRelatedType(null);
          followUpForm.resetFields();
        }}
        footer={null}
        centered
        width={600}
      >
        <Form form={followUpForm} layout="vertical" onFinish={handleFollowUpSubmit}>
          <Form.Item 
            label="Task Title" 
            name="title" 
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="Enter follow-up task title" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="E.g., Call customer to discuss next steps" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Priority" 
                name="priority" 
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Due Date" 
                name="due_date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Assigned To" name="assigned_to">
            <Select placeholder="Select user" showSearch optionFilterProp="children" allowClear>
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Related To" name="related_type">
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
              <Form.Item label="Related Record" name="related_id">
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
                  setFollowUpModalOpen(false);
                  setCompletingTask(null);
                  setRelatedType(null);
                  followUpForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                Create Follow-up Task
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
