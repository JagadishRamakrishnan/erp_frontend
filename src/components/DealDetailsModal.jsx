export default function DealDetailsModal({ open, onClose, deal }) {

  if (!open || !deal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

      <div className="bg-white w-[500px] max-w-[90vw] p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-4">Deal Details</h2>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Deal Name:</span>
            <span className="text-gray-900">{deal.deal_name}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Customer:</span>
            <span className="text-gray-900">{deal.customer?.name || 'N/A'}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Lead:</span>
            <span className="text-gray-900">{deal.lead?.name || 'N/A'}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Value:</span>
            <span className="text-gray-900 font-bold">₹{parseFloat(deal.value || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Stage:</span>
            <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase
              ${
                deal.stage === "Won" ? "bg-green-100 text-green-700" :
                deal.stage === "Lost" ? "bg-red-100 text-red-700" :
                deal.stage === "Negotiation" ? "bg-yellow-100 text-yellow-700" :
                deal.stage === "Proposal" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-700"
              }`}
            >
              {deal.stage}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Probability:</span>
            <span className="text-gray-900">{deal.probability}%</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Expected Close Date:</span>
            <span className="text-gray-900">
              {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('en-IN') : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Assigned To:</span>
            <span className="text-gray-900">{deal.assignedTo?.name || 'Unassigned'}</span>
          </div>

          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Created:</span>
            <span className="text-gray-900">
              {new Date(deal.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between py-2">
            <span className="font-semibold text-gray-600">Last Updated:</span>
            <span className="text-gray-900">
              {new Date(deal.updated_at).toLocaleDateString('en-IN')}
            </span>
          </div>

        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>

    </div>
  );
}