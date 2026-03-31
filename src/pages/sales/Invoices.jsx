import { useState, useEffect } from "react";
import { 
  Card,
  Input,
  Button,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  Spin,
  Tag,
  InputNumber,
  Avatar,
  Divider,
  Switch,
  Tooltip
} from "antd";  
import { 
  SearchOutlined, DownloadOutlined, SendOutlined, EyeOutlined, 
  PlusOutlined, FileTextOutlined, EditOutlined, DeleteOutlined,
  BellOutlined, RetweetOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { invoiceService, customerService, dealService, quotationService } from "../../services";
import dayjs from "dayjs";
import ResponsiveTable from "../../components/ResponsiveTable";
import QuoteInvoiceView from "../../components/QuoteInvoiceView";

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
const [bulkModalOpen, setBulkModalOpen] = useState(false);
const [reminding, setReminding] = useState(false);
  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchDeals();
    fetchQuotations();
  }, []);
const th = {
  padding: 10,
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb"
};

const td = {
  padding: 10,
  borderBottom: "1px solid #f3f4f6"
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 8
};
  const fetchInvoices = async () => {
  setLoading(true);
  try {
    const response = await invoiceService.getAll();
    if (response.success) {
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setInvoices(sorted);
    }
  } catch (error) {
    message.error("Failed to load invoices");
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
      status: invoice.status,
      is_recurring: invoice.is_recurring,
      recurring_interval: invoice.recurring_interval,
      items: invoice.items?.length > 0 ? invoice.items : [{ description: "", quantity: 1, unit_price: 0, tax_percent: 0, total: 0 }]
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
    form.setFieldsValue({
      items: [{ description: "", quantity: 1, unit_price: 0, tax_percent: 0, total: 0 }],
      status: 'Pending',
      paid_amount: 0,
      is_recurring: false
    });
    setModalOpen(true);
  };

  const handleSendReminder = async (id) => {
    setReminding(true);
    try {
      const res = await invoiceService.sendReminder(id);
      if (res.success) {
        message.success("Reminder sent successfully!");
        fetchInvoices();
      }
    } catch (err) {
      message.error("Failed to send reminder");
    } finally {
      setReminding(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch =
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.status?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "All" || inv.status === filter;
    return matchSearch && matchStatus;
  });
  const handleDownloadTemplate = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/quotation/template/download", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice_template.csv";
    a.click();

    message.success("Template downloaded");
  } catch (error) {
    message.error("Download failed");
  }
};

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
    align: "center",
    render: (text, record) => (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, cursor:"pointer" }} onClick={() => handleView(record)}>
        <FileTextOutlined style={{ color: "#1677ff" }} />
        <span style={{ fontWeight: 600, color: "#111827" }}>{text}</span>
        {record.is_recurring && <Tooltip title={`Recurring: ${record.recurring_interval}`}><RetweetOutlined style={{ color: '#7c3aed' }} /></Tooltip>}
      </div>
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
    title: "Total Amount",
    dataIndex: "total_amount",
    align: "center",
    render: (amount) => (
      <span style={{ fontWeight: 700 }}>
        ₹{amount?.toLocaleString("en-IN") || 0}
      </span>
    ),
  },
  {
    title: "Paid",
    dataIndex: "paid_amount",
    align: "center",
    render: (paid) => (
      <span style={{ color: "#10b981", fontWeight: 600 }}>
        ₹{paid?.toLocaleString("en-IN") || 0}
      </span>
    ),
  },
  {
    title: "Due",
    dataIndex: "due_amount",
    align: "center",
    render: (due) => (
      <span style={{ color: "#ef4444", fontWeight: 600 }}>
        ₹{due?.toLocaleString("en-IN") || 0}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    align: "center",
    render: (status) => (
      <Tag color={getStatusColor(status)}>
        {status}
      </Tag>
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
        <Tooltip title="View Details">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)} />
        </Tooltip>
        
        {record.status !== 'Paid' && (
          <Tooltip title="Send Reminder">
            <Button 
              type="link" 
              icon={<BellOutlined />} 
              onClick={() => handleSendReminder(record.id)} 
              loading={reminding && selectedInvoice?.id === record.id}
            />
          </Tooltip>
        )}

        <Tooltip title="Edit">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        </Tooltip>

        <Popconfirm title="Delete invoice" onConfirm={() => handleDelete(record.id)}>
          <Tooltip title="Delete">
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Tooltip>
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
     
           <div style={{ display: "flex", gap: 10 }}>
  
  <button
    onClick={handleAddNew}
    className="flex items-center gap-2 bg-[#1677ff] text-white px-4 h-10 rounded-lg"
  >
    <PlusOutlined />
    Create Invoice
  </button>

  <button
    onClick={() => setBulkModalOpen(true)}
    className="flex items-center gap-2 border px-4 h-10 rounded-lg"
  >
    <DownloadOutlined />
    Bulk Upload
  </button>

</div>
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
           className="bg-white p-4 lg:px-5 rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e5e7eb] mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
<div className="flex items-center gap-3 min-w-[300px] bg-[#f9fafb] border border-[#d1d5db] px-3 h-10 rounded-lg">
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
<div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
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
                const dueAmount = record.total_amount - record.paid_amount;
                
                return (
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <FileTextOutlined style={{ fontSize: 20 }} />
                        </div>
                        <div>
                          <div className="font-bold text-[15px] text-gray-900 leading-tight">{record.invoice_number}</div>
                          <div className="text-[12px] text-gray-400">{dayjs(record.created_at).format('MMM DD, YYYY')}</div>
                        </div>
                      </div>
                      <Tag color={statusColors[record.status] || 'default'} style={{ borderRadius: 6, margin: 0 }}>
                        {record.status}
                      </Tag>
                    </div>

                    {/* Financials Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Total</div>
                        <div className="text-[14px] font-bold text-gray-900">₹{record.total_amount?.toLocaleString() || 0}</div>
                      </div>
                      <div className="text-center border-x border-gray-100 px-2">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Paid</div>
                        <div className="text-[14px] font-bold text-green-600">₹{record.paid_amount?.toLocaleString() || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Due</div>
                        <div className="text-[14px] font-bold text-red-500">₹{dueAmount?.toLocaleString() || 0}</div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar size={24} style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }} icon={<UserOutlined />} />
                        <span className="text-[13px] font-medium text-gray-700">{record.customer?.name || 'N/A'}</span>
                      </div>
                      {record.is_recurring && (
                        <Tag icon={<RetweetOutlined />} color="purple" style={{ margin: 0, fontSize: 10 }}>Recurring</Tag>
                      )}
                    </div>

                    {/* Quick Access Bar */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        type="primary" 
                        variant="soft" 
                        block 
                        icon={<EyeOutlined />} 
                        onClick={(e) => { e.stopPropagation(); handleView(record); }}
                        className="h-10 rounded-lg font-semibold bg-gray-100 text-gray-700 border-none hover:bg-gray-200"
                      >
                        View Details
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                           icon={<EditOutlined />} 
                           onClick={(e) => { e.stopPropagation(); handleEdit(record); }}
                           className="w-10 h-10 rounded-lg flex items-center justify-center border-gray-200"
                        />
                        <Popconfirm title="Delete invoice?" onConfirm={(e) => { e.stopPropagation(); handleDelete(record.id); }}>
                          <Button danger icon={<DeleteOutlined />} className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80" />
                        </Popconfirm>
                      </div>
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
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          onValuesChange={(changed, all) => {
            if (changed.items) {
              const total = (all.items || []).reduce((sum, item) => {
                return sum + ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0));
              }, 0);
              form.setFieldsValue({ total_amount: total });
            }
          }}
        >
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

          <Divider orientation="left" style={{ margin: '12px 0' }}>Line Items</Divider>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'start' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: 'Missing description' }]}
                      style={{ flex: 3, marginBottom: 0 }}
                    >
                      <Input placeholder="Description (e.g. Consulting)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true }]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <InputNumber placeholder="Qty" min={1} style={{ width: '100% '}} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unit_price']}
                      rules={[{ required: true }]}
                      style={{ flex: 2, marginBottom: 0 }}
                    >
                      <InputNumber placeholder="Price" min={0} prefix="₹" style={{ width: '100%' }} />
                    </Form.Item>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => remove(name)} 
                      disabled={fields.length === 1}
                    />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                  Add Item
                </Button>
              </>
            )}
          </Form.List>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Total Amount" 
                name="total_amount" 
                rules={[{ required: true, message: 'Please enter amount' }]}
                tooltip="Calculated from items above"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Enter amount" 
                  min={0}
                  prefix="₹"
                  onChange={() => {}} // User can override or we can auto-calc
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

          <Row gutter={16}>
            <Col span={12}>
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
            </Col>
            <Col span={12}>
              <Form.Item label="Is Recurring?" name="is_recurring" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            noStyle 
            shouldUpdate={(prev, curr) => prev.is_recurring !== curr.is_recurring}
          >
            {({ getFieldValue }) => 
              getFieldValue('is_recurring') ? (
                <Form.Item label="Recurrence Interval" name="recurring_interval" rules={[{ required: true }]}>
                  <Select placeholder="Select interval">
                    <Option value="Monthly">Monthly</Option>
                    <Option value="Quarterly">Quarterly</Option>
                    <Option value="Yearly">Yearly</Option>
                  </Select>
                </Form.Item>
              ) : null
            }
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
      <QuoteInvoiceView
  open={viewOpen}
  onClose={() => setViewOpen(false)}
  record={selectedInvoice}
  type="invoice"
