import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Button,
  Space,
  Input,
  Card,
  message,
  Spin,
  Tag,
  Row,
  Col,
  Badge,
} from "antd";
import { motion } from "framer-motion";
import { Send, Users, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const { Title, Text } = Typography;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const WhatsAppCampaign = () => {
  const CRM_PRIMARY = "#1C2244";
  const WHATSAPP_GREEN = "#25D366";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [campaignName, setCampaignName] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("hello_world");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/whatsapp/customers`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data.map((c) => ({ ...c, key: c.id })));
      } else {
        message.error(data.message || "Failed loading customers");
      }
    } catch {
      message.error("Network error");
    }
    setLoading(false);
  };

  const handleSendCampaign = async () => {
    if (!campaignName.trim()) return message.warning("Enter Campaign Name");
    if (selectedRowKeys.length === 0) return message.warning("Select at least one customer");

    setSending(true);
    setLastResult(null);
    try {
      const res = await fetch(`${API_BASE}/whatsapp/send`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          campaignName,
          messageTemplate,
          customerIds: selectedRowKeys,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastResult(data.data);
        message.success(data.message || "Campaign sent");
        setSelectedRowKeys([]);
        setCampaignName("");
      } else {
        message.error(data.message || "Campaign failed");
      }
    } catch {
      message.error("Network error");
    }
    setSending(false);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      render: (phone) =>
        phone ? (
          <Text>{phone}</Text>
        ) : (
          <Tag color="red">No phone</Tag>
        ),
    },
    {
      title: "Company",
      dataIndex: "company",
      render: (c) => c || "-",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: 24 }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          WhatsApp Campaigns
        </Title>
        <Text type="secondary">
          Send bulk WhatsApp template messages directly to your customers.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT: Config */}
        <Col xs={24} lg={10}>
          <Card
            style={{ borderRadius: 16, boxShadow: "0 4px 18px rgba(0,0,0,0.05)" }}
            styles={{ body: { padding: 24 } }}
            title={
              <Space>
                <MessageSquare size={18} color={CRM_PRIMARY} />
                <Text strong>Campaign Configuration</Text>
              </Space>
            }
          >
            <div style={{ marginBottom: 20 }}>
              <Text strong>Campaign Name</Text>
              <Input
                size="large"
                placeholder="e.g. Diwali Weekend Promo"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                style={{ marginTop: 6, borderRadius: 8 }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <Text strong>Meta Template Name</Text>
              <Text type="secondary" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
                Must match an approved template in Meta Business Manager (e.g.{" "}
                <Tag color="blue">hello_world</Tag>)
              </Text>
              <Input
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                style={{ marginTop: 6, borderRadius: 8 }}
              />
            </div>

            <div
              style={{
                background: "#F4F6FA",
                padding: 16,
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Summary
              </Text>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Target Audience</Text>
                <Text strong>{selectedRowKeys.length} Customers</Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <Text type="secondary">Platform</Text>
                <Space>
                  <FaWhatsapp color={WHATSAPP_GREEN} />
                  <Text strong>WhatsApp</Text>
                </Space>
              </div>
            </div>

            {lastResult && (
              <div
                style={{
                  background: lastResult.failed > 0 ? "#fff2f0" : "#f6ffed",
                  border: `1px solid ${lastResult.failed > 0 ? "#ffccc7" : "#b7eb8f"}`,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Text strong style={{ display: "block", marginBottom: 6 }}>
                  Last Campaign Result
                </Text>
                <Space style={{ marginBottom: 8 }}>
                  <Badge color="green" text={`${lastResult.sent} sent`} />
                  <Badge color="red" text={`${lastResult.failed} failed`} />
                  <Badge color="default" text={`${lastResult.skipped} skipped`} />
                </Space>
                {lastResult.results?.filter(r => r.status !== 'sent').map((r, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    <Text type="danger">{r.name}</Text>: {r.reason}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="primary"
              size="large"
              icon={<Send size={18} />}
              loading={sending}
              onClick={handleSendCampaign}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 8,
                fontWeight: 600,
                background: WHATSAPP_GREEN,
                borderColor: WHATSAPP_GREEN,
              }}
            >
              Launch WhatsApp Campaign
            </Button>
          </Card>
        </Col>

        {/* RIGHT: Customer list */}
        <Col xs={24} lg={14}>
          <Card
            style={{ borderRadius: 16, boxShadow: "0 4px 18px rgba(0,0,0,0.05)" }}
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Space>
                  <Users size={18} color={CRM_PRIMARY} />
                  <Text strong>Select Target Audience</Text>
                </Space>
                <Space>
                  <Button size="small" onClick={() => setSelectedRowKeys(customers.map((c) => c.key))}>
                    Select All
                  </Button>
                  <Button size="small" onClick={() => setSelectedRowKeys([])}>
                    Clear
                  </Button>
                </Space>
              </div>
            }
          >
            {loading ? (
              <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spin size="large" />
              </div>
            ) : (
              <Table
                rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                columns={columns}
                dataSource={customers}
                pagination={{ pageSize: 8 }}
                scroll={{ x: true, y: 350 }}
                size="small"
              />
            )}
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default WhatsAppCampaign;
