import { useState, useEffect, useMemo } from "react";
import { Card, Table, Input, Button, Modal, Form, Select, Tag, Avatar, message, Popconfirm, Row, Col, Spin, Switch, DatePicker, Typography, Radio } from "antd";
import { SearchOutlined, PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, EyeOutlined, UploadOutlined, CalendarOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { leadService, userService, noteService, taskService, activityService } from "../services";
import authService from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import BulkUploadModal from "../components/BulkUploadModal";
import ResponsiveTable from "../components/ResponsiveTable";
import LeadKanbanBoard from "../components/LeadKanbanBoard";
import LeadDetailsModal from "../components/LeadDetailsModal";
import { LayoutGrid, List, ClipboardCopy, CheckCircle2, Users, UserPlus, UserCheck, Crown, TrendingUp, TrendingDown } from "lucide-react";
import {
  WhatsAppOutlined,
  FacebookOutlined,
  InstagramOutlined
} from "@ant-design/icons";
import { CheckCircle, FileText, Phone, Trophy, XCircle, Info } from "lucide-react";
const { Option } = Select;
const { Text } = Typography;

const STAGE_OUTCOMES = {
  New: [
    { label: 'RNR (Ring Not Received)', value: 'RNR', autoTask: 'Call Back: Lead was RNR', offset: 24 },
    { label: 'Busy / Call Later', value: 'Busy', autoTask: 'Call Back: Lead was Busy', offset: 4 },
  ],
  Contacted: [
    { label: 'RNR (Ring Not Received)', value: 'RNR', autoTask: 'Call Back: Lead was RNR', offset: 24 },
    { label: 'Do Not Disturb (DND)', value: 'DND', autoTask: 'Re-engage: Lead requested DND', offset: 720 },
    { label: 'Busy / Call Later', value: 'Busy', autoTask: 'Call Back: Lead was Busy', offset: 4 },
    { label: 'Interested', value: 'Interested', autoTask: 'Follow-up: Interested Lead', requiresDate: true },
  ],
  Qualified: [
    { label: 'Interested / Follow-up', value: 'Interested', autoTask: 'Follow-up: Discuss requirements', requiresDate: true },
    { label: 'Decision Maker Away', value: 'DM_Away', autoTask: 'Call Back: DM was away', offset: 168 },
    { label: 'Info Needed', value: 'Info_Needed', autoTask: 'Prep Info: Lead needs more info', offset: 48 },
  ],
  Proposal: [
    { label: 'Sent - Awaiting', value: 'Sent_Awaiting', autoTask: 'Follow-up: Proposal Sent', offset: 72 },
    { label: 'Pricing Review', value: 'Pricing_Review', autoTask: 'Follow-up: Pricing Discussion', offset: 168 },
    { label: 'Budget Issue', value: 'Budget_Issue', autoTask: 'Re-check: Budget constraints', offset: 360 },
  ],
  Lost: [
    { label: 'Budget Issue', value: 'Budget_Issue', autoTask: 'Re-engage: Re-check budget', offset: 2160 },
    { label: 'Competition', value: 'Competition', autoTask: 'Re-engage: Check relationship', offset: 4320 },
  ],
  Won: []
};


export default function Leads() {
  const navigate = useNavigate();
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewTransitioning, setViewTransitioning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [viewType, setViewType] = useState("list");
  const tabs = ["All", "New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
  const [activeTab, setActiveTab] = useState("All");
  const currentUser = authService.getCurrentUser();
  const [stageChangeModalOpen, setStageChangeModalOpen] = useState(false);
  const [pendingStageChange, setPendingStageChange] = useState(null);
  const [pendingLeadValues, setPendingLeadValues] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [stageForm] = Form.useForm();

  const handleViewTypeChange = (type) => {
    setViewTransitioning(true);
    setViewType(type);
    if (type === "kanban") setActiveTab("All");
    setTimeout(() => setViewTransitioning(false), 300); // Small delay to let React render
  };


  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadService.getAll();
      if (response.success) {
        setLeads((response.data || []).reverse());
      }
    } catch (error) {
      message.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingLead && values.status !== editingLead.status) {
        // If status changed, we need the stage change note modal
        setPendingLeadValues(values);
        handleLeadDrop(editingLead, values.status);
        setModalOpen(false);
        return;
      }

      const response = editingLead
        ? await leadService.update(editingLead.id, values)
        : await leadService.create(values);

      if (response.success) {
        message.success(editingLead ? 'Lead updated successfully' : 'Lead created successfully');
        fetchLeads();
        setModalOpen(false);
        setEditingLead(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (lead) => {
    if (lead.assigned_to && lead.assigned_to !== currentUser?.id) {
      message.warning(`This lead is assigned to ${lead.assignedTo?.name || 'another user'}. You cannot modify it.`);
      return;
    }
    setEditingLead(lead);
    form.setFieldsValue({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      status: lead.status,
      assigned_to: lead.assigned_to
    });
    setModalOpen(true);
  };
  const handleView = (lead) => {
    if (!lead.assigned_to) {
      Modal.confirm({
        title: 'Assign Lead',
        content: 'This lead is currently unassigned. Would you like to assign it to yourself to manage it?',
        okText: 'Assign to Me',
        cancelText: 'Cancel',
        onOk: async () => {
          try {
            const response = await leadService.update(lead.id, { assigned_to: currentUser.id });
            if (response.success) {
              message.success('Lead assigned to you successfully!');
              fetchLeads();
              setSelectedLead({ ...lead, assigned_to: currentUser.id, assignedTo: currentUser });
              setViewModalOpen(true);
            }
          } catch (error) {
            message.error('Failed to assign lead');
          }
        }
      });
    } else if (lead.assigned_to !== currentUser?.id) {
      message.warning(`This lead is assigned to ${lead.assignedTo?.name || 'another user'}. You can view it but cannot make changes.`);
      setSelectedLead(lead);
      setViewModalOpen(true);
    } else {
      setSelectedLead(lead);
      setViewModalOpen(true);
    }
  };

  const handleLeadDrop = (lead, newStage) => {
    setPendingStageChange({ lead, newStage });
    setStageChangeModalOpen(true);
  };

  const handleStageChangeSubmit = async (values) => {
    if (!pendingStageChange) return;
    const { lead, newStage } = pendingStageChange;

    try {
      const finalStage = isConverting ? values.selectedStatus : newStage;
      const stageOutcomes = STAGE_OUTCOMES[finalStage] || [];
      const selectedOutcome = stageOutcomes.find(o => o.value === values.outcome);

      if (isConverting) {
        // Convert Lead to Customer first
        const convertRes = await leadService.convertToCustomer(lead.id);
        if (convertRes.success && convertRes.data.alreadyConverted) {
          message.warning('This lead is already a customer');
        }
      }

      const updateData = { 
        status: finalStage, 
        last_outcome: values.outcome || null 
      };

      if (pendingLeadValues) {
        // Full update from Edit Modal
        await leadService.update(lead.id, { ...pendingLeadValues, ...updateData });
      } else {
        // Single status update or Conversion update
        await leadService.update(lead.id, updateData);
      }

      // 2. Create Automation Task logic first to get the date for Activity
      let taskDueDate = null;
      let taskTitle = `Follow up with ${lead.name}`;

      if (selectedOutcome) {
        if (selectedOutcome.offset) {
          taskDueDate = new Date(Date.now() + selectedOutcome.offset * 60 * 60 * 1000);
          taskTitle = selectedOutcome.autoTask;
        } else if (selectedOutcome.requiresDate && values.followUpDate) {
          taskDueDate = values.followUpDate.toDate ? values.followUpDate.toDate() : new Date(values.followUpDate);
        }
      } else if (values.requiresFollowUp && values.followUpDate) {
        taskDueDate = values.followUpDate.toDate ? values.followUpDate.toDate() : new Date(values.followUpDate);
      }

      // 3. Create Note and Activity
      const notePrefix = isConverting ? 'conversion' : 'stage change';
      const outcomeText = selectedOutcome ? ` (Outcome: ${selectedOutcome.label})` : '';
      const finalNote = `Moved to ${finalStage} during ${notePrefix}${outcomeText}. Notes: ${values.note}`;
      
      await noteService.create({
        related_type: 'Lead',
        related_id: lead.id,
        note: finalNote
      });

      // Log this as an Activity (using scheduled date if available)
      await activityService.create({
        type: values.contact_type || (taskDueDate ? 'Task' : 'Stage Change'),
        related_type: 'Lead',
        related_id: lead.id,
        notes: finalNote,
        activity_date: (taskDueDate || new Date()).toISOString(),
        scheduled_at: taskDueDate ? taskDueDate.toISOString() : null
      });

      if (taskDueDate) {
        await taskService.create({
          title: taskTitle,
          description: values.note,
          related_type: 'Lead',
          related_id: lead.id,
          assigned_to: currentUser.id,
          due_date: taskDueDate.toISOString(),
          priority: 'Medium',
          status: 'Pending'
        });
      }

      // 4. Optional: Redirect to Quotes if Sent_Awaiting
      if (values.outcome === 'Sent_Awaiting') {
        const hide = message.loading('Preparing quote board...', 1.5);
        setTimeout(() => {
          hide();
          navigate('/quotes', { state: { activeTab: '2' } });
        }, 1500);
      }

      message.success(isConverting ? 'Lead successfully converted to customer!' : (pendingLeadValues ? 'Lead and stage updated' : `Lead moved to ${finalStage}`));
      setStageChangeModalOpen(false);
      setPendingStageChange(null);
      setPendingLeadValues(null);
      setIsConverting(false);
      setEditingLead(null);
      stageForm.resetFields();
      fetchLeads();
    } catch (error) {
      message.error('Failed to update stage and metadata');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await leadService.delete(id);
      if (response.success) {
        message.success('Lead deleted successfully');
        fetchLeads();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleUnassign = async (lead) => {
    try {
      const response = await leadService.update(lead.id, {
        assigned_to: null
      });
      if (response.success) {
        message.success('Lead unassigned successfully');
        fetchLeads();
      }
    } catch (error) {
      message.error('Failed to unassign lead');
    }
  };

  const handleConvert = (lead) => {
    setPendingStageChange({ lead, newStage: 'Won' }); // Default target for conversion
    setIsConverting(true);
    stageForm.setFieldsValue({ selectedStatus: 'Won' });
    setStageChangeModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingLead(null);
    form.resetFields();
    setModalOpen(true);
  };

  useEffect(() => {
    if (leads.length > 0 && location.state?.autoAction && location.state?.autoLeadId) {
      const { autoAction, autoLeadId } = location.state;
      const targetLead = leads.find(l => l.id === autoLeadId);
      
      if (targetLead) {
        if (autoAction === 'edit') {
          handleEdit(targetLead);
        } else if (autoAction === 'convert') {
          handleConvert(targetLead);
        }
        
        // Clear state to prevent re-opening on manual refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [leads, location, navigate]);

  const handleBulkUpload = async (formData) => {
    try {
      const response = await leadService.bulkUpload(formData);
      if (response.success) {
        fetchLeads(); // Refresh the list
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://crm-be-giqy.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/leads/template/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads_template.csv';
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

  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => {
        const searchMatch = (lead.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          lead.company?.toLowerCase().includes(searchText.toLowerCase()));
        const tabMatch = activeTab === "All" || lead.status === activeTab;
        return searchMatch && tabMatch;
      })
      .sort((a, b) => {
        // Unassigned first (null/undefined)
        const aVal = a.assigned_to ? 1 : 0;
        const bVal = b.assigned_to ? 1 : 0;
        if (aVal !== bVal) return aVal - bVal;
        
        // Secondary sort by date (newest first)
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [leads, searchText, activeTab]);

  const getStatusColor = (status) => {
    const colors = {
      'New': 'blue',
      'Contacted': 'cyan',
      'Qualified': 'green',
      'Proposal': 'orange',
      'Won': 'success',
      'Lost': 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: "Lead",
      dataIndex: "name",
      align: "left",   // keep left like customer avatar column
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            src={
              record.email
                ? `https://logo.clearbit.com/${record.email.split("@")[1]}`
                : null
            }
            style={{ backgroundColor: "#ff8a00", color: "#fff", flexShrink: 0 }}
            icon={<UserOutlined />}
          >
            {!record.email && text?.charAt(0)}
          </Avatar>

          <div>
            <div style={{ fontWeight: 600, color: "#111827" }}>{text}</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{record.lead_code}</div>
          </div>
        </div>
      ),
    },

    {
      title: "Contact",
      key: "contact",
      align: "center",
      render: (_, record) => (
        <div>
          {record.email && (
            <div style={{ fontSize: 13, marginBottom:"5px" }}>
              <Typography.Text 
                copyable={{ 
                  text: record.email,
                  icon: [<ClipboardCopy size={14} className="text-gray-400 hover:text-blue-500 ml-1" key="copy" />, <CheckCircle2 size={14} className="text-green-500 ml-1" key="copied" />],
                  tooltips: ['Copy', 'Copied!']
                }}
              >
                {record.email}
              </Typography.Text>
            </div>
          )}

          {record.phone && (
            <div style={{ fontSize: 13 }}>
              <Typography.Text 
                copyable={{ 
                  text: record.phone,
                  icon: [<ClipboardCopy size={14} className="text-gray-400 hover:text-blue-500 ml-1" key="copy" />, <CheckCircle2 size={14} className="text-green-500 ml-1" key="copied" />],
                  tooltips: ['Copy', 'Copied!']
                }}
              >
                {record.phone}
              </Typography.Text>
            </div>
          )}

          {/* ✅ SOCIAL LINKS ADD HERE */}
          {/* <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 10 }}>

            
            <a
              href={`https://wa.me/${record.phone}`}
              target="_blank"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#e6f7ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <WhatsAppOutlined style={{ color: "#25D366", fontSize: 16 }} />
            </a>

            
            <a
              href={record.facebook_url || "#"}
              target="_blank"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#e7f0ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FacebookOutlined style={{ color: "#1877F2", fontSize: 16 }} />
            </a>

            
            <a
              href={record.instagram_url || "#"}
              target="_blank"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#fce7f3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <InstagramOutlined style={{ color: "#E1306C", fontSize: 16 }} />
            </a>

          </div> */}
        </div>
      ),
    },

    {
      title: "Company",
      dataIndex: "company",
      align: "center",
      render: (text) => <span>{text || "N/A"}</span>,
    },

    {
      title: "Source",
      dataIndex: "source",
      align: "center",
      render: (text) => <span>{text || "N/A"}</span>,
    },

    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <Tag variant="filled" color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },

    {
      title: "Assigned To",
      dataIndex: "assigned_to",
      align: "center",
      sorter: (a, b) => {
        // Unassigned leads first
        const aVal = a.assignedTo ? 1 : 0;
        const bVal = b.assignedTo ? 1 : 0;
        if (aVal !== bVal) return aVal - bVal;
        return (a.assignedTo?.name || "").localeCompare(b.assignedTo?.name || "");
      },
      render: (_, record) => (
        <span>
          {record.assignedTo?.name || "Unassigned"}
        </span>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const isAssignedToOther = record.assigned_to && record.assigned_to !== currentUser?.id;
        const isAdmin = currentUser?.role === 'Admin';
        const canEdit = !isAssignedToOther || isAdmin;

        return (
          <div style={{ display: "flex", alignItems:"center", justifyContent: "center", gap: 5 }}>
            {record.status !== "Won" && (
              <Button
                type="primary"
                size="small"
                onClick={() => handleConvert(record)}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                disabled={!canEdit}
                title={!canEdit ? "Assigned to another user" : ""}
              >
                Convert
              </Button>
            )}

            <Button
              icon={<EyeOutlined />}
              type=""
              onClick={() => handleView(record)}
            >
            </Button>

            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={!canEdit}
              title={!canEdit ? "Assigned to another user" : ""}
            >
            </Button>

            <Popconfirm
              title="Delete lead"
              onConfirm={() => handleDelete(record.id)}
              disabled={!canEdit}
            >
              <Button danger icon={<DeleteOutlined />} disabled={!canEdit} title={!canEdit ? "Assigned to another user" : ""} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const cardAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <div style={{ padding: "10px", minHeight: "100vh", background: "#f5f6f8" }}>
      {loading && !leads.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>Leads</div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Manage and track all leads
              </div>
            </Col>
            <Col>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ height: 40, borderRadius: 8 }}
                  onClick={handleAddNew}
                >
                  Add Lead
                </Button>
                <Button
                  type="default"
                  icon={<UploadOutlined />}
                  style={{ height: 40, borderRadius: 8 }}
                  onClick={() => setShowBulkUpload(true)}
                >
                  Bulk Upload
                </Button>
              </div>
            </Col>
          </Row>

          {/* STATS - ONLY SHOW IN LIST VIEW */}
          {viewType === "list" && (
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {[
                { title: "Total Leads", count: leads.length, color: "#6366f1", icon: <Users size={22} />, trend: "+12.5%", isUp: true },
                { title: "New Leads", count: leads.filter(l => l.status === 'New').length, color: "#3b82f6", icon: <UserPlus size={22} />, trend: "+5.2%", isUp: true },
                { title: "Qualified", count: leads.filter(l => l.status === 'Qualified').length, color: "#f97316", icon: <UserCheck size={22} />, trend: "-2.4%", isUp: false },
                { title: "Deals Won", count: leads.filter(l => l.status === 'Won').length, color: "#10b981", icon: <Crown size={22} />, trend: "+8.1%", isUp: true },
              ].map((item, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <motion.div
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardAnimation}
                  >
                    <Card variant="borderless" style={{ borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", overflow: 'hidden' }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: '0.5px' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: "#111827" }}>
                            {item.count}
                          </div>
                          <div className="flex items-center mt-3 text-[11px] font-medium">
                            <span className={`flex items-center gap-0.5 ${item.isUp ? 'text-green-500' : 'text-red-500'}`}>
                              {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {item.trend}
                            </span>
                            <span className="text-gray-400 ml-1.5">vs last 30 days</span>
                          </div>
                        </div>
                        <div style={{ 
                          width: 44, 
                          height: 44, 
                          borderRadius: 12, 
                          backgroundColor: `${item.color}15`, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: item.color
                        }}>
                          {item.icon}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}

          {/* SEARCH & TOGGLES */}
          <Card style={{ borderRadius: 12, marginBottom: 20 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Input
                placeholder="Search leads by name, email, or company..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                style={{ height: 40, borderRadius: 8, maxWidth: "250px" }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <div className="flex items-center gap-4">
                {/* VIEW TOGGLE */}
                <div className="flex bg-[#f3f4f6] p-1 rounded-lg">
                  <button
                    onClick={() => handleViewTypeChange("kanban")}
                    className={`flex items-center gap-2 px-3 h-8 rounded-md text-[13px] font-medium transition-all ${viewType === "kanban" ? "bg-white text-[#1677ff] shadow-sm" : "text-[#6b7280] hover:text-[#374151]"}`}
                  >
                    <LayoutGrid size={16} /> Kanban
                  </button>
                  <button
                    onClick={() => handleViewTypeChange("list")}
                    className={`flex items-center gap-2 px-3 h-8 rounded-md text-[13px] font-medium transition-all ${viewType === "list" ? "bg-white text-[#1677ff] shadow-sm" : "text-[#6b7280] hover:text-[#374151]"}`}
                  >
                    <List size={16} /> Table
                  </button>
                </div>


              </div>
            </div>
            {/* STATUS TABS - ONLY SHOW IN LIST VIEW */}
            {viewType === "list" && (
              <div className="flex items-center mt-3 gap-2 overflow-x-auto whitespace-nowrap hidden lg:flex">
                {tabs.map((tab) => {
                  const count = tab === "All" ? leads.length : leads.filter((d) => d.status === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${activeTab === tab ? "bg-[#1677ff] text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100 border border-[#e5e7eb]"}`}
                    >
                      {tab} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {viewTransitioning ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', background: '#fff', borderRadius: 16 }}>
              <Spin size="large" description="Switching view..." />
            </div>
          ) : viewType === "kanban" ? (
            <LeadKanbanBoard
              leads={filteredLeads}
              onLeadDrop={handleLeadDrop}
              onLeadClick={handleView}
              onUnassign={handleUnassign}
              currentUser={currentUser}
            />
          ) : (
            <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)",padding:"10px" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  Lead Directory ({filteredLeads.length})
                </span>
              </div>
              <ResponsiveTable
                columns={columns}
                dataSource={filteredLeads}
                rowKey="id"
                loading={loading}
                pagination={{ 
                  defaultPageSize: 10,
                  showSizeChanger: true, 
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total) => `Total ${total} leads`
                }}
                renderMobileCard={(record) => (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Header with Avatar and Name */}
                    <div style={{ display: 'flex', alignItems: 'center'}}>
                      <Avatar
                        style={{ backgroundColor: "#ff8a00", color: "#fff", flexShrink: 0 }}
                        icon={<UserOutlined />}
                      >
                        {record.name?.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1 , paddingLeft: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>
                          {record.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>
                          {record.lead_code}
                        </div>
                      </div>
                      <Tag color={getStatusColor(record.status)}>
                        {record.status}
                      </Tag>
                    </div>

                    {/* Contact Info */}
                    <div style={{ marginBottom: 12, paddingLeft: 8 }}>
                      {record.email && (
                        <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                          <MailOutlined style={{ marginRight: 6 }} />
                          {record.email}
                        </div>
                      )}
                      {record.phone && (
                        <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                          <PhoneOutlined style={{ marginRight: 6 }} />
                          {record.phone}
                        </div>
                      )}
                      {record.company && (
                        <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                          <strong>Company:</strong> {record.company}
                        </div>
                      )}
                      {record.source && (
                        <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                          <strong>Source:</strong> {record.source}
                        </div>
                      )}
                      <div style={{ fontSize: 13, color: "#4b5563" }}>
                        <strong>Assigned:</strong> {record.assignedTo?.name || 'Unassigned'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                      {(() => {
                        const isAssignedToOther = record.assigned_to && record.assigned_to !== currentUser?.id;
                        const isAdmin = currentUser?.role === 'Admin';
                        const canEdit = !isAssignedToOther || isAdmin;

                        return (
                          <>
                            {record.status !== 'Won' && (
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => handleConvert(record)}
                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                disabled={!canEdit}
                              >
                                Convert
                              </Button>
                            )}
                            <Button
                              type="link"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => handleView(record)}
                            >
                              View
                            </Button>
                            <Button
                              type="link"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEdit(record)}
                              disabled={!canEdit}
                            >
                              Edit
                            </Button>
                            <Popconfirm
                              title="Delete lead"
                              description="Are you sure?"
                              onConfirm={() => handleDelete(record.id)}
                              okText="Yes"
                              cancelText="No"
                              disabled={!canEdit}
                            >
                              <Button type="link" size="small" danger icon={<DeleteOutlined />} disabled={!canEdit}>
                                Delete
                              </Button>
                            </Popconfirm>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              />
            </Card>
          )}
        </>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal
        title={editingLead ? "Edit Lead" : "Add Lead"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingLead(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="Enter phone" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Company" name="company">
                <Input placeholder="Enter company" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Source" name="source">
                <Input placeholder="e.g., Website, Referral" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="New">New</Option>
                  <Option value="Contacted">Contacted</Option>
                  <Option value="Qualified">Qualified</Option>
                  <Option value="Proposal">Proposal</Option>
                  <Option value="Won">Won</Option>
                  <Option value="Lost">Lost</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Assigned To" name="assigned_to">
                <Select
                  placeholder="Select user"
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  <Option value={null}>Unassigned</Option>
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={10}>
            <Col span={12}>
              <Button
                block
                onClick={() => {
                  setModalOpen(false);
                  setEditingLead(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingLead ? 'Update' : 'Create'} Lead
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* STAGE CHANGE MODAL */}
      <Modal
        title={isConverting ? "Convert Lead to Customer" : `Move to ${pendingStageChange?.newStage}`}
        open={stageChangeModalOpen}
        onCancel={() => {
          setStageChangeModalOpen(false);
          setPendingStageChange(null);
          setPendingLeadValues(null);
          setEditingLead(null);
          setIsConverting(false);
          stageForm.resetFields();
        }}
        footer={null}
        centered
        width={500}
      >
        <Form form={stageForm} layout="vertical" onFinish={handleStageChangeSubmit} initialValues={{ requiresFollowUp: false, selectedStatus: 'Won' }}>
          {isConverting && (
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.selectedStatus !== currentValues.selectedStatus}
            >
              {() => (
                <Form.Item 
                  label="Select final stage for this conversion" 
                  name="selectedStatus" 
                  rules={[{ required: true }]}
                >
                  <div className="flex flex-wrap gap-3 mt-2">
                    {[
                      { value: 'Contacted', color: '#0ea5e9', icon: <Phone size={14} /> },
                      { value: 'Qualified', color: '#f59e0b', icon: <CheckCircle size={14} /> },
                      { value: 'Proposal', color: '#6366f1', icon: <FileText size={14} /> },
                      { value: 'Won', color: '#10b981', icon: <Trophy size={14} /> },
                      { value: 'Lost', color: '#ef4444', icon: <XCircle size={14} /> },
                    ].map((s) => {
                      const isSelected = stageForm.getFieldValue('selectedStatus') === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => {
                            stageForm.setFieldsValue({ selectedStatus: s.value });
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all font-semibold text-[13px] 
                            ${isSelected ? 'scale-105 shadow-md' : 'opacity-60 hover:opacity-90 hover:scale-102'}`}
                          style={{
                            borderColor: s.color,
                            backgroundColor: isSelected ? s.color : `${s.color}15`,
                            color: isSelected ? '#fff' : s.color,
                            boxShadow: isSelected ? `0 4px 12px ${s.color}40` : 'none',
                            borderWidth: '2px'
                          }}
                        >
                          {s.icon} {s.value}
                        </button>
                      );
                    })}
                  </div>
                </Form.Item>
              )}
            </Form.Item>
          )}

          <Form.Item
            label="Communication Channel"
            name="contact_type"
            initialValue="Call"
            rules={[{ required: true, message: 'Select your communication method' }]}
          >
            <Radio.Group block buttonStyle="solid">
              <Radio.Button value="Call"><div className="flex items-center gap-1.5 px-1"><Phone size={14} /> Call</div></Radio.Button>
              <Radio.Button value="WhatsApp"><div className="flex items-center gap-1.5 px-1"><WhatsAppOutlined /> WA</div></Radio.Button>
              <Radio.Button value="Email"><div className="flex items-center gap-1.5 px-1"><MailOutlined /> Email</div></Radio.Button>
              <Radio.Button value="Meeting"><div className="flex items-center gap-1.5 px-1"><CalendarOutlined /> Meet</div></Radio.Button>
              <Radio.Button value="Stage Change"><div className="flex items-center gap-1.5 px-1">Other</div></Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="What did the customer say?"
            name="note"
            rules={[{ required: true, message: 'Please provide notes on this stage change' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter details of the conversation..." />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.selectedStatus !== currentValues.selectedStatus || 
              prevValues.outcome !== currentValues.outcome
            }
          >
            {({ getFieldValue }) => {
              const currentStage = isConverting ? getFieldValue('selectedStatus') : pendingStageChange?.newStage;
              const outcomes = STAGE_OUTCOMES[currentStage] || [];
              
              return (
                <>
                  {outcomes.length > 0 && (
                    <Form.Item
                      label="Interaction Outcome"
                      name="outcome"
                      rules={[{ required: true, message: 'Please select an outcome' }]}
                    >
                      <Select placeholder="How did the interaction go?">
                        {outcomes.map(o => (
                          <Option key={o.value} value={o.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{o.label}</span>
                              {o.offset && (
                                <Tag color="blue" className="mr-0">
                                  {o.offset < 24 ? `+${o.offset}h` : `+${Math.round(o.offset/24)}d`}
                                </Tag>
                              )}
                            </div>
                          </Option>
                        ))}
                        <Option value="Other">Other (Manual Follow-up)</Option>
                      </Select>
                    </Form.Item>
                  )}

                  {(getFieldValue('outcome') === 'Other' || outcomes.length === 0) && (
                    <Form.Item label="Manual Follow-up needed?" name="requiresFollowUp" valuePropName="checked">
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                  )}

                  {((getFieldValue('outcome') === 'Other' || outcomes.length === 0) && getFieldValue('requiresFollowUp')) || 
                   (outcomes.find(o => o.value === getFieldValue('outcome'))?.requiresDate) ? (
                    <Form.Item
                      label="Follow-up Date & Time"
                      name="followUpDate"
                      rules={[{ required: true, message: 'Please select follow-up date' }]}
                    >
                      <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                  ) : null}

                  {outcomes.find(o => o.value === getFieldValue('outcome'))?.offset && !getFieldValue('requiresFollowUp') && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4 flex items-center gap-2">
                      <Info size={16} className="text-blue-500" />
                      <Text size="small" className="text-blue-700">
                        A follow-up task will be auto-scheduled for <strong>
                          {(() => {
                            const o = outcomes.find(o => o.value === getFieldValue('outcome'));
                            const date = new Date(Date.now() + o.offset * 60 * 60 * 1000);
                            return date.toLocaleString();
                          })()}
                        </strong>
                      </Text>
                    </div>
                  )}
                </>
              );
            }}
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => {
              setStageChangeModalOpen(false);
              setPendingStageChange(null);
              setPendingLeadValues(null);
              setEditingLead(null);
              setIsConverting(false);
              stageForm.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Save & Move
            </Button>
          </div>
        </Form>
      </Modal>

      <LeadDetailsModal
        open={viewModalOpen}
        lead={selectedLead}
        onClose={() => setViewModalOpen(false)}
        onLeadUpdate={fetchLeads}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onConvert={handleConvert}
      />

      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUpload={handleBulkUpload}
        onDownloadTemplate={handleDownloadTemplate}
        moduleName="Leads"
        templateFields={['name', 'email', 'phone', 'company', 'source', 'status', 'assigned_to']}
      />
    </div>
  );
}
