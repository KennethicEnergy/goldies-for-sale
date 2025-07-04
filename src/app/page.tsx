"use client";
import React, { useState } from "react";
import Image from "next/image";

// Function to generate image paths based on folder structure
const generateImagePaths = (folderName: string, count: number = 3) => {
  return Array.from({ length: count }, (_, i) => `/dogs/${folderName.toLowerCase()}/image${i + 1}.jpg`);
};

// Dynamic data structure based on folder naming
const data = {
  dam: {
    name: "Queenie",
    images: generateImagePaths("dam", 2)
  },
  sire: {
    name: "King",
    images: generateImagePaths("sire", 1)
  },
  puppies: [
    { name: "Gray", images: generateImagePaths("gray", 2), isSold: false },
    { name: "Red", images: generateImagePaths("red", 1), isSold: false },
    { name: "Blue", images: generateImagePaths("blue", 1), isSold: false },
    { name: "Sky", images: generateImagePaths("sky", 1), isSold: false },
    { name: "Fuchsia", images: generateImagePaths("fuchsia", 1), isSold: false },
    { name: "Yellow", images: generateImagePaths("yellow", 1), isSold: false },
    { name: "Green", images: generateImagePaths("green", 1), isSold: true },
    { name: "Pink", images: generateImagePaths("pink", 1), isSold: true },
    { name: "Violet", images: generateImagePaths("violet", 1), isSold: false },
  ],
};

function GalleryModal({ images, name, onClose }: { images: string[]; name: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 relative shadow-2xl border border-gray-200">
        <button onClick={onClose} className="absolute top-4 left-4 text-yellow-700 font-semibold px-4 py-2 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-all duration-200 shadow-sm border border-yellow-200">&larr; Back</button>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200">&times;</button>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 mt-8">{name}&apos;s Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-full aspect-square group">
              <Image src={img} alt={name + " photo " + (idx + 1)} fill className="object-cover rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [modal, setModal] = useState<null | { name: string; images: string[] }>(null);

  return (
    <main className="min-h-screen bg-yellow-50 flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-2 text-yellow-900 text-center">Golden Retriever Puppies for Sale</h1>
      <p className="mb-8 text-lg text-yellow-800">Click a puppy to see more photos!</p>
      <div className="mb-6 flex gap-8">
        <div className="text-center">
          <div className="w-24 h-24 relative mx-auto mb-2 cursor-pointer" onClick={() => setModal({ name: data.dam.name, images: data.dam.images })}>
            <Image src={data.dam.images[0]} alt="Dam" fill className="object-cover rounded-full border-4 border-yellow-400" />
          </div>
          <span className="block text-yellow-700 font-semibold">Dam: {data.dam.name}</span>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 relative mx-auto mb-2 cursor-pointer" onClick={() => setModal({ name: data.sire.name, images: data.sire.images })}>
            <Image src={data.sire.images[0]} alt="Sire" fill className="object-cover rounded-full border-4 border-yellow-400" />
          </div>
          <span className="block text-yellow-700 font-semibold">Sire: {data.sire.name}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {data.puppies.map((puppy, idx) => (
          <div key={idx} className="relative group cursor-pointer" onClick={() => setModal({ name: puppy.name, images: puppy.images })}>
            <div className="aspect-square relative w-full h-48 md:h-56 rounded-xl overflow-hidden border-4 border-yellow-300 group-hover:scale-105 transition-transform">
              <Image src={puppy.images[0]} alt={puppy.name} fill className="object-cover" />
              {puppy.isSold && (
                <span className="absolute top-2 left-2 bg-white text-red-600 px-2 py-1 rounded text-xs font-bold border border-red-600 transform">REHOMED</span>
              )}
            </div>
            <div className="mt-2 text-center text-yellow-900 font-semibold text-lg">{puppy.name}</div>
          </div>
        ))}
      </div>
      {modal && <GalleryModal images={modal.images} name={modal.name} onClose={() => setModal(null)} />}
    </main>
  );
}
