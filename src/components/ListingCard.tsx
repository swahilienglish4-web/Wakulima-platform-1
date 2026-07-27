import React, { useState } from "react";
import { Listing } from "../types";
import { MapPin, Phone, MessageSquare, Share2, Calendar, ShoppingBag, Sprout, Tag, Box, Milestone, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ListingCardProps {
  key?: any;
  listing: Listing;
  onOpenChat: (listing: Listing) => any;
  userRole: "mkulima" | "mnunuzi";
}

// Map categories to beautiful gradient badges and icons
const getCategoryMeta = (category: string) => {
  switch (category) {
    case "Mazao":
      return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Sprout, label: "Mazao ya Kilimo" };
    case "Mbegu":
      return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Tag, label: "Mbegu Bora" };
    case "Mbolea & Pembejeo":
      return { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Milestone, label: "Pembejeo & Mbolea" };
    case "Vifaa vya Kilimo":
      return { bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Box, label: "Zana & Vifaa" };
    case "Mifugo":
      return { bg: "bg-orange-50 text-orange-700 border-orange-200", icon: ShoppingBag, label: "Mifugo" };
    default:
      return { bg: "bg-slate-50 text-slate-700 border-slate-200", icon: Sprout, label: "Bidhaa nyingine" };
  }
};

// Map categories to mock illustration-styled background gradients
const getCategoryGradient = (category: string) => {
  switch (category) {
    case "Mazao":
      return "from-emerald-500 to-green-600";
    case "Mbegu":
      return "from-amber-400 to-amber-600";
    case "Mbolea & Pembejeo":
      return "from-blue-500 to-indigo-600";
    case "Vifaa vya Kilimo":
      return "from-purple-500 to-indigo-600";
    case "Mifugo":
      return "from-orange-400 to-red-500";
    default:
      return "from-emerald-500 to-teal-600";
  }
};

export default function ListingCard({ listing, onOpenChat, userRole }: ListingCardProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const { bg, icon: Icon, label } = getCategoryMeta(listing.category);
  const grad = getCategoryGradient(listing.category);

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-US").format(listing.price);

  // Format date
  const dateStr = new Date(listing.createdAt).toLocaleDateString("sw-TZ", {
    day: "numeric",
    month: "short",
  });

  // Prefilled WhatsApp message
  const waMessage = encodeURIComponent(
    `Habari ${listing.farmerName}, nimeona tangazo lako la "${listing.title}" la bei ya ${formattedPrice} TZS kwa kila ${listing.unit} katika "Wakulima Platform" ya Kilimo Tech Africa. Ningependa kufanya manunuzi.`
  );
  const waLink = `https://wa.me/${listing.farmerPhone.replace(/\+/g, "")}?text=${waMessage}`;

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border-2 border-emerald-100/85 shadow-md shadow-emerald-100/20 hover:shadow-xl hover:shadow-emerald-200/50 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
      
      {/* Listing Cover Header */}
      <div className={`h-40 bg-gradient-to-br ${grad} p-6 relative flex flex-col justify-between text-white overflow-hidden`}>
        {/* Product image if available */}
        {listing.imageUrls && listing.imageUrls.length > 0 ? (
          <>
            <img 
              src={listing.imageUrls[0]} 
              alt={listing.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              referrerPolicy="no-referrer"
            />
            {/* Dark elegant gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30 pointer-events-none z-0" />
          </>
        ) : (
          /* Abstract farm pattern lines fallback */
          <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* Dynamic Category Tag */}
        <div className="flex items-center justify-between z-10">
          <span className={`text-[11px] font-black px-3 py-1.5 rounded-full border bg-white/95 backdrop-blur-sm text-emerald-900 shadow-sm flex items-center space-x-1`}>
            <Icon className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] bg-black/35 backdrop-blur-sm px-2.5 py-1 rounded-full text-slate-100 font-mono flex items-center space-x-1 font-bold">
            <Calendar className="h-3 w-3" />
            <span>{dateStr}</span>
          </span>
        </div>

        {/* Status indicator badges for self-posted listings under review */}
        {(listing.status === "pending" || listing.status === "rejected") && (
          <div className="absolute top-16 left-6 z-10">
            {listing.status === "pending" ? (
              <span className="bg-amber-500 text-white font-black text-[10px] px-3 py-1.5 rounded-xl shadow-lg border border-amber-400 uppercase tracking-wider flex items-center space-x-1 animate-pulse">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                <span>Uhakiki (Review) ⏳</span>
              </span>
            ) : (
              <span className="bg-red-600 text-white font-black text-[10px] px-3 py-1.5 rounded-xl shadow-lg border border-red-500 uppercase tracking-wider">
                Imekataliwa ❌
              </span>
            )}
          </div>
        )}

        {/* Pricing Area */}
        <div className="z-10 mt-auto">
          <span className="text-xs text-white/85 font-bold block">Bei ya Bidhaa</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-mono font-black text-2xl tracking-tight text-white">{formattedPrice}</span>
            <span className="text-xs font-bold text-orange-200">TZS / {listing.unit}</span>
          </div>
        </div>
      </div>

      {/* Listing Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          
          {/* Location & Title */}
          <div className="space-y-1.5">
            <div className="flex items-center text-xs text-emerald-800 font-bold">
              <MapPin className="h-3.5 w-3.5 text-orange-500 mr-1 flex-shrink-0" />
              <span>{listing.location}</span>
            </div>
            <h3 className="font-sans font-black text-emerald-900 text-lg leading-snug line-clamp-1 group-hover:text-orange-500 transition-colors">
              {listing.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs text-emerald-900/75 font-medium leading-relaxed line-clamp-3">
            {listing.description}
          </p>

          {/* Picha za Bidhaa (Kama zipo) */}
          {listing.imageUrls && listing.imageUrls.length > 0 && (
            <div className="pt-2.5 space-y-2">
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-900/60 font-black uppercase tracking-wider">
                <Camera className="h-3.5 w-3.5 text-orange-500" />
                <span>Gusa picha kuikuza ({listing.imageUrls.length}):</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {listing.imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex(idx);
                    }}
                    className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-emerald-100 hover:border-orange-500 transition-all flex-shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    title="Gusa ili kuona picha kubwa"
                  >
                    <img 
                      src={url} 
                      alt={`${listing.title} picha ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {idx === 0 && (
                      <div className="absolute inset-x-0 bottom-0 bg-emerald-900/70 text-[7px] text-white text-center py-0.5 font-bold uppercase tracking-wider">
                        Kuu
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stocks */}
          <div className="flex items-center space-x-2 text-xs py-1.5 px-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 w-fit">
            <span className="text-emerald-800/70 font-bold">Kiasi Kilichopo:</span>
            <span className="font-black text-emerald-900 font-mono">
              {listing.quantity} {listing.unit}
            </span>
          </div>
        </div>

        {/* Farmer Information Box */}
        <div className="mt-5 pt-4 border-t-2 border-emerald-50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-900/60 uppercase tracking-widest block font-black">Mkulima / Muuzaji</span>
              <span className="text-xs font-black text-emerald-900">{listing.farmerName}</span>
            </div>
            
            {/* Direct Calls */}
            <a
              href={`tel:${listing.farmerPhone}`}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 rounded-full text-emerald-600 transition-colors shadow-sm"
              title="Piga Simu Direct"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>

          {/* Connect Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* In-app Chat */}
            <button
              id={`chat-btn-${listing.id}`}
              onClick={() => onOpenChat(listing)}
              className="flex items-center justify-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-sm shadow-orange-100/50"
            >
              <MessageSquare className="h-4 w-4 text-white" />
              <span>Tuma Soga</span>
            </button>

            {/* Direct WhatsApp Negotiation */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-1.5 bg-emerald-800 hover:bg-emerald-950 text-white px-3 py-2.5 rounded-2xl text-xs font-black transition-all text-center shadow-sm active:scale-95"
            >
              <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.015 14.117 1 11.503 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.452 3.39 1.31 4.877L1.93 21.01l5.44-1.417z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      {/* Photo Lightbox Modal */}
      {activePhotoIndex !== null && listing.imageUrls && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Top header */}
          <div className="flex items-center justify-between text-white p-2 z-10">
            <div>
              <h4 className="font-sans font-black text-sm text-slate-100 tracking-tight">{listing.title}</h4>
              <p className="text-[11px] text-slate-400 font-bold">Mkulima: {listing.farmerName}</p>
            </div>
            <button
              onClick={() => setActivePhotoIndex(null)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main image viewer with controls */}
          <div className="relative flex-1 flex items-center justify-center max-w-4xl mx-auto w-full" onClick={(e) => e.stopPropagation()}>
            {/* Prev button */}
            <button
              onClick={() => setActivePhotoIndex((prev) => (prev! - 1 + listing.imageUrls!.length) % listing.imageUrls!.length)}
              className="absolute left-2 md:left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-10"
            >
              <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
            </button>

            {/* The Image */}
            <div className="max-h-[70vh] max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={listing.imageUrls[activePhotoIndex]}
                alt={`${listing.title} - picha ya ${activePhotoIndex + 1}`}
                className="max-h-[70vh] max-w-full object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next button */}
            <button
              onClick={() => setActivePhotoIndex((prev) => (prev! + 1) % listing.imageUrls!.length)}
              className="absolute right-2 md:right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-10"
            >
              <ChevronRight className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Bottom thumbnails & counter */}
          <div className="text-center space-y-4 p-4 z-10" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-full font-mono font-bold">
              Picha {activePhotoIndex + 1} kati ya {listing.imageUrls.length}
            </span>

            {/* Thumbnail switcher */}
            <div className="flex justify-center space-x-2">
              {listing.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activePhotoIndex ? "border-orange-500 scale-110 shadow-md" : "border-white/25 hover:border-white/50 opacity-60"
                  }`}
                >
                  <img src={url} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
