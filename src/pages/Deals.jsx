import { useState, useEffect } from "react";
import { Search, Calendar, Plus, Upload } from "lucide-react";
import AddDealModal from "../components/AddDealModal";
import DealDetailsModal from "../components/DealDetailsModal";
import BulkUploadModal from "../components/BulkUploadModal";
import { motion } from "framer-motion";
import { Typography, message, Spin } from "antd";
import { dealService } from "../services";
import ResponsiveTable from "../components/ResponsiveTable";

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

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <ResponsiveTable 
              columns={[
                {
                  title: "Deal Name",
                  dataIndex: "deal_name",
                  render: (text, record) => (
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{text}</span>
                      <span className="text-[11px] text-gray-400">{record.customer?.name || 'No Customer'}</span>
                    </div>
                  )
                },
                {
                  title: "Stage",
                  dataIndex: "stage",
                  render: (stage) => (
                    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-[0.5px] uppercase ${getStageColor(stage)}`}>
                      {stage}
                    </span>
                  )
                },
                {
                  title: "Value",
                  dataIndex: "value",
                  align: "right",
                  render: (v) => <span className="font-bold text-gray-900">₹{parseFloat(v || 0).toLocaleString()}</span>
                },
                {
                  title: "Prob.",
                  dataIndex: "probability",
                  align: "center",
                  render: (p) => (
                    <div className="flex items-center gap-2">
                       <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p > 70 ? 'bg-green-500' : p > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-gray-400">{p}%</span>
                    </div>
                  )
                },
                {
                  title: "Expected Close",
                  dataIndex: "expected_close_date",
                  render: (d) => <span className="text-gray-500 text-[12px]">{d ? dayjs(d).format('MMM DD, YYYY') : '-'}</span>
                },
                {
                  title: "Actions",
                  align: "right",
                  render: (_, record) => (
                    <button className="text-blue-600 font-semibold text-[13px] hover:underline" onClick={() => { setSelectedDeal(record); setShowDetails(true); }}>Manage</button>
                  )
                }
              ]}
              dataSource={filteredDeals}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 12 }}
              onRow={(record) => ({
                onClick: () => { setSelectedDeal(record); setShowDetails(true); }
              })}
              renderMobileCard={(deal) => (
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[16px] font-bold text-gray-900 truncate leading-tight uppercase">{deal.deal_name}</h3>
                        {deal.priority && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getPriorityColor(deal.priority)}`}>
                            {deal.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-500 font-medium">
                        {deal.customer?.name || 'No Customer'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-[6px] text-[10px] font-bold tracking-[0.5px] uppercase ${getStageColor(deal.stage)}`}>
                      {deal.stage}
                    </span>
                  </div>

                  {/* Financials & Progress */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Weighted Value</div>
                        <div className="text-[15px] font-bold text-indigo-600 leading-none">
                          ₹{parseFloat(deal.weighted_value || (deal.value * (deal.probability || 0) / 100) || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Total Deal Value</div>
                        <div className="text-[20px] font-extrabold text-gray-900 leading-none">₹{parseFloat(deal.value || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {deal.probability && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400">
                          <span>WIN PROBABILITY</span>
                          <span>{deal.probability}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${deal.probability > 70 ? 'bg-green-500' : deal.probability > 30 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${deal.probability}%` }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between text-[12px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-300" />
                      <span>{deal.expected_close_date ? dayjs(deal.expected_close_date).format('MMM DD, YYYY') : 'No Date'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                       <span className="font-medium text-gray-600">{deal.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button className="w-full h-10 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm uppercase tracking-wider">
                      Manage Opportunity
                    </button>
                  </div>
                </div>
              )}
            />
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
