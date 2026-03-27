import authService from "../services/authService";

export default function DealDetailsModal({ open, onClose, deal, onEdit }) {

  if (!open || !deal) return null;

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'Admin';
  // Check if current user is the owner or an admin
  const canEdit = isAdmin || deal.assignedTo?.id === currentUser?.id || deal.assigned_to === currentUser?.id;

  const getStageColor = (stage) => {
    switch (stage) {
      case "Closed Won": return "bg-green-100 text-green-700";
      case "Closed Lost": return "bg-red-100 text-red-700";
      case "Negotiation/Review": return "bg-amber-100 text-amber-700";
      case "Proposal/Price Quote": return "bg-blue-100 text-blue-700";
      case "Needs Analysis": return "bg-gray-100 text-gray-700";
      case "Qualification": return "bg-emerald-100 text-emerald-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-600 bg-red-50 border-red-100";
      case "Medium": return "text-amber-600 bg-amber-50 border-amber-100";
      case "Low": return "text-blue-600 bg-blue-50 border-blue-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]" onClick={onClose}>

      <div className="bg-white w-[600px] max-w-[95vw] p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{deal.deal_name}</h2>
            <p className="text-gray-500 text-sm mt-1">Opportunity Details</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStageColor(deal.stage)}`}>
            {deal.stage}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm mb-8">
          
          <div className="space-y-4">
             <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Customer</p>
                <p className="text-gray-900 font-semibold text-base">{deal.customer?.name || 'N/A'}</p>
             </div>
             <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Total Value</p>
                <p className="text-gray-900 font-bold text-xl">₹{parseFloat(deal.value || 0).toLocaleString('en-IN')}</p>
             </div>
             <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Priority</p>
                <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getPriorityColor(deal.priority)}`}>
                  {deal.priority || 'Medium'}
                </span>
             </div>
             <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Deal Type</p>
                <p className="text-gray-700 font-medium">{deal.deal_type || 'New Business'}</p>
             </div>
          </div>

          <div className="space-y-4">
             <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Source</p>
                <p className="text-gray-700 font-medium">{deal.source || 'Direct'}</p>
             </div>
             <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Weighted Value</p>
                <p className="text-blue-600 font-bold text-xl">
                  ₹{parseFloat(deal.weighted_value || (deal.value * (deal.probability || 0) / 100) || 0).toLocaleString('en-IN')}
                  <span className="text-gray-400 text-xs ml-1 font-normal">({deal.probability || 0}%)</span>
                </p>
             </div>
             <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Expected Close</p>
                <p className="text-gray-700 font-medium">
                  {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('en-IN') : 'TBD'}
                </p>
             </div>
             <div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Owner</p>
                <p className="text-gray-700 font-medium">{deal.assignedTo?.name || 'Unassigned'}</p>
             </div>
          </div>

        </div>

        {deal.description && (
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2">Internal Description</p>
             <p className="text-gray-700 leading-relaxed italic">"{deal.description}"</p>
          </div>
        )}

        <div className="flex justify-between items-center py-4 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
          <div className="flex gap-4">
            <span>Created: {new Date(deal.created_at).toLocaleDateString('en-IN')}</span>
            <span>Last Update: {new Date(deal.updated_at).toLocaleDateString('en-IN')}</span>
          </div>
          <div className="flex gap-3">
            {canEdit && (
              <button
                onClick={() => onEdit(deal)}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
              >
                Edit Deal
              </button>
            )}
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg shadow-gray-200"
            >
              Close
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}