import { useState, useEffect, useMemo } from "react";
import { Card, Table, Input, Button, Modal, Form, Select, Tag, Avatar, message, Popconfirm, Row, Col, Spin, Switch, DatePicker, Typography, Radio, Tooltip } from "antd";
import { SearchOutlined, PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, EyeOutlined, UploadOutlined, CalendarOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { leadService, userService, noteService, taskService, activityService, serviceCatalogService } from "../services";
import authService from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";

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
import LeadStatsCards from "./LeadStatsCards";
const { Option } = Select;
const { Text } = Typography;
import { STAGE_OUTCOMES } from "../utils/leadStages";



export default function Leads() {
  const navigate = useNavigate();
  const location = useLocation();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewTransitioning, setViewTransitioning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState();
  const [assignedFilter, setAssignedFilter] = useState();
  const [dateRange, setDateRange] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [form] = Form.useForm();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

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
    fetchServices();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadService.getAll();
      console.log(response)
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

  const fetchServices = async () => {
    try {
      const response = await serviceCatalogService.getAll({ is_active: 'true' });
      if (response.success) setServices(response.data || []);
    } catch (error) {
      console.error('Failed to load services');
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
      assigned_to: lead.assigned_to,
      service_ids: lead.interestedServices?.map(s => s.id) || []
    });
    setModalOpen(true);
  };
  const handleView = (lead) => {
    if (!lead.assigned_to) {
      let selectedToAssignId = currentUser.id;
      Modal.confirm({
        title: <div className="flex items-center gap-2"><UserPlus size={20} className="text-blue-500" /> <span>Assign Lead</span></div>,
        icon: null,
        width: 450,
        content: (
          <div className="mt-4">
            <Text type="secondary">This lead is currently unassigned. Please choose a user to manage this lead or just view the details.</Text>
            <div className="mt-4">
              <Text strong className="block mb-2">Select Team Member:</Text>
              <Select
                placeholder="Choose user"
                style={{ width: '100%' }}
                defaultValue={currentUser.id}
                onChange={(val) => selectedToAssignId = val}
              >
                {users.map(user => (
                  <Option key={user.id} value={user.id}>{user.name} ({user.role})</Option>
                ))}
              </Select>
            </div>
          </div>
        ),
        okText: 'Assign & View Lead',
        cancelText: 'Just View (Wait)',
        okButtonProps: { style: { background: '#1677ff' } },
        cancelButtonProps: { type: 'default' },
        onOk: async () => {
          try {
            const response = await leadService.update(lead.id, { assigned_to: selectedToAssignId });
            if (response.success) {
              message.success(`Lead assigned successfully!`);
              fetchLeads();
              const assignedUser = users.find(u => u.id === selectedToAssignId);
              setSelectedLead({ ...lead, assigned_to: selectedToAssignId, assignedTo: assignedUser });
              setViewModalOpen(true);
            }
          } catch (error) {
            message.error('Failed to assign lead');
          }
        },
        onCancel: () => {
          // Just view without assigning
          setSelectedLead(lead);
          setViewModalOpen(true);
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

  const baseFilteredLeads = useMemo(() => {
    return leads;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return baseFilteredLeads
      .filter((lead) => {
        // Search
        const searchMatch =
          (lead.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (lead.email || "").toLowerCase().includes(searchText.toLowerCase()) ||
          (lead.interestedServices || [])
            .some(service =>
              service.name?.toLowerCase().includes(searchText.toLowerCase())
            ) ||
          (lead.phone || "").toLowerCase().includes(searchText.toLowerCase());

        // Tab
        const tabMatch =
          activeTab === "All" || lead.status === activeTab;

        // Status Filter
        const statusMatch =
          !statusFilter || lead.status === statusFilter;

        // Assigned Employee Filter
        const assignedMatch =
          !assignedFilter || lead.assigned_to === assignedFilter;

        // Date Range Filter
        let dateMatch = true;

        if (dateRange && dateRange.length === 2) {
          const created = new Date(lead.created_at);
          const start = dateRange[0].startOf("day").toDate();
          const end = dateRange[1].endOf("day").toDate();

          dateMatch = created >= start && created <= end;
        }

        return (
          searchMatch &&
          tabMatch &&
          statusMatch &&
          assignedMatch &&
          dateMatch
        );
      })
      .sort((a, b) => {
        const aVal = a.assigned_to ? 1 : 0;
        const bVal = b.assigned_to ? 1 : 0;

        if (aVal !== bVal) return aVal - bVal;

        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [
    baseFilteredLeads,
    searchText,
    activeTab,
    statusFilter,
    assignedFilter,
    dateRange,
  ]);

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
      title: "Lead Name",
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
            // icon={<UserOutlined />}
            className="cursor-pointer"
            onClick={() => handleView(record)}
          >
            {record.name?.charAt(0)}
          </Avatar>

          <div>
            <Tooltip title={text}>
              <div
                style={{
                  fontWeight: 600,
                  color: "#111827",
                  maxWidth: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                className="cursor-pointer"
                onClick={() => handleView(record)}
              >
                {text}
              </div>
            </Tooltip>
            <div style={{ fontSize: 12, color: "#9ca3af" }} className="cursor-pointer" onClick={() => handleView(record)} >{record.lead_code}</div>
          </div>
        </div>
      ),
    },

    {
      title: "Contact",
      key: "contact",
      align: "start",
      render: (_, record) => (
        <div>
          {record.email && (
            <div style={{ fontSize: 13, marginBottom: "5px" }}>
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


        </div>
      ),
    },

    {
      title: "Interested Course",
      dataIndex: "interestedServices",
      align: "start",
      render: (services) => {
        const courseNames =
          services?.map((service) => service.name).join(", ") || "N/A";

        return (
          <Tooltip title={courseNames}>
            <div
              style={{
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {courseNames}
            </div>
          </Tooltip>
        );
      },
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
      align: "start",
      render: (status) => (
        <Tag variant="filled" color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },

    {
      title: "Assigned To",
      dataIndex: "assigned_to",
      align: "start",
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
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      align: "start",
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString("en-IN")
          : "N/A",
    },

    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const isAssignedToOther = record.assigned_to && record.assigned_to !== currentUser?.id;
        const isAdmin = currentUser?.role === 'Admin';
        const canEdit = !isAssignedToOther || isAdmin;
        const isClosed = record.status === 'Won' || record.status === 'Lost';

        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
            <Button
              type="primary"
              size="small"
              onClick={() => handleConvert(record)}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
              disabled={!canEdit || isClosed}
              title={
                !canEdit
                  ? "Assigned to another user"
                  : isClosed
                    ? `Lead is already ${record.status}`
                    : "Convert to Opportunity"
              }
            >
              Convert
            </Button>

            {/* <Button
              icon={<EyeOutlined />}
              type=""
              onClick={() => handleView(record)}
            >
            </Button> */}

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
              </div>
            </Col>
          </Row>

          {/* STATS - ONLY SHOW IN LIST VIEW */}
          {viewType === "list" && (
            <LeadStatsCards leads={baseFilteredLeads} />
          )}

          {/* SEARCH & TOGGLES */}
          <Card style={{ borderRadius: 12, marginBottom: 20 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Input
                placeholder="Search leads by name, email, phone or company..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                style={{ height: 40, borderRadius: 8, maxWidth: "250px" }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <div className="flex items-center mt-3 gap-2 overflow-x-auto whitespace-nowrap hidden lg:flex">
                {/* Lead Status */}
                <Select
                  placeholder="Lead Status"
                  allowClear
                  style={{ width: 170 }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="New">New</Option>
                  <Option value="Contacted">Contacted</Option>
                  <Option value="Qualified">Qualified</Option>
                  <Option value="Proposal">Proposal</Option>
                  <Option value="Won">Won</Option>
                  <Option value="Lost">Lost</Option>
                </Select>

                {/* Assigned Employee */}
                <Select
                  placeholder="Assigned Employee"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  style={{ width: 220 }}
                  value={assignedFilter}
                  onChange={setAssignedFilter}
                >
                  {users.map((user) => (
                    <Option key={user.id} value={user.id}>
                      {user.name}
                    </Option>
                  ))}
                </Select>

                {/* Date Range */}
                <DatePicker.RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates || [])}
                />

                {/* Reset */}
                <Button
                  onClick={() => {
                    setStatusFilter(undefined);
                    setAssignedFilter(undefined);
                    setDateRange([]);
                    setSearchText("");
                    setActiveTab("All");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>

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
            <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }} styles={{ body: { padding: '15px' } }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
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
                  pageSizeOptions: ['10', '25', '50'],
                  showTotal: (total) => `Total ${total} leads`
                }}
                renderMobileCard={(record) => {
                  const isAssignedToOther = record.assigned_to && record.assigned_to !== currentUser?.id;
                  const isAdmin = currentUser?.role === 'Admin';
                  const canEdit = !isAssignedToOther || isAdmin;
                  const isClosed = record.status === 'Won' || record.status === 'Lost';

                  return (
                    <div className="flex flex-col gap-4">
                      {/* Top Row: Avatar & Name */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            size={44}
                            style={{ backgroundColor: "#ff8a00", color: "#fff", flexShrink: 0 }}
                            src={record.email ? `https://logo.clearbit.com/${record.email.split("@")[1]}` : null}
                            onClick={(e) => { e.stopPropagation(); handleView(record); }}
                          >
                            {record.name?.charAt(0)}
                          </Avatar>
                          <div onClick={(e) => { e.stopPropagation(); handleView(record); }}>
                            <div className="font-bold text-[15px] text-gray-900 leading-tight">{record.name}</div>
                            <div className="text-[12px] text-gray-400">{record.lead_code}</div>
                          </div>
                        </div>
                        <Tag color={getStatusColor(record.status)} style={{ borderRadius: 6, margin: 0 }}>
                          {record.status}
                        </Tag>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 gap-2 text-[13px] text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {record.email && (
                          <div className="flex items-center gap-2 truncate">
                            <MailOutlined className="text-gray-400" />
                            <span className="truncate">{record.email}</span>
                          </div>
                        )}
                        {record.phone && (
                          <div className="flex items-center gap-2">
                            <PhoneOutlined className="text-gray-400" />
                            <span>{record.phone}</span>
                          </div>
                        )}
                        {record.interestedServices?.length > 0 && (
  <div className="flex items-center gap-2">
    <span className="bg-gray-200 w-1 h-1 rounded-full"></span>
    <span className="font-medium">
      {record.interestedServices.map(course => course.name).join(", ")}
    </span>
  </div>
)}
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200 mt-1">
                          <UserOutlined className="text-gray-400" />
                          <span className="text-[12px]">Assigned: <span className="font-semibold">{record.assignedTo?.name || 'Unassigned'}</span></span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Button
                          type="primary"
                          size="middle"
                          block
                          onClick={(e) => { e.stopPropagation(); handleConvert(record); }}
                          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 border-none rounded-lg h-10 font-semibold"
                          disabled={!canEdit || isClosed}
                        >
                          Convert Lead
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            icon={<EditOutlined />}
                            onClick={(e) => { e.stopPropagation(); handleEdit(record); }}
                            className="w-10 h-10 rounded-lg flex items-center justify-center border-gray-200"
                            disabled={!canEdit}
                          />
                          <Popconfirm
                            title="Delete lead"
                            onConfirm={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                            onCancel={(e) => e.stopPropagation()}
                            disabled={!canEdit}
                          >
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80"
                              disabled={!canEdit}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Popconfirm>
                        </div>
                      </div>
                    </div>
                  );
                }}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="Enter name" />
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
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Please enter phone number' }]}>
                <Input placeholder="Enter phone" />
              </Form.Item>
            </Col>
          </Row>



          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Course Interested" name="service_ids" rules={[{ required: true, message: 'Need to select at least one course' }]}>
                <Select placeholder="Select services of interest" mode="multiple" allowClear showSearch optionFilterProp="label"
                  options={services.map(s => ({ label: `${s.name}${s.category ? ` — ${s.category}` : ''}`, value: s.id }))}
                />
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
                                  {o.offset < 24 ? `+${o.offset}h` : `+${Math.round(o.offset / 24)}d`}
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
    </div>
  );
}
