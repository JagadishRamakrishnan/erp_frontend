import { Layout, Dropdown, Select } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const { Header } = Layout;
const { Option } = Select;

export default function AppHeader({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const handleLogout = () => {
    // Remove all auth data from localStorage
    authService.logout();
    // Redirect to login page
    navigate("/login");
  };

  return (
    <Header
      className="flex justify-between items-center px-6 transition-all duration-300"
      style={{
        background: "#ffffff",
        padding: "0 24px",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        borderBottom: "1px solid #f3f4f6", 
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* LEFT SIDE - Sidebar Toggle */}
      <div
        className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
        style={{ color: "#000", display: "flex", alignItems: "center" }}
      >
        {collapsed ? (
          <MenuUnfoldOutlined style={{ fontSize: 20 }} />
        ) : (
          <MenuFoldOutlined style={{ fontSize: 20 }} />
        )}
      </div>

      {/* RIGHT SIDE - Select & Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-6">
        

        <Dropdown
          placement="bottomRight"
          trigger={["click"]}
         menu={{
  items: [
  {
    key: "profile",
    icon: <SettingOutlined />,
    label: "Profile"
  },
  {
    type: "divider"
  },
  {
    key: "logout",
    icon: <LogoutOutlined style={{ color: "red" }} />,
    label: <span style={{ color: "red" }}>Logout</span>
  }
],
  onClick: ({ key }) => {

    if (key === "profile") {
      navigate("/settings");
    }

    if (key === "logout") {
      handleLogout();
    }

  }
}}
        >
          <div
            className="cursor-pointer flex items-center gap-3 p-1 pr-3 rounded-full border border-transparent hover:border-gray-200 transition-all duration-200"
            style={{
              background: "#ffffff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {/* Dutch style Indigo user icon circle (replaces AntD Avatar) */}
            <div
              className="rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600"
              style={{ width: 36, height: 36 }}
            >
              <UserOutlined style={{ fontSize: 18 }} />
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{ color: "#000" }}>
              {currentUser?.name || "User"}
            </span>
            <DownOutlined style={{ fontSize: 10, color: "#9CA3AF" }} />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
