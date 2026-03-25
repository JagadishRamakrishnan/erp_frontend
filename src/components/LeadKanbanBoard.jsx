import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardCopy, Mail, Phone } from "lucide-react";
import { Typography } from "antd";

export default function LeadKanbanBoard({ leads, onLeadDrop, onLeadClick, currentUser }) {
  const [draggedLead, setDraggedLead] = useState(null);

  // Lead Statuses
  const columns = [
    { title: "New", value: "New", color: "#f0ceeeff", textColor: "#634b63ff" },
    { title: "Contacted", value: "Contacted", color: "#e0f2fe", textColor: "#0369a1" },
    { title: "Qualified", value: "Qualified", color: "#dcfce7", textColor: "#166534" },
    { title: "Proposal", value: "Proposal", color: "#e0e7ff", textColor: "#4f46e5" },
    { title: "Won", value: "Won", color: "#d1fae5", textColor: "#059669" },
    { title: "Lost", value: "Lost", color: "#fee2e2", textColor: "#dc2626" },
  ];

  const handleDragStart = (e, lead) => {
    // Cannot drag if it's assigned to someone else
    if (lead.assigned_to && lead.assigned_to !== currentUser?.id) {
      e.preventDefault();
      return;
    }
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== status) {
      onLeadDrop(draggedLead, status);
    }
    setDraggedLead(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-1 pb-4 h-[calc(100vh-50px)] w-full overflow-hidden">
      {columns.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.value);

        return (
          <div
            key={col.value}
            className="flex flex-col bg-[#f8f9fa] border border-gray-200 shadow-sm rounded-xl overflow-hidden h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.value)}
          >
            {/* Column Header */}
            <div
              className="px-4 py-3 font-semibold flex items-center justify-between shadow-sm z-10"
              style={{ backgroundColor: col.color, color: col.textColor }}
            >
              <span className="text-[14px] uppercase tracking-wider font-bold">{col.title}</span>
              <span className="bg-white/50 text-black/70 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                {columnLeads.length}
              </span>
            </div>

            {/* Column Body */}
            <div className="flex-1 overflow-y-auto py-3 px-1 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
              {columnLeads.map((lead) => {
                const isAssignedToOther = lead.assigned_to && lead.assigned_to !== currentUser?.id;

                return (
                  <motion.div
                    key={lead.id}
                    layoutId={lead.id.toString()}
                    draggable={!isAssignedToOther}
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onClick={() => onLeadClick(lead)}
                    className={`bg-white p-2 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer ${isAssignedToOther ? 'opacity-70 grayscale-[20%]' : 'cursor-grab active:cursor-grabbing'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 text-[15px] truncate pr-2" title={lead.name}>
                        {lead.name}
                      </h4>
                      {isAssignedToOther && (
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1" title="Assigned to another user" />
                      )}
                    </div>

                    <div className="text-[12px] font-medium text-gray-600 mb-2 flex flex-col gap-1.5">
                      {lead.company && <div className="font-semibold text-gray-800 truncate">{lead.company}</div>}
                      {lead.email && (
                        <div className="flex items-center text-gray-500 w-full">
                          <Mail size={12} className="mr-1.5 flex-shrink-0 opacity-70" />
                          <div className="flex-1 min-w-0" title={lead.email}>
                            <Typography.Text
                              className="text-gray-500 text-xs"
                              style={{ width: '100%' }}
                              ellipsis={{ tooltip: lead.email }}
                              copyable={{
                                text: lead.email,
                                icon: [<ClipboardCopy size={13} className="text-gray-400 hover:text-blue-500 ml-1 flex-shrink-0" key="copy" />, <CheckCircle2 size={13} className="text-green-500 ml-1 flex-shrink-0" key="copied" />],
                                tooltips: ['Copy', 'Copied!']
                              }}
                            >
                              {lead.email}
                            </Typography.Text>
                          </div>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center text-gray-500 w-full">
                          <Phone size={12} className="mr-1.5 flex-shrink-0 opacity-70" />
                          <div className="flex-1 min-w-0" title={lead.phone}>
                            <Typography.Text
                              className="text-gray-500 text-xs"
                              style={{ width: '100%' }}
                              ellipsis={{ tooltip: lead.phone }}
                              copyable={{
                                text: lead.phone,
                                icon: [<ClipboardCopy size={13} className="text-gray-400 hover:text-blue-500 ml-1 flex-shrink-0" key="copy" />, <CheckCircle2 size={13} className="text-green-500 ml-1 flex-shrink-0" key="copied" />],
                                tooltips: ['Copy', 'Copied!']
                              }}
                            >
                              {lead.phone}
                            </Typography.Text>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
                      <div className="text-[10px] font-bold tracking-wide text-gray-400 uppercase truncate">
                        {lead.source || "No Source"}
                      </div>
                      <div className="text-[11px] font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-200 truncate w-max max-w-full">
                        {lead.assignedTo?.name || "Unassigned"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
