import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AdminPanel() {
  // Template styles state
  const [styles, setStyles] = useState([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [editingStyleId, setEditingStyleId] = useState(null);
  const [editedStyleName, setEditedStyleName] = useState("");

  // Library items state
  const [file, setFile] = useState(null);
  const [shortDescEN, setShortDescEN] = useState("");
  const [shortDescES, setShortDescES] = useState("");
  const [longDescEN, setLongDescEN] = useState("");
  const [longDescES, setLongDescES] = useState("");
  const [selectedStyleIds, setSelectedStyleIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [libraryItems, setLibraryItems] = useState([]);

  // Inline edit states for library items
  const [editingItemId, setEditingItemId] = useState(null);

  // Fetch template styles from Supabase
  const fetchStyles = async () => {
    const { data, error } = await supabase
      .from('template_styles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching styles:', error);
      return;
    }
    setStyles(data || []);
  };

  // Fetch library items from Supabase
  const fetchLibraryItems = async () => {
    const { data, error } = await supabase
      .from('library_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching library items:', error);
      return;
    }
    setLibraryItems(data || []);
  };

  useEffect(() => {
    fetchStyles();
    fetchLibraryItems();
  }, []);

  // Template Styles CRUD
  const handleAddStyle = async () => {
    if (!newStyleName) return;

    const { error } = await supabase
      .from('template_styles')
      .insert({ name: newStyleName });

    if (error) {
      console.error('Error adding style:', error);
      alert('Failed to add style');
      return;
    }

    setNewStyleName("");
    fetchStyles();
  };

  const handleDeleteStyle = async (styleId) => {
    const { error } = await supabase
      .from('template_styles')
      .delete()
      .eq('id', styleId);

    if (error) {
      console.error('Error deleting style:', error);
      alert('Failed to delete style');
      return;
    }
    fetchStyles();
  };

  const handleSaveStyleEdit = async (styleId) => {
    const { error } = await supabase
      .from('template_styles')
      .update({ name: editedStyleName })
      .eq('id', styleId);

    if (error) {
      console.error("Failed to update style name:", error);
      alert("Could not save changes.");
      return;
    }

    setEditingStyleId(null);
    setEditedStyleName("");
    fetchStyles();
  };

  // Library Items CRUD
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `library-items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('library-items')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('library-items')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Save function for library item
  const handleSaveLibraryItem = async () => {
    if (
      !file ||
      !shortDescEN ||
      !shortDescES ||
      !longDescEN ||
      !longDescES ||
      selectedStyleIds.length === 0
    ) {
      alert("Please fill all fields and select styles.");
      return;
    }

    setSaving(true);

    try {
      const imageUrl = await uploadFile(file);

      const { error } = await supabase
        .from('library_items')
        .insert({
          image_url: imageUrl,
          short_description_en: shortDescEN,
          short_description_es: shortDescES,
          long_description_en: longDescEN,
          long_description_es: longDescES,
          associated_styles: selectedStyleIds,
        });

      if (error) throw error;

      alert("Library Item saved!");

      // Reset form
      setFile(null);
      setShortDescEN("");
      setShortDescES("");
      setLongDescEN("");
      setLongDescES("");
      setSelectedStyleIds([]);
      fetchLibraryItems();
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving item: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handler for multi-select in add form
  const handleMultiSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedStyleIds(options);
  };

  // When "Edit" is clicked for a library item
  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setShortDescEN(item.short_description_en || "");
    setShortDescES(item.short_description_es || "");
    setLongDescEN(item.long_description_en || "");
    setLongDescES(item.long_description_es || "");
    setSelectedStyleIds(item.associated_styles || []);
    setFile(null);
  };

  // Update library item (with optional image upload)
  const handleUpdateItem = async () => {
    if (!editingItemId) {
      alert("No item selected for update.");
      return;
    }

    setSaving(true);

    try {
      const updatedData = {
        short_description_en: shortDescEN,
        short_description_es: shortDescES,
        long_description_en: longDescEN,
        long_description_es: longDescES,
        associated_styles: selectedStyleIds,
      };

      if (file) {
        const imageUrl = await uploadFile(file);
        updatedData.image_url = imageUrl;
      }

      const { error } = await supabase
        .from('library_items')
        .update(updatedData)
        .eq('id', editingItemId);

      if (error) throw error;

      alert("Item updated successfully!");
      setEditingItemId(null);
      setFile(null);
      setShortDescEN("");
      setShortDescES("");
      setLongDescEN("");
      setLongDescES("");
      setSelectedStyleIds([]);
      fetchLibraryItems();
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update item: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete library item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Delete this library item?")) return;

    const { error } = await supabase
      .from('library_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
      return;
    }
    fetchLibraryItems();
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

      {/* Add Library Item Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <label className="block mb-2 font-medium">
          Add Library Item
        </label>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full mb-2"
              disabled={editingItemId !== null}
            />
            {file && (
              <div className="mb-2">
                <span className="text-gray-700">{file.name}</span>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Short Description</label>
            <input
              className="w-full border p-2 mb-2"
              placeholder="English"
              value={shortDescEN}
              onChange={e => setShortDescEN(e.target.value)}
              disabled={editingItemId !== null}
            />
            <input
              className="w-full border p-2"
              placeholder="Español"
              value={shortDescES}
              onChange={e => setShortDescES(e.target.value)}
              disabled={editingItemId !== null}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Long Description</label>
            <textarea
              className="w-full border p-2 mb-2"
              placeholder="English"
              value={longDescEN}
              onChange={e => setLongDescEN(e.target.value)}
              disabled={editingItemId !== null}
            />
            <textarea
              className="w-full border p-2"
              placeholder="Español"
              value={longDescES}
              onChange={e => setLongDescES(e.target.value)}
              disabled={editingItemId !== null}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Associate Template Styles</label>
            <select
              multiple
              value={selectedStyleIds}
              onChange={handleMultiSelect}
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
              disabled={editingItemId !== null}
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
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm"
              disabled={saving || editingItemId !== null}
              onClick={handleSaveLibraryItem}
            >
              {saving ? "Saving..." : "Add Item"}
            </button>
          </div>
        </div>
      </div>

      {/* Library Items Card-based List */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Library Items</h3>
        <div className="flex flex-col gap-5">
          {libraryItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow transition-shadow hover:shadow-lg border border-gray-100"
              style={{ position: "relative" }}
            >
              {/* Left: Image */}
              <div className="flex-shrink-0 flex items-center justify-center w-[100px] min-w-[100px]">
                {editingItemId === item.id ? (
                  <div className="flex flex-col items-center w-full">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt="Current"
                        className="rounded border border-gray-200 object-cover"
                        style={{ width: 60, height: 60 }}
                      />
                    )}
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="mt-2 text-xs"
                    />
                  </div>
                ) : (
                  <img
                    src={item.image_url}
                    alt="Library"
                    className="rounded border border-gray-200 object-cover"
                    style={{ width: 60, height: 60 }}
                  />
                )}
              </div>
              {/* Right: Content */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex flex-col gap-2">
                  {/* Short Description */}
                  <div>
                    <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">EN</span>
                    {editingItemId === item.id ? (
                      <input
                        placeholder="Short Description (EN)"
                        value={shortDescEN}
                        onChange={e => setShortDescEN(e.target.value)}
                        className="w-full border p-1 rounded mb-1 text-sm"
                      />
                    ) : (
                      <div className="text-gray-900 text-sm">{item.short_description_en || ""}</div>
                    )}
                    <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-2 mb-0.5">ES</span>
                    {editingItemId === item.id ? (
                      <input
                        placeholder="Short Description (ES)"
                        value={shortDescES}
                        onChange={e => setShortDescES(e.target.value)}
                        className="w-full border p-1 rounded text-sm"
                      />
                    ) : (
                      <div className="text-gray-900 text-sm">{item.short_description_es || ""}</div>
                    )}
                  </div>
                  {/* Long Description */}
                  <div className="mt-2">
                    <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">EN</span>
                    {editingItemId === item.id ? (
                      <textarea
                        placeholder="Long Description (EN)"
                        value={longDescEN}
                        onChange={e => setLongDescEN(e.target.value)}
                        className="w-full border p-1 rounded mb-1 text-sm"
                        rows={2}
                      />
                    ) : (
                      <div className="text-gray-700 text-sm whitespace-pre-line">{item.long_description_en || ""}</div>
                    )}
                    <span className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-2 mb-0.5">ES</span>
                    {editingItemId === item.id ? (
                      <textarea
                        placeholder="Long Description (ES)"
                        value={longDescES}
                        onChange={e => setLongDescES(e.target.value)}
                        className="w-full border p-1 rounded text-sm"
                        rows={2}
                      />
                    ) : (
                      <div className="text-gray-700 text-sm whitespace-pre-line">{item.long_description_es || ""}</div>
                    )}
                  </div>
                </div>
                {/* Template Styles */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-gray-500 italic mb-2 sm:mb-0">
                    Template Styles:&nbsp;
                    {editingItemId === item.id ? (
                      <select
                        multiple
                        value={selectedStyleIds}
                        onChange={handleMultiSelect}
                        className="border p-1 rounded text-xs"
                        style={{ minWidth: 120, maxWidth: 200, maxHeight: 60 }}
                        size={Math.min(3, styles.length)}
                      >
                        {styles.map(style => (
                          <option key={style.id} value={style.id}>
                            {style.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      (item.associated_styles || [])
                        .map(id => styles.find(s => s.id === id)?.name || id)
                        .join(", ")
                    )}
                  </div>
                  {/* Edit/Delete Buttons */}
                  <div className="flex gap-2 mt-2 sm:mt-0 sm:justify-end">
                    {editingItemId === item.id ? (
                      <>
                        <button
                          onClick={handleUpdateItem}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Responsive and card styles */}
        <style>{`
          @media (max-width: 640px) {
            .library-card-flex {
              flex-direction: column !important;
            }
            .library-card-img {
              margin-bottom: 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
