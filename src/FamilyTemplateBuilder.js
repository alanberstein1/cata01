import React, { useState } from "react";
import { db } from "./firebase";
import { addDoc, collection } from "firebase/firestore";

export default function FamilyTemplateBuilder() {
  const [familyMembers, setFamilyMembers] = useState([{ name: "", item: "" }]);

  const handleMemberChange = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handleAddMember = () => {
    setFamilyMembers([...familyMembers, { name: "", item: "" }]);
  };

  const handleSave = async () => {
    try {
      await addDoc(collection(db, "family_templates"), {
        createdAt: new Date().toISOString(),
        members: familyMembers,
      });
      alert("Family template saved!");
    } catch (error) {
      console.error("Error saving family template:", error);
      alert("Failed to save.");
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="text-lg font-bold mb-2">Family Template Builder</h2>
      {familyMembers.map((member, index) => (
        <div key={index} className="mb-2 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Name"
            value={member.name}
            onChange={(e) => handleMemberChange(index, "name", e.target.value)}
            className="p-2 border rounded w-1/2"
          />
          <input
            type="text"
            placeholder="Library Item (e.g. flower.png)"
            value={member.item}
            onChange={(e) => handleMemberChange(index, "item", e.target.value)}
            className="p-2 border rounded w-1/2"
          />
        </div>
      ))}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleAddMember}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600"
        >
          Add Member
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
        >
          Save Template
        </button>
      </div>
    </div>
  );
}