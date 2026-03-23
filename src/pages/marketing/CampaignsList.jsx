import React, { useState, useEffect } from "react";
import { Table, Tag, Typography, Button, Space, Input, message, Spin } from "antd";
import { motion } from "framer-motion";
import { Search, Filter, Facebook, RefreshCw } from "lucide-react";
import { metaService } from "../../services";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const CampaignsList = () => {
  const [searchText, setSearchText] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const CRM_PRIMARY = "#1C2244";

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await metaService.getCampaigns();
      if (response.success) {
        setCampaigns(response.data || []);
      }
    } catch (error) {
      if (error.message && error.message.includes('not connected')) {
        setCampaigns([]);
      } else {
        message.error('Failed to load campaigns');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await metaService.syncFromFacebook();
      if (response.success) {
        message.success(response.message || 'Campaigns synced from Facebook');
        fetchCampaigns(); // Refresh list
      }
    } catch (error) {
      message.error(error.message || 'Failed to sync from Facebook');
    } finally {
      setSyncing(false);
    }
  };

  const filteredData = campaigns.filter((item) =>
    item.campaign_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Platform",
      key: "platform",
      render: () => (
        <Space>
          <Facebook size={18} color="#1877F2" />
          <Text>Meta</Text>
        </Space>
      ),
    },

    {
      title: "Campaign Name",
      dataIndex: "campaign_name",
      key: "campaign_name",
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: "14px" }}>
            {text}
          </Text>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            ID: {record.campaign_id}
          </div>
        </div>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const active = status === "ACTIVE";
        const paused = status === "PAUSED";

        return (
          <Tag
            style={{
              borderRadius: 20,
              padding: "4px 14px",
              fontWeight: 500,
              border: active ? "1px solid #b7eb8f" : paused ? "1px solid #ffd591" : "1px solid #ffa39e",
              background: active ? "#f6ffed" : paused ? "#fff7e6" : "#fff2f0",
              color: active ? "#389e0d" : paused ? "#d46b08" : "#cf1322"
            }}
          >
            {status || 'UNKNOWN'}
          </Tag>
        );
      },
    },

    {
      title: "Objective",
      dataIndex: "objective",
      key: "objective",
      render: (text) => <Text>{text || 'N/A'}</Text>,
    },

    {
      title: "Daily Budget",
      dataIndex: "daily_budget",
      key: "daily_budget",
      render: (budget) => (
        <Text>
          {budget ? `₹${parseFloat(budget).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
        </Text>
      ),
    },

    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (date) => (
        <Text style={{ color: "#6b7280" }}>
          {date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'}
        </Text>
      ),
    },

    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (date) => (
        <Text style={{ color: "#6b7280" }}>
          {date ? dayjs(date).format('MMM DD, YYYY') : 'Ongoing'}
        </Text>
      ),
    },

    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (
        <Text style={{ color: "#6b7280" }}>
          {date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'}
        </Text>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: "24px" }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Ad Campaigns
          </Title>

          <Text type="secondary">
            Manage and monitor your active marketing campaigns from Meta Ads.
          </Text>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button
            type="primary"
            icon={<RefreshCw size={16} />}
            loading={syncing}
            onClick={handleSync}
            style={{ borderRadius: 10, height: 38, backgroundColor: '#1677ff' }}
          >
            {syncing ? 'Syncing...' : 'Sync from Facebook'}
          </Button>

          <Input
            prefix={<Search size={16} color="#9CA3AF" />}
            placeholder="Search campaigns..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 260, borderRadius: 10, height: 38 }}
          />

          <Button
            icon={<Filter size={16} />}
            style={{ borderRadius: 10, height: 38 }}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 16,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">
              {campaigns.length === 0 
                ? 'No campaigns found. Connect your Meta Ads account to see campaigns.'
                : 'No campaigns match your search.'}
            </Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              pageSize: 10,
              position: ["bottomRight"],
            }}
            rowKey="id"
          />
        )}
      </div>
    </motion.div>
  );
};

export default CampaignsList;
