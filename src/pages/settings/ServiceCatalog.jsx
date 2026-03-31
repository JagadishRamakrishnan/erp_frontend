import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space,
  Tag, Typography, message, Popconfirm, Select, Divider, Tooltip
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, PlusCircleOutlined, PullRequestOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { serviceCatalogService } from '../../services';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  'Consulting', 'SaaS / Software', 'Hardware', 'Support & Maintenance',
  'Digital Marketing', 'Design', 'Development', 'Legal', 'Finance', 'Other'
];

const fontInter = { fontFamily: '"Inter", sans-serif' };

export default function ServiceCatalog() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await serviceCatalogService.getAll();
      if (res.success) setServices(res.data);
    } catch (err) {
      message.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingService(null);
    form.resetFields();
    setLineItems([{ item_name: '', qty: 1, unit_price: 0, tax_percent: 0, description: '' }]);
    setModalOpen(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    form.setFieldsValue({
      name: service.name,
      category: service.category,
      description: service.description,
      unit_price: parseFloat(service.unit_price),
      tax_percent: parseFloat(service.tax_percent),
      currency: service.currency || 'INR',
      is_active: service.is_active !== false,
    });
    setLineItems(
      service.lineItems && service.lineItems.length > 0
        ? service.lineItems.map(li => ({
            id: li.id, item_name: li.item_name, qty: parseFloat(li.qty), description: li.description,
            unit_price: parseFloat(li.unit_price), tax_percent: parseFloat(li.tax_percent)
          }))
        : [{ item_name: '', qty: 1, unit_price: 0, tax_percent: 0, description: '' }]
    );
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await serviceCatalogService.delete(id);
      message.success('Service deleted');
      fetchServices();
    } catch (err) {
      message.error('Failed to delete service');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = { 
        ...values, 
        line_items: lineItems.filter(li => li.item_name)
      };
      if (editingService) {
        await serviceCatalogService.update(editingService.id, payload);
        message.success('Service updated!');
      } else {
        await serviceCatalogService.create(payload);
        message.success('Service created!');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      if (err.errorFields) return; // Validation error
      message.error(err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, { item_name: '', qty: 1, unit_price: 0, tax_percent: 0, description: '' }]);
  };

  const updateLineItem = (index, field, value) => {
    setLineItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeLineItem = (index) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{id}</div>
        </div>
      )
    },
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827' }}>{name}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{record.description.substring(0, 60)}...</div>
          )}
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => cat ? <Tag color="blue">{cat}</Tag> : <Text type="secondary">—</Text>
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: '#111827' }}>₹{parseFloat(val || 0).toLocaleString('en-IN')}</span>
    },
    {
      title: 'Tax %',
      dataIndex: 'tax_percent',
      key: 'tax_percent',
      align: 'center',
      render: (val) => `${parseFloat(val || 0)}%`
    },
    {
      title: 'Line Items',
      key: 'lineItems',
      align: 'center',
      render: (_, record) => (
        <Tag>{record.lineItems?.length || 0} items</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      align: 'center',
      render: (val) => <Tag color={val !== false ? 'success' : 'default'}>{val !== false ? 'Active' : 'Inactive'}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Service">
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="View Action Plan">
            <Button 
              icon={<PullRequestOutlined />} 
              size="small" 
              onClick={() => navigate(`/action-plans?serviceId=${record.id}`)} 
              style={{ color: '#722ed1', borderColor: '#722ed1' }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this service?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete Service">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={fontInter}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Service & Product Catalog</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Create service templates to quickly generate quotes and invoices.</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Service</Button>
      </div>

      <Table
        columns={columns}
        dataSource={services}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        size="small"
        style={{ borderRadius: 8 }}
      />

      <Modal
        title={<span style={{ fontSize: 16, fontWeight: 700 }}>{editingService ? 'Edit Service' : 'Add New Service'}</span>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText={editingService ? 'Update' : 'Create'}
        confirmLoading={saving}
        centered
        width={740}
        style={fontInter}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item label="Service Name" name="name" rules={[{ required: true, message: 'Required' }]}>
              <Input placeholder="e.g. Website Development" />
            </Form.Item>
            <Form.Item label="Category" name="category">
              <Select placeholder="Select category" options={CATEGORY_OPTIONS.map(c => ({ label: c, value: c }))} allowClear />
            </Form.Item>
            <Form.Item label="Unit Price (₹)" name="unit_price" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} prefix="₹" />
            </Form.Item>
            <Form.Item label="Tax %" name="tax_percent" initialValue={18}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
            </Form.Item>
            <Form.Item label="Description" name="description" style={{ gridColumn: '1 / -1' }}>
              <TextArea rows={2} placeholder="Brief description of the service..." />
            </Form.Item>
            <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
          </div>

          <Divider orientation="left" style={{ fontSize: 13, color: '#6b7280' }}>Line Items (used in auto-generated quotes)</Divider>

          {lineItems.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <Input
                value={item.item_name}
                onChange={e => updateLineItem(index, 'item_name', e.target.value)}
                placeholder="Item name"
                size="small"
              />
              <InputNumber
                value={item.qty}
                onChange={v => updateLineItem(index, 'qty', v)}
                min={0}
                size="small"
                placeholder="Qty"
                style={{ width: '100%' }}
              />
              <InputNumber
                value={item.unit_price}
                onChange={v => updateLineItem(index, 'unit_price', v)}
                min={0}
                size="small"
                prefix="₹"
                placeholder="Price"
                style={{ width: '100%' }}
              />
              <InputNumber
                value={item.tax_percent}
                onChange={v => updateLineItem(index, 'tax_percent', v)}
                min={0}
                max={100}
                size="small"
                suffix="%"
                style={{ width: '100%' }}
              />
              <Button
                icon={<Trash2 size={14} />}
                size="small"
                danger
                type="text"
                onClick={() => removeLineItem(index)}
                disabled={lineItems.length === 1}
              />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1fr auto', gap: 8, marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>Item Name</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Qty</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Unit Price</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Tax %</Text>
            <span />
          </div>

          <Button icon={<PlusCircleOutlined />} size="small" onClick={addLineItem} type="dashed" style={{ width: '100%', marginBottom: 24 }}>
            Add Line Item
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
