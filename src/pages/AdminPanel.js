import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, updateDoc, doc, arrayUnion
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminPanel() {
  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [templateStyles, setTemplateStyles] = useState([]);
  const [selectedStyleId, setSelectedStyleId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  // const [newItemUrl, setNewItemUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchStyles = async () => {
      const colRef = collection(db, "templateStyles");
      const snapshot = await getDocs(colRef);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStyles(list);
      setTemplateStyles(list);
    };
    fetchStyles();
  }, []);

  const addStyle = async () => {
    if (!newStyle) return;
    await addDoc(collection(db, "templateStyles"), {
      name: newStyle,
      libraryItems: []
    });
    setNewStyle("");
    window.location.reload();
  };

  // Firebase Storage image upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `objects/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    setImageUrl(downloadURL);
  };

  // New handleAddLibraryItem function
  const handleAddLibraryItem = async () => {
    if (!selectedStyleId || !newItemName || !imageUrl) {
      alert("Please fill in all fields and upload a file.");
      return;
    }

    try {
      const styleDocRef = doc(db, "templateStyles", selectedStyleId);
      const docSnap = await getDocs(collection(db, "templateStyles"));
      const styleDoc = docSnap.docs.find(doc => doc.id === selectedStyleId);
      if (!styleDoc) {
        alert("Selected style not found.");
        return;
      }
      const styleData = styleDoc.data();
      const updatedLibraryItems = [
        ...(styleData.libraryItems || []),
        { name: newItemName, url: imageUrl }
      ];

      await updateDoc(styleDocRef, { libraryItems: updatedLibraryItems });

      setNewItemName("");
      setImageUrl("");
      setSelectedStyleId("");
      window.location.reload();
      alert("Library item added successfully!");
    } catch (error) {
      console.error("Error adding library item:", error);
      alert("There was an error adding the item.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold">Add Template Style</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="e.g. Cars, Tools"
          value={newStyle}
          onChange={(e) => setNewStyle(e.target.value)}
        />
        <button onClick={addStyle} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Style
        </button>
      </div>

      {/* Updated Add Library Item section with Firebase Storage image upload */}
      <div className="mb-6">
        <div>
          <label className="block mb-2 font-medium">Add Library Item</label>
          <select
            className="p-2 border rounded w-full mb-2"
            value={selectedStyleId}
            onChange={(e) => setSelectedStyleId(e.target.value)}
          >
            {templateStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. 🌸 Wrench"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="mb-2"
          />
          {/* Optionally show a preview */}
          {imageUrl && (
            <div className="mb-2">
              <img src={imageUrl} alt="Preview" className="h-16" />
            </div>
          )}
          {/* Manual URL input removed */}
          <button
            onClick={handleAddLibraryItem}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Item
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Current Styles</h2>
        <ul className="list-disc pl-5">
          {styles.map(style => (
            <li key={style.id}>
              {style.name} ({style.libraryItems?.length || 0} items)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}