import { Card, Row, Col, Table, Input, Select, Button, Typography, Grid } from "antd";
import { PlusOutlined, SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { useState } from "react";
import AddLeads from "../components/AddLeads";

const { Option } = Select;
const { Title, Text } = Typography;

export default function Product() {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // Dutch specific styles mapping 
  const styles = {
    page: { padding: "8px 24px", minHeight: "100vh", width: "100%", background: "#f8fafc" },
    roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)", border: "none" },
    filterCard: { borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff", marginBottom: 20 },
    primaryBtn: { borderRadius: 8, fontWeight: 500, height: 40, fontFamily: '"Inter", sans-serif' },
    secondaryBtn: { borderRadius: 8, fontWeight: 500, height: 40, border: "1px solid #d1d5db", background: "#ffffff", fontFamily: '"Inter", sans-serif' },
  };

  // 🔥 ORIGINAL DATA
  const originalData = [
    {
      key: 1, name: "John Doe", company: "ABC Pvt Ltd", email: "john@abc.com",
      phone: "9876543210", status: "New", value: "₹45,000", assigned: "Priya Sharma",
    },
    {
      key: 2, name: "Rahul Kumar", company: "Tech Solutions", email: "rahul@tech.com",
      phone: "9123456789", status: "Qualified", value: "₹78,000", assigned: "Rahul Mehta",
    },
    {
      key: 3, name: "Anjali Verma", company: "NextGen Solutions", email: "anjali@nextgen.com",
      phone: "9012345678", status: "Contacted", value: "₹32,000", assigned: "Priya Sharma",
    },
    {
      key: 4, name: "Karthik Reddy", company: "Innovatech Pvt Ltd", email: "karthik@innovatech.com",
      phone: "8899776655", status: "New", value: "₹55,000", assigned: "Rahul Mehta",
    },
    {
      key: 5, name: "Sneha Iyer", company: "BlueWave Systems", email: "sneha@bluewave.com",
      phone: "9345678123", status: "Lost", value: "₹20,000", assigned: "Priya Sharma",
    },
    {
      key: 6, name: "Vikram Singh", company: "Skyline Technologies", email: "vikram@skyline.com",
      phone: "9786543210", status: "Qualified", value: "₹90,000", assigned: "Rahul Mehta",
    },
    {
      key: 7, name: "Meera Nair", company: "DigitalCore", email: "meera@digitalcore.com",
      phone: "9123987654", status: "Contacted", value: "₹60,000", assigned: "Priya Sharma",
    },
  ];

  const [data, setData] = useState(originalData);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");

  // 🔥 FILTER LOGIC
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.company.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesRep = repFilter === "all" || item.assigned === repFilter;
    return matchesSearch && matchesStatus && matchesRep;
  });

  const columns = [
    {
      title: "S. No", key: "serial", width: 80,
      render: (text, record, index) => <Text type="secondary">{index + 1}</Text>,
    },
    { 
      title: "Lead Name", dataIndex: "name",
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: "Company", dataIndex: "company",
      render: (text) => <Text type="secondary">{text}</Text>
    },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const styleMap = {
          New: { background: "#e0f2fe", color: "#0284c7" },
          Contacted: { background: "#fef3c7", color: "#d97706" },
          Qualified: { background: "#dcfce7", color: "#16a34a" },
          Lost: { background: "#fee2e2", color: "#dc2626" },
        };
        return (
          <span
            style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 12,
              fontWeight: 600, ...styleMap[status],
            }}
          >
            {status}
          </span>
        );
      },
    },
    { 
      title: "Value", dataIndex: "value", align: "right",
      render: (val) => <Text strong style={{ color: "#10b981" }}>{val}</Text> 
    },
    { title: "Assigned To", dataIndex: "assigned" },
  ];

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={styles.page}>
      {/* HEADER Matching Dutch layout */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
  <Col>
    <Title level={2} style={{ margin: 0 }}>
      Leads Management
    </Title>

    <Text type="secondary">
      Track and manage all leads
    </Text>
  </Col>
        <Col>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button
              icon={<FilterOutlined />}
              style={styles.secondaryBtn}
            >
              Filters
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={styles.primaryBtn}
              onClick={() => setModalOpen(true)}
            >
              Add Lead
            </Button>
          </div>
        </Col>
      </Row>

      {/* FILTER BAR  */}
      <Card variant="borderless" style={styles.filterCard} styles={{ body: { padding: "16px 20px" } }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Input
              placeholder="Search leads..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 8, height: 40 }}
            />
          </Col>

          <Col xs={24} md={7}>
            <Select
              value={statusFilter}
              style={{ width: "100%", height: 40 }}
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="all">All Statuses</Option>
              <Option value="New">New</Option>
              <Option value="Qualified">Qualified</Option>
              <Option value="Contacted">Contacted</Option>
              <Option value="Lost">Lost</Option>
            </Select>
          </Col>

          <Col xs={24} md={7}>
            <Select
              value={repFilter}
              style={{ width: "100%", height: 40 }}
              onChange={(value) => setRepFilter(value)}
            >
              <Option value="all">All Sales Reps</Option>
              <Option value="Priya Sharma">Priya Sharma</Option>
              <Option value="Rahul Mehta">Rahul Mehta</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card
        variant="borderless"
        style={{ ...styles.roundedCard, padding: 0 }}
      >
        {/* DESKTOP + TABLET TABLE */}
        {!screens.xs && (
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        )}

        {/* MOBILE CARD VIEW */}
        {screens.xs && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
            {filteredData.map((lead, index) => (
              <div
                key={lead.key}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: 16,
                  borderRadius: 12,
                  background: "#ffffff",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: "#111827", fontFamily: '"Inter", sans-serif' }}>
                      {lead.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280", fontFamily: '"Inter", sans-serif' }}>
                      {lead.company}
                    </div>
                  </div>
                  {/* Status Tag on mobile */}
                  {(() => {
                    const styleMap = {
                      New: { background: "#e0f2fe", color: "#0284c7" },
                      Contacted: { background: "#fef3c7", color: "#d97706" },
                      Qualified: { background: "#dcfce7", color: "#16a34a" },
                      Lost: { background: "#fee2e2", color: "#dc2626" },
                    };
                    return (
                      <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, ...styleMap[lead.status] }}>
                        {lead.status}
                      </span>
                    );
                  })()}
                </div>

                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#4b5563" }}>
                  <div>📧 {lead.email}</div>
                  <div>📞 {lead.phone}</div>
                </div>

                <div style={{ marginTop: 12, borderTop: "1px solid #f3f4f6", paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                  <div>
                     <span style={{ color: "#9ca3af", fontSize: 12 }}>Assigned to:</span>
                     <div style={{ fontWeight: 500 }}>{lead.assigned}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                     <span style={{ color: "#9ca3af", fontSize: 12 }}>Value:</span>
                     <div style={{ fontWeight: 700, color: "#10b981", fontSize: 15 }}>{lead.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <AddLeads
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(newLead) => {
          setData([...data, newLead]);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
