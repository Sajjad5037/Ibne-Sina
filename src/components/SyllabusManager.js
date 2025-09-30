import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SyllabusManager() {
  const [activeTab, setActiveTab] = useState("add");
  const [syllabus, setSyllabus] = useState([]);
  const [form, setForm] = useState({ className: "", subject: "", chapter: "" });
  const [editId, setEditId] = useState(null);

  const API_URL = "http://localhost:8000/syllabus"; // Update with your backend URL

  // Fetch all syllabus entries on load
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

  // Start editing an entry
  const handleEditInit = (entry) => {
    setEditId(entry.id);
    setForm({ className: entry.class_name, subject: entry.subject, chapter: entry.chapter });
    setActiveTab("edit");
  };

  // Save edited entry
  const handleSaveEdit = async () => {
    if (!form.className || !form.subject || !form.chapter) {
      return alert("Fill all fields");
    }
    try {
      const res = await axios.put(`${API_URL}/${editId}`, {
        class_name: form.className,
        subject: form.subject,
        chapter: form.chapter,
      });
      const updated = syllabus.map((entry) => (entry.id === editId ? res.data : entry));
      setSyllabus(updated);
      setForm({ className: "", subject: "", chapter: "" });
      setEditId(null);
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

      {/* Tab Content */}
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

      {activeTab === "edit" && (
        <div>
          {editId !== null ? (
            <div>
              <h3 className="font-semibold mb-2">Edit Syllabus Entry</h3>
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
            </div>
          ) : (
            <p>Select an entry from the list below to edit it.</p>
          )}
        </div>
      )}

      {activeTab === "delete" && (
        <div>
          <h3 className="font-semibold mb-2">Delete Syllabus Entry</h3>
          {syllabus.length === 0 ? (
            <p>No entries to delete.</p>
          ) : (
            <ul className="list-disc list-inside">
              {syllabus.map((entry) => (
                <li key={entry.id} className="flex justify-between items-center mb-1">
                  <span>
                    {entry.class_name} - {entry.subject} - {entry.chapter}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEditInit(entry)}
                      className="mr-2 px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
