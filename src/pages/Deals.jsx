import { useState, useEffect } from "react";
import { Search, Calendar, Plus, Upload } from "lucide-react";
import AddDealModal from "../components/AddDealModal";
import DealDetailsModal from "../components/DealDetailsModal";
import BulkUploadModal from "../components/BulkUploadModal";
import { motion } from "framer-motion";
import { Typography, message, Spin } from "antd";
import { dealService } from "../services";

export default function Deals() {
  const tabs = [
    "All", "Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost",
  ];
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const { Title, Text } = Typography;
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const response = await dealService.getAll();
      if (response.success) {
        setDeals(response.data || []);
      }
    } catch (error) {
      message.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = async (newDeal) => {
    try {
      const response = await dealService.create(newDeal);
      if (response.success) {
        message.success('Deal created successfully');
        fetchDeals();
        setShowModal(false);
      }
    } catch (error) {
      message.error('Failed to create deal');
    }
  };

  const handleBulkUpload = async (formData) => {
    try {
      const response = await dealService.bulkUpload(formData);
      if (response.success) {
        fetchDeals(); // Refresh the list
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-be-giqy.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/deals/template/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deals_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      throw error;
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const statusMatch = activeTab === "All" || deal.stage === activeTab;
    const searchMatch =
      deal.deal_name?.toLowerCase().includes(search.toLowerCase()) ||
      deal.customer?.name?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Dutch Animated Styles mapping
  const listAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
    })
  };

  const fontInter = { fontFamily: '"Inter", sans-serif' };

  return (
<div className="p-4 md:p-6 min-h-screen" style={fontInter}>
      {loading && !deals.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* ================= HEADER ================= */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Deals
              </Title>
              <Text type="secondary">
                Track your sales opportunities
              </Text>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-[#1677ff] hover:bg-[#0958d9] transition-colors text-white px-4 h-10 rounded-lg font-medium text-[14px] shadow-sm"
              >
                <Plus size={18}/>
                Add Deal
              </button>
              
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 bg-[#52c41a] hover:bg-[#389e0d] transition-colors text-white px-4 h-10 rounded-lg font-medium text-[14px] shadow-sm"
              >
                <Upload size={18}/>
                Bulk Upload
              </button>
            </div>
          </div>

          {/* ================= SEARCH + FILTER AREA ================= */}
          <div className="bg-white p-4 lg:px-5 rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e5e7eb] mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">

              {/* SEARCH */}
              <div className="flex items-center gap-3 w-full lg:max-w-sm bg-[#f9fafb] border border-[#d1d5db] px-3 h-10 rounded-lg shrink-0">
                <Search size={18} className="text-[#9ca3af]"/>
                <input
                  type="text"
                  placeholder="Search deals..."
                  className="outline-none bg-transparent w-full text-[14px] text-[#111827]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={fontInter}
                />
              </div>

              {/* STATUS TABS */}
              <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1 rounded-xl ml-auto">
                {tabs.map((tab) => {
                  const count =
                    tab === "All"
                      ? deals.length
                      : deals.filter((d) => d.stage === tab).length;

                  return (
                   <button
  key={tab}
  onClick={() => setActiveTab(tab)}
  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
  ${
    activeTab === tab
      ? "bg-[#1677ff] text-white shadow"
      : "bg-white text-gray-600 hover:bg-gray-100 border border-[#e5e7eb]"
  }`}
>
  {tab} ({count})
</button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* ================= DEAL LIST ================= */}
          <div className="space-y-4">
            {filteredDeals.map((deal, i) => (
              <motion.div
                key={deal.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={listAnimation}
                className="bg-white p-5 lg:px-6 rounded-[14px] shadow-[0_6px_18px_rgba(15,23,42,0.06)] border border-[#transparent] flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-[#e2e8f0] hover:shadow-[0_10px_30px_rgba(2,6,23,0.08)] transition-all"
              >
                {/* LEFT */}
                <div>
                  <h3 className="text-[17px] font-bold text-[#111827]">
                    {deal.deal_name}
                  </h3>

                  <p className="text-[#6b7280] text-[13px] mt-1 font-medium">
                    <span className="text-[#4b5563]">{deal.customer?.name || 'No Customer'}</span> 
                    {deal.assignedTo && (
                      <>
                        <span className="mx-1">•</span> {deal.assignedTo.name}
                      </>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    {/* Dynamically colored Dutch Badge */}
                    <span className={`px-3 py-1 rounded-[6px] text-[11px] font-bold tracking-[0.5px] uppercase
                      ${
                        deal.stage === "Won" ? "bg-[#d1fae5] text-[#059669]" :
                        deal.stage === "Lost" ? "bg-[#fee2e2] text-[#dc2626]" :
                        deal.stage === "Negotiation" ? "bg-[#fef3c7] text-[#d97706]" :
                        deal.stage === "Proposal" ? "bg-[#e0e7ff] text-[#4f46e5]" :
                        "bg-[#f3f4f6] text-[#4b5563]"
                      }`}
                    >
                      {deal.stage}
                    </span>

                    {deal.expected_close_date && (
                      <span className="flex items-center text-[#6b7280] text-[13px] font-medium">
                        <Calendar size={15} className="mr-1.5 text-[#9ca3af]"/>
                        Close: <span className="ml-1 text-[#4b5563]">{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                      </span>
                    )}

                    {deal.probability && (
                      <span className="text-[#6b7280] text-[13px] font-medium">
                        Probability: <span className="text-[#4b5563]">{deal.probability}%</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* RIGHT (Amounts & Actions) */}
                <div className="md:text-right flex flex-col items-start md:items-end border-t md:border-none border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0">
                  
                  <div className="mb-3">
                    <p className="text-[#9ca3af] text-[12px] uppercase tracking-wide font-semibold mb-0.5 mt-0">Value</p>
                    <div className="text-[#111827] font-[800] text-[22px] leading-none">
                      ₹{parseFloat(deal.value || 0).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDeal(deal);
                      setShowDetails(true);
                    }}
                    className="flex items-center justify-center border border-[#d1d5db] bg-white text-[#4b5563] hover:text-[#1890ff] hover:border-[#1890ff] px-4 h-9 rounded-lg text-[13px] font-medium transition-colors hover:bg-blue-50"
                  >
                    View Details
                  </button>
                </div>

              </motion.div>
            ))}

            {filteredDeals.length === 0 && (
              <div className="text-center py-12 bg-white rounded-[14px] border border-dashed border-gray-300">
                <p className="text-[#6b7280] font-medium text-[14px]">No deals found matching your search.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= MODALS ================= */}
      <AddDealModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddDeal}
      />

      <DealDetailsModal
        open={showDetails}
        deal={selectedDeal}
        onClose={() => setShowDetails(false)}
      />

      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUpload={handleBulkUpload}
        onDownloadTemplate={handleDownloadTemplate}
        moduleName="Deals"
        templateFields={['deal_name', 'customer_id', 'value', 'stage', 'probability', 'expected_close_date', 'assigned_to']}
      />
    </div>
  );
}
