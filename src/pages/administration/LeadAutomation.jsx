import React, { useState, useEffect } from "react";
import { 
  Table, Tag, Card, Button, Modal, Form, Select, Input, 
  message, Popconfirm, Row, Col, Switch, Space, Tooltip, Typography 
} from "antd";
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  ThunderboltOutlined, FilterOutlined, UserOutlined 
} from "@ant-design/icons";
import { motion } from "framer-motion";
import apiCall from "../../services/api";

const { Title, Text } = Typography;
const { Option } = Select;

export default function LeadAutomation() {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form] = Form.useForm();

  const fetchRules = async () => {
    try {
      const res = await apiCall('/lead-assignment-rules');
      if (res.success) setRules(res.data);
    } catch (err) {
      message.error("Failed to load assignment rules");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiCall('/users');
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchRules();
    fetchUsers();
  }, []);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      if (editingRule) {
        await apiCall(`/lead-assignment-rules/${editingRule.id}`, {
          method: 'PUT',
          body: JSON.stringify(values)
        });
        message.success("Rule updated");
      } else {
        await apiCall('/lead-assignment-rules', {
          method: 'POST',
          body: JSON.stringify(values)
        });
        message.success("Rule created");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingRule(null);
      fetchRules();
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (rule, checked) => {
    try {
      await apiCall(`/lead-assignment-rules/${rule.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: checked })
      });
      fetchRules();
    } catch (err) {
      message.error("Toggle failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiCall(`/lead-assignment-rules/${id}`, { method: 'DELETE' });
      message.success("Rule deleted");
      fetchRules();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "Rule Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: "Criteria",
      key: "criteria",
      render: (_, record) => (
        <Space>
          <Tag icon={<FilterOutlined />} color="blue" style={{ borderRadius: 4 }}>
            {record.criteria_field} == {record.criteria_value}
          </Tag>
        </Space>
      )
    },
    {
      title: "Assign To",
      key: "assignee",
      render: (_, record) => (
        <Space>
           <div style={{ 
            width: 24, height: 24, borderRadius: '50%', background: '#f0fdf4', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <UserOutlined style={{ fontSize: 12, color: '#10b981' }} />
          </div>
          <Text style={{ fontSize: 13 }}>{record.assignee?.name || 'Unassigned'}</Text>
        </Space>
      )
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (p) => <Tag color="blue" style={{ borderRadius: 4 }}>P{p}</Tag>
    },
    {
      title: "Active",
      key: "active",
      render: (_, record) => (
        <Switch 
          checked={record.is_active} 
          onChange={(checked) => handleToggle(record, checked)} 
          size="small"
        />
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingRule(record);
              form.setFieldsValue(record);
              setModalOpen(true);
            }} 
          />
          <Popconfirm title="Delete rule?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>Lead Assignment Rules</Title>
          <Text type="secondary">Automate lead routing based on source, service, or custom criteria</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          className="h-10 rounded-lg flex items-center"
          onClick={() => setModalOpen(true)}
        >
          Add Rule
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm border-gray-100">
        <Table
          columns={columns}
          dataSource={rules}
          loading={loading}
          rowKey="id"
          pagination={false}
          style={{ borderRadius: 12 }}
        />
      </Card>

      <Modal
        title={editingRule ? "Edit Assignment Rule" : "Create New Rule"}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRule(null); }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={550}
        centered
        style={{ borderRadius: 16 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Rule Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Website Leads - High Priority" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="criteria_field" label="Criteria Field" rules={[{ required: true }]}>
                <Select placeholder="Select field">
                  <Option value="source">Lead Source</Option>
                  <Option value="service">Interested Service (ID)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="criteria_value" label="Criteria Value" rules={[{ required: true }]}>
                <Input placeholder="e.g. Facebook" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="assign_to" label="Automatically Assign To" rules={[{ required: true }]}>
            <Select placeholder="Select team member">
              {users.map(u => (
                <Option key={u.id} value={u.id}>{u.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" initialValue={0}>
                <Select>
                  <Option value={0}>Low (0)</Option>
                  <Option value={5}>Medium (5)</Option>
                  <Option value={10}>High (10)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" label="Status" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
