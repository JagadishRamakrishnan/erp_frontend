import React, { useState, useEffect } from "react";
import { Modal, Tabs, Steps, Avatar, Tag, Card, Row, Col, Divider, Timeline, Spin } from "antd";
import { noteService, taskService } from "../services";
import { UserOutlined, MailOutlined, PhoneOutlined, LinkOutlined, FileTextOutlined } from "@ant-design/icons";
import { Briefcase, Info, CheckCircle2, X } from "lucide-react";

const { Step } = Steps;
const { TabPane } = Tabs;

export default function LeadDetailsModal({ open, lead, onClose }) {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    if (open && lead) {
      const fetchData = async () => {
        setLoadingConfig(true);
        try {
          const notesRes = await noteService.getAll({ related_type: 'Lead', related_id: lead.id });
          const tasksRes = await taskService.getAll({ related_type: 'Lead', related_id: lead.id });
          
          if (notesRes.success) setNotes(notesRes.data || []);
          if (tasksRes.success) setTasks(tasksRes.data || []);
        } catch (error) {
          console.error("Failed to fetch notes/tasks", error);
        }
        setLoadingConfig(false);
      };
      fetchData();
    }
  }, [open, lead]);

  if (!lead) return null;

  const timelineItems = [
    ...notes.map(n => ({ type: 'note', date: new Date(n.created_at), data: n })),
    ...tasks.map(t => ({ type: 'task', date: new Date(t.created_at), data: t }))
  ].sort((a, b) => b.date - a.date);

  // Define the strict pipeline stages
  const stages = ["New", "Contacted", "Qualified", "Proposal", "Won"];
  
  // Calculate current stage index. If "Lost", we might show it differently, 
  // but for the stepper, we'll just find the index or set it to 0.
  let currentStageIndex = stages.indexOf(lead.status);
  if (lead.status === "Lost") currentStageIndex = -1; // Specific handling for Lost

  return (
    <Modal
      title={null}
      open={open}
      footer={null}
      onCancel={onClose}
      centered
      width={1000}
      bodyStyle={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}
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
              src={lead.email ? `https://logo.clearbit.com/${lead.email.split("@")[1]}` : null}
              style={{ background: "#1677ff", fontSize: '24px' }}
              icon={<UserOutlined />}
            >
              {!lead.email && lead.name?.charAt(0)}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 m-0">{lead.name}</h2>
                <Tag color={lead.status === 'Won' ? 'success' : lead.status === 'Lost' ? 'error' : 'processing'} className="rounded-full px-3">
                  {lead.status}
                </Tag>
              </div>
              <div className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                <Briefcase size={16} />
                {lead.company || "No Company"}
                <span className="text-gray-300 mx-1">|</span>
                <span className="text-gray-400 text-sm">Code: {lead.lead_code}</span>
              </div>
            </div>
          </div>

          {/* Pipeline Stepper / Sales Guide */}
          <div className="bg-blue-50/50 rounded-xl p-5 mb-8 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} /> Pipeline Progress
            </h4>
            {lead.status === "Lost" ? (
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
            <Tabs defaultActiveKey="details" className="lead-tabs">
              <TabPane tab={<span className="font-semibold text-[14px]">Details</span>} key="details">
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Email Address</div>
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      <MailOutlined className="text-blue-500" /> {lead.email || "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Phone Number</div>
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      <PhoneOutlined className="text-green-500" /> {lead.phone || "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Lead Source</div>
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      <LinkOutlined className="text-purple-500" /> {lead.source || "N/A"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Date Created</div>
                    <div className="font-medium text-gray-800">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </TabPane>
              
              <TabPane tab={<span className="font-semibold text-[14px]">Notes & Activities</span>} key="notes">
                <div className="mt-4 px-2 h-[400px] overflow-y-auto">
                  {loadingConfig ? (
                    <div className="flex justify-center items-center h-full"><Spin /></div>
                  ) : timelineItems.length > 0 ? (
                    <Timeline className="mt-4">
                      {timelineItems.map((item, index) => (
                        <Timeline.Item key={index} color={item.type === 'note' ? 'blue' : 'green'}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-xs text-gray-500 m-0">{item.date.toLocaleString()}</p>
                            {item.data.creator && (
                              <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                {item.data.creator.name}
                              </span>
                            )}
                          </div>
                          {item.type === 'note' ? (
                            <div className="text-gray-800 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 shadow-sm text-[13px] leading-relaxed">
                              {item.data.note}
                            </div>
                          ) : (
                            <div className="bg-green-50/50 p-3 rounded-lg border border-green-100/50 shadow-sm text-[13px]">
                              <p className="font-bold text-green-800 m-0">{item.data.title}</p>
                              {item.data.description && <p className="text-green-700 mt-1 mb-0 leading-relaxed">{item.data.description}</p>}
                              <p className="text-xs font-semibold text-green-600 mt-2 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Due: {new Date(item.data.due_date).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <div className="mt-12 text-center text-gray-400 flex flex-col items-center">
                      <FileTextOutlined style={{ fontSize: 32, color: '#d1d5db', marginBottom: 12 }} />
                      <p>No notes or activities recorded yet.</p>
                    </div>
                  )}
                </div>
              </TabPane>
            </Tabs>
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
                <div className="font-bold text-gray-900 text-[14px]">{lead.assignedTo?.name || "Unassigned"}</div>
                {lead.assignedTo && <div className="text-xs text-gray-500">{lead.assignedTo.email}</div>}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-xs text-gray-400 uppercase font-bold mb-3">Internal Summary</div>
            <p className="text-[13px] text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-200 shadow-sm italic">
              "Lead captured from {lead.source || 'system'}. Currently in {lead.status} stage. Needs follow-up."
            </p>
          </div>
          
          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="text-[11px] text-center text-gray-400">
              Last updated: {new Date(lead.updated_at).toLocaleString()}
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
