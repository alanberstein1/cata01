import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export default function AdminPanel() {
  const [templateStyles, setTemplateStyles] = useState([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [newItems, setNewItems] = useState([{ name: "", url: "" }]);

  useEffect(() => {
    const fetchStyles = async () => {
      const snapshot = await getDocs(collection(db, "templateStyles"));
      const styles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplateStyles(styles);
    };
    fetchStyles();
  }, []);

  const handleAddItem = () => {
    setNewItems([...newItems, { name: "", url: "" }]);
  };

  const handleItemChange = (index, field, value) => {
    const items = [...newItems];
    items[index][field] = value;
    setNewItems(items);
  };

  const handleCreateStyle = async () => {
    if (!newStyleName) return;
    await addDoc(collection(db, "templateStyles"), {
      name: newStyleName,
      libraryItems: newItems.filter(item => item.name && item.url),
    });
    setNewStyleName("");
    setNewItems([{ name: "", url: "" }]);
    const updated = await getDocs(collection(db, "templateStyles"));
    setTemplateStyles(updated.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteStyle = async (id) => {
    await deleteDoc(doc(db, "templateStyles", id));
    setTemplateStyles(templateStyles.filter(style => style.id !== id));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Admin: Manage Template Styles</h2>

      <div className="mb-6">
        <input
          type="text"
          value={newStyleName}
          onChange={(e) => setNewStyleName(e.target.value)}
          placeholder="Template Style Name"
          className="p-2 border rounded w-full mb-4"
        />

        {newItems.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Icon Name"
              value={item.name}
              onChange={(e) => handleItemChange(idx, "name", e.target.value)}
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={item.url}
              onChange={(e) => handleItemChange(idx, "url", e.target.value)}
              className="p-2 border rounded w-full"
            />
          </div>
        ))}
        <button
          onClick={handleAddItem}
          className="bg-gray-300 px-4 py-2 rounded mr-2"
        >
          Add Library Item
        </button>
        <button
          onClick={handleCreateStyle}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Create Template Style
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-4">Existing Styles</h3>
      <ul>
        {templateStyles.map((style) => (
          <li key={style.id} className="flex justify-between items-center border-b py-2">
            <span>{style.name}</span>
            <button
              onClick={() => handleDeleteStyle(style.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}