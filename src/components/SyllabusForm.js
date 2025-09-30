import React, { useState, useEffect } from "react";
import axios from "axios";

export default function SyllabusForm() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [syllabus, setSyllabus] = useState([]);

  const API_URL = "http://localhost:8000/syllabus"; // Update if deployed

  useEffect(() => {
    // Fetch existing entries from backend
    axios.get(API_URL).then((res) => setSyllabus(res.data));
  }, []);

  const handleAdd = async () => {
    if (!className || !subject || !chapter) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await axios.post(API_URL + "/", {
        class_name: className,
        subject: subject,
        chapter: chapter,
      });
      setSyllabus([...syllabus, res.data]);
      setClassName("");
      setSubject("");
      setChapter("");
    } catch (err) {
      console.error(err);
      alert("Error adding syllabus entry.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Add to Syllabus</h2>

      <div className="mb-2">
        <label className="block mb-1 font-medium">Class:</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter class (e.g., Grade 7)"
        />
      </div>

      <div className="mb-2">
        <label className="block mb-1 font-medium">Subject:</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter subject (e.g., Math)"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Chapter:</label>
        <input
          type="text"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter chapter (e.g., Algebra)"
        />
      </div>

      <button
        onClick={handleAdd}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add
      </button>

      <h3 className="mt-6 text-lg font-semibold">Syllabus Entries</h3>
      {syllabus.length === 0 && <p className="text-gray-500">No entries yet.</p>}
      <ul className="mt-2 list-disc list-inside">
        {syllabus.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.class_name}</strong> - {entry.subject} - {entry.chapter}
          </li>
        ))}
      </ul>
    </div>
  );
}
