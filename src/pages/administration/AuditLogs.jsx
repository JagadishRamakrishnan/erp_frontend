import React, { useState, useEffect } from "react";
import { 
  Table, Tag, Card, Input, DatePicker, 
  Typography, Spin, Space, Tooltip 
} from "antd";
import { 
  SearchOutlined, HistoryOutlined, UserOutlined, 
  InfoCircleOutlined, LayoutOutlined 
} from "@ant-design/icons";
import { motion } from "framer-motion";
import apiCall from "../../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function AuditLogs() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [searchText, setSearchText] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/audit-logs');
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'green',
      'UPDATE': 'blue',
      'DELETE': 'volcano',
      'LOGIN': 'purple',
      'CONVERT': 'cyan'
    };
    return colors[action] || 'default';
  };

  const columns = [
    {
      title: "Timestamp",
      dataIndex: "created_at",
      key: "timestamp",
      render: (date) => (
        <Text style={{ fontSize: 13, color: "#6b7280" }}>
          {dayjs(date).format('MMM DD, YYYY HH:mm:ss')}
        </Text>
      )
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <div style={{ 
            width: 24, height: 24, borderRadius: '50%', background: '#e0f2fe', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <UserOutlined style={{ fontSize: 12, color: '#0ea5e9' }} />
          </div>
          <Text strong style={{ fontSize: 13 }}>{record.user?.name || 'System'}</Text>
        </Space>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action) => <Tag color={getActionColor(action)} style={{ borderRadius: 6, fontWeight: 600 }}>{action}</Tag>
    },
    {
      title: "Entity",
      key: "entity",
      render: (_, record) => (
        <Space>
          <Tag icon={<LayoutOutlined />} style={{ borderRadius: 4 }}>{record.entity_type}</Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.entity_id}</Text>
        </Space>
      )
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
      render: (details) => (
        <Tooltip title={details}>
          <Text ellipsis style={{ maxWidth: 200, fontSize: 13 }}>
            {details || 'N/A'}
          </Text>
        </Tooltip>
      )
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip",
      render: (ip) => <code style={{ fontSize: 11, color: '#9ca3af' }}>{ip || 'local'}</code>
    }
  ];

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="mb-6">
        <Title level={2} style={{ margin: 0 }}>System Audit Logs</Title>
        <Text type="secondary">Track all administrative actions and data modifications</Text>
      </div>

      <Card className="rounded-2xl shadow-sm border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
          <Input
            placeholder="Search action or user..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            className="flex-1 max-w-md h-10 rounded-lg"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <RangePicker className="rounded-lg h-10" />
        </div>

        <Table
          columns={columns}
          dataSource={logs.filter(log => 
            log.action?.toLowerCase().includes(searchText.toLowerCase()) ||
            log.user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            log.entity_type?.toLowerCase().includes(searchText.toLowerCase())
          )}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 12 }}
          style={{ borderRadius: 12 }}
        />
      </Card>
    </div>
  );
}
