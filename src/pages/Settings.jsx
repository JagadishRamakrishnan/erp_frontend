import React, { useState, useEffect } from "react";
import { Card, Row, Col, Input, Button, Switch, Form, Spin, message, Avatar, Upload } from "antd";
import { UserOutlined, LockOutlined, BellOutlined, HomeOutlined, EditOutlined, PlusOutlined, UploadOutlined, AppstoreOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import companyService from "../services/companyService";
import authService from "../services/authService";
import ServiceCatalog from "./settings/ServiceCatalog";


export default function Settings() {
  const [companyForm] = Form.useForm();
  const [company, setCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companySaving, setCompanySaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setCompanyLoading(true);
    try {
      const data = await companyService.getAll();
      if (data.success && data.data?.length > 0) {
        const c = data.data[0];
        setCompany(c);
        setLogoUrl(c.logo_url || '');
        companyForm.setFieldsValue(c);
      }
    } catch {
      // no company yet
    }
    setCompanyLoading(false);
  };

  const handleCompanySave = async (values) => {
    setCompanySaving(true);
    try {
      const data = company
        ? await companyService.update(company.id, { ...values, logo_url: logoUrl })
        : await companyService.create({ ...values, logo_url: logoUrl });

      if (data.success) {
        message.success(company ? "Company updated" : "Company created");
        setCompany(data.data);
      } else {
        message.error(data.message || "Failed to save");
      }
    } catch (err) {
      message.error(err.message || "Network error");
    }
    setCompanySaving(false);
  };

  const handleLogoUpload = async ({ file }) => {
    setLogoUploading(true);
    try {
      const data = await companyService.uploadLogo(file);
      if (data.success) {
        setLogoUrl(data.data.logo_url);
        message.success("Logo uploaded");
      } else {
        message.error(data.message || "Upload failed");
      }
    } catch {
      message.error("Upload failed");
    }
    setLogoUploading(false);
  };

  // Dutch Dashboard specific styles mapping
  const styles = {
    page: { 
      padding: window.innerWidth < 768 ? "16px" : "24px", 
       background: "#f5f6f8", 
      minHeight: "100vh",
      fontFamily: '"Inter", sans-serif' 
    },
    card: {
      borderRadius: 14,
      boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
      border: "none"
    },
    iconWrap: (bgColor, textColor) => ({
      width: 40, height: 40, borderRadius: 10, display: "inline-flex", 
      alignItems: "center", justifyContent: "center",
      background: bgColor, color: textColor, marginRight: 14, fontSize: 18
    }),
    primaryBtn: {
      borderRadius: 8, height: 40, fontWeight: 500, fontFamily: '"Inter", sans-serif',
      background: "#1677ff", borderColor: "#1677ff", color: "#fff", marginTop: 16
    },
    input: {
      borderRadius: 8, height: 42, fontFamily: '"Inter", sans-serif', marginBottom: 16
    }
  };

  // Framer Motion Animation Variants
  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, y: 0, 
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } 
    })
  };

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}
      <div style={{ marginBottom: 24 }} className={isAdmin ? "" : "mx-auto max-w-3xl"}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.5px", fontFamily: '"Inter", sans-serif' }}>
          Settings
        </div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4, fontFamily: '"Inter", sans-serif' }}>
          Manage your account and system preferences
        </div>
      </div>

      <Row gutter={[24, 24]}>

        {/* ================= COMPANY SETTINGS (LEFT) ================= */}
        {isAdmin && (
          <Col xs={24} lg={16}>
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardAnimation}>
            <Card variant="borderless" style={styles.card} styles={{ body: { padding: 24 } }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={styles.iconWrap("#f3e8ff", "#7c3aed")}>
                    <HomeOutlined />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: '"Inter", sans-serif' }}>
                    Company Settings
                  </span>
                </div>
                {!companyLoading && (
                  <span style={{
                    fontSize: 12, fontWeight: 500, padding: "2px 10px", borderRadius: 20,
                    background: company ? "#f0fdf4" : "#fff7ed",
                    color: company ? "#16a34a" : "#ea580c",
                    border: `1px solid ${company ? "#bbf7d0" : "#fed7aa"}`
                  }}>
                    {company ? <><EditOutlined /> Edit Mode</> : <><PlusOutlined /> New Company</>}
                  </span>
                )}
              </div>

              {companyLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
              ) : (
                <>
                  {/* Logo upload */}
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    {logoUrl ? (
                      <Avatar src={logoUrl} size={90} shape="square"
                        style={{ border: "1px solid #e5e7eb", display: "block", margin: "0 auto 10px" }} />
                    ) : (
                      <div style={{
                        width: 90, height: 90, borderRadius: 12, background: "#f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 10px", border: "1px dashed #d1d5db"
                      }}>
                        <HomeOutlined style={{ fontSize: 32, color: "#9ca3af" }} />
                      </div>
                    )}
                    <Upload accept="image/*" showUploadList={false} customRequest={handleLogoUpload}>
                      <Button icon={<UploadOutlined />} loading={logoUploading} size="small">
                        {logoUrl ? "Change Logo" : "Upload Logo"}
                      </Button>
                    </Upload>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>PNG, JPG, SVG · max 2MB</div>
                  </div>

                  <Form form={companyForm} layout="vertical" onFinish={handleCompanySave}>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item name="name" label="Company Name" rules={[{ required: true, message: "Required" }]}>
                          <Input style={styles.input} placeholder="Acme Pvt Ltd" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="email" label="Email">
                          <Input style={styles.input} placeholder="info@company.com" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="phone" label="Phone">
                          <Input style={styles.input} placeholder="+91 98765 43210" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="website" label="Website">
                          <Input style={styles.input} placeholder="https://company.com" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="gst_number" label="GST Number">
                          <Input style={styles.input} placeholder="22AAAAA0000A1Z5" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item name="pan_number" label="PAN Number">
                          <Input style={styles.input} placeholder="AAAAA0000A" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item name="address" label="Address">
                          <Input style={styles.input} placeholder="123 Main St" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item name="city" label="City">
                          <Input style={styles.input} placeholder="Mumbai" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item name="state" label="State">
                          <Input style={styles.input} placeholder="Maharashtra" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item name="country" label="Country">
                          <Input style={styles.input} placeholder="India" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button
                      type="primary" htmlType="submit" block loading={companySaving}
                      icon={company ? <EditOutlined /> : <PlusOutlined />}
                      style={{ ...styles.primaryBtn, background: "#7c3aed", borderColor: "#7c3aed" }}
                    >
                      {company ? "Update Company" : "Add Company"}
                    </Button>
                  </Form>
                </>
              )}
            </Card>
          </motion.div>
        </Col>
      )}

        {/* ================= RIGHT COLUMN ================= */}
        <Col xs={24} lg={isAdmin ? 8 : 18} className={isAdmin ? "" : "mx-auto"}>
          <Row gutter={[0, 24]}>

            {/* PROFILE SETTINGS */}
            <Col xs={24}>
              <motion.div custom={1} initial="hidden" animate="visible" variants={cardAnimation}>
                <Card variant="borderless" style={styles.card} styles={{ body: { padding: 24 } }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                    <div style={styles.iconWrap("#f0f5ff", "#1677ff")}>
                      <UserOutlined />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: '"Inter", sans-serif' }}>
                      Profile Settings
                    </span>
                  </div>
                  <Input placeholder="Full Name" style={styles.input} />
                  <Input placeholder="Email Address" style={styles.input} />
                  <Input placeholder="Phone Number" style={styles.input} />
                  <Button type="primary" block style={styles.primaryBtn}>
                    Save Changes
                  </Button>
                </Card>
              </motion.div>
            </Col>

            {/* NOTIFICATIONS */}
            <Col xs={24}>
              <motion.div custom={2} initial="hidden" animate="visible" variants={cardAnimation}>
                <Card variant="borderless" style={styles.card} styles={{ body: { padding: 24 } }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                    <div style={styles.iconWrap("#d1fae5", "#059669")}>
                      <BellOutlined />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: '"Inter", sans-serif' }}>
                      Notifications
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <Row justify="space-between" align="middle">
                      <span style={{ fontSize: 14, color: "#4b5563", fontWeight: 500 }}>Email Notifications</span>
                      <Switch defaultChecked style={{ background: "#1677ff" }} />
                    </Row>
                    <div style={{ height: 1, background: "#f3f4f6" }} />
                    <Row justify="space-between" align="middle">
                      <span style={{ fontSize: 14, color: "#4b5563", fontWeight: 500 }}>SMS Alerts</span>
                      <Switch />
                    </Row>
                    <div style={{ height: 1, background: "#f3f4f6" }} />
                    <Row justify="space-between" align="middle">
                      <span style={{ fontSize: 14, color: "#4b5563", fontWeight: 500 }}>Deal Updates</span>
                      <Switch defaultChecked style={{ background: "#7c3aed" }} />
                    </Row>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* SECURITY */}
            <Col xs={24}>
              <motion.div custom={3} initial="hidden" animate="visible" variants={cardAnimation}>
                <Card variant="borderless" style={styles.card} styles={{ body: { padding: 24 } }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                    <div style={styles.iconWrap("#fee2e2", "#dc2626")}>
                      <LockOutlined />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: '"Inter", sans-serif' }}>
                      Security
                    </span>
                  </div>
                  <Input.Password placeholder="Current Password" style={styles.input} />
                  <Input.Password placeholder="New Password" style={styles.input} />
                  <Input.Password placeholder="Confirm Password" style={{ ...styles.input, marginBottom: 0 }} />
                  <Button type="primary" block style={{ ...styles.primaryBtn, background: "#dc2626", borderColor: "#dc2626" }}>
                    Change Password
                  </Button>
                </Card>
              </motion.div>
            </Col>

          </Row>
        </Col>

      </Row>

      {/* ================= SERVICE CATALOG (Admin only) ================= */}
      {isAdmin && (
        <motion.div custom={3} initial="hidden" animate="visible" variants={cardAnimation} style={{ marginTop: 24 }}>
          <Card
            variant="borderless"
            style={styles.card}
            styles={{ body: { padding: 24 } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div style={styles.iconWrap('#eff6ff', '#3b82f6')}>
                <AppstoreOutlined />
              </div>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#111827', fontFamily: '"Inter", sans-serif' }}>
                Service & Product Catalog
              </span>
            </div>
            <ServiceCatalog />
          </Card>
        </motion.div>
      )}
    </div>
  );
}

