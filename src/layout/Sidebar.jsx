import React, { useState, useEffect, useRef } from "react";
// Replace this with your actual CRM logo path if necessary!
//import companyLogo from "../assets/Company_logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
//import { useTheme } from "../../context/ThemeContext";
import { Popover, Tooltip, Grid } from "antd";
import { Megaphone, MessageSquare } from "lucide-react";
//import { MessageSquare } from "lucide-react";
// Ant Design Icons
import {
  DashboardOutlined,
  AppstoreOutlined,
  DollarOutlined,
  PercentageOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  SettingOutlined,
  RiseOutlined,
} from "@ant-design/icons";

// Lucide Icons
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

/**
 * CRM Sidebar component (Dutch styling)
 * - Collapsed (desktop): parent icons centered; parents with children open a Popover flyout.
 * - Expanded or mobile: inline expand/collapse for parent children.
 */

const Sidebar = ({
  collapsed = true,
  setCollapsed = () => {},
}) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = "light";
const primaryColor = "#1C2244";
const sidebarBgColor = "#ffffff";
  const [openMenu, setOpenMenu] = useState(null); // stores key of open inline menu OR open popover
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const containerRef = useRef(null);

  // Colors
  const ACTIVE_TEXT = "#ffffff";
  const INACTIVE_TEXT = theme === "dark" ? "#D1D5DB" : "#374151"; 

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close popup when clicking outside (guard). Only closes popover when collapsed & desktop.
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpenMenu((prev) => {
          return prev && collapsed && !isMobile ? null : prev;
        });
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [collapsed, isMobile]);

  // Expand logic correctly matching the user's route structure
  const selectedKey = pathname.replace("/", "") || "dashboard";
  
  // Menu configuration injected from user's code
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: "Dashboard",
    },
    // SALES GROUP
    {
      key: "sales",
      icon: <RiseOutlined style={{ fontSize: 18 }} />,
      label: "Sales",
      children: [
        {
          key: "leads",
          icon: <AppstoreOutlined style={{ fontSize: 18 }} />,
          label: "Leads",
        },
        {
          key: "opportunities",
          icon: <DollarOutlined style={{ fontSize: 18 }} />,
          label: "Opportunities",
        },
        {
          key: "quotes",
          icon: <FileText size={18} />,
          label: "Quotes",
        },
        {
          key: "activities",
          icon: <PercentageOutlined style={{ fontSize: 18 }} />,
          label: "Activities",
        },
        {
          key: "invoices",
          icon: <DollarOutlined style={{ fontSize: 18 }} />,
          label: "Invoices",
        },
      ],
    },
    // CUSTOMER
    {
      key: "customer",
      icon: <UserOutlined style={{ fontSize: 18 }} />,
      label: "Customers",
    },
    {
      key: "deals",
      icon: <DollarOutlined style={{ fontSize: 18 }} />,
      label: "Deals",
    },
    // TASKS
    {
      key: "tasks",
      icon: <FileText size={18} />,
      label: "Tasks",
    },
    // REPORTS
    {
      key: "reports",
      icon: <BarChartOutlined style={{ fontSize: 18 }} />,
      label: "Reports",
    },
    // MARKETING GROUP
{
  key: "marketing",
  icon: <Megaphone size={18} />,
  label: "Marketing",
  children: [
    {
  key: "marketing-dashboard",
  icon: <BarChartOutlined style={{ fontSize: 18 }} />,
  label: "Overview",
},
    {
      key: "campaigns",
      icon: <RiseOutlined style={{ fontSize: 18 }} />,
      label: "Campaigns",
    },
    {
      key: "whatsapp-campaign",
      icon: <MessageSquare size={18} />,
      label: "WhatsApp Campaign",
    },
  ],
},
    // ADMINISTRATION GROUP
    {
      key: "admin",
      icon: <DatabaseOutlined style={{ fontSize: 18 }} />,
      label: "Administration",
      children: [
        {
          key: "users",
          icon: <UserOutlined style={{ fontSize: 18 }} />,
          label: "Users",
        },
      ],
    },
    // SUPPORT & FINANCE GROUP
    {
      key: "support",
      icon: <DatabaseOutlined style={{ fontSize: 18 }} />,
      label: "Support & Finance",
      children: [
        {
          key: "tickets",
          icon: <FileText size={18} />,
          label: "Tickets",
        },
        {
          key: "payments",
          icon: <DollarOutlined style={{ fontSize: 18 }} />,
          label: "Payments",
        },
        {
          key: "notes",
          icon: <FileText size={18} />,
          label: "Notes",
        },
      ],
    },
  ];

  // Set the correct menu folder open on mount / navigate if it matches child keys
