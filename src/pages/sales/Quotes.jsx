import { useState, useEffect } from "react";
import { 
  Card, Input, Button, Modal, Form, Select, message, 
  Popconfirm, Row, Col, Spin, Tag, InputNumber 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EyeOutlined, SendOutlined, 
  DownloadOutlined, FileTextOutlined, EditOutlined, DeleteOutlined 
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { quotationService, customerService, dealService } from "../../services";
import dayjs from "dayjs";
import ResponsiveTable from "../../components/ResponsiveTable";

const { Option } = Select;
const { Title, Text } = Typography;

export default function Quotes() {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [form] = Form.useForm();
const [viewModalOpen, setViewModalOpen] = useState(false);
const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
    fetchDeals();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await quotationService.getAll();
      if (response.success) {
        setQuotations(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load quotations');
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

  const handleSubmit = async (values) => {
    try {
      const response = editingQuote
        ? await quotationService.update(editingQuote.id, values)
        : await quotationService.create(values);
      
      if (response.success) {
        message.success(editingQuote ? 'Quotation updated successfully' : 'Quotation created successfully');
        fetchQuotations();
        setModalOpen(false);
        setEditingQuote(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    form.setFieldsValue({
      customer_id: quote.customer_id,
      deal_id: quote.deal_id,
      total_amount: quote.total_amount,
      tax_amount: quote.tax_amount,
      status: quote.status
    });
    setModalOpen(true);
  };
const handleView = (quote) => {
  setSelectedQuote(quote);
  setViewModalOpen(true);
};
  const handleDelete = async (id) => {
    try {
      const response = await quotationService.delete(id);
      if (response.success) {
        message.success('Quotation deleted successfully');
        fetchQuotations();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleAddNew = () => {
    setEditingQuote(null);
    form.resetFields();
    setModalOpen(true);
  };

  const filteredQuotes = quotations.filter((q) => {
    const matchSearch = 
      q.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "All" || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'default',
      'Sent': 'processing',
      'Approved': 'success',
      'Rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
  {
    title: "Quote ID",
    dataIndex: "quotation_number",
    align: "center",
    render: (text) => (
      <span style={{ fontWeight: 600, color: "#111827" }}>{text}</span>
    )
  },
  {
    title: "Customer",
    key: "customer",
    align: "center",
    render: (_, record) => (
      <div>
        <div style={{ fontWeight: 600, color: "#111827" }}>
          {record.customer?.name || "N/A"}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {record.customer?.email || ""}
        </div>
      </div>
    ),
  },
  {
    title: "Amount",
    dataIndex: "total_amount",
    align: "center",
    render: (amount) => (
      <span style={{ fontWeight: 700, color: "#10b981" }}>
        ₹{amount?.toLocaleString("en-IN") || 0}
      </span>
    ),
  },
  {
    title: "Tax",
    dataIndex: "tax_amount",
    align: "center",
    render: (tax) => (
      <span style={{ color: "#4b5563" }}>
        ₹{tax?.toLocaleString("en-IN") || 0}
      </span>
    )
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
    title: "Created",
    dataIndex: "created_at",
    align: "center",
    render: (date) => (
      <span style={{ color: "#4b5563" }}>
        {date ? dayjs(date).format("MMM DD, YYYY") : "N/A"}
      </span>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    align: "center",
    render: (_, record) => (
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
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
          title="Delete quotation"
          description="Are you sure you want to delete this quotation?"
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
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const fontInter = { fontFamily: '"Inter", sans-serif' };

  const totalValue = quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0);
  const approvedValue = quotations.filter(q => q.status === 'Approved').reduce((sum, q) => sum + (q.total_amount || 0), 0);
  const pendingCount = quotations.filter(q => q.status === 'Sent').length;

  return (
    <div className="p-4 md:p-6 min-h-screen" style={fontInter}>
      {loading && !quotations.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* ================= HEADER ================= */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Quotes Management
              </Title>
              <Text type="secondary">
                Create and manage sales quotations
              </Text>
            </div>

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-[#1677ff] hover:bg-[#0958d9] transition-colors text-white px-4 h-10 rounded-lg font-medium text-[14px] shadow-sm"
            >
              <PlusOutlined />
              New Quote
            </button>
          </div>

          {/* ================= SUMMARY CARDS (Animated) ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { title: "Total Quotes", count: quotations.length, icon: <FileTextOutlined className="text-[#7c3aed]" />, bg: "bg-[#7c3aed]/10", color: "#111827" },
              { title: "Quote Value", count: `₹${(totalValue / 100000).toFixed(1)}L`, icon: <FileTextOutlined className="text-[#10b981]" />, bg: "bg-[#10b981]/10", color: "#10b981" },
              { title: "Pending", count: pendingCount, icon: <FileTextOutlined className="text-[#f59e0b]" />, bg: "bg-[#f59e0b]/10", color: "#f59e0b" },
              { title: "Approved Value", count: `₹${(approvedValue / 100000).toFixed(1)}L`, icon: <FileTextOutlined className="text-[#3b82f6]" />, bg: "bg-[#3b82f6]/10", color: "#3b82f6" },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -6, boxShadow: "0 12px 35px rgba(2,6,23,0.12)" }}
                variants={cardAnimation}
                className="bg-white p-5 rounded-[14px] shadow-[0_10px_30px_rgba(2,6,23,0.06)] flex items-center gap-4 cursor-pointer transition-shadow"
              >
                <div className={`${item.bg} p-3 rounded-[10px] text-[20px]`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-[#6b7280] text-[13px] font-semibold uppercase tracking-[0.5px]">{item.title}</p>
                  <h2 className={`text-[28px] font-[800] mt-1 leading-none`} style={{ color: item.color }}>
                    {item.count}
                  </h2>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ================= SEARCH & FILTERS ================= */}
          <div className="bg-white p-4 lg:px-6 rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e5e7eb] mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 w-full bg-[#f9fafb] border border-[#e5e7eb] px-3 h-10 rounded-lg">
              <SearchOutlined className="text-[#9ca3af]" />
              <input
                placeholder="Search quotes or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none w-full bg-transparent text-[14px] text-[#111827]"
                style={fontInter}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {["All", "Draft", "Sent", "Approved", "Rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
  filterStatus === status
    ? "bg-[#1677ff] text-white shadow"
    : "bg-white text-gray-600 hover:bg-gray-100 border border-[#e5e7eb]"
}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* ================= QUOTATIONS TABLE ================= */}
          <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Latest Quotations ({filteredQuotes.length})
              </span>
            </div>
            <ResponsiveTable
              columns={columns}
              dataSource={filteredQuotes}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              renderMobileCard={(record) => {
                const statusColors = {
                  'Draft': 'default',
                  'Sent': 'processing',
                  'Approved': 'success',
                  'Rejected': 'error'
                };
                
                return (
                  <div>
                    {/* Header with Quote ID and Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileTextOutlined style={{ color: "#1677ff", fontSize: 18 }} />
                        <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
                          {record.quotation_number}
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
                        <strong>Amount:</strong>{' '}
                        <span style={{ fontWeight: 700, color: "#10b981" }}>
                          ₹{record.total_amount?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Tax:</strong> ₹{record.tax_amount?.toLocaleString("en-IN") || 0}
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
                        title="Delete quotation"
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
        title={editingQuote ? "Edit Quotation" : "Create Quotation"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingQuote(null);
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

          <Form.Item label="Deal (Optional)" name="deal_id">
            <Select placeholder="Select deal" showSearch optionFilterProp="children" allowClear>
              {deals.map(deal => (
                <Option key={deal.id} value={deal.id}>
                  {deal.deal_name} - {deal.stage}
                </Option>
              ))}
            </Select>
          </Form.Item>

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
              <Form.Item label="Tax Amount" name="tax_amount">
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Enter tax" 
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
              <Option value="Draft">Draft</Option>
              <Option value="Sent">Sent</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <Row gutter={10}>
            <Col span={12}>
              <Button 
                block 
                onClick={() => {
                  setModalOpen(false);
                  setEditingQuote(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingQuote ? 'Update' : 'Create'} Quotation
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
  title="Quotation Details"
  open={viewModalOpen}
  footer={null}
  onCancel={() => setViewModalOpen(false)}
  centered
>
  {selectedQuote && (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p><b>Quote ID:</b> {selectedQuote.quotation_number}</p>
      <p><b>Customer:</b> {selectedQuote.customer?.name || "N/A"}</p>
      <p><b>Email:</b> {selectedQuote.customer?.email || "N/A"}</p>
      <p><b>Deal:</b> {selectedQuote.deal?.deal_name || "N/A"}</p>
      <p><b>Total Amount:</b> ₹{selectedQuote.total_amount?.toLocaleString("en-IN")}</p>
      <p><b>Tax Amount:</b> ₹{selectedQuote.tax_amount?.toLocaleString("en-IN")}</p>
      <p><b>Status:</b> {selectedQuote.status}</p>
      <p><b>Created:</b> {selectedQuote.created_at ? dayjs(selectedQuote.created_at).format("MMM DD, YYYY") : "N/A"}</p>
    </div>
  )}
</Modal>
    </div>
  );
}
