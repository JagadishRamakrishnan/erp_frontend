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
import { serviceCatalogService } from "../../services";

const { Title, Text } = Typography;
const { Option } = Select;

export default function LeadAutomation() {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [services, setServices] = useState([]);
  const [form] = Form.useForm();
  const criteriaField = Form.useWatch('criteria_field', form);

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

  const fetchServices = async () => {
    try {
      const res = await serviceCatalogService.getAll({ is_active: 'true' });
      if (res.success) setServices(res.data || []);
    } catch (err) {
      console.error("Failed to load services");
    }
  };

  useEffect(() => {
    fetchRules();
    fetchUsers();
    fetchServices();
  }, []);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values };
      if (Array.isArray(payload.criteria_value)) {
        payload.criteria_value = JSON.stringify(payload.criteria_value);
      }
      if (Array.isArray(payload.priority)) {
        // Since backend expects an INTEGER for priority, we should ideally pick one.
        // However, if the user wants multiple priorities, the backend model needs to change to STRING or a separate table.
        // For now, to fix the crash, we'll pick the highest priority if multiple are selected, OR we could keep as string if we change backend.
        // Let's change backend later if needed. For now, let's pick the first one or stringify if we plan to change backend.
        // Based on user request "Priority also can be select multiple", I will stringify it and we should update backend model.
        payload.priority = JSON.stringify(payload.priority);
      }

      if (editingRule) {
        await apiCall(`/lead-assignment-rules/${editingRule.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        message.success("Rule updated");
      } else {
        await apiCall('/lead-assignment-rules', {
          method: 'POST',
          body: JSON.stringify(payload)
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
      render: (_, record) => {
        let displayValue = record.criteria_value;
        if (record.criteria_field === 'service') {
          try {
            const ids = record.criteria_value.startsWith('[') ? JSON.parse(record.criteria_value) : [record.criteria_value];
            const names = ids.map(id => {
              const service = services.find(s => String(s.id) === String(id));
              return service ? service.name : id;
            });
            displayValue = names.join(', ');
          } catch (e) {
            const service = services.find(s => String(s.id) === String(record.criteria_value));
            displayValue = service ? service.name : record.criteria_value;
          }
        }
        
        return (
          <Space>
            <Tag icon={<FilterOutlined />} color="blue" style={{ borderRadius: 4 }}>
              {record.criteria_field} == {displayValue}
            </Tag>
          </Space>
        );
      }
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
      render: (p) => {
        let priorities = [];
        try {
          priorities = typeof p === 'string' && p.startsWith('[') ? JSON.parse(p) : (Array.isArray(p) ? p : [p]);
        } catch (e) {
          priorities = [p];
        }
        
        // Final fallback to ensure it's always an array for .map
        if (!Array.isArray(priorities)) {
          priorities = priorities === null || priorities === undefined ? [] : [priorities];
        }
        
        return (
          <Space size={[0, 4]} wrap>
            {priorities.map((val, idx) => (
              val !== null && val !== undefined && <Tag key={idx} color="blue" style={{ borderRadius: 4 }}>P{val}</Tag>
            ))}
          </Space>
        );
      }
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
              const formattedValue = { ...record };
              try {
                if (typeof formattedValue.criteria_value === 'string' && formattedValue.criteria_value.startsWith('[')) {
                  formattedValue.criteria_value = JSON.parse(formattedValue.criteria_value);
                }
                if (typeof formattedValue.priority === 'string' && formattedValue.priority.startsWith('[')) {
                  formattedValue.priority = JSON.parse(formattedValue.priority);
                }
              } catch (e) {}
              setEditingRule(record);
              form.setFieldsValue(formattedValue);
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
                <Select placeholder="Select field" onChange={() => form.setFieldsValue({ criteria_value: undefined })}>
                  <Option value="source">Lead Source</Option>
                  <Option value="service">Interested Service</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="criteria_value" label="Criteria Value" rules={[{ required: true }]}>
                {criteriaField === 'service' ? (
                  <Select 
                    placeholder="Select services" 
                    mode="multiple" 
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={services.map(s => ({ label: s.name, value: String(s.id) }))}
                  />
                ) : (
                  <Input placeholder="e.g. Facebook" />
                )}
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
              <Form.Item name="priority" label="Priority" rules={[{ required: true, message: 'Select at least one priority' }]}>
                <Select mode="multiple" placeholder="Select priorities" allowClear>
                  <Option value={0}>Low (0)</Option>
                  <Option value={5}>Medium (5)</Option>
                  <Option value={10}>High (10)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="is_active" label="Status (Active/Inactive)" valuePropName="checked" initialValue={true}>
                <Switch  />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
