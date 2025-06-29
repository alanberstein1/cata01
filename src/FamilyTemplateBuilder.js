import React, { useState } from "react";

export default function FamilyTemplateBuilder({ libraryItems = [] }) {
  const [selectedItem, setSelectedItem] = useState("");

  return (
    <div className="p-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Select Library Item
      </label>

      <select
        value={selectedItem}
        onChange={(e) => setSelectedItem(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded"
      >
        <option value="">-- Choose an item --</option>
        {libraryItems.map((item) => (
          <option key={item.url} value={item.url}>
            {item.name}
          </option>
        ))}
      </select>

      {selectedItem && (
        <div className="mt-4">
          <img
            src={selectedItem}
            alt="Selected Preview"
            className="w-24 h-24 object-contain border"
          />
        </div>
      )}
    </div>
  );
}