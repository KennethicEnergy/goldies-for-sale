"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Puppy {
  id: number;
  name: string;
  images: string[];
  isSold: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState("gray");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [newPuppyName, setNewPuppyName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/puppies');
      const data = await response.json();
      setPuppies(data.puppies);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("folder", selectedFolder);

      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus("Upload successful! Refreshing data...");
        setTimeout(() => {
          fetchData();
          setUploadStatus("");
        }, 2000);
      } else {
        setUploadStatus("Upload failed. Please try again.");
      }
    } catch {
      setUploadStatus("Upload failed. Please try again.");
    }

    setUploading(false);
  };

  const togglePuppyStatus = async (puppyId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/puppies/${puppyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSold: !currentStatus })
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating puppy status:', error);
    }
  };

  const addNewPuppy = async () => {
    if (!newPuppyName.trim()) return;

    try {
      const response = await fetch('/api/puppies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPuppyName,
          images: [`/dogs/${newPuppyName.toLowerCase()}/image1.jpg`]
        })
      });

      if (response.ok) {
        setNewPuppyName("");
        fetchData();
      }
    } catch (error) {
      console.error('Error adding puppy:', error);
    }
  };

  const handleDeleteImage = async (imgPath: string, puppyId: number) => {
    await fetch('/api/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath: imgPath, puppyId })
    });
    fetchData();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center text-black">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mb-4"></div>
          <p className="text-black text-lg">Loading admin panel...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-50 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-black">Goldie Admin Panel</h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md text-black">
          <h2 className="text-2xl font-semibold mb-4">Upload Images</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Folder:</label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="dam">Dam (Queenie)</option>
                <option value="sire">Sire (King)</option>
                {puppies.map(puppy => (
                  <option key={puppy.id} value={puppy.name.toLowerCase()}>{puppy.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Images:</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {uploadStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              uploadStatus.includes("successful")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Add New Puppy */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md text-black">
          <h2 className="text-2xl font-semibold mb-4">Add New Puppy</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newPuppyName}
              onChange={(e) => setNewPuppyName(e.target.value)}
              placeholder="Puppy name"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addNewPuppy}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Puppy
            </button>
          </div>
        </div>

        {/* Puppies List */}
        <div className="bg-white rounded-lg p-6 shadow-md text-black">
          <h2 className="text-2xl font-semibold mb-4">Manage Puppies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {puppies.map((puppy) => (
              <div key={puppy.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {puppy.images.map((img) => (
                    <div key={img} className="relative">
                      <Image
                        src={img || '/placeholder.jpg'}
                        alt={puppy.name}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                      />
                      <button
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs"
                        onClick={() => handleDeleteImage(img, puppy.id)}
                        title="Delete image"
                      >🗑️</button>
                    </div>
                  ))}
                </div>
                <h3 className="font-semibold text-lg mb-2">{puppy.name}</h3>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    puppy.isSold
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {puppy.isSold ? "REHOMED" : "AVAILABLE"}
                  </span>
                  <button
                    onClick={() => togglePuppyStatus(puppy.id, puppy.isSold)}
                    className={`px-3 py-1 rounded text-sm ${
                      puppy.isSold
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    } transition-colors`}
                  >
                    {puppy.isSold ? "Mark Available" : "Mark Rehomed"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}