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
    "All", "Qualification", "Needs Analysis", "Value Proposition", "Id. Decision Makers", 
    "Perception Analysis", "Proposal/Price Quote", "Negotiation/Review", "Closed Won", "Closed Lost"
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
        const sortedDeals = (response.data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setDeals(sortedDeals);
      }
    } catch (error) {
      message.error("Failed to load deals");
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

  const handleEditClick = (deal) => {
    setSelectedDeal(deal);
    setShowDetails(false);
    setShowModal(true);
  };

  const handleUpdateDeal = async (updatedDeal) => {
    try {
      const response = await dealService.update(selectedDeal.id, updatedDeal);
      if (response.success) {
        message.success('Deal updated successfully');
        fetchDeals();
        setShowModal(false);
        setSelectedDeal(null);
      }
    } catch (error) {
      message.error('Failed to update deal');
    }
  };

  const handleBulkUpload = async (formData) => {
    try {
      const response = await dealService.bulkUpload(formData);
      if (response.success) {
        fetchDeals();
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

  const listAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
    })
  };

  const fontInter = { fontFamily: '"Inter", sans-serif' };

  const getStageColor = (stage) => {
    switch (stage) {
      case "Closed Won": return "bg-[#d1fae5] text-[#059669]";
      case "Closed Lost": return "bg-[#fee2e2] text-[#dc2626]";
      case "Negotiation/Review": return "bg-[#fef3c7] text-[#d97706]";
      case "Proposal/Price Quote": return "bg-[#e0e7ff] text-[#4f46e5]";
      case "Needs Analysis": return "bg-[#f3f4f6] text-[#4b5563]";
      case "Qualification": return "bg-[#dcfce7] text-[#166534]";
      default: return "bg-[#f3f4f6] text-[#4b5563]";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-500 border-red-200 bg-red-50";
      case "Medium": return "text-amber-500 border-amber-200 bg-amber-50";
      case "Low": return "text-blue-500 border-blue-200 bg-blue-50";
      default: return "text-gray-500 border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen" style={fontInter}>
      {loading && !deals.length ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <Title level={2} style={{ margin: 0 }}>Deals Pipeline</Title>
              <Text type="secondary">Production-grade sales opportunity tracking</Text>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedDeal(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-[#1677ff] hover:bg-[#0958d9] text-white px-4 h-10 rounded-lg shadow-sm font-medium transition-all"
              >
                <Plus size={18} /> Add Deal
              </button>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 border border-gray-300 px-4 h-10 rounded-lg hover:bg-gray-100 transition-all bg-white font-medium"
              >
                <Upload size={18} /> Bulk Upload
              </button>
            </div>
          </div>

          <div className="bg-white p-4 lg:px-5 rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#e5e7eb] mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3 w-full lg:max-w-xs bg-[#f9fafb] border border-[#d1d5db] px-3 h-10 rounded-lg shrink-0">
                <Search size={18} className="text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  className="outline-none bg-transparent w-full text-[14px] text-[#111827]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={fontInter}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 ml-auto flex-wrap pb-1 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? "bg-[#1677ff] text-white shadow-md border-[#1677ff]" : "bg-white text-gray-500 hover:bg-gray-50 border border-[#e5e7eb]"}`}
                  >
                    {tab} <span className="ml-1 opacity-70">({tab === "All" ? deals.length : deals.filter((d) => d.stage === tab).length})</span>
                  </button>
                ))}
              </div>
          </div>

          <div className="space-y-4">
            {filteredDeals.map((deal, i) => (
              <motion.div
                key={deal.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={listAnimation}
                className="bg-white p-5 lg:px-6 rounded-[14px] shadow-[0_4px_15px_rgba(15,23,42,0.05)] border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-blue-200 hover:shadow-[0_8px_25px_rgba(2,6,23,0.08)] transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedDeal(deal);
                  setShowDetails(true);
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-[17px] font-bold text-[#111827] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{deal.deal_name}</h3>
                    {deal.priority && <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(deal.priority)}`}>{deal.priority}</span>}
                  </div>
                  <p className="text-[#6b7280] text-[13px] mt-1 font-medium flex items-center gap-2">
                    <span className="text-[#4b5563] font-semibold">{deal.customer?.name || 'No Customer'}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-[#6b7280]">Owner: {deal.assignedTo?.name || 'Unassigned'}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <span className={`px-3 py-1 rounded-[6px] text-[11px] font-bold tracking-[0.5px] uppercase ${getStageColor(deal.stage)}`}>{deal.stage}</span>
                    {deal.expected_close_date && (
                      <span className="flex items-center text-[#6b7280] text-[13px] font-medium">
                        <Calendar size={15} className="mr-1.5 text-[#9ca3af]" /> {new Date(deal.expected_close_date).toLocaleDateString()}
                      </span>
                    )}
                    {deal.probability && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${deal.probability > 70 ? 'bg-green-500' : deal.probability > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${deal.probability}%` }} />
                        </div>
                        <span className="text-[#4b5563] text-[12px] font-bold">{deal.probability}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:text-right flex flex-col items-start md:items-end border-t md:border-none border-gray-50 pt-4 md:pt-0 mt-2 md:mt-0">
                  <div className="flex gap-x-8 mb-3">
                    <div className="text-right">
                      <p className="text-[#9ca3af] text-[10px] uppercase tracking-wide font-bold mb-0.5">Weighted Value</p>
                      <div className="text-[#6366f1] font-[700] text-[16px] leading-none">₹{parseFloat(deal.weighted_value || (deal.value * (deal.probability || 0) / 100) || 0).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#9ca3af] text-[10px] uppercase tracking-wide font-bold mb-0.5">Total Value</p>
                      <div className="text-[#111827] font-[800] text-[22px] leading-none">₹{parseFloat(deal.value || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  <button className="flex items-center justify-center border border-[#d1d5db] bg-white text-[#4b5563] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 px-4 h-9 rounded-lg text-[13px] font-semibold transition-all shadow-sm">Manage Deal</button>
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

      <AddDealModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDeal(null);
        }}
        onAdd={selectedDeal ? handleUpdateDeal : handleAddDeal}
        deal={selectedDeal}
      />

      <DealDetailsModal
        open={showDetails}
        deal={selectedDeal}
        onClose={() => setShowDetails(false)}
        onEdit={handleEditClick}
      />

      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUpload={handleBulkUpload}
        onDownloadTemplate={handleDownloadTemplate}
        moduleName="Deals"
        templateFields={['deal_name', 'customer_id', 'value', 'stage', 'probability', 'expected_close_date', 'assigned_to', 'priority', 'deal_type', 'source', 'description']}
      />
    </div>
  );
}
