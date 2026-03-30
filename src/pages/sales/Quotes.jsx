import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Card, Input, Button, Modal, Form, Select, message,
  Popconfirm, Row, Col, Spin, Tag, InputNumber, Tabs, Table
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EyeOutlined, SendOutlined, 
  DownloadOutlined, FileTextOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
  WhatsAppOutlined, FacebookOutlined, InstagramOutlined, FilePdfOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { quotationService, customerService, dealService, leadService, serviceCatalogService } from "../../services";
import dayjs from "dayjs";
import ResponsiveTable from "../../components/ResponsiveTable";
import QuoteInvoiceView from "../../components/QuoteInvoiceView";
import q2 from "../../assets/icons/q2.gif";
import q3 from "../../assets/icons/q3.gif";
import q4 from "../../assets/icons/q4.gif";
import BulkUploadModal from "../../components/BulkUploadModal";

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
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [leadsAwaitingQuote, setLeadsAwaitingQuote] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState(null);
  const [directPrintActive, setDirectPrintActive] = useState(false);
  const [downloadRecord, setDownloadRecord] = useState(null);
  const [services, setServices] = useState([]);         // catalog services
  const [selectedServiceIds, setSelectedServiceIds] = useState([]); // multi-select
  const [serviceTotal, setServiceTotal] = useState(0);  // live computed total
  const location = useLocation();

  useEffect(() => {
    fetchQuotations();
    fetchCustomers();
    fetchDeals();
    fetchLeads();
    fetchServices();

    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await quotationService.getAll();
      if (response.success) {
        setQuotations((response.data || []).reverse());
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

  const fetchLeads = async () => {
    try {
      const resp = await leadService.getAll();
      if (resp.success) {
        const filtered = (resp.data || []).filter(l => l.last_outcome === 'Sent_Awaiting');
        setLeadsAwaitingQuote(filtered);
      }
    } catch (err) {
      console.error('Failed to load leads', err);
    }
  };

  const fetchServices = async () => {
    try {
      const resp = await serviceCatalogService.getAll();
      if (resp.success) setServices((resp.data || []).filter(s => s.is_active !== false));
    } catch (err) {
      console.error('Failed to load services', err);
    }
  };

  // When services are selected, compute total automatically
  const handleServiceChange = (ids) => {
    setSelectedServiceIds(ids);
    const selected = services.filter(s => ids.includes(s.id));
    const total = selected.reduce((sum, s) => {
      const sub = parseFloat(s.unit_price || 0);
      const tax = (sub * parseFloat(s.tax_percent || 0)) / 100;
      return sum + sub + tax;
    }, 0);
    setServiceTotal(total);
    form.setFieldsValue({
      total_amount: parseFloat(total.toFixed(2)),
      tax_amount: parseFloat(selected.reduce((sum, s) => {
        const sub = parseFloat(s.unit_price || 0);
        return sum + (sub * parseFloat(s.tax_percent || 0)) / 100;
      }, 0).toFixed(2))
    });
  };

  const handleDownload = (quote) => {
    setDownloadRecord(quote);
    setDirectPrintActive(true);
  };

  const handlePreviewBeforeSave = () => {
    const values = form.getFieldsValue();
    if (!values.customer_id) {
      return message.warning('Please select a customer first');
    }
    
    const customer = customers.find(c => c.id === values.customer_id);
    const deal = deals.find(d => d.id === values.deal_id);
    
    const mockRecord = {
      ...values,
      customer,
      deal,
      quotation_number: 'DRAFT',
      created_at: new Date().toISOString(),
      items: [] // In this simple version we don't have items yet in the UI
    };
    
    setSelectedQuote(mockRecord);
    setViewModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      let response;

      if (!editingQuote && selectedServiceIds.length > 0) {
        // Generate from multiple services — gets full itemized lines
        response = await quotationService.generateFromMultipleServices({
          serviceIds: selectedServiceIds,
          customerId: values.customer_id,
          dealId: values.deal_id || null,
        });
        // Override status if needed
        if (response.success && values.status && values.status !== 'Draft') {
          await quotationService.update(response.data.id, { status: values.status });
        }
      } else {
        response = editingQuote
          ? await quotationService.update(editingQuote.id, values)
          : await quotationService.create(values);
      }

      if (response.success) {
        message.success(editingQuote ? 'Quotation updated successfully' : 'Quotation created successfully');

        if (!editingQuote && selectedLeadForQuote) {
          try {
            await leadService.update(selectedLeadForQuote.id, { last_outcome: 'Quote_Created' });
            fetchLeads();
          } catch (err) {
            console.error('Failed to update lead status after quote creation', err);
          }
        }

        fetchQuotations();
        setModalOpen(false);
        setEditingQuote(null);
        setSelectedLeadForQuote(null);
        setSelectedServiceIds([]);
        setServiceTotal(0);
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
    setSelectedLeadForQuote(null);
    setSelectedServiceIds([]);
    setServiceTotal(0);
    form.resetFields();
    form.setFieldsValue({ status: 'Draft' });
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
      render: (text) => <span style={{ fontWeight: 600, color: "#111827" }}>{text}</span>
    },
    {
      title: "Customer",
      key: "customer",
      align: "center",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.customer?.name || "N/A"}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{record.customer?.email || ""}</div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 10 }}>
            <a href={`https://wa.me/${record.customer?.phone || ""}`} target="_blank" style={{ width: 30, height: 30, borderRadius: "50%", background: "#e6f7ee", display: "flex", alignItems: "center", justifyContent: "center" }}><WhatsAppOutlined style={{ color: "#25D366" }} /></a>
            <a href={record.customer?.facebook_url || "#"} target="_blank" style={{ width: 30, height: 30, borderRadius: "50%", background: "#e7f0ff", display: "flex", alignItems: "center", justifyContent: "center" }}><FacebookOutlined style={{ color: "#1877F2" }} /></a>
            <a href={record.customer?.instagram_url || "#"} target="_blank" style={{ width: 30, height: 30, borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}><InstagramOutlined style={{ color: "#E1306C" }} /></a>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      align: "center",
      render: (amount) => <span style={{ fontWeight: 700, color: "#10b981" }}>₹{amount?.toLocaleString("en-IN") || 0}</span>,
    },
    {
      title: "Tax",
      dataIndex: "tax_amount",
      align: "center",
      render: (tax) => <span style={{ color: "#4b5563" }}>₹{tax?.toLocaleString("en-IN") || 0}</span>
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button type="link" title="View" icon={<EyeOutlined />} onClick={() => handleView(record)}></Button>
          <Button type="link" title="Edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}></Button>
          <Button type="link" title="Download as pdf" icon={<DownloadOutlined />} style={{ color: '#E11D48' }} onClick={() => handleDownload(record)}></Button>
          <Popconfirm title="Delete quotation" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button type="link" title="Delete" danger icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const totalValue = quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0);
  const approvedValue = quotations.filter(q => q.status === 'Approved').reduce((sum, q) => sum + (q.total_amount || 0), 0);
  const pendingCount = quotations.filter(q => q.status === 'Sent').length;

  const handleBulkUpload = async (formData) => {
    try {
      const response = await quotationService.bulkUpload(formData);
      if (response.success) fetchQuotations();
      return response;
    } catch (error) { throw error; }
  };

  const handleDownloadTemplate = async () => {
    try {
      const API_BASE_URL = window.location.hostname === 'localhost' ? "http://localhost:5000/api" : "/api";
      const response = await fetch(`${API_BASE_URL}/quotes/template/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "quotes_template.csv";
        a.click();
        message.success("Template downloaded successfully");
      } else throw new Error("Download failed");
    } catch (error) { message.error("Template download failed"); }
  };

  const cardAnimation = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } })
  };

  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ fontFamily: '"Inter", sans-serif' }}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>Quotes Management</Title>
          <Text type="secondary">Create and manage sales quotations</Text>
        </div>
        <div className="flex gap-3">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew} style={{ height: 40, borderRadius: 8 }}>New Quote</Button>
          <Button icon={<UploadOutlined />} onClick={() => setShowBulkUpload(true)} style={{ height: 40, borderRadius: 8 }}>Bulk Upload</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { title: "Total Quotes", count: quotations.length, icon: <img src={q2} alt="q" style={{ width: 28, mixBlendMode: 'multiply' }} />, bg: "bg-purple-50", color: "#7c3aed" },
          { title: "Quote Value", count: `₹${(totalValue / 100000).toFixed(1)}L`, icon: <img src={q3} alt="q" style={{ width: 28, mixBlendMode: 'multiply' }} />, bg: "bg-emerald-50", color: "#10b981" },
          { title: "Needs Quote (Leads)", count: leadsAwaitingQuote.length, icon: <img src={q4} alt="q" style={{ width: 28, mixBlendMode: 'multiply' }} />, bg: "bg-orange-50", color: "#f59e0b" },
          { title: "Approved Value", count: `₹${(approvedValue / 100000).toFixed(1)}L`, icon: <img src={q2} alt="q" style={{ width: 28, mixBlendMode: 'multiply' }} />, bg: "bg-blue-50", color: "#3b82f6" },
        ].map((item, i) => (
          <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={cardAnimation} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${item.bg} p-3 rounded-xl`}>{item.icon}</div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{item.title}</p>
              <h2 className="text-2xl font-extrabold" style={{ color: item.color }}>{item.count}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="mb-6"
        items={[
          { key: "1", label: <span className="px-4 font-semibold">Active Quotations</span> },
          { key: "2", label: <span className="px-4 font-semibold flex items-center gap-2">Needs Quote (Leads) <Tag color="orange" className="mr-0 border-none rounded-full">{leadsAwaitingQuote.length}</Tag></span> }
        ]}
      />

      {activeTab === "1" ? (
        <>
          <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <Input
              placeholder="Search quotes..."
              prefix={<SearchOutlined className="text-gray-400" />}
              style={{ width: 300, borderRadius: 8 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-2">
              {["All", "Draft", "Sent", "Approved", "Rejected"].map(s => (
                <Button key={s} type={filterStatus === s ? "primary" : "default"} onClick={() => setFilterStatus(s)} style={{ borderRadius: 8 }}>{s}</Button>
              ))}
            </div>
          </div>
          <Card variant="borderless" style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <ResponsiveTable 
              columns={columns} 
              dataSource={filteredQuotes} 
              rowKey="id" 
              loading={loading} 
              pagination={{ pageSize: 12 }} 
              renderMobileCard={(record) => (
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <FileTextOutlined style={{ fontSize: 20 }} />
                      </div>
                      <div>
                        <div className="font-bold text-[15px] text-gray-900 leading-tight">{record.quotation_number}</div>
                        <div className="text-[12px] text-gray-400">{dayjs(record.created_at).format('MMM DD, YYYY')}</div>
                      </div>
                    </div>
                    <Tag color={getStatusColor(record.status)} style={{ borderRadius: 6, margin: 0 }}>
                      {record.status}
                    </Tag>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        size={32} 
                        style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} 
                        src={record.customer?.email ? `https://logo.clearbit.com/${record.customer.email.split('@')[1]}` : null}
                      >
                        <UserOutlined className="text-gray-400" />
                      </Avatar>
                      <div>
                        <div className="text-[13px] font-bold text-gray-800">{record.customer?.name || 'N/A'}</div>
                        <div className="text-[11px] text-gray-400 truncate w-32">{record.customer?.email || ''}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {record.customer?.phone && (
                         <a href={`https://wa.me/${record.customer.phone}`} target="_blank" className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                           <WhatsAppOutlined className="text-green-500 text-[14px]" />
                         </a>
                       )}
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Total Quote Value</div>
                      <div className="text-[18px] font-extrabold text-emerald-600">₹{record.total_amount?.toLocaleString() || 0}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Tax (GST)</div>
                      <div className="text-[13px] font-bold text-gray-600">₹{record.tax_amount?.toLocaleString() || 0}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button 
                      type="primary" 
                      block 
                      icon={<EyeOutlined />} 
                      onClick={(e) => { e.stopPropagation(); handleView(record); }}
                      className="h-10 rounded-lg font-semibold shadow-sm"
                    >
                      Preview Quote
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                         icon={<FilePdfOutlined />} 
                         onClick={(e) => { e.stopPropagation(); handleDownload(record); }}
                         className="w-10 h-10 rounded-lg flex items-center justify-center border-gray-200 text-rose-500"
                      />
                      <Button 
                         icon={<EditOutlined />} 
                         onClick={(e) => { e.stopPropagation(); handleEdit(record); }}
                         className="w-10 h-10 rounded-lg flex items-center justify-center border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            />
          </Card>
        </>
      ) : (
        <Card variant="borderless" style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <Table
            columns={[
              { title: "Lead Code", dataIndex: "lead_code", render: t => <span className="font-bold text-blue-600">#{t}</span> },
              { title: "Client Name", dataIndex: "name", render: (t, r) => <div><div className="font-semibold">{t}</div><div className="text-xs text-gray-400">{r.company || 'Personal'}</div></div> },
              { title: "Contact Info", render: (_, r) => <div className="text-xs"><div>{r.email}</div><div>{r.phone}</div></div> },
              { title: "Outcome", dataIndex: "last_outcome", render: () => <Tag color="gold">Awaiting Quote</Tag> },
              {
                title: "Action", render: (_, r) => <Button type="primary" icon={<PlusOutlined />} onClick={async () => {
                  setEditingQuote(null);
                  setSelectedLeadForQuote(r);

                  // Auto-select this lead's interested services
                  const leadServiceIds = (r.services || []).map(s => s.id);
                  setSelectedServiceIds(leadServiceIds);
                  if (leadServiceIds.length > 0) {
                    // Compute total from services
                    const selected = services.filter(s => leadServiceIds.includes(s.id));
                    const total = selected.reduce((sum, s) => {
                      const sub = parseFloat(s.unit_price || 0);
                      return sum + sub + (sub * parseFloat(s.tax_percent || 0)) / 100;
                    }, 0);
                    setServiceTotal(total);
                  }

                  // Find or create customer
                  let match = customers.find(c => (c.email && c.email === r.email) || c.name === r.name);

                  if (!match) {
                    const hide = message.loading(`Creating customer record for ${r.name}...`, 0);
                    try {
                      const res = await leadService.convertToCustomer(r.id);
                      if (res.success) {
                        const newCustomer = res.data.customer;
                        if (newCustomer) {
                          match = newCustomer;
                          fetchCustomers();
                        }
                        hide();
                        message.success(`Lead successfully converted to Customer!`);
                      }
                    } catch (err) {
                      hide();
                      message.error("Auto-conversion failed. Please select customer manually.");
                    }
                  }

                  // Pre-fill the form
                  const leadServiceIds2 = (r.services || []).map(s => s.id);
                  form.setFieldsValue({
                    customer_id: match ? match.id : null,
                    status: 'Draft',
                    service_ids: leadServiceIds2.length > 0 ? leadServiceIds2 : undefined,
                  });

                  setModalOpen(true);
                  if (match) message.info(`Preparing quote for ${match.name}`);
                }}>Create Quote</Button>
              }
            ]}
            dataSource={leadsAwaitingQuote}
            rowKey="id"
          />
        </Card>
      )}

      <Modal
        title={editingQuote ? "Edit Quotation" : "Create Quotation"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedServiceIds([]);
          setServiceTotal(0);
        }}
        footer={null}
        centered
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Customer" name="customer_id" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select customer" optionFilterProp="children">
              {customers.map(c => <Option key={c.id} value={c.id}>{c.name} ({c.email})</Option>)}
            </Select>
          </Form.Item>

          {/* Services multi-select — replaces Deal field */}
          {!editingQuote && (
            <Form.Item
              label={
                <span>
                  Interested Services / Products
                  {selectedServiceIds.length > 0 && (
                    <span style={{ marginLeft: 8, color: "#10b981", fontSize: 12 }}>
                      ({selectedServiceIds.length} selected)
                    </span>
                  )}
                </span>
              }
              name="service_ids"
            >
              <Select
                mode="multiple"
                placeholder="Select services (auto-fills line items & amount)"
                onChange={handleServiceChange}
                value={selectedServiceIds}
                allowClear
                showSearch
                optionFilterProp="label"
                options={services.map(s => ({
                  value: s.id,
                  label: `${s.name} — ₹${Number(s.unit_price || 0).toLocaleString('en-IN')}`,
                }))}
              />
            </Form.Item>
          )}

          {/* Live service price preview */}
          {!editingQuote && selectedServiceIds.length > 0 && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 10, padding: "12px 16px", marginBottom: 16
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 8 }}>Selected Services Preview</div>
              {services.filter(s => selectedServiceIds.includes(s.id)).map(s => {
                const sub = parseFloat(s.unit_price || 0);
                const tax = (sub * parseFloat(s.tax_percent || 0)) / 100;
                return (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "#374151" }}>{s.name}</span>
                    <span style={{ fontWeight: 600, color: "#059669" }}>
                      ₹{(sub + tax).toLocaleString('en-IN')}
                      {s.tax_percent > 0 && <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>+{s.tax_percent}% GST</span>}
                    </span>
                  </div>
                );
              })}
              <div style={{ borderTop: "1px solid #bbf7d0", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 15 }}>
                <span>Total</span>
                <span style={{ color: "#059669" }}>₹{serviceTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          {/* Deal linkage (optional, only for edit or manual quote) */}
          {editingQuote && (
            <Form.Item label="Deal" name="deal_id">
              <Select allowClear showSearch placeholder="Link to deal (optional)">
                {deals.map(d => <Option key={d.id} value={d.id}>{d.deal_name} - {d.stage}</Option>)}
              </Select>
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Total Amount" name="total_amount" rules={[{ required: true }]}>
                <InputNumber
                  prefix="₹" style={{ width: '100%' }}
                  disabled={selectedServiceIds.length > 0}
                  onChange={v => form.setFieldsValue({ tax_amount: v ? parseFloat((v * 0.18).toFixed(2)) : 0 })}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tax (GST)" name="tax_amount">
                <InputNumber prefix="₹" style={{ width: '100%' }} disabled={selectedServiceIds.length > 0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select>
              <Option value="Draft">Draft</Option>
              <Option value="Sent">Sent</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              icon={<FilePdfOutlined />}
              onClick={handlePreviewBeforeSave}
              style={{ border: '1px solid #E11D48', color: '#E11D48' }}
            >
              Preview & Share
            </Button>
            <Button onClick={() => { setModalOpen(false); setSelectedServiceIds([]); setServiceTotal(0); }}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save Quote</Button>
          </div>
        </Form>
      </Modal>

      <QuoteInvoiceView open={viewModalOpen} onClose={() => setViewModalOpen(false)} record={selectedQuote} type="quote" />
      
      {/* Background worker for direct PDF generation */}
      <QuoteInvoiceView
        open={directPrintActive}
        onClose={() => {
          setDirectPrintActive(false);
          setDownloadRecord(null);
        }}
        record={downloadRecord}
        directPrint={true}
      />

      <BulkUploadModal open={showBulkUpload} onClose={() => setShowBulkUpload(false)} onUpload={handleBulkUpload} onDownloadTemplate={handleDownloadTemplate} moduleName="Quotes" templateFields={["customer_id", "deal_id", "total_amount", "tax_amount", "status"]} />
    </div>
  );
}
