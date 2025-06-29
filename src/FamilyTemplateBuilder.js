import React, { useState } from "react";

export default function FamilyTemplateBuilder({ libraryItems = [] }) {
  const [members, setMembers] = useState([{ name: "", libraryItem: "" }]);

  const handleChange = (e, index, field) => {
    const newMembers = [...members];
    newMembers[index][field] = e.target.value;
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members, { name: "", libraryItem: "" }]);
  };

  const saveTemplate = () => {
    console.log("Saving family template:", members);
    // Add your Firebase saving logic here
  };

  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <h2 className="text-lg font-bold mb-4">Family Template Builder</h2>

      {members.map((member, index) => (
        <div key={index} className="flex flex-col md:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={member.name}
            onChange={(e) => handleChange(e, index, "name")}
            className="p-2 border border-gray-300 rounded w-full"
          />

          <select
            value={member.libraryItem}
            onChange={(e) => handleChange(e, index, "libraryItem")}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="">-- Select Library Item --</option>
            {Array.isArray(libraryItems) && libraryItems.length > 0 ? (
              libraryItems.map((item) => (
                <option key={item.url} value={item.url}>
                  {item.name}
                </option>
              ))
            ) : (
              <option disabled>No library items available</option>
            )}
          </select>
        </div>
      ))}

      <div className="flex gap-2">
        <button
          onClick={addMember}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Member
        </button>
        <button
          onClick={saveTemplate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Template
        </button>
      </div>
    </div>
  );
}