import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

export default function AdminPanel() {
  // Template styles state
  const [styles, setStyles] = useState([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [editingStyleId, setEditingStyleId] = useState(null);
  const [editedStyleName, setEditedStyleName] = useState("");

  // Library items state
  const [libraryItems, setLibraryItems] = useState([]);
  const [itemFile, setItemFile] = useState(null);
  const [itemForm, setItemForm] = useState({
    imageURL: "",
    shortDescription: "",
    longDescription: "",
    templateStyleIds: [],
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch template styles from Firestore
  const fetchStyles = async () => {
    const snapshot = await getDocs(collection(db, "templateStyles"));
    setStyles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch library items from Firestore
  const fetchLibraryItems = async () => {
    const snapshot = await getDocs(collection(db, "libraryItems"));
    setLibraryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchStyles();
    fetchLibraryItems();
    // eslint-disable-next-line
  }, []);

  // Template Styles CRUD
  const handleAddStyle = async () => {
    if (!newStyleName) return;
    await addDoc(collection(db, "templateStyles"), { name: newStyleName });
    setNewStyleName("");
    fetchStyles();
  };

  const handleDeleteStyle = async (styleId) => {
    await deleteDoc(doc(db, "templateStyles", styleId));
    fetchStyles();
  };

  const handleSaveStyleEdit = async (styleId) => {
    try {
      const docRef = doc(db, "templateStyles", styleId);
      await updateDoc(docRef, { name: editedStyleName });
      setEditingStyleId(null);
      setEditedStyleName("");
      fetchStyles();
    } catch (error) {
      console.error("Failed to update style name:", error);
      alert("Could not save changes.");
    }
  };

  // Library Items CRUD
  const handleFileChange = (e) => {
    setItemFile(e.target.files[0]);
  };

  // Add or update library item
  const handleItemFormSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (
      (!editingItemId && !itemFile) ||
      !itemForm.shortDescription ||
      !itemForm.longDescription ||
      itemForm.templateStyleIds.length === 0
    ) {
      alert("Please fill all required fields and select at least one template style.");
      return;
    }
    setUploading(true);
    let imageURL = itemForm.imageURL;
    // Upload file if new file selected
    if (itemFile) {
      const storageRef = ref(
        storage,
        `library-items/${Date.now()}_${itemFile.name}`
      );
      await uploadBytes(storageRef, itemFile);
      imageURL = await getDownloadURL(storageRef);
    }
    const itemData = {
      imageURL,
      shortDescription: itemForm.shortDescription,
      longDescription: itemForm.longDescription,
      templateStyleIds: itemForm.templateStyleIds,
    };
    try {
      if (editingItemId) {
        // Update
        await updateDoc(doc(db, "libraryItems", editingItemId), itemData);
        setEditingItemId(null);
      } else {
        // Add new
        await addDoc(collection(db, "libraryItems"), itemData);
      }
      setItemForm({
        imageURL: "",
        shortDescription: "",
        longDescription: "",
        templateStyleIds: [],
      });
      setItemFile(null);
      fetchLibraryItems();
    } catch (error) {
      alert("Error saving library item.");
      console.error(error);
    }
    setUploading(false);
  };

  // Edit library item
  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setItemForm({
      imageURL: item.imageURL || "",
      shortDescription: item.shortDescription || "",
      longDescription: item.longDescription || "",
      templateStyleIds: item.templateStyleIds || [],
    });
    setItemFile(null);
  };

  // Delete library item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Delete this library item?")) return;
    await deleteDoc(doc(db, "libraryItems", itemId));
    fetchLibraryItems();
  };

  // Handle multi-select change for template styles
  const handleMultiSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setItemForm((f) => ({
      ...f,
      templateStyleIds: options,
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Current Template Styles Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Current Template Styles</h3>
        <div className="mb-6">
          {styles.map((style) => (
            <div key={style.id} className="flex items-center justify-between py-1 border-b">
              {editingStyleId === style.id ? (
                <>
                  <input
                    type="text"
                    value={editedStyleName}
                    onChange={(e) => setEditedStyleName(e.target.value)}
                    className="border p-1 mr-2 flex-1"
                  />
                  <button
                    onClick={() => handleSaveStyleEdit(style.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingStyleId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{style.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingStyleId(style.id);
                        setEditedStyleName(style.name);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStyle(style.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
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

      {/* Add/Edit Library Item Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <label className="block mb-2 font-medium">
          {editingItemId ? "Edit Library Item" : "Add Library Item"}
        </label>
        <form className="flex flex-col gap-4" onSubmit={handleItemFormSubmit}>
          <div>
            <label className="block mb-1 font-medium">Image</label>
            {itemForm.imageURL && !itemFile && (
              <img src={itemForm.imageURL} alt="Library Item" className="w-24 h-24 object-cover mb-2 rounded border" />
            )}
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
          </div>
          <input
            type="text"
            placeholder="Short Description"
            value={itemForm.shortDescription}
            onChange={e => setItemForm(f => ({ ...f, shortDescription: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
          <textarea
            placeholder="Long Description"
            value={itemForm.longDescription}
            onChange={e => setItemForm(f => ({ ...f, longDescription: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows={3}
            required
          />
          <div>
            <label className="block mb-1 font-medium">Associate Template Styles</label>
            <select
              multiple
              value={itemForm.templateStyleIds}
              onChange={handleMultiSelect}
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            >
              {styles.map(style => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm"
              disabled={uploading}
            >
              {uploading ? "Saving..." : editingItemId ? "Save Changes" : "Add Item"}
            </button>
            {editingItemId && (
              <button
                type="button"
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow-sm"
                onClick={() => {
                  setEditingItemId(null);
                  setItemForm({
                    imageURL: "",
                    shortDescription: "",
                    longDescription: "",
                    templateStyleIds: [],
                  });
                  setItemFile(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Library Items Table */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Library Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Image</th>
                <th className="border px-2 py-1">Short Description</th>
                <th className="border px-2 py-1">Long Description</th>
                <th className="border px-2 py-1">Template Styles</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {libraryItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    No items found.
                  </td>
                </tr>
              )}
              {libraryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">
                    <img
                      src={item.imageURL}
                      alt="Library"
                      className="w-14 h-14 object-cover rounded border"
                    />
                  </td>
                  <td className="border px-2 py-1">{item.shortDescription}</td>
                  <td className="border px-2 py-1 max-w-xs break-words">{item.longDescription}</td>
                  <td className="border px-2 py-1">
                    {(item.templateStyleIds || [])
                      .map(
                        (sid) =>
                          styles.find((s) => s.id === sid)?.name || sid
                      )
                      .join(", ")}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}