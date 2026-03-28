import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber, DatePicker, message } from "antd";
import { customerService, userService, serviceCatalogService } from "../services";
import dayjs from "dayjs";

const { Option } = Select;

export default function AddDealModal({ open, onClose, onAdd, deal = null }) {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchUsers();
      fetchServices();
      if (deal) {
        form.setFieldsValue({
          ...deal,
          expected_close_date: deal.expected_close_date ? dayjs(deal.expected_close_date) : null
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, deal, form]); // Added form to deps to avoid size change warnings and be safe

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

  const fetchServices = async () => {
    try {
      const response = await serviceCatalogService.getAll({ is_active: 'true' });
      if (response.success) setServices(response.data || []);
    } catch (error) {
      console.error('Failed to load services');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const dealData = {
        deal_name: values.deal_name,
        customer_id: values.customer_id,
        value: values.value,
        stage: values.stage,
        probability: values.probability,
        expected_close_date: values.expected_close_date ? values.expected_close_date.format('YYYY-MM-DD') : null,
        assigned_to: values.assigned_to,
        priority: values.priority,
        deal_type: values.deal_type,
        source: values.source,
        service_id: values.service_id || null,
        description: values.description
      };

      await onAdd(dealData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const DEAL_STAGES = [
    'Qualification',
    'Needs Analysis',
    'Value Proposition',
    'Id. Decision Makers',
    'Perception Analysis',
    'Proposal/Price Quote',
    'Negotiation/Review',
    'Closed Won',
    'Closed Lost'
  ];

  return (
    <Modal
      title={deal ? "Edit Deal" : "Create Deal"}
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      okText={deal ? "Update Deal" : "Create Deal"}
      cancelText="Cancel"
      width={800}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          stage: 'Qualification',
          probability: 10,
          priority: 'Medium',
          deal_type: 'New Business'
        }}
      >
        <div className="grid grid-cols-3 gap-x-4">
          <Form.Item
            label="Deal Name"
            name="deal_name"
            rules={[{ required: true, message: 'Please enter deal name' }]}
            className="col-span-3"
          >
            <Input placeholder="Enter deal name" />
          </Form.Item>

          <Form.Item
            label="Customer"
            name="customer_id"
            rules={[{ required: true, message: 'Please select customer' }]}
          >
            <Select placeholder="Select customer" showSearch optionFilterProp="children">
              {customers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} {customer.company ? `(${customer.company})` : ''}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Deal Value"
            name="value"
            rules={[{ required: true, message: 'Please enter deal value' }]}
          >
            <InputNumber
              placeholder="Enter value"
              style={{ width: '100%' }}
              min={0}
              prefix="₹"
            />
          </Form.Item>

          <Form.Item
            label="Stage"
            name="stage"
            rules={[{ required: true, message: 'Please select stage' }]}
          >
            <Select placeholder="Select stage">
              {DEAL_STAGES.map(s => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Probability (%)"
            name="probability"
          >
            <InputNumber
              placeholder="Enter probability"
              style={{ width: '100%' }}
              min={0}
              max={100}
            />
          </Form.Item>

          <Form.Item
            label="Priority"
            name="priority"
          >
            <Select>
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Deal Type"
            name="deal_type"
          >
            <Select>
              <Option value="New Business">New Business</Option>
              <Option value="Existing Business">Existing Business</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Source"
            name="source"
          >
            <Input placeholder="Referred, Website, etc." />
          </Form.Item>

          <Form.Item
            label="Expected Close Date"
            name="expected_close_date"
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Service / Product"
            name="service_id"
          >
            <Select placeholder="Select service (optional)" allowClear showSearch optionFilterProp="label"
              options={services.map(s => ({ label: `${s.name}${s.category ? ` — ${s.category}` : ''}`, value: s.id }))}
            />
          </Form.Item>

          <Form.Item
            label="Assigned To"
            name="assigned_to"
          >
            <Select placeholder="Select user" showSearch optionFilterProp="children">
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            className="col-span-3"
          >
            <Input.TextArea rows={3} placeholder="Additional deal details..." />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}