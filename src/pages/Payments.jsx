import { useState, useEffect } from "react";
import { 
  Card, Table, Input, Button, Modal, Form, Select, message, 
  Popconfirm, Row, Col, Spin, Tag, DatePicker, InputNumber 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  DollarOutlined, CreditCardOutlined, BankOutlined, WalletOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { paymentService, invoiceService } from "../services";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterMethod, setFilterMethod] = useState("All");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getAll();
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await invoiceService.getAll();
      if (response.success) {
        setInvoices(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load invoices');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        payment_date: values.payment_date ? values.payment_date.toISOString() : new Date().toISOString()
      };

      const response = editingPayment
        ? await paymentService.update(editingPayment.id, formattedValues)
        : await paymentService.create(formattedValues);
      
      if (response.success) {
        message.success(editingPayment ? 'Payment updated successfully' : 'Payment recorded successfully');
        fetchPayments();
        setModalOpen(false);
        setEditingPayment(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    form.setFieldsValue({
      invoice_id: payment.invoice_id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date ? dayjs(payment.payment_date) : null,
      reference_number: payment.reference_number
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await paymentService.delete(id);
      if (response.success) {
        message.success('Payment deleted successfully');
        fetchPayments();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleAddNew = () => {
    setEditingPayment(null);
    form.resetFields();
    setModalOpen(true);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchSearch = 
      payment.reference_number?.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.invoice?.invoice_number?.toLowerCase().includes(searchText.toLowerCase());
    const matchMethod = filterMethod === "All" || payment.payment_method === filterMethod;
    return matchSearch && matchMethod;
  });

  const getMethodIcon = (method) => {
    const icons = {
      'Cash': <DollarOutlined style={{ color: "#10b981" }} />,
      'UPI': <WalletOutlined style={{ color: "#8b5cf6" }} />,
      'Card': <CreditCardOutlined style={{ color: "#3b82f6" }} />,
      'Bank': <BankOutlined style={{ color: "#f59e0b" }} />
    };
    return icons[method] || <DollarOutlined />;
  };

  const getMethodColor = (method) => {
    const colors = {
      'Cash': 'success',
      'UPI': 'purple',
      'Card': 'processing',
      'Bank': 'warning'
    };
    return colors[method] || 'default';
  };

  const columns = [
    {
      title: "Invoice",
      key: "invoice",
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: "#111827" }}>
          {record.invoice?.invoice_number || `INV-${record.invoice_id}`}
        </span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount) => (
        <span style={{ fontWeight: 700, color: "#10b981", fontSize: 15 }}>
          ₹{amount?.toLocaleString("en-IN") || 0}
        </span>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      render: (method) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {getMethodIcon(method)}
          <Tag color={getMethodColor(method)}>{method}</Tag>
        </div>
      ),
    },
    {
      title: "Reference",
      dataIndex: "reference_number",
      render: (ref) => <span style={{ color: "#4b5563" }}>{ref || 'N/A'}</span>
    },
    {
      title: "Payment Date",
      dataIndex: "payment_date",
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
            title="Delete payment"
            description="Are you sure you want to delete this payment?"
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

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashPayments = payments.filter(p => p.payment_method === 'Cash').reduce((sum, p) => sum + (p.amount || 0), 0);
  const upiPayments = payments.filter(p => p.payment_method === 'UPI').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f5f6f8" }}>
      {loading && !payments.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>Payments</Title>
              <Text type="secondary">Track and manage payment records</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ height: 40, borderRadius: 8 }}
                onClick={handleAddNew}
              >
                Record Payment
              </Button>
            </Col>
          </Row>

          {/* STATS */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title: "Total Received", amount: totalAmount, color: "#10b981", icon: <DollarOutlined /> },
              { title: "Cash Payments", amount: cashPayments, color: "#3b82f6", icon: <DollarOutlined /> },
              { title: "UPI Payments", amount: upiPayments, color: "#8b5cf6", icon: <WalletOutlined /> },
              { title: "Total Transactions", count: payments.length, color: "#f59e0b", icon: <CreditCardOutlined /> },
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
                    <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: "#111827" }}>
                      {item.amount !== undefined ? `₹${item.amount.toLocaleString("en-IN")}` : item.count}
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
                  placeholder="Search by reference or invoice..."
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  style={{ height: 40, borderRadius: 8 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {["All", "Cash", "UPI", "Card", "Bank"].map((method) => (
                    <Button
                      key={method}
                      type={filterMethod === method ? "primary" : "default"}
                      onClick={() => setFilterMethod(method)}
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>

          {/* PAYMENTS TABLE */}
          <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Payment Records ({filteredPayments.length})
              </span>
            </div>
            <Table
              columns={columns}
              dataSource={filteredPayments}
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
        title={editingPayment ? "Edit Payment" : "Record Payment"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingPayment(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            label="Invoice" 
            name="invoice_id" 
            rules={[{ required: true, message: 'Please select invoice' }]}
          >
            <Select placeholder="Select invoice" showSearch optionFilterProp="children">
              {invoices.map(invoice => (
                <Option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - ₹{invoice.total_amount?.toLocaleString("en-IN")} ({invoice.status})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Amount" 
                name="amount" 
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Enter amount" 
                  min={0}
                  prefix="₹"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Payment Method" 
                name="payment_method" 
                rules={[{ required: true, message: 'Please select method' }]}
              >
                <Select placeholder="Select method">
                  <Option value="Cash">Cash</Option>
                  <Option value="UPI">UPI</Option>
                  <Option value="Card">Card</Option>
                  <Option value="Bank">Bank Transfer</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Payment Date" 
                name="payment_date" 
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Reference Number" name="reference_number">
                <Input placeholder="Enter reference number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10}>
            <Col span={12}>
              <Button 
                block 
                onClick={() => {
                  setModalOpen(false);
                  setEditingPayment(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingPayment ? 'Update' : 'Record'} Payment
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
