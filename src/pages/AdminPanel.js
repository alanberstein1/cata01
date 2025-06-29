import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, updateDoc, doc, arrayUnion
} from "firebase/firestore";

export default function AdminPanel() {
  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [newItem, setNewItem] = useState({ name: "", url: "", styleId: "" });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [itemUrl, setItemUrl] = useState("");

  useEffect(() => {
    const fetchStyles = async () => {
      const colRef = collection(db, "templateStyles");
      const snapshot = await getDocs(colRef);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStyles(list);
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

  const addLibraryItem = async () => {
    if (!newItem.styleId || !newItem.name || !itemUrl) return;

    const styleRef = doc(db, "templateStyles", newItem.styleId);
    await updateDoc(styleRef, {
      libraryItems: arrayUnion({
        name: newItem.name,
        url: itemUrl
      })
    });
    setNewItem({ name: "", url: "", styleId: "" });
    setItemUrl("");
    setUploadFile(null);
    window.location.reload();
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

      <div className="mb-6">
        <h2 className="text-lg font-semibold">Add Library Item</h2>
        <select
          className="border p-2 w-full mb-2"
          value={newItem.styleId}
          onChange={(e) => setNewItem({ ...newItem, styleId: e.target.value })}
        >
          <option value="">-- Select Style --</option>
          {styles.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          className="border p-2 w-full mb-2"
          placeholder="e.g. 🔧 Wrench"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        {/* Image upload UI */}
        <div
          className="border-dashed border-2 border-gray-300 p-4 rounded mb-2 text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) {
              setUploadFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => document.getElementById("fileInput").click()}
        >
          {uploadFile ? uploadFile.name : "Click or drag an image file here"}
        </div>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setUploadFile(e.target.files[0])}
        />
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded mb-2"
          disabled={!uploadFile || uploading}
          onClick={async () => {
            if (!uploadFile) return;
            setUploading(true);
            const fileRef = ref(storage, `objects/${Date.now()}_${uploadFile.name}`);
            await uploadBytes(fileRef, uploadFile);
            const url = await getDownloadURL(fileRef);
            setItemUrl(url);
            setUploading(false);
          }}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
        {/* Optionally show uploaded image preview */}
        {itemUrl && (
          <div className="mb-2">
            <img src={itemUrl} alt="Uploaded" className="max-h-32 mx-auto" />
          </div>
        )}
        <button onClick={addLibraryItem} className="bg-green-600 text-white px-4 py-2 rounded">
          Add Item
        </button>
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