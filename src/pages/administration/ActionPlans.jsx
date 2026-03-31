import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, message, Select, Card, Empty, Modal, Form, Input, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined, PullRequestOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { serviceCatalogService } from '../../services';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ActionPlans() {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Selection
  const [actionPlans, setActionPlans] = useState([]);
  const [serviceDetails, setServiceDetails] = useState(null);

  // Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await serviceCatalogService.getAll();
      if (res.success) {
        setServices(res.data);
        
        // Handle deep link selection
        const serviceIdFromUrl = searchParams.get('serviceId');
        if (serviceIdFromUrl) {
          setSelectedServiceId(parseInt(serviceIdFromUrl));
        }
      }
    } catch (err) {
      message.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedServiceId) {
      const srv = services.find(s => s.id === selectedServiceId);
      if (srv) {
        setServiceDetails(srv);
        // Sort action plans by offset_days ascending
        const sortedPlans = [...(srv.actionPlans || [])].sort((a, b) => 
          parseInt(a.offset_days || 0) - parseInt(b.offset_days || 0)
        );
        setActionPlans(sortedPlans);
      }
    } else {
      setServiceDetails(null);
      setActionPlans([]);
    }
  }, [selectedServiceId, services]);

  const openAdd = () => {
    setEditingPlan(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      title: plan.title,
      description: plan.description,
      offset_days: parseInt(plan.offset_days),
      priority: plan.priority
    });
    setModalOpen(true);
  };

  const handleDelete = async (id, virtualIndex) => {
    try {
      // Create fresh list excluding deleted
      const updatedPlans = actionPlans.filter((_, i) => i !== virtualIndex);
      
      const payload = { 
        name: serviceDetails.name, 
        unit_price: serviceDetails.unit_price,
        action_plans: updatedPlans
      };

      await serviceCatalogService.update(selectedServiceId, payload);
      message.success('Action plan deleted');
      fetchServices(); // Refreshes and updates the view
    } catch (err) {
      message.error('Failed to delete action plan');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      let updatedPlans = [...actionPlans];
      if (editingPlan) {
        updatedPlans = updatedPlans.map(p => 
          p.id === editingPlan.id ? { ...p, ...values } : p
        );
      } else {
        // Find if we are editing an ID-less (new) existing plan or creating net new
        updatedPlans.push({ ...values });
      }

      const payload = { 
        name: serviceDetails.name, 
        unit_price: serviceDetails.unit_price,
        action_plans: updatedPlans
      };

      await serviceCatalogService.update(selectedServiceId, payload);
      message.success('Action plans updated!');
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.message || 'Failed to save action plan');
    }
  };

  const columns = [
    {
      title: 'Task Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <div style={{ fontWeight: 600, color: '#111827' }}>{text}</div>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || <Text type="secondary">—</Text>
    },
    {
      title: 'Days Due Offset',
      dataIndex: 'offset_days',
      key: 'offset_days',
      align: 'center',
      sorter: (a, b) => parseInt(a.offset_days || 0) - parseInt(b.offset_days || 0),
      defaultSortOrder: 'ascend',
      render: (days) => <Text type="secondary">{days} Days (0=Today)</Text>
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      align: 'center'
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record, index) => (
        <div>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
             title="Delete this task?"
             onConfirm={() => handleDelete(record.id, index)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#f5f6f8', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Service Action Plans</Title>
          <Text type="secondary">Define sequence of automated tasks triggered when a lead expresses interest in a service.</Text>
        </div>
      </div>

      <Card variant="borderless" style={{ borderRadius: 12, marginBottom: 24, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text strong>Select Service:</Text>
          <Select
            placeholder="Select a service catalog item"
            style={{ width: 300 }}
            value={selectedServiceId}
            onChange={setSelectedServiceId}
            allowClear
            loading={loading}
          >
            {services.map(s => (
              <Option key={s.id} value={s.id}>{s.name} {s.category ? `(${s.category})` : ''}</Option>
            ))}
          </Select>
        </div>
      </Card>

      {selectedServiceId ? (
        <Card title="Automated Task Sequence" extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Task Template</Button>} variant="borderless" style={{ borderRadius: 12, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
          <Table
            columns={columns}
            dataSource={actionPlans}
            rowKey={(record) => record.id || record.title}
            pagination={false}
          />
        </Card>
      ) : (
        <Card variant="borderless" style={{ borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
           <Empty description={<span>Select a service above to configure its action plan.</span>} />
        </Card>
      )}

      <Modal
        title={editingPlan ? "Edit Task Template" : "Add Task Template"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Task Title" rules={[{ required: true }]}>
            <Input placeholder="e.g., Initial Outreach Call" />
          </Form.Item>
          <Form.Item name="description" label="Task Description">
            <Input.TextArea rows={3} placeholder="Additional context for the sales agent" />
          </Form.Item>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="offset_days" label="Days Offset" initialValue={0} style={{ flex: 1 }} rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="priority" label="Priority" initialValue="Medium" style={{ flex: 1 }}>
              <Select>
                <Option value="High">High</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Low">Low</Option>
              </Select>
            </Form.Item>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>If Days Offset is 0, the task will be due on the same day the lead is created.</Text>
        </Form>
      </Modal>

    </div>
  );
}
