import { Card, Row, Col, Table, Input, Select, Button, Typography, Grid } from "antd";
import { SearchOutlined, PlusOutlined, FilterOutlined } from "@ant-design/icons";
import { useState } from "react";
import { motion } from "framer-motion";
import AddOpportunity from "../../components/AddOpportunity";
const { Option } = Select;
const { Title,Text } = Typography;

export default function Opportunities() {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewType, setViewType] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Dutch specific styles mapping 
  const styles = {
    page: { padding: "8px 24px", minHeight: "100vh", width: "100%", background: "#f8fafc" },
    roundedCard: { borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)", border: "none" },
    filterCard: { borderRadius: 12, border: "1px solid #e5e7eb", background: "#ffffff", marginBottom: 20 },
    primaryBtn: { borderRadius: 8, fontWeight: 500, height: 40, fontFamily: '"Inter", sans-serif' },
    secondaryBtn: { borderRadius: 8, fontWeight: 500, height: 40, border: "1px solid #d1d5db", background: "#ffffff", fontFamily: '"Inter", sans-serif' },
    kpiCard: { 
      borderRadius: 14, 
      background: "#ffffff", 
      boxShadow: "0 10px 30px rgba(2,6,23,0.06)", 
      padding: "20px", 
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      border: "none",
      cursor: "pointer"
    }
  };

  // Framer Motion Animation Variants
  const cardAnimation = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (text, record, index) => <Text type="secondary">{(currentPage - 1) * 10 + index + 1}</Text>,
    },
    {
      title: "Opportunity Name",
      dataIndex: "deal",
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: "Account",
      dataIndex: "company",
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: "Stage",
      dataIndex: "stage",
      render: (stage) => {
        const styleMap = {
          Negotiation: { background: "#e0f2fe", color: "#0284c7" },
          "Proposal Sent": { background: "#fef3c7", color: "#d97706" },
          Qualified: { background: "#dcfce7", color: "#16a34a" },
          "Closed Won": { background: "#dcfce7", color: "#15803d" },
        };
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: '"Inter", sans-serif',
              ...styleMap[stage],
            }}
          >
            {stage}
          </span>
        );
      },
    },
    {
      title: "Value",
      dataIndex: "value",
      align: "right",
      render: (value) => (
        <span style={{ fontWeight: 700, color: "#10b981", fontFamily: '"Inter", sans-serif' }}>${value}</span>
      ),
    },
    {
      title: "Close Date",
      dataIndex: "closeDate",
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: "Owner",
      dataIndex: "owner",
    },
  ];

  const data = [
    {
      key: 1, deal: "Website Redesign", company: "Acme Corp", stage: "Negotiation",
      value: "75,000", closeDate: "Apr 28, 2024", owner: "John Smith",
    },
    {
      key: 2, deal: "Cloud Services Upgrade", company: "Beta Solutions", stage: "Proposal Sent",
      value: "120,000", closeDate: "May 5, 2024", owner: "Sarah Lee",
    },
    {
      key: 3, deal: "ERP Implementation", company: "Global Industries", stage: "Qualified",
      value: "200,000", closeDate: "May 10, 2024", owner: "David Brown",
    },
    {
      key: 4, deal: "Security Audit", company: "TechFlow", stage: "Closed Won",
      value: "45,000", closeDate: "May 12, 2024", owner: "Sarah Lee",
    },
    {
      key: 5, deal: "Mobile App Development", company: "StartUp Inc", stage: "Negotiation",
      value: "95,000", closeDate: "Jun 01, 2024", owner: "John Smith",
    },
  ];

  const filteredData = data.filter((item) => {
    const matchesView = viewType === "all" ? true : item.owner === "John Smith"; 
    const matchesStage = stageFilter === "all" ? true : item.stage === stageFilter;
    const matchesSearch =
      item.deal.toLowerCase().includes(searchText.toLowerCase()) ||
      item.company.toLowerCase().includes(searchText.toLowerCase());

    return matchesView && matchesStage && matchesSearch;
  });

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}
      
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
  <Col>
    <Title level={2} style={{ margin: 0 }}>
      Opportunities
    </Title>

    <Text type="secondary">
       Manage and track your sales pipeline
    </Text>
  </Col>

        <Col>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button
              icon={<FilterOutlined />}
              style={styles.secondaryBtn}
            >
              Export
            </Button>
            <Button
  type="primary"
  icon={<PlusOutlined />}
  style={styles.primaryBtn}
  onClick={() => setModalOpen(true)}
