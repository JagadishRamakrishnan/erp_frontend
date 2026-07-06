import React, { useState, useEffect } from "react";
import { Modal, Tabs, Steps, Avatar, Tag, Card, Row, Col, Divider, Timeline, Spin, Button, Input, message, Popconfirm, Tooltip, Collapse, Table } from "antd";
import { leadService, noteService, taskService } from "../services";
import { UserOutlined, MailOutlined, PhoneOutlined, LinkOutlined, FileTextOutlined, EditOutlined, SaveOutlined, CloseOutlined, CopyOutlined, DeleteOutlined, TrophyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Briefcase, Info, CheckCircle2, X } from "lucide-react";

const { Step } = Steps;

export default function LeadDetailsModal({ open, lead, onClose, onLeadUpdate, onEdit, onDelete, onConvert }) {
  const [localLead, setLocalLead] = useState(lead);
  const [loading, setLoading] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);

  if (!localLead && lead) {
    // We have a lead prop but haven't synced to local state yet
    // This can happen on first mount or when lead changes
  }

  useEffect(() => {
    if (lead) {
      setLocalLead(lead);
      setSummaryContent(lead.internal_summary || "");
    }
  }, [lead]);

  useEffect(() => {
    if (open && localLead) {
      const fetchData = async () => {
        setLoadingConfig(true);
        try {
          const notesRes = await noteService.getAll({ related_type: 'Lead', related_id: localLead.id });
          const tasksRes = await taskService.getAll({ related_type: 'Lead', related_id: localLead.id });
          
          if (notesRes.success) setNotes(notesRes.data || []);
          if (tasksRes.success) setTasks(tasksRes.data || []);
        } catch (error) {
          console.error("Failed to fetch notes/tasks", error);
        }
        setLoadingConfig(false);
      };
      fetchData();
    }
  }, [open, localLead?.id]);

  const handleUpdateSummary = async () => {
    if (!localLead) return;
    setSavingSummary(true);
    try {
      const response = await leadService.update(localLead.id, {
        internal_summary: summaryContent
      });
      if (response.success) {
        setLocalLead(response.data);
        setIsEditingSummary(false);
        message.success("Summary updated successfully");
        if (onLeadUpdate) onLeadUpdate(response.data);
      }
    } catch (error) {
      message.error("Failed to update summary");
    } finally {
      setSavingSummary(false);
    }
  };

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success(`${field} copied to clipboard!`);
  };

  if (!open || !localLead) return null;

  const timelineItems = [
    ...notes.map(n => ({ type: 'note', date: new Date(n.created_at), data: n })),
    ...tasks.map(t => ({ type: 'task', date: new Date(t.created_at), data: t }))
  ].sort((a, b) => b.date - a.date);

  // Define the strict pipeline stages
  const stages = ["New", "Contacted", "Qualified", "Proposal", "Won"];
  
  // Calculate current stage index. If "Lost", we might show it differently, 
  // but for the stepper, we'll just find the index or set it to 0.
  let currentStageIndex = stages.indexOf(localLead.status);
  if (localLead.status === "Lost") currentStageIndex = -1; // Specific handling for Lost

  const statusColors = {
    'New': 'blue',
    'Contacted': 'geekblue',
    'Qualified': 'purple',
    'Proposal': 'gold',
    'Won': 'success',
    'Lost': 'error',
    'Pending': 'default'
  };

  return (
    <Modal
      title={null}
      open={open}
      footer={null}
      onCancel={onClose}
      centered
      width={1000}
      styles={{ body: { padding: 0, overflow: 'hidden', borderRadius: '12px' } }}
      closeIcon={
        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full transition-all">
          <X size={18} />
        </div>
      }
    >
      <div className="flex flex-col md:flex-row min-h-[600px] bg-white rounded-xl overflow-hidden">
        
        {/* LEFT MAIN AREA */}
        <div className="flex-1 p-6 md:p-8 border-r border-gray-100 flex flex-col">
          
          {/* Header Info */}
          <div className="flex items-start gap-4 mb-8">
            <Avatar
              size={64}
              src={localLead.email ? `https://logo.clearbit.com/${localLead.email.split("@")[1]}` : null}
              style={{ background: "#1677ff", fontSize: '24px' }}
              icon={<UserOutlined />}
            >
              {!localLead.email && localLead.name?.charAt(0)}
            </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-800 m-0">{localLead.name}</h2>
                  <Tag color={statusColors[localLead.status] || 'blue'} className="px-3 py-0.5 rounded-full uppercase text-[10px] font-bold border-none">
                    {localLead.status}
                  </Tag>
                </div>
                <div className="text-gray-400 text-sm flex items-center gap-4">
                  <span>Lead ID: <span className="text-gray-600 font-semibold">#{localLead.lead_code || localLead.id}</span></span>
                  <span>Created: <span className="text-gray-600 font-semibold">{new Date(localLead.created_at).toLocaleDateString()}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Tooltip title="Edit Lead">
                    <Button 
                      shape="circle"
                      icon={<EditOutlined style={{ color: '#0ea5e9' }} />} 
                      onClick={() => { onEdit(localLead); onClose(); }}
                      className="border-blue-100 hover:border-blue-300 hover:bg-blue-50"
                    />
                  </Tooltip>
                )}
                {onConvert && localLead.status !== 'Won' && (
                  <Tooltip title="Convert Lead">
                    <Button 
                      type="primary"
                      shape="circle"
                      icon={<TrophyOutlined />} 
                      onClick={() => { onConvert(localLead); onClose(); }}
                      className="bg-emerald-500 border-none hover:bg-emerald-600 flex items-center justify-center"
                    />
                  </Tooltip>
                )}
                {onDelete && (
                  <Popconfirm
                    title="Delete Lead"
                    description="Are you sure you want to delete this lead?"
                    onConfirm={() => { onDelete(localLead.id); onClose(); }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Tooltip title="Delete Lead">
                      <Button 
                        danger 
                        shape="circle"
                        icon={<DeleteOutlined />} 
                        className="flex items-center justify-center"
                      />
                    </Tooltip>
                  </Popconfirm>
                )}
                <Tooltip title="Close">
                  <Button 
                    type="text" 
                    icon={<X size={20} />} 
                    onClick={onClose}
                    className="hover:bg-gray-100 rounded-full flex items-center justify-center h-10 w-10 text-gray-400"
                  />
                </Tooltip>
              </div>
          </div>

          {/* Pipeline Stepper / Sales Guide */}
          <div className="bg-blue-50/50 rounded-xl p-5 mb-8 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} /> Pipeline Progress
            </h4>
            {localLead.status === "Lost" ? (
              <div className="text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                This lead was marked as Lost.
              </div>
            ) : (
              <Steps current={currentStageIndex} size="small" className="custom-stepper">
                {stages.map((stage) => (
                  <Step key={stage} title={<span className="text-[13px] font-semibold">{stage}</span>} />
                ))}
              </Steps>
            )}
          </div>

          {/* Main Tabs */}
          <div className="flex-1">
            <Tabs 
              defaultActiveKey="details" 
              className="lead-tabs"
              items={[
                {
                  key: 'details',
                  label: <span className="font-semibold text-[14px]">Details</span>,
                  children: (
                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                        <div>
                          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Email Address</div>
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            <MailOutlined className="text-blue-500" /> {localLead.email || "N/A"}
                          </div>
                        </div>
                        {localLead.email && (
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<CopyOutlined className="text-gray-400" />} 
                            onClick={() => handleCopy(localLead.email, 'Email')}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-colors">
                        <div>
                          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Phone Number</div>
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            <PhoneOutlined className="text-green-500" /> {localLead.phone || "N/A"}
                          </div>
                        </div>
                        {localLead.phone && (
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<CopyOutlined className="text-gray-400" />} 
                            onClick={() => handleCopy(localLead.phone, 'Phone')}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Lead Source</div>
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                          <LinkOutlined className="text-purple-500" /> {localLead.source || "N/A"}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Date Created</div>
                        <div className="font-medium text-gray-800">
                          {new Date(localLead.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'notes',
                  label: <span className="font-semibold text-[14px]">Notes & Activities</span>,
                  children: (
                    <div className="mt-4 px-2 h-[400px] overflow-y-auto">
                      {loadingConfig ? (
                        <div className="flex justify-center items-center h-full"><Spin /></div>
                      ) : timelineItems.length > 0 ? (
                        <Timeline 
                          className="mt-4"
                          items={timelineItems.map(item => ({
                            color: item.type === 'note' ? 'blue' : 'green',
                            children: (
                              <div className="mb-2">
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                  {item.type === 'note' ? <FileTextOutlined /> : <CheckCircleOutlined />}
                                  {item.date.toLocaleString()}
                                  {item.data.creator && (
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500 uppercase">
                                      {item.data.creator.name}
                                    </span>
                                  )}
                                  {item.data.User && !item.data.creator && (
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-500 uppercase">
                                      {item.data.User.name}
                                    </span>
                                  )}
                                </div>
                                {item.type === 'note' ? (
                                  <div className="text-gray-800 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 shadow-sm text-[13px] leading-relaxed mt-2">
                                    {item.data.note}
                                  </div>
                                ) : (
                                  <div className="bg-green-50/50 p-3 rounded-lg border border-green-100/50 shadow-sm text-[13px] mt-2">
                                    <p className="font-bold text-green-800 m-0">{item.data.title}</p>
                                    {item.data.description && <p className="text-green-700 mt-1 mb-0 leading-relaxed">{item.data.description}</p>}
                                    <p className="text-xs font-semibold text-green-600 mt-2 flex items-center gap-1">
                                      <CheckCircle2 size={12} /> Due: {new Date(item.data.due_date).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          }))}
                        />
                      ) : (
                        <div className="mt-12 text-center text-gray-400 flex flex-col items-center">
                          <FileTextOutlined style={{ fontSize: 32, color: '#d1d5db', marginBottom: 12 }} />
                          <p>No notes or activities recorded yet.</p>
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  key: 'services',
                  label: <span className="font-semibold text-[14px]">Course Interested</span>,
                  children: (
                    <div className="mt-4 px-2 h-[400px] overflow-y-auto">
                      {localLead.interestedServices && localLead.interestedServices.length > 0 ? (
                        <div className="">
                          {localLead.interestedServices.map(service => (
                            <Collapse.Panel 
                              header={
                                <div className="flex justify-between items-center w-full pr-4 p-5">
                                  <div className="flex items-center gap-2">
                                    <Briefcase size={16} className="text-blue-500" />
                                    <span className="font-bold text-gray-800">{service.name}</span>
                                  </div>
                                  <Tag color="blue" className="border-none rounded-full px-3">{service.category}</Tag>
                                </div>
                              } 
                              key={service.id}
                              className="mb-3 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
                            >
                            </Collapse.Panel>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-12 text-center text-gray-400 flex flex-col items-center">
                          <Briefcase size={40} className="text-gray-200 mb-3" />
                          <p>No Course Interested associated with this lead.</p>
                        </div>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR PREVIEW */}
        <div className="w-full md:w-[320px] bg-[#fafafa] p-6 border-l border-gray-100 flex flex-col">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Info size={16} /> Preview
          </h3>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="text-xs text-gray-400 uppercase font-bold mb-1">Assigned Owner</div>
            <div className="flex items-center gap-3">
              <Avatar size={36} style={{ backgroundColor: '#ff8a00' }} icon={<UserOutlined />} />
              <div>
                <div className="font-bold text-gray-900 text-[14px]">{localLead.assignedTo?.name || "Unassigned"}</div>
                {localLead.assignedTo && <div className="text-xs text-gray-500">{localLead.assignedTo.email}</div>}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">Internal Summary</div>
              {!isEditingSummary ? (
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined className="text-gray-400 hover:text-blue-500" />} 
                  onClick={() => setIsEditingSummary(true)}
                />
              ) : (
                <div className="flex gap-1">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CloseOutlined className="text-red-400" />} 
                    onClick={() => {
                      setIsEditingSummary(false);
                      setSummaryContent(localLead.internal_summary || "");
                    }} 
                  />
                  <Button 
                    type="text" 
                    size="small" 
                    loading={savingSummary}
                    icon={<SaveOutlined className="text-green-500" />} 
                    onClick={handleUpdateSummary} 
                  />
                </div>
              )}
            </div>
            
            {isEditingSummary ? (
              <Input.TextArea
                rows={4}
                value={summaryContent}
                onChange={(e) => setSummaryContent(e.target.value)}
                placeholder="Enter an internal summary for this lead..."
                className="text-[13px] rounded-xl border-blue-200 focus:border-blue-400 shadow-sm"
              />
            ) : (
              <div className="group relative">
                <p className="text-[13px] text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-200 shadow-sm italic min-h-[60px]">
                  {localLead.internal_summary ? `"${localLead.internal_summary}"` : "No internal summary provided."}
                </p>
                {localLead.summary_updated_at && (
                  <div className="mt-2 text-[10px] text-gray-400 flex flex-col gap-0.5 px-1">
                    <span className="font-medium">
                      Last edited {new Date(localLead.summary_updated_at).toLocaleString()}
                    </span>
                    {localLead.summaryUpdatedBy && (
                      <span className="uppercase tracking-tighter">
                        By {localLead.summaryUpdatedBy.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
              Lead Code: {localLead.lead_code}
            </div>
            <div className="text-[10px] text-center text-gray-300 mt-1">
              Refreshed: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
