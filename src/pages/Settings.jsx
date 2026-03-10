import React from "react";
import { Card, Row, Col, Input, Button, Switch } from "antd";
import { UserOutlined, LockOutlined, BellOutlined, HomeOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

export default function Settings() {
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
      <div style={{ marginBottom: 24, paddingLeft: 4 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.5px", fontFamily: '"Inter", sans-serif' }}>
          Settings
        </div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4, fontFamily: '"Inter", sans-serif' }}>
          Manage your account and system preferences
        </div>
      </div>

      <Row gutter={[24, 24]}>

        {/* ================= PROFILE SETTINGS ================= */}
        <Col xs={24} sm={24} md={12} lg={12}>
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardAnimation}>
            <Card variant="borderless" style={styles.card} bodyStyle={{ padding: 24 }}>
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

              <Button type="primary" block style={styles.primaryBtn} className="hover:opacity-90">
                Save Changes
              </Button>
            </Card>
          </motion.div>
        </Col>

        {/* ================= COMPANY SETTINGS ================= */}
        <Col xs={24} sm={24} md={12} lg={12}>
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardAnimation}>
            <Card variant="borderless" style={styles.card} bodyStyle={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                <div style={styles.iconWrap("#f3e8ff", "#7c3aed")}>
                  <HomeOutlined />
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: '"Inter", sans-serif' }}>
                  Company Settings
                </span>
              </div>

              <Input placeholder="Company Name" style={styles.input} />
              <Input placeholder="Company Address" style={styles.input} />
              <Input placeholder="GST / Tax ID" style={styles.input} />

             <Button type="primary" block style={styles.primaryBtn} className="hover:opacity-90">
                Save Changes
              </Button>
            </Card>
          </motion.div>
        </Col>

        {/* ================= NOTIFICATIONS ================= */}
        <Col xs={24} sm={24} md={12} lg={12}>
          <motion.div custom={2} initial="hidden" animate="visible" variants={cardAnimation}>
            <Card variant="borderless" style={styles.card} bodyStyle={{ padding: 24 }}>
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
                  <span style={{ fontSize: 14, color: "#4b5563", fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>Email Notifications</span>
                  <Switch defaultChecked style={{ background: "#1677ff" }} />
                </Row>
                
                <div style={{ height: 1, width: "100%", background: "#f3f4f6" }} />
                
                <Row justify="space-between" align="middle">
                  <span style={{ fontSize: 14, color: "#4b5563", fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>SMS Alerts</span>
                  <Switch />
                </Row>

                <div style={{ height: 1, width: "100%", background: "#f3f4f6" }} />

                <Row justify="space-between" align="middle">
                  <span style={{ fontSize: 14, color: "#4b5563", fontWeight: 500, fontFamily: '"Inter", sans-serif' }}>Deal Updates</span>
                  <Switch defaultChecked style={{ background: "#7c3aed" }} />
                </Row>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* ================= SECURITY ================= */}
        <Col xs={24} sm={24} md={12} lg={12}>
          <motion.div custom={3} initial="hidden" animate="visible" variants={cardAnimation}>
            <Card variant="borderless" style={styles.card} bodyStyle={{ padding: 24 }}>
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
    </div>
  );
}