>
  Add Opportunity
</Button>
          </div>
        </Col>
      </Row>

      {/* ================= KPI SUMMARY CARDS (Animated) ================= */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: "Open Deals", count: 24, amount: "$580,000", color: "#3b82f6" },
          { title: "In Negotiation", count: 8, amount: "$150,000", color: "#f59e0b" },
          { title: "Proposal Sent", count: 5, amount: "$220,000", color: "#8b5cf6" },
          { title: "Closed Won", count: 12, amount: "$340,000", color: "#10b981" },
        ].map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <motion.div
              variants={cardAnimation}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -6, boxShadow: "0 12px 35px rgba(2,6,23,0.12)" }}
              style={styles.kpiCard}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: '"Inter", sans-serif' }}>
                {item.title}
              </div>
              
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#111827", lineHeight: 1, fontFamily: '"Inter", sans-serif' }}>
                  {item.count}
                </div>
                <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: item.color, fontFamily: '"Inter", sans-serif' }}>
                  {item.amount}
                </div>
              </div>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* ================= FILTERS ================= */}
      <Card variant="borderless" style={styles.filterCard} styles={{ body: { padding: "16px 20px" } }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
             <Input
                placeholder="Search deals or accounts..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ borderRadius: 8, height: 40 }}
              />
          </Col>

          <Col xs={24} sm={12} md={7}>
            <Select
              value={viewType}
              style={{ width: "100%", height: 40 }}
              onChange={(value) => setViewType(value)}
            >
              <Option value="all">All Opportunities</Option>
              <Option value="mine">My Opportunities</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={7}>
            <Select
              value={stageFilter}
              style={{ width: "100%", height: 40 }}
              onChange={(value) => setStageFilter(value)}
            >
              <Option value="all">Stage: All</Option>
              <Option value="Negotiation">Negotiation</Option>
              <Option value="Proposal Sent">Proposal Sent</Option>
              <Option value="Qualified">Qualified</Option>
              <Option value="Closed Won">Closed Won</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* ================= TABLE SECTION ================= */}
      <motion.div
        variants={cardAnimation}
        initial="hidden"
        animate="visible"
      >
        <Card
          variant="borderless"
          style={{ ...styles.roundedCard, padding: 0 }}
        >
          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: '"Inter", sans-serif' }}>
              Opportunities Pipeline
            </span>
          </div>

          {/* DESKTOP + TABLET TABLE */}
          {!screens.xs && !screens.sm && (
            <Table
              columns={columns}
              dataSource={filteredData}
              size="middle"
              pagination={{
                current: currentPage,
                pageSize: 10,
                showSizeChanger: false,
                onChange: (page) => setCurrentPage(page),
              }}
            />
          )}

          {/* MOBILE CARD VIEW */}
          {(screens.xs || screens.sm) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
              {filteredData.map((item, index) => (
                <div
                  key={item.key}
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
                        {item.deal}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280", fontFamily: '"Inter", sans-serif' }}>
                        {item.company}
                      </div>
                    </div>
                    {/* Status Tag on mobile */}
                    {(() => {
                      const styleMap = {
                        Negotiation: { background: "#e0f2fe", color: "#0284c7" },
                        "Proposal Sent": { background: "#fef3c7", color: "#d97706" },
                        Qualified: { background: "#dcfce7", color: "#16a34a" },
                        "Closed Won": { background: "#dcfce7", color: "#15803d" },
                      };
                      return (
                         <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, ...styleMap[item.stage] }}>
                          {item.stage}
                        </span>
                      );
                    })()}
                  </div>

                  <div style={{ marginTop: 12, borderTop: "1px solid #f3f4f6", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                       <div style={{ color: "#9ca3af", fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                          <span><Text strong style={{color: "#4b5563"}}>Owner:</Text> {item.owner}</span>
                          <span><Text strong style={{color: "#4b5563"}}>Close:</Text> {item.closeDate}</span>
                       </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                       <span style={{ color: "#9ca3af", fontSize: 12 }}>Value:</span>
                       <div style={{ fontWeight: 700, color: "#10b981", fontSize: 15, fontFamily: '"Inter", sans-serif' }}>${item.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
      <AddOpportunity
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onSave={(newOpportunity) => {
    console.log(newOpportunity);
    setModalOpen(false);
  }}
/>
    </div>
  );
}