useEffect(() => {
  const adminMenu = ["contact", "users", "roles", "admin"];

  const salesMenu = [
    "leads",
    "opportunities",
    "quotes",
    "activities",
    "invoices",
    "sales"
  ];

  const marketingMenu = [
    "marketing-dashboard",
    "campaigns",
    "whatsapp-campaign",
    "marketing"
  ];

  const supportMenu = [
    "tickets",
    "payments",
    "notes",
    "support"
  ];

  if (adminMenu.includes(selectedKey)) {
    setOpenMenu("admin");
  } 
  else if (salesMenu.includes(selectedKey)) {
    setOpenMenu("sales");
  } 
  else if (marketingMenu.includes(selectedKey)) {
    setOpenMenu("marketing");
  }
  else if (supportMenu.includes(selectedKey)) {
    setOpenMenu("support");
  }

}, [selectedKey]);
  // Helper for determining active state
  const isActive = (itemKey) => {
    if (!itemKey) return false;
    
    // Exact match
    if (selectedKey === itemKey || pathname === `/${itemKey}`) return true;

    // Direct match against logic from the provided code block
    const parentItem = menuItems.find((m) => m.key === itemKey);
    if (parentItem && parentItem.children && parentItem.children.length > 0) {
      return parentItem.children.some((c) => selectedKey === c.key || pathname === `/${c.key}`);
    }

    return false;
  };

  // Build modern popover content for children (uses exact active/inactive colors requested)
  const buildPopoverContent = (item) => {
    const bg = theme === "dark" ? "#1f2937" : "#ffffff";
    const border = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
    return (
      <div
        className="shadow-xl"
        style={{
          minWidth: 240,
          borderRadius: 16,
          background: bg,
          color: INACTIVE_TEXT,
          overflow: "hidden",
          border: `1px solid ${border}`,
          padding: "8px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${border}`,
          fontWeight: 600,
          color: theme === "dark" ? "#9CA3AF" : "#6B7280",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}>
          {item.label}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 0" }}>
          {item.children.map((child) => {
            const active = isActive(child.key);
            return (
              <div
                key={child.key}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!child.noRoute) {
                    navigate(`/${child.key}`);
                  }
                  setOpenMenu(null);
                  if (isMobile) setCollapsed(false);
                }}
                role="button"
                tabIndex={0}
                className="transition-all duration-200"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: active ? `${primaryColor}15` : "transparent",
                  color: active ? primaryColor : INACTIVE_TEXT,
                  fontWeight: active ? 600 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "#F3F4F6";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span style={{ fontSize: 18 }}>
                  {child.icon}
                </span>
                <div style={{ fontSize: 14 }}>{child.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // render parent button: when collapsed + desktop + has children => show popover, else inline expand or navigate
  const renderParentButton = (item) => {
    const active = isActive(item.key);

    // Collapsed & Desktop & has children => use Popover (modern flyout)
    if (collapsed && !isMobile && item.children && item.children.length > 0) {
      return (
        <Popover
          content={buildPopoverContent(item)}
          trigger="hover"
          placement="rightTop"
          overlayClassName="sidebar-flyout-popover"
          open={openMenu === item.key && collapsed && !isMobile} // Only if collapsed
          onOpenChange={(visible) => {
             if(collapsed && !isMobile)
                setOpenMenu(visible ? item.key : null)
          }}
          getPopupContainer={() => containerRef.current || document.body}
          destroyTooltipOnHide
          overlayStyle={{ zIndex: 3000, paddingLeft: 10 }}
        >
          <div
            className="transition-all duration-200"
            style={{
              padding: 12,
              cursor: "pointer",
              margin: "8px 0",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: active ? "#ffffff" : INACTIVE_TEXT,
              background: active ? primaryColor : "transparent",
              boxShadow: active ? `0 4px 12px ${primaryColor}40` : "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              // When collapsed on desktop, we let hover do the work, or if not hovering, click toggles it
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "#F3F4F6";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ fontSize: 22 }}>
              {item.icon}
            </span>
          </div>
        </Popover>
      );
    }

    // Normal behavior (not collapsed or mobile)
    const button = (
      <div
        onClick={() => {
          if (item.children && item.children.length > 0) {
            setOpenMenu(openMenu === item.key ? null : item.key);
          } else {
            if (!item.noRoute) {
              navigate(`/${item.key}`);
            }
            if (isMobile) setCollapsed(false);
            setOpenMenu(null);
          }
        }}
        className="group transition-all duration-200"
      style={{
  padding: collapsed && !isMobile ? 14 : "14px 18px",
  cursor: "pointer",
  margin: "8px 0",
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: collapsed && !isMobile ? "center" : "flex-start",
  color: active ? "#ffffff" : INACTIVE_TEXT,
  background: active ? "#2F2A68" : "transparent",
  boxShadow: active ? "0 6px 14px rgba(47,42,104,0.35)" : "none",
  fontWeight: active ? 600 : 500,
}}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "#F3F4F6";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
<span style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  width: 22
}}>
            {item.icon}
        </span>
        {/* show label only when not collapsed OR on mobile */}
{(!collapsed || isMobile) && (
  <span style={{
    marginLeft: 14,
    fontSize: 15,
    fontWeight: 500
  }}>
    {item.label}
  </span>
)}
        {item.children && item.children.length > 0 && (!collapsed || isMobile) && (
          <span style={{ marginLeft: "auto", fontSize: 14, opacity: 0.7 }}>{openMenu === item.key ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
        )}
      </div>
    );

    return collapsed && !isMobile ? (
      <Tooltip title={item.label} placement="right">
        {button}
      </Tooltip>
    ) : (
      button
    );
  };

  const settingsActive = selectedKey === "settings";

  return (
    <>
      {/* Mobile Hamburger / Close */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 2100,
            cursor: "pointer",
            background: "#fff",
            borderRadius: "50%",
            padding: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? <Menu size={20} color="#000" /> : <X size={20} color="#000" />}
        </div>
      )}

      <AnimatePresence initial={false}>
        {(isMobile ? !collapsed : true) && (
          <div ref={containerRef} style={{ height: "100%" }}>
            {isMobile && !collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "black",
                  zIndex: 1500,
                }}
                onClick={() => setCollapsed(true)}
              />
            )}

            <motion.div
              initial={{ x: isMobile ? -300 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -300 : 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                height: "100%",
                width: collapsed && !isMobile ? 80 : isMobile ? 260 : 260,
                backgroundColor: theme === "dark" ? "#1f2937" : sidebarBgColor || "#ffffff",
                borderRight: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                position: isMobile ? "fixed" : "fixed", // Making it stick like Antd Sider
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 1601,
              }}
            >
              {/* Top (Logo) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: screens.xs ? "center" : collapsed && !isMobile ? "center" : "flex-start",
                  padding: collapsed && !isMobile ? "20px 0" : "20px 24px",
                  height: 90,
                  borderBottom: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
                  marginBottom: 8,
                }}
              >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
                    <div
                      style={{
                        background: primaryColor || "#1C2244",
                        padding: 10,
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <RiseOutlined style={{ color: "#fff", fontSize: 20 }} />
                    </div>

                    {(!collapsed || isMobile) && (
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: theme === "dark" ? "#ffffff" : "#111827" }}>CRM</div>
                        <div style={{ fontSize: 12, color: theme === "dark" ? "#9CA3AF" : "#6b7280" }}>
                          Management
                        </div>
                      </div>
                    )}
                  </div>
              </div>

              {/* Menu items */}
              <div className="custom-scrollbar" style={{ flexGrow: 1, overflowY: "auto", padding: "20px 16px" }}>
                {menuItems.map((item) => (
                  <div key={item.key}>
                    {renderParentButton(item)}

                    {/* Inline submenu when expanded or on mobile */}
                    <AnimatePresence initial={false}>
                      {item.children && openMenu === item.key && (!collapsed || isMobile) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          style={{ marginLeft: 12, overflow: "hidden", borderLeft: `2px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}` }}
                        >
                          {item.children.map((child) => {
                            const childActive = isActive(child.key);
                            return (
                              <div
                                key={child.key}
                                onClick={() => {
                                  if (!child.noRoute) {
                                    navigate(`/${child.key}`);
                                  }
                                  setOpenMenu(item.key); // keep parent open / active in inline mode
                                  if (isMobile) setCollapsed(true);
                                }}
                                className="transition-all duration-200"
                                style={{
                                  padding: "8px 12px",
                                  cursor: "pointer",
                                  margin: "4px 0 4px 12px",
                                  borderRadius: 8,
                                  display: "flex",
                                  alignItems: "center",
                                  color: childActive ? primaryColor : INACTIVE_TEXT,
                                  backgroundColor: childActive ? `${primaryColor}10` : "transparent",
                                  fontWeight: childActive ? "600" : 500,
                                }}
                                onMouseEnter={(e) => {
                                  if (!childActive) e.currentTarget.style.backgroundColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "#F3F4F6";
                                }}
                                onMouseLeave={(e) => {
                                  if (!childActive) e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                <span style={{ marginRight: 10, fontSize: 16 }}>{child.icon}</span>
                                <span style={{ fontSize: 14 }}>{child.label}</span>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Settings (sticky bottom) */}
              <Tooltip title={collapsed && !isMobile ? "Settings" : ""} placement="right">
                <div
                  onClick={() => {
                    navigate("/settings");
                    if (isMobile) setCollapsed(true);
                  }}
                  role="button"
                  tabIndex={0}
                  className="transition-all duration-200 hover:bg-gray-50"
                  style={{
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                    cursor: "pointer",
                    marginTop: "auto",
                    borderTop: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.05)" : "#e5e7eb"}`,
                    color: settingsActive ? primaryColor : INACTIVE_TEXT,
                  }}
                >
                  <SettingOutlined style={{ fontSize: 18 }} />
                  {(!collapsed || isMobile) && <span style={{ marginLeft: 12, fontWeight: 500 }}>Settings</span>}
                </div>
              </Tooltip>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
