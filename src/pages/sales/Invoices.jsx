import { useState, useEffect } from "react";
import { 
  Card, Input, Button, Modal, Form, Select, message, 
  Popconfirm, Row, Col, Spin, Tag, InputNumber 
} from "antd";
import { 
  SearchOutlined, DownloadOutlined, SendOutlined, EyeOutlined, 
  PlusOutlined, FileTextOutlined, EditOutlined, DeleteOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { invoiceService, customerService, dealService, quotationService } from "../../services";
import dayjs from "dayjs";
import ResponsiveTable from "../../components/ResponsiveTable";

const { Option } = Select;
const { Title, Text } = Typography;

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [form] = Form.useForm();
const [viewOpen, setViewOpen] = useState(false);
const [selectedInvoice, setSelectedInvoice] = useState(null);
  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchDeals();
    fetchQuotations();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoiceService.getAll();
      if (response.success) {
        setInvoices(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load invoices');
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

  const fetchQuotations = async () => {
    try {
      const response = await quotationService.getAll();
      if (response.success) {
        setQuotations(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load quotations');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = editingInvoice
        ? await invoiceService.update(editingInvoice.id, values)
        : await invoiceService.create(values);
      
      if (response.success) {
        message.success(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
        fetchInvoices();
        setModalOpen(false);
        setEditingInvoice(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    form.setFieldsValue({
      customer_id: invoice.customer_id,
      deal_id: invoice.deal_id,
      quotation_id: invoice.quotation_id,
      total_amount: invoice.total_amount,
      paid_amount: invoice.paid_amount,
      status: invoice.status
    });
    setModalOpen(true);
  };
const handleView = (invoice) => {
  setSelectedInvoice(invoice);
  setViewOpen(true);
};
  const handleDelete = async (id) => {
    try {
      const response = await invoiceService.delete(id);
      if (response.success) {
        message.success('Invoice deleted successfully');
        fetchInvoices();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleAddNew = () => {
    setEditingInvoice(null);
    form.resetFields();
    setModalOpen(true);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch =
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.status?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "All" || inv.status === filter;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Partial': 'processing',
      'Paid': 'success'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoice_number",
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined style={{ color: "#1677ff" }} />
          <span style={{ fontWeight: 600, color: "#111827" }}>{text}</span>
        </div>
      )
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
      title: "Total Amount",
      dataIndex: "total_amount",
      render: (amount) => (
        <span style={{ fontWeight: 700, color: "#111827" }}>
          ₹{amount?.toLocaleString("en-IN") || 0}
        </span>
      ),
    },
    {
      title: "Paid",
      dataIndex: "paid_amount",
      render: (paid) => (
        <span style={{ color: "#10b981", fontWeight: 600 }}>
          ₹{paid?.toLocaleString("en-IN") || 0}
        </span>
      ),
    },
    {
      title: "Due",
      dataIndex: "due_amount",
      render: (due) => (
        <span style={{ color: "#ef4444", fontWeight: 600 }}>
          ₹{due?.toLocaleString("en-IN") || 0}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
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
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
              >
                View
              </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete invoice"
            description="Are you sure you want to delete this invoice?"
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
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const fontInter = { fontFamily: '"Inter", sans-serif' };

 const total = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

const paid = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);

const pending = invoices
  .filter(inv => inv.status === "Pending")
  .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
  return (
    <div className="p-4 md:p-6 min-h-screen" style={fontInter}>
      {loading && !invoices.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* ================= HEADER ================= */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Invoices
              </Title>
              <Text type="secondary">
                Manage your billing and payments
              </Text>
            </div>
     
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-[#1677ff] hover:bg-[#0958d9] transition-colors text-white px-4 h-10 rounded-lg font-medium text-[14px] shadow-sm"
            >
              <PlusOutlined />
              Create Invoice
            </button>
          </div>

          {/* ================= SUMMARY CARDS (Animated) ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { title: "Total Amount", amount: total, color: "#111827", bg: "#1677ff" },
              { title: "Paid", amount: paid, color: "#10b981", bg: "#10b981" },
              { title: "Pending", amount: pending, color: "#f59e0b", bg: "#f59e0b" }
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -6, boxShadow: "0 12px 35px rgba(2,6,23,0.12)" }}
                variants={cardAnimation}
                className={`bg-white p-5 rounded-[14px] shadow-[0_10px_30px_rgba(2,6,23,0.06)] flex flex-col justify-between cursor-pointer border-t-[4px]`}
                style={{ borderTopColor: item.bg }}
              >
                <p className="text-[#6b7280] text-[13px] font-semibold uppercase tracking-[0.5px]">
                  {item.title}
                </p>
                <h2 className="text-[32px] font-[800] mt-2 leading-none" style={{ color: item.color }}>
                  ₹{item.amount.toLocaleString("en-IN")}
                </h2>
              </motion.div>
            ))}
          </div>

          {/* ================= SEARCH + FILTER ================= */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white p-4 lg:px-5 rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e5e7eb] mb-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3 w-full bg-[#f9fafb] border border-[#d1d5db] px-3 h-10 rounded-lg">
              <SearchOutlined className="text-[#9ca3af]" />
              <input
                placeholder="Search invoices, customer, status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none w-full bg-transparent text-[14px] text-[#111827]"
                style={fontInter}
              />
            </div>

            {/* STATUS TABS */}
           <div className="flex flex-wrap items-center gap-2">
  {["All", "Paid", "Pending", "Partial"].map((status) => {
    const count =
      status === "All"
        ? invoices.length
        : invoices.filter((i) => i.status === status).length;

    return (
      <button
        key={status}
        onClick={() => setFilter(status)}
        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
        ${
          filter === status
            ? "bg-[#1677ff] text-white shadow"
    : "bg-white text-gray-600 hover:bg-gray-100 border border-[#e5e7eb]"
        }`}
      >
        {status} ({count})
      </button>
    );
  })}
</div>
          </motion.div>

          {/* ================= INVOICES TABLE ================= */}
          <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Invoice List ({filteredInvoices.length})
              </span>
            </div>
            <ResponsiveTable
              columns={columns}
              dataSource={filteredInvoices}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              renderMobileCard={(record) => {
                const statusColors = {
                  'Pending': 'warning',
                  'Partial': 'processing',
                  'Paid': 'success'
                };
                
                return (
                  <div>
                    {/* Header with Invoice ID and Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileTextOutlined style={{ color: "#1677ff", fontSize: 18 }} />
                        <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
                          {record.invoice_number}
                        </span>
                      </div>
                      <Tag color={statusColors[record.status] || 'default'}>
                        {record.status}
                      </Tag>
                    </div>

                    {/* Customer Info */}
                    <div style={{ marginBottom: 12, paddingLeft: 8 }}>
                      <div style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                        {record.customer?.name || 'N/A'}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                        {record.customer?.email || ''}
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Total:</strong>{' '}
                        <span style={{ fontWeight: 700, color: "#111827" }}>
                          ₹{record.total_amount?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Paid:</strong>{' '}
                        <span style={{ color: "#10b981", fontWeight: 600 }}>
                          ₹{record.paid_amount?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Due:</strong>{' '}
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>
                          ₹{record.due_amount?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563" }}>
                        <strong>Created:</strong> {record.created_at ? dayjs(record.created_at).format('MMM DD, YYYY') : 'N/A'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                      >
                        View
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete invoice"
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
                );
              }}
            />
          </Card>
        </>
      )}

      {/* ================= ADD/EDIT MODAL ================= */}
      <Modal
        title={editingInvoice ? "Edit Invoice" : "Create Invoice"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingInvoice(null);
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Deal (Optional)" name="deal_id">
                <Select placeholder="Select deal" showSearch optionFilterProp="children" allowClear>
                  {deals.map(deal => (
                    <Option key={deal.id} value={deal.id}>
                      {deal.deal_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Quotation (Optional)" name="quotation_id">
                <Select placeholder="Select quotation" showSearch optionFilterProp="children" allowClear>
                  {quotations.map(quote => (
                    <Option key={quote.id} value={quote.id}>
                      {quote.quotation_number}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Total Amount" 
                name="total_amount" 
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
              <Form.Item label="Paid Amount" name="paid_amount">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Enter paid amount" 
                  min={0}
                  prefix="₹"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Status" 
            name="status" 
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="Pending">Pending</Option>
              <Option value="Partial">Partial</Option>
              <Option value="Paid">Paid</Option>
            </Select>
          </Form.Item>

          <Row gutter={10}>
            <Col span={12}>
              <Button 
                block 
                onClick={() => {
                  setModalOpen(false);
                  setEditingInvoice(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingInvoice ? 'Update' : 'Create'} Invoice
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
  title="Invoice Details"
  open={viewOpen}
  footer={null}
  onCancel={() => setViewOpen(false)}
  centered
>
  {selectedInvoice && (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      <p>
        <b>Invoice ID:</b> {selectedInvoice.invoice_number}
      </p>

      <p>
        <b>Customer:</b> {selectedInvoice.customer?.name || "N/A"}
      </p>

      <p>
        <b>Total Amount:</b> ₹{selectedInvoice.total_amount?.toLocaleString("en-IN")}
      </p>

      <p>
        <b>Paid Amount:</b> ₹{selectedInvoice.paid_amount?.toLocaleString("en-IN")}
      </p>

      <p>
        <b>Due Amount:</b> ₹{selectedInvoice.due_amount?.toLocaleString("en-IN")}
      </p>

      <p>
        <b>Status:</b>{" "}
        <Tag color={getStatusColor(selectedInvoice.status)}>
          {selectedInvoice.status}
        </Tag>
      </p>

      <p>
        <b>Created Date:</b>{" "}
        {selectedInvoice.created_at
          ? dayjs(selectedInvoice.created_at).format("MMM DD, YYYY")
          : "N/A"}
      </p>

    </div>
  )}
</Modal>
    </div>
  );
}
