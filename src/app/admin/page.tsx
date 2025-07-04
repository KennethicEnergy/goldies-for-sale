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

interface VisitStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  uniqueToday: number;
  uniqueThisWeek: number;
  recentVisits: Array<{
    ip_address: string;
    page_visited: string;
    visited_at: string;
  }>;
}

export default function AdminPage() {
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState("gray");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [newPuppyName, setNewPuppyName] = useState("");

  useEffect(() => {
    fetchData();
    fetchVisitStats();
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

  const fetchVisitStats = async () => {
    try {
      const response = await fetch('/api/visit-stats');
      const stats = await response.json();
      setVisitStats(stats);
    } catch (error) {
      console.error('Error fetching visit stats:', error);
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

        {/* Visit Statistics */}
        {visitStats && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-md text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Visit Statistics</h2>
              <button
                onClick={fetchVisitStats}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh Stats
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{visitStats.total}</div>
                <div className="text-sm text-blue-700">Total Visits</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{visitStats.today}</div>
                <div className="text-sm text-green-700">Today&apos;s Visits</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{visitStats.thisWeek}</div>
                <div className="text-sm text-yellow-700">This Week</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{visitStats.thisMonth}</div>
                <div className="text-sm text-purple-700">This Month</div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="text-xl font-bold text-indigo-600">{visitStats.uniqueToday}</div>
                <div className="text-sm text-indigo-700">Unique Visitors Today</div>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <div className="text-xl font-bold text-pink-600">{visitStats.uniqueThisWeek}</div>
                <div className="text-sm text-pink-700">Unique Visitors This Week</div>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Recent Visits</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                {visitStats.recentVisits.length > 0 ? (
                  <div className="space-y-2">
                    {visitStats.recentVisits.map((visit, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{visit.ip_address}</span>
                          <span className="text-gray-500 ml-2">({visit.page_visited})</span>
                        </div>
                        <span className="text-gray-500">
                          {new Date(visit.visited_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent visits</p>
                )}
              </div>
            </div>
          </div>
        )}

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