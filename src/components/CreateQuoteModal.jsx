import { useState } from "react";

export default function CreateQuoteModal({ closeModal }) {

  const [form, setForm] = useState({
    customer: "",
    contact: "",
    amount: "",
    validUntil: "",
    status: "Draft",
    items: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log("Quote Created:", form);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

<div className="bg-white w-[95%] max-w-[1000px] rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6">
          Create New Quote
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            name="customer"
            placeholder="Customer Name"
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            name="contact"
            placeholder="Contact Person"
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            name="amount"
            placeholder="Amount (₹)"
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            name="items"
            placeholder="Items Count"
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <input
            type="date"
            name="validUntil"
            onChange={handleChange}
            className="border p-3 rounded-lg"
          />

          <select
            name="status"
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option>Draft</option>
            <option>Sent</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>

        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

          <button
            onClick={closeModal}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Save Quote
          </button>

        </div>

      </div>

    </div>
  );
}