/>
<Modal
  open={bulkModalOpen}
  onCancel={() => setBulkModalOpen(false)}
  footer={null}
  width={900}
  centered
>
  <h2 style={{ fontSize: 20, fontWeight: 600 }}>Bulk Upload Invoices</h2>

{/* STEP 1 */}
<div style={{ marginTop: 20 }}>
  <h3>Step 1: Download Template</h3>
  <p style={{ color: "#6b7280" }}>
    Download the Excel template with correct format
  </p>

  <Button
    icon={<DownloadOutlined />}
    type="primary"
    onClick={handleDownloadTemplate}
  >
    Download Invoice Template
  </Button>

  <div style={{
    marginTop: 15,
    padding: 15,
    background: "#f9fafb",
    borderRadius: 10
  }}>
    Required Fields:
    <div style={{ marginTop: 8 }}>
      <Tag>customer_id</Tag>
      <Tag>deal_id</Tag>
      <Tag>total_amount</Tag>
      <Tag>paid_amount</Tag>
      <Tag>status</Tag>
    </div>
  </div>
</div>

{/* STEP 2 */}
<div style={{ marginTop: 25 }}>
  <h3>Step 2: Upload Your File</h3>

  <div style={{
    border: "2px dashed #d1d5db",
    borderRadius: 10,
    padding: 40,
    textAlign: "center",
    background: "#fafafa"
  }}>
    <p>Click or drag file to upload</p>
    <p style={{ color: "#6b7280" }}>
      Support Excel (.xlsx, .xls) or CSV
    </p>

    <input type="file" style={{ marginTop: 10 }} />
  </div>
</div>
</Modal>
    </div>
  );
}
