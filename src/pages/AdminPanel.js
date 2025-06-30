import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";

export default function AdminPanel() {
  const [styles, setStyles] = useState([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemFile, setItemFile] = useState(null);

  // Fetch styles from Firestore and update styles state
  const fetchStyles = async () => {
    const snapshot = await getDocs(collection(db, "templateStyles"));
    setStyles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchStyles();
    // eslint-disable-next-line
  }, []);

  const handleAddStyle = async () => {
    if (!newStyleName) return;
    await addDoc(collection(db, "templateStyles"), { name: newStyleName, libraryItems: [] });
    setNewStyleName("");
    fetchStyles();
  };

  const handleDeleteStyle = async (styleId) => {
    await deleteDoc(doc(db, "templateStyles", styleId));
    fetchStyles();
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setItemFile(e.target.files[0]);
  };

  // Add item: upload file to Storage and add doc to Firestore
  const handleAddItem = async () => {
    if (!selectedStyle || !itemName || !itemFile) return alert("Missing fields");

    // Upload file to Firebase Storage
    const storageRef = ref(storage, `library-items/${selectedStyle}/${itemFile.name}`);
    await uploadBytes(storageRef, itemFile);
    const imageUrl = await getDownloadURL(storageRef);

    // Find the style doc by id
    const styleDoc = styles.find(style => style.id === selectedStyle);

    if (styleDoc) {
      const itemsCol = collection(doc(db, "templateStyles", styleDoc.id), "items");
      await addDoc(itemsCol, { name: itemName, imageUrl });
      alert("Item added!");
    } else {
      alert("Style not found in Firestore.");
    }

    setItemName("");
    setItemFile(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Current Template Styles Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Current Template Styles</h3>
        <div className="mb-6">
          {styles.map((style) => (
            <div
              key={style.id}
              className="flex justify-between items-center mb-2"
            >
              <span className="font-medium">{style.name}</span>
              <div className="flex gap-2">
                <button
                  className="text-sm px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                  // Placeholder edit handler
                  onClick={() => alert(`Edit style: ${style.name}`)}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteStyle(style.id)}
                  className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block mb-2 font-medium">Add Template Style</label>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="e.g. Cars, Tools"
              value={newStyleName}
              onChange={(e) => setNewStyleName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleAddStyle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm"
            >
              Add Style
            </button>
          </div>
        </div>
      </div>

      {/* Add Library Item Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <label className="block mb-2 font-medium">Add Library Item</label>
        <div className="flex flex-col gap-4">
          <select
            value={selectedStyle}
            onChange={e => setSelectedStyle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">-- Select Style --</option>
            {styles.map(style => (
              <option key={style.id} value={style.id}>{style.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. 🌸 Wrench"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full mb-2"
          />
          {itemFile && (
            <div className="mb-2">
              <span className="text-gray-700">{itemFile.name}</span>
            </div>
          )}
          <button
            onClick={handleAddItem}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}