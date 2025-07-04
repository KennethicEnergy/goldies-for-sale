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

interface Dog {
	id: number;
	name: string;
	type: "dam" | "sire";
	images: string[];
	createdAt: string;
}

interface Data {
	puppies: Puppy[];
	dam: Dog;
	sire: Dog;
}

function GalleryModal({
	images,
	name,
	onClose,
	onImageClick,
}: {
	images: string[];
	name: string;
	onClose: () => void;
	onImageClick: (image: string) => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
			<div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 relative shadow-2xl border border-gray-200">
				<button
					onClick={onClose}
					className="absolute top-4 left-4 text-yellow-700 font-semibold px-4 py-2 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-all duration-200 shadow-sm border border-yellow-200">
					&larr; Back
				</button>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200">
					&times;
				</button>
				<h2 className="text-3xl font-bold mb-6 text-center text-gray-800 mt-8">
					{name}&apos;s Gallery
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{images.map((img, idx) => (
						<div
							key={idx}
							className="relative w-full aspect-square group cursor-pointer"
							onClick={() => onImageClick(img)}>
							<Image
								src={img}
								alt={name + " photo " + (idx + 1)}
								fill
								className="object-cover rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg"></div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function FullSizeImageModal({
	images,
	currentImageIndex,
	name,
	onClose,
	onNavigate,
}: {
	images: string[];
	currentImageIndex: number;
	name: string;
	onClose: () => void;
	onNavigate: (direction: "prev" | "next") => void;
}) {
	const currentImage = images[currentImageIndex];

	return (
		<div
			className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm"
			onClick={onClose}>
			<div className="relative w-[80%] h-[80%] flex items-center justify-center">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white hover:text-gray-300 hover:bg-black/20 rounded-full transition-all duration-200 z-10 text-2xl">
					&times;
				</button>

				{/* Previous button */}
				{currentImageIndex > 0 && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onNavigate("prev");
						}}
						className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white hover:text-gray-300 hover:bg-black/20 rounded-full transition-all duration-200 z-10 text-2xl">
						‹
					</button>
				)}

				{/* Next button */}
				{currentImageIndex < images.length - 1 && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onNavigate("next");
						}}
						className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white hover:text-gray-300 hover:bg-black/20 rounded-full transition-all duration-200 z-10 text-2xl">
						›
					</button>
				)}

				{/* Image */}
				<Image
					src={currentImage}
					alt={`${name} photo ${currentImageIndex + 1}`}
					width={1200}
					height={800}
					className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
					onClick={(e) => e.stopPropagation()}
				/>

				{/* Image counter */}
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
					{currentImageIndex + 1} / {images.length}
				</div>
			</div>
		</div>
	);
}

export default function Home() {
	const [modal, setModal] = useState<null | { name: string; images: string[] }>(
		null
	);
	const [fullSizeImage, setFullSizeImage] = useState<null | {
		images: string[];
		currentIndex: number;
		name: string;
	}>(null);
	const [data, setData] = useState<Data | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/puppies")
			.then((res) => res.json())
			.then((data) => {
				setData(data);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<main className="min-h-screen bg-yellow-50 flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mb-4"></div>
					<p className="text-yellow-800 text-lg">Loading puppies...</p>
				</div>
			</main>
		);
	}

	if (!data) {
		return (
			<main className="min-h-screen bg-yellow-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 text-lg">Failed to load puppies</p>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-yellow-50 flex flex-col items-center p-8">
			<div className="w-full max-w-4xl">
				<h1 className="text-4xl font-bold mb-2 text-yellow-900 text-center">
					Golden Retriever Puppies
				</h1>
				<h2 className="text-2xl font-bold mb-2 text-yellow-900 text-center">
					FOR SALE
				</h2>
				<p className="text-lg text-yellow-800 text-center mb-8">
					Click a puppy to see more photos!
				</p>
			</div>

			<div className="mb-6 flex gap-8">
				<div className="text-center">
					<div
						className="w-24 h-24 relative mx-auto mb-2 cursor-pointer"
						onClick={() =>
							setModal({ name: data.dam.name, images: data.dam.images })
						}>
						<Image
							src={data.dam.images[0]}
							alt="Dam"
							fill
							className="object-cover rounded-full border-4 border-yellow-400"
						/>
					</div>
					<span className="block text-yellow-700 font-semibold">
						Dam: {data.dam.name}
					</span>
				</div>
				<div className="text-center">
					<div
						className="w-24 h-24 relative mx-auto mb-2 cursor-pointer"
						onClick={() =>
							setModal({ name: data.sire.name, images: data.sire.images })
						}>
						<Image
							src={data.sire.images[0]}
							alt="Sire"
							fill
							className="object-cover rounded-full border-4 border-yellow-400"
						/>
					</div>
					<span className="block text-yellow-700 font-semibold">
						Sire: {data.sire.name}
					</span>
				</div>
			</div>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
				{data.puppies.map((puppy) => (
					<div
						key={puppy.id}
						className="relative group cursor-pointer"
						onClick={() =>
							setModal({ name: puppy.name, images: puppy.images })
						}>
						<div className="aspect-square relative w-full h-48 md:h-56 rounded-xl overflow-hidden border-4 border-yellow-300 group-hover:scale-105 transition-transform">
							<Image
								src={puppy.images[0]}
								alt={puppy.name}
								fill
								className="object-cover"
							/>
							{puppy.isSold && (
								<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-red-600 px-4 py-2 rounded text-lg font-bold border-2 border-red-600 transform rotate-[320deg]">
									REHOMED
								</span>
							)}
						</div>
						{/* <div className="mt-2 text-center text-yellow-900 font-semibold text-lg">{puppy.name}</div> */}
					</div>
				))}
			</div>
			{modal && !fullSizeImage && (
				<GalleryModal
					images={modal.images}
					name={modal.name}
					onClose={() => setModal(null)}
					onImageClick={(image) => {
						const imageIndex = modal.images.indexOf(image);
						setFullSizeImage({
							images: modal.images,
							currentIndex: imageIndex,
							name: modal.name,
						});
					}}
				/>
			)}
			{fullSizeImage && (
				<FullSizeImageModal
					images={fullSizeImage.images}
					currentImageIndex={fullSizeImage.currentIndex}
					name={fullSizeImage.name}
					onClose={() => setFullSizeImage(null)}
					onNavigate={(direction) => {
						if (direction === "prev" && fullSizeImage.currentIndex > 0) {
							setFullSizeImage({
								...fullSizeImage,
								currentIndex: fullSizeImage.currentIndex - 1,
							});
						} else if (
							direction === "next" &&
							fullSizeImage.currentIndex < fullSizeImage.images.length - 1
						) {
							setFullSizeImage({
								...fullSizeImage,
								currentIndex: fullSizeImage.currentIndex + 1,
							});
						}
					}}
				/>
			)}

			{/* Contact Section */}
			<footer className="w-full max-w-4xl mt-12 pt-8 border-t-2 border-yellow-200">
				<div className="text-center">
					<h3 className="text-2xl font-bold text-yellow-900 mb-6">Contact Us</h3>

					<div className="grid md:grid-cols-2 gap-6 text-yellow-800 mb-6">
						<div>
							<h4 className="font-semibold text-lg mb-2">Phone</h4>
							<p className="text-lg">+63 927 255 9083</p>
						</div>
						<div>
							<h4 className="font-semibold text-lg mb-2">Location</h4>
							<p className="text-lg">Lipa City, Batangas</p>
						</div>
					</div>

					<div className="border-t border-yellow-200 pt-4">
						<p className="text-sm text-yellow-700">
							Available for visits by appointment only
						</p>
					</div>
				</div>
			</footer>
		</main>
	);
}
