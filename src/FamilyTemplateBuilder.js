import React, { useState } from "react";

export default function FamilyTemplateBuilder() {
  const [familyMembers, setFamilyMembers] = useState([""]);
  const [selectedItems, setSelectedItems] = useState({});

  const handleNameChange = (index, value) => {
    const newMembers = [...familyMembers];
    newMembers[index] = value;
    setFamilyMembers(newMembers);
  };

  const addMember = () => {
    setFamilyMembers([...familyMembers, ""]);
  };

  const handleItemSelect = (name, item) => {
    setSelectedItems({ ...selectedItems, [name]: item });
  };

  const libraryItems = [
    { label: "🌸 Flower", value: "flower.png" },
    { label: "🚗 Car", value: "car.png" },
    { label: "⭐ Star", value: "star.png" }
  ];

  return (
    <div className="p-4 bg-yellow-50 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-3">Family Builder</h2>
      {familyMembers.map((name, index) => (
        <div key={index} className="mb-4">
          <input
            type="text"
            placeholder={`Family Member ${index + 1}`}
            value={name}
            onChange={(e) => handleNameChange(index, e.target.value)}
            className="p-2 border border-gray-300 rounded mr-2"
          />
          <select
            value={selectedItems[name] || ""}
            onChange={(e) => handleItemSelect(name, e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="">Select Library Item</option>
            {libraryItems.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button
        onClick={addMember}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Add Family Member
      </button>
    </div>
  );
}