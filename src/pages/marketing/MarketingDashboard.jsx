import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Eye,
  Link as LinkIcon
} from "lucide-react";

import { Modal, Button, Card, Row, Col, Typography, Statistic, Alert, message, Spin, Tag } from "antd";
import { metaService } from "../../services";

const { Title, Text } = Typography;

const CRM_PRIMARY = "#1C2244";
const CRM_SECONDARY = "#4F46E5";

const MarketingDashboard = () => {
  const [isConnectModalVisible, setIsConnectModalVisible] = useState(false);
  const [activePlatform, setActivePlatform] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await metaService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
        setIsConnected(true);
      }
    } catch (error) {
      setIsConnected(false);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform) => {
    setActivePlatform(platform);
    setIsConnectModalVisible(true);
  };

  const handleMetaConnect = async () => {
    try {
      const response = await metaService.connect({
        access_token: process.env.REACT_APP_META_ACCESS_TOKEN || 'env_token',
        meta_user_id: 'env_user',
        token_expiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      });
      
      if (response.success) {
        message.success('Meta account connected successfully');
        setIsConnectModalVisible(false);
        setIsConnected(true);
        // Auto-sync campaigns from Facebook
        try {
          await metaService.syncFromFacebook();
          message.success('Campaigns synced from Facebook');
        } catch (e) {
          // sync errors are non-blocking
        }
        fetchDashboardData();
      }
    } catch (error) {
      message.error(error.message || 'Failed to connect Meta account');
    }
  };

  const summary = dashboardData?.summary || {};
  
  const summaryData = [
    {
      title: "Total Ad Spend",
      value: summary.totalSpend ? `₹${parseFloat(summary.totalSpend).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00",
      icon: <DollarSign size={22} color={CRM_PRIMARY} />
    },
    {
      title: "Total Campaigns",
      value: summary.totalCampaigns || 0,
      icon: <TrendingUp size={22} color={CRM_PRIMARY} />
    },
    {
      title: "Total Leads from Ads",
      value: summary.totalLeadsFromAds || 0,
      icon: <MousePointerClick size={22} color={CRM_PRIMARY} />
    },
    {
      title: "Cost Per Lead",
      value: summary.costPerLead ? `₹${parseFloat(summary.costPerLead).toFixed(2)}` : "₹0.00",
      icon: <Eye size={22} color={CRM_PRIMARY} />
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ padding: 24 }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Marketing Overview
          </Title>
          <Text type="secondary">
            Monitor performance of your connected advertising platforms
          </Text>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Button
            type="primary"
            icon={<LinkIcon size={16} />}
            onClick={() => handleConnect("Meta")}
            disabled={isConnected}
            style={{
              backgroundColor: isConnected ? '#52c41a' : CRM_PRIMARY,
              borderColor: isConnected ? '#52c41a' : CRM_PRIMARY,
              borderRadius: 8
            }}
          >
            {isConnected ? 'Meta Connected' : 'Connect Meta'}
          </Button>

          <Button
            type="primary"
            icon={<LinkIcon size={16} />}
            onClick={() => handleConnect("Google")}
            disabled
            style={{
              backgroundColor: CRM_SECONDARY,
              borderColor: CRM_SECONDARY,
              borderRadius: 8
            }}
          >
            Connect Google (Coming Soon)
          </Button>
        </div>
      </div>

      {/* ALERT */}
      {!isConnected && (
        <Alert
          message="No Ad Platforms Connected"
          description="Connect your Meta or Google advertising accounts to begin tracking campaign performance within your CRM."
          type="info"
          showIcon
          style={{
            borderRadius: 10,
            marginBottom: 24
          }}
        />
      )}

      {isConnected && (
        <Alert
          message="Meta Ads Connected"
          description={`Your Meta campaigns are being tracked. Total Ads Running: ${summary.totalAdsRunning || 0}`}
          type="success"
          showIcon
          style={{
            borderRadius: 10,
            marginBottom: 24
          }}
        />
      )}

      {/* STAT CARDS */}
      <Row gutter={[20, 20]}>
        {summaryData.map((data, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 14,
                border: "1px solid #f1f1f1",
                boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
              }}
              styles={{ body: { padding: 22 } }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Statistic
                  title={
                    <Text style={{ color: "#6B7280" }}>
                      {data.title}
                    </Text>
                  }
                  value={data.value}
                  valueStyle={{
                    fontWeight: 700,
                    fontSize: 28,
                    color: "#111827"
                  }}
                />

                <div
                  style={{
                    backgroundColor: "#EEF2FF",
                    padding: 12,
                    borderRadius: 10
                  }}
                >
                  {data.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Additional Stats */}
      {isConnected && summary && (
        <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card
              style={{
                borderRadius: 14,
                border: "1px solid #f1f1f1",
                boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
              }}
            >
              <Statistic
                title="Total Campaigns"
                value={summary.totalCampaigns || 0}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              style={{
                borderRadius: 14,
                border: "1px solid #f1f1f1",
                boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
              }}
            >
              <Statistic
                title="Total Ads Running"
                value={summary.totalAdsRunning || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card
              style={{
                borderRadius: 14,
                border: "1px solid #f1f1f1",
                boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
              }}
            >
              <Statistic
                title="Total Leads from Ads"
                value={summary.totalLeadsFromAds || 0}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Campaign Performance */}
      {isConnected && dashboardData?.campaignPerformance && dashboardData.campaignPerformance.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>Campaign Performance</Title>
          <Row gutter={[20, 20]}>
            {dashboardData.campaignPerformance.slice(0, 3).map((campaign, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  style={{
                    borderRadius: 14,
                    border: "1px solid #f1f1f1",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
                  }}
                >
                  <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
                    {campaign.campaign_name}
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Leads:</Text>
                    <Text strong>{campaign.leads || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Spend:</Text>
                    <Text strong>₹{parseFloat(campaign.spend || 0).toFixed(2)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Clicks:</Text>
                    <Text strong>{campaign.clicks || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">CPL:</Text>
                    <Text strong>₹{parseFloat(campaign.cpl || 0).toFixed(2)}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Top Performing Ads */}
      {isConnected && dashboardData?.adsPerformance && dashboardData.adsPerformance.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>Top 10 Performing Ads</Title>
          <Card
            style={{
              borderRadius: 14,
              border: "1px solid #f1f1f1",
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
            }}
          >
            <Row gutter={[16, 16]}>
              {dashboardData.adsPerformance.map((ad, index) => (
                <Col xs={24} sm={12} lg={12} key={index}>
                  <div style={{ 
                    padding: 16, 
                    background: '#f9fafb', 
                    borderRadius: 8,
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 14, display: 'block' }}>{ad.ad_name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{ad.campaign_name}</Text>
                      </div>
                      <Tag color="blue">#{index + 1}</Tag>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Leads</Text>
                        <div><Text strong>{ad.leads || 0}</Text></div>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Clicks</Text>
                        <div><Text strong>{ad.clicks || 0}</Text></div>
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Impressions</Text>
                        <div><Text strong>{ad.impressions || 0}</Text></div>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      )}

      {/* Lead Source Analytics */}
      {isConnected && dashboardData?.leadSourceAnalytics && dashboardData.leadSourceAnalytics.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>Lead Source Analytics</Title>
          <Row gutter={[20, 20]}>
            {dashboardData.leadSourceAnalytics.map((source, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  style={{
                    borderRadius: 14,
                    border: "1px solid #f1f1f1",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
                  }}
                >
                  <Statistic
                    title={source.source || 'Unknown'}
                    value={source.leads || 0}
                    suffix="leads"
                    valueStyle={{ color: '#1677ff', fontSize: 24 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* CONNECT MODAL */}
      <Modal
        title={`Connect ${activePlatform} Ads`}
        open={isConnectModalVisible}
        onCancel={() => setIsConnectModalVisible(false)}
        footer={null}
        centered
        width={500}
        getContainer={document.body}
        styles={{ mask: { backdropFilter: "blur(2px)" }, body: { padding: "24px" } }}
      >
        <div style={{ textAlign: "center", padding: 20 }}>
          <Title level={4}>
            Authenticate {activePlatform}
          </Title>

          <Text type="secondary">
            {activePlatform === 'Meta' 
              ? 'Click continue to connect your Meta Ads account. In production, you will be redirected to Meta for authentication.'
              : 'Google Ads integration coming soon!'
            }
          </Text>

          <Button
            type="primary"
            size="large"
            disabled={activePlatform !== 'Meta'}
            onClick={handleMetaConnect}
            style={{
              marginTop: 20,
              width: "100%",
              height: 44,
              borderRadius: 8,
              backgroundColor: CRM_PRIMARY,
              borderColor: CRM_PRIMARY
            }}
          >
            {activePlatform === 'Meta' ? 'Continue' : 'Coming Soon'}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default MarketingDashboard;
