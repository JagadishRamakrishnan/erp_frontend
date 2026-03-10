import { useState, useEffect } from "react";
import { Card, Table, Input, Button, Modal, Form, Select, Tag, Avatar, message, Popconfirm, Row, Col, Spin } from "antd";
import { SearchOutlined, PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { userService } from "../../services";

const { Option } = Select;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = editingUser
        ? await userService.update(editingUser.id, values)
        : await userService.create(values);
      
      if (response.success) {
        message.success(editingUser ? 'User updated successfully' : 'User created successfully');
        fetchUsers();
        setModalOpen(false);
        setEditingUser(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await userService.delete(id);
      if (response.success) {
        message.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar 
            style={{ backgroundColor: "#6366f1", color: "#fff" }} 
            icon={<UserOutlined />}
          >
            {text?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "#111827" }}>{text}</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (text) => <span style={{ color: "#4b5563" }}>{text || 'N/A'}</span>
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => (
        <Tag 
          icon={<SafetyOutlined />}
          color={
            role === 'Admin' ? 'red' :
            role === 'Manager' ? 'blue' :
            role === 'Executive' ? 'green' : 'default'
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status ? 'success' : 'error'}>
          {status ? 'Active' : 'Inactive'}
        </Tag>
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
            title="Delete user"
            description="Are you sure you want to delete this user?"
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

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f5f6f8"}}>
      {loading && !users.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>Users</div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Manage CRM system users
              </div>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ height: 40, borderRadius: 8 }}
                onClick={handleAddNew}
              >
                Add User
              </Button>
            </Col>
          </Row>

          {/* STATS */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #6366f1' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                  Total Users
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, color: "#111827" }}>
                  {users.length}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #10b981' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                  Active Users
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, color: "#111827" }}>
                  {users.filter(u => u.status).length}
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #f59e0b' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                  Admins
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, color: "#111827" }}>
                  {users.filter(u => u.role === 'Admin').length}
                </div>
              </Card>
            </Col>
          </Row>

          {/* SEARCH */}
          <Card style={{ borderRadius: 12, marginBottom: 20 }}>
            <Input
              placeholder="Search users by name, email, or role..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              style={{ height: 40, borderRadius: 8 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Card>

          {/* USERS TABLE */}
          <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                User Directory ({filteredUsers.length})
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={filteredUsers}
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
        title={editingUser ? "Edit User" : "Add User"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            label="Name" 
            name="name" 
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item 
            label="Email" 
            name="email" 
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input placeholder="Enter phone" />
          </Form.Item>

          {!editingUser && (
            <Form.Item 
              label="Password" 
              name="password" 
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item 
            label="Role" 
            name="role" 
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Option value="Admin">Admin</Option>
              <Option value="Manager">Manager</Option>
              <Option value="Executive">Executive</Option>
              <Option value="Support">Support</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Select defaultValue={true}>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>

          <Row gutter={10}>
            <Col span={12}>
              <Button 
                block 
                onClick={() => {
                  setModalOpen(false);
                  setEditingUser(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingUser ? 'Update' : 'Create'} User
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
