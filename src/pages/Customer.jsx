import { useState, useEffect } from "react";
import { Card, Row, Col, Table, Input, Select, Tag, Avatar, Grid, Button, Modal, Form, message, Spin, Popconfirm } from "antd";
import { SearchOutlined, UserOutlined, TeamOutlined, LaptopOutlined, DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import c1 from "../assets/icons/c1.gif";
import c2 from "../assets/icons/c2.gif";
import c3 from "../assets/icons/c3.gif";
import {
  WhatsAppOutlined,
  FacebookOutlined,
  InstagramOutlined
} from "@ant-design/icons";
import { customerService } from "../services";
import BulkUploadModal from "../components/BulkUploadModal";
const { Option } = Select;

export default function Customer() {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
  setLoading(true);
  try {
    const response = await customerService.getAll();
    if (response.success) {
      const sortedCustomers = (response.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setCustomers(sortedCustomers);
    }
  } catch (error) {
    message.error("Failed to load customers");
  } finally {
    setLoading(false);
  }
};  
  const handleSubmit = async (values) => {
    try {
      const response = editingCustomer
        ? await customerService.update(editingCustomer.id, values)
        : await customerService.create(values);
      
      if (response.success) {
        message.success(editingCustomer ? 'Customer updated successfully' : 'Customer created successfully');
        fetchCustomers();
        setOpen(false);
        setEditingCustomer(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };
  
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      country: customer.country
    });
    setOpen(true);
  };
  
  const handleDelete = async (id) => {
    try {
      const response = await customerService.delete(id);
      if (response.success) {
        message.success('Customer deleted successfully');
        fetchCustomers();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };
  
  const handleAddNew = () => {
    setEditingCustomer(null);
    form.resetFields();
    setOpen(true);
  };

  const handleBulkUpload = async (formData) => {
    try {
      const response = await customerService.bulkUpload(formData);
      if (response.success) {
        fetchCustomers(); // Refresh the list
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL ||'https://crm-be-giqy.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/customers/template/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      throw error;
    }
  };
  
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchText.toLowerCase())
  );
  // Dutch specific styles mapping 
  const styles = {
page: { 
  padding: "8px 24px",
  minHeight: "100vh",
  width: "100%",
  background: "#f5f6f8"
},    roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)", border: "none" },
    filterCard: { borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff", padding: "16px 20px" },
    kpiCard: { 
      borderRadius: 14, 
      background: "#ffffff", 
      boxShadow: "0 10px 30px rgba(2,6,23,0.06)", 
      padding: "20px",
      border: "none",
      cursor: "pointer",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  };

  // Framer Motion Animation Variants
  const cardAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const layoutAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } }
  };
  const circleStyle = (bg) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: bg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
});

  const columns = [
  {
    title: "Customer",
    dataIndex: "name",
    align: "left",
    width: 280,
    render: (text, record) => (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar
          style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }}
          icon={<UserOutlined />}
        />
        <div>
          <div style={{ fontWeight: 600, color: "#111827" }}>{text}</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            {record.customer_code}
          </div>
        </div>
      </div>
    ),
  },

  {
    title: "Company",
    dataIndex: "company",
    align: "center",
    width: 150,
    render: (text) => <span>{text || "N/A"}</span>,
  },

  {
    title: "Phone",
    dataIndex: "phone",
    align: "center",
    width: 150,
    render: (text) => <span>{text || "N/A"}</span>,
  },

  {
    title: "Email",
    dataIndex: "email",
    align: "center",
    width: 220,
    render: (text) => <span>{text || "N/A"}</span>,
  },
  {
  title: "Social",
  key: "social",
  align: "center",
  width: 150,
  render: (_, record) => (
    <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>

      {/* WhatsApp */}
      <a
        href={record.phone ? `https://wa.me/${record.phone}` : "#"}
        target="_blank"
      >
        <div style={circleStyle("#e6f7ee")}>
          <WhatsAppOutlined style={{ color: "#25D366" }} />
        </div>
      </a>

      {/* Facebook */}
      <a
        href={record.facebook_url || "#"}
        target="_blank"
      >
        <div style={circleStyle("#e7f0ff")}>
          <FacebookOutlined style={{ color: "#1877F2" }} />
        </div>
      </a>

      {/* Instagram */}
      <a
        href={record.instagram_url || "#"}
        target="_blank"
      >
        <div style={circleStyle("#fce7f3")}>
          <InstagramOutlined style={{ color: "#E1306C" }} />
        </div>
      </a>

    </div>
  ),
},

  {
    title: "City",
    dataIndex: "city",
    align: "center",
    width: 150,
    render: (text) => <span>{text || "N/A"}</span>,
  },

  {
    title: "Actions",
    key: "actions",
    align: "center",
    width: 160,
    render: (_, record) => (
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>

        <Popconfirm
          title="Delete customer"
          description="Are you sure you want to delete this customer?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      </div>
    ),
  },
];
  return (
    <div style={styles.page}>
      {loading && !customers.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
      {/* ================= PAGE HEADER ================= */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
  <Col>
    <div style={{ fontSize: 26, fontWeight: 700 }}>Customers</div>
    <div style={{ fontSize: 14, color: "#6b7280" }}>
      Manage and track all customers
    </div>
  </Col>

  <Col>
    <div style={{ display: 'flex', gap: 12 }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ height: 40, borderRadius: 8 }}
        onClick={handleAddNew}
      >
        Add Customer
      </Button>
      <Button
        type="default"
        icon={<UploadOutlined />}
        style={{ height: 40, borderRadius: 8 }}
        onClick={() => setShowBulkUpload(true)}
      >
        Bulk Upload
      </Button>
    </div>
  </Col>
</Row>
      {/* ================= TOP STATS (Animated, Black Text) ================= */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
           {
    title: "Total Customers",
    count: customers.length,
    icon: (
  <img
    src={c1}
    alt="customers"
    style={{ width: 32, height: 32, mixBlendMode: "multiply" }}
  />
),
    change: "All customers",
    trendColor: "#10b981",
    iconBg: "#e0e7ff",
    iconColor: "#6366f1",
    borderTop: "#6366f1"
  },
  {
    title: "With Email",
    count: customers.filter(c => c.email).length,
    icon: (
  <img
    src={c2}
    alt="customers"
    style={{ width: 32, height: 32, mixBlendMode: "multiply" }}
  />
),
    change: "Have email",
    trendColor: "#10b981",
    iconBg: "#fce7f3",
    iconColor: "#ec4899",
    borderTop: "#ec4899"
  },
  {
    title: "With Phone",
    count: customers.filter(c => c.phone).length,
    icon: (
  <img
    src={c3}
    alt="customers"
    style={{ width: 32, height: 32, mixBlendMode: "multiply" }}
  />
),
    change: "Have phone",
    trendColor: "#10b981",
    iconBg: "#d1fae5",
    iconColor: "#10b981",
    borderTop: "#10b981"
  },  ].map((item, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <motion.div
              custom={index}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -6, boxShadow: "0 12px 35px rgba(2,6,23,0.12)" }}
              variants={cardAnimation}
              style={{ ...styles.kpiCard, borderTop: `4px solid ${item.borderTop}` }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: '"Inter", sans-serif' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, color: "#111827", lineHeight: 1, fontFamily: '"Inter", sans-serif' }}>
                    {item.count}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: item.trendColor, fontFamily: '"Inter", sans-serif' }}>
                    {item.change}
                  </div>
                </div>
                
                <div style={{ 
                  width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                  background: item.iconBg, color: item.iconColor, fontSize: 22
                }}>
                  {item.icon}
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* ================= SEARCH & CUSTOMER TABLE ================= */}
      <motion.div variants={layoutAnimation} initial="hidden" animate="visible">
        
        {/* Isolated Filter Section */}
        <Card variant="borderless" style={{ ...styles.filterCard, marginBottom: 20 }}>
          <Row gutter={[16, 16]} justify="space-between" align="middle">
            <Col xs={24} md={10}>
              <Input
                placeholder="Search customer..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                style={{ height: 40, borderRadius: 8, fontFamily: '"Inter", sans-serif' }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>

            <Col xs={24} md={6}>
              <Select 
                defaultValue="newest" 
                style={{ width: "100%", height: 40 }}
                suffixIcon={<DownOutlined style={{ color: "#9ca3af" }}/>}
              >
                <Option value="newest">Sort by: Newest</Option>
                <Option value="oldest">Sort by: Oldest</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Table Container */}
        <Card variant="borderless" style={{ ...styles.roundedCard, padding: 0 }}>
          
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
             <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: '"Inter", sans-serif' }}>
               Customer Directory ({filteredCustomers.length})
             </span>
          </div>

          {/* DESKTOP + TABLET TABLE */}
          {!screens.xs && (
             <Table
  columns={columns}
  dataSource={filteredCustomers}
  rowKey="id"
  loading={loading}
  pagination={{ pageSize: 10 }}
  size="middle"
  scroll={{ x: 900 }}
/>
          )}

          {/* MOBILE CARD VIEW */}
          {screens.xs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
              {filteredCustomers.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: 16,
                    borderRadius: 12,
                    background: "#ffffff",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar style={{ backgroundColor: "#f3f4f6", color: "#6b7280" }} icon={<UserOutlined />} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", fontFamily: '"Inter", sans-serif' }}>{item.name}</div>
                        <div style={{ fontSize: 13, color: "#6b7280", fontFamily: '"Inter", sans-serif' }}>{item.company || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#4b5563", fontFamily: '"Inter", sans-serif' }}>
                    <div>📞 {item.phone || 'N/A'}</div>
                    <div>📧 {item.email || 'N/A'}</div>
                  </div>

                  <div style={{ marginTop: 12, borderTop: "1px solid #f3f4f6", paddingTop: 12, display: "flex", gap: 8 }}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(item)}>Edit</Button>
                    <Popconfirm
                      title="Delete customer"
                      description="Are you sure?"
                      onConfirm={() => handleDelete(item.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
        </>
      )}
<Modal
  title={editingCustomer ? "Edit Customer" : "Add Customer"}
  open={open}
  onCancel={() => {
    setOpen(false);
    setEditingCustomer(null);
    form.resetFields();
  }}
  footer={null}
  centered
  zIndex={2000}
>
    <Form form={form} layout="vertical" onFinish={handleSubmit}>

    <Form.Item label="Customer Name" name="name" rules={[{ required: true, message: 'Please enter customer name' }]}>
      <Input placeholder="Enter name" />
    </Form.Item>

    <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Please enter valid email' }]}>
      <Input placeholder="Enter email" />
    </Form.Item>

    <Form.Item label="Phone" name="phone">
      <Input placeholder="Enter phone" />
    </Form.Item>

    <Form.Item label="Company" name="company">
      <Input placeholder="Enter company" />
    </Form.Item>

    <Form.Item label="Address" name="address">
      <Input.TextArea placeholder="Enter address" rows={2} />
    </Form.Item>

    <Row gutter={16}>
      <Col span={12}>
        <Form.Item label="City" name="city">
          <Input placeholder="Enter city" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="State" name="state">
          <Input placeholder="Enter state" />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item label="Country" name="country">
      <Input placeholder="Enter country" />
    </Form.Item>

    <Row gutter={10}>
      <Col span={12}>
        <Button block onClick={() => {
          setOpen(false);
          setEditingCustomer(null);
          form.resetFields();
        }}>
          Cancel
        </Button>
      </Col>

      <Col span={12}>
        <Button type="primary" block htmlType="submit">
          {editingCustomer ? 'Update' : 'Save'} Customer
        </Button>
      </Col>
    </Row>

  </Form>
</Modal>

      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUpload={handleBulkUpload}
        onDownloadTemplate={handleDownloadTemplate}
        moduleName="Customers"
        templateFields={['name', 'email', 'phone', 'company', 'address', 'city', 'state', 'country', 'postal_code']}
      />
    </div>
  );
}
