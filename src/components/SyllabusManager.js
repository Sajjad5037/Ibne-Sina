import React, { useState } from "react";
import axios from "axios";

export default function SyllabusManager() {
  const [activeTab, setActiveTab] = useState("Add");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [images, setImages] = useState([])

  const API_BASE = "https://usefulapis-production.up.railway.app";


  // Handle file input
  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleAddWithImages = async () => {
    if (!className || !subject || !chapter || images.length === 0) {
      return alert("Please fill all fields and select at least one image");
    }

    const formData = new FormData();
    formData.append("class_name", className);
    formData.append("subject", subject);
    formData.append("chapter", chapter);

    // Append each image
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]); // backend should accept multiple "images"
    }

    try {
      const res = await axios.post(`${API_BASE}/syllabus/add-with-images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Syllabus added successfully!");
      console.log("Backend response:", res.data);

      // Reset form
      setClassName("");
      setSubject("");
      setChapter("");
      setImages([]);
      document.getElementById("imagesInput").value = ""; // reset file input
    } catch (err) {
      console.error("Error uploading syllabus:", err);
      alert("Failed to add syllabus");
    }
  };

  const tabs = ["Add", "Edit", "Delete", "View All"];

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Syllabus Manager</h2>

      {/* Tabs */}
      <div className="flex border-b mb-4 space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px font-medium border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600"
            }`}
          >
            {tab} Syllabus
          </button>
        ))}
      </div>

      {/* Add Tab */}
      {activeTab === "Add" && (
        <div>
          <h3 className="font-semibold mb-2">Add Syllabus Entry</h3>
      
          <input
            type="text"
            placeholder="Class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-2"
          />
      
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-2"
          />
      
          <input
            type="text"
            placeholder="Chapter"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-2"
          />
      
          {/* Image Upload */}
          <label className="block mb-2 font-medium">Upload Images (mandatory)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            id="imagesInput"
            onChange={(e) => setImages(Array.from(e.target.files))} // convert FileList to array
            className="border px-3 py-2 rounded w-full mb-4"
          />
      
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              console.log({ className, subject, chapter, images }); // debug
              handleAddWithImages();
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* Delete Tab */}
      {activeTab === "Delete" && (
        <div>
          <h3 className="font-semibold mb-2">Delete Syllabus Entry</h3>
          <select className="border px-3 py-2 rounded w-full mb-2">
            <option value="" disabled>
              -- Select entry to delete --
            </option>
            {/* Options to be filled from backend */}
          </select>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Delete Selected Entry
          </button>
        </div>
      )}

      {/* View All Tab */}
      {activeTab === "View All" && (
        <div>
          <h3 className="font-semibold mb-2">All Syllabus Entries</h3>
          <ul className="list-disc list-inside border rounded p-2">
            <li>No entries available. Will be loaded from backend later.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
