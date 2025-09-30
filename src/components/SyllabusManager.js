import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SyllabusManager() {
  const [activeTab, setActiveTab] = useState("add");
  const [syllabus, setSyllabus] = useState([]);
  const [form, setForm] = useState({ className: "", subject: "", chapter: "" });
  const [selectedId, setSelectedId] = useState(null);

  const API_URL = "http://localhost:8000/syllabus"; // Update with your backend URL

  // Fetch all syllabus entries on component load
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await axios.get(API_URL);
        setSyllabus(res.data);
      } catch (err) {
        console.error("Error fetching syllabus:", err);
      }
    };
    fetchSyllabus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add new syllabus entry
  const handleAdd = async () => {
    if (!form.className || !form.subject || !form.chapter) {
      return alert("Fill all fields");
    }
    try {
      const res = await axios.post(API_URL + "/", {
        class_name: form.className,
        subject: form.subject,
        chapter: form.chapter,
      });
      setSyllabus([...syllabus, res.data]);
      setForm({ className: "", subject: "", chapter: "" });
    } catch (err) {
      console.error("Error adding syllabus:", err);
      alert("Failed to add syllabus.");
    }
  };

  // When user selects an entry from dropdown in Edit tab
  const handleSelectEntry = (id) => {
    setSelectedId(id);
    const entry = syllabus.find((e) => e.id === parseInt(id));
    if (entry) {
      setForm({
        className: entry.class_name,
        subject: entry.subject,
        chapter: entry.chapter,
      });
    }
  };

  // Save edited entry
  const handleSaveEdit = async () => {
    if (!selectedId || !form.className || !form.subject || !form.chapter) {
      return alert("Select an entry and fill all fields");
    }
    try {
      const res = await axios.put(`${API_URL}/${selectedId}`, {
        class_name: form.className,
        subject: form.subject,
        chapter: form.chapter,
      });
      const updated = syllabus.map((entry) => (entry.id === selectedId ? res.data : entry));
      setSyllabus(updated);
      setForm({ className: "", subject: "", chapter: "" });
      setSelectedId(null);
      setActiveTab("add");
    } catch (err) {
      console.error("Error editing syllabus:", err);
      alert("Failed to save changes.");
    }
  };

  // Delete an entry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setSyllabus(syllabus.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("Error deleting syllabus:", err);
      alert("Failed to delete entry.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Syllabus Manager</h2>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {["add", "edit", "delete"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px font-medium border-b-2 ${
              activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1) + " Syllabus"}
          </button>
        ))}
      </div>

      {/* Add Tab */}
      {activeTab === "add" && (
        <div>
          <h3 className="font-semibold mb-2">Add Syllabus Entry</h3>
          <input
            type="text"
            name="className"
            value={form.className}
            onChange={handleChange}
            placeholder="Class"
            className="border px-3 py-2 rounded w-full mb-2"
          />
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="border px-3 py-2 rounded w-full mb-2"
          />
          <input
            type="text"
            name="chapter"
            value={form.chapter}
            onChange={handleChange}
            placeholder="Chapter"
            className="border px-3 py-2 rounded w-full mb-2"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      {/* Edit Tab */}
      {activeTab === "edit" && (
        <div>
          <h3 className="font-semibold mb-2">Edit Syllabus Entry</h3>
          <select
            className="border px-3 py-2 rounded w-full mb-2"
            value={selectedId || ""}
            onChange={(e) => handleSelectEntry(e.target.value)}
          >
            <option value="" disabled>
              -- Select entry to edit --
            </option>
            {syllabus.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.class_name} - {entry.subject} - {entry.chapter}
              </option>
            ))}
          </select>

          {selectedId && (
            <>
              <input
                type="text"
                name="className"
                value={form.className}
                onChange={handleChange}
                placeholder="Class"
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <input
                type="text"
                name="chapter"
                value={form.chapter}
                onChange={handleChange}
                placeholder="Chapter"
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Tab */}
      {activeTab === "delete" && (
        <div>
          <h3 className="font-semibold mb-2">Delete Syllabus Entry</h3>
      
          {syllabus.length === 0 ? (
            <p>No entries available to delete.</p>
          ) : (
            <>
              {/* Dropdown to select entry */}
              <select
                className="border px-3 py-2 rounded w-full mb-2"
                value={selectedId || ""}
                onChange={(e) => setSelectedId(parseInt(e.target.value))}
              >
                <option value="" disabled>
                  -- Select entry to delete --
                </option>
                {syllabus.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    ID {entry.id}: {entry.class_name} - {entry.subject} - {entry.chapter}
                  </option>
                ))}
              </select>
      
              {/* Delete button */}
              {selectedId && (
                <button
                  onClick={() => handleDelete(selectedId)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Selected Entry
                </button>
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}
