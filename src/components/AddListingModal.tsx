import React, { useState, useRef } from "react";
import { Listing } from "../types";
import { X, Sprout, ShieldAlert, CheckCircle, Image as ImageIcon, Plus, Trash2, Camera, Upload, Loader2 } from "lucide-react";

const PRESET_IMAGES = [
  { url: "https://images.unsplash.com/photo-1551754625-70c9048718bd?auto=format&fit=crop&w=600&q=80", category: "Mazao", label: "Mahindi Meupe" },
  { url: "https://images.unsplash.com/photo-1530071437248-26665840d7e6?auto=format&fit=crop&w=600&q=80", category: "Mazao", label: "Mahindi Shambani" },
  { url: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=600&q=80", category: "Mazao", label: "Nyanya Safi" },
  { url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80", category: "Mazao", label: "Nyanya Shambani" },
  { url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80", category: "Mbegu", label: "Alizeti" },
  { url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80", category: "Mbolea & Pembejeo", label: "Mbolea ya Udongo" },
  { url: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80", category: "Mifugo", label: "Kuku wa Kienyeji" },
  { url: "https://images.unsplash.com/photo-1530268578403-df6e89da0d30?auto=format&fit=crop&w=600&q=80", category: "Vifaa vya Kilimo", label: "Trekta / Vifaa" },
  { url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80", category: "Mazao", label: "Shamba Kijani" },
  { url: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80", category: "Vifaa vya Kilimo", label: "Power Tiller" }
];

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 0.7 quality is lightweight (around 30KB) and highly clear
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface AddListingModalProps {
  onClose: () => void;
  onSave: (listing: Omit<Listing, "id" | "createdAt">) => void;
}

export default function AddListingModal({ onClose, onSave }: AddListingModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Listing["category"]>("Mazao");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("Gunia (100kg)");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [farmerName, setFarmerName] = useState(() => {
    return localStorage.getItem("kilimo_user_name") || "";
  });
  const [farmerPhone, setFarmerPhone] = useState(() => {
    return localStorage.getItem("kilimo_user_phone") || "+255";
  });
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleAddCustomUrl = () => {
    setError("");
    const url = customUrl.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("Tafadhali weka URL sahihi inayoanza na http:// au https://");
      return;
    }
    if (imageUrls.includes(url)) {
      setError("Picha hii tayari imeshachaguliwa!");
      return;
    }
    if (imageUrls.length >= 5) {
      setError("Umekamilisha idadi ya picha 5.");
      return;
    }
    setImageUrls([...imageUrls, url]);
    setCustomUrl("");
  };

  const handleTogglePreset = (url: string) => {
    setError("");
    if (imageUrls.includes(url)) {
      setImageUrls(imageUrls.filter(u => u !== url));
    } else {
      if (imageUrls.length >= 5) {
        setError("Umekamilisha idadi ya picha 5.");
        return;
      }
      setImageUrls([...imageUrls, url]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleLocalFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - imageUrls.length;
    if (remainingSlots <= 0) {
      setError("Umeshachagua idadi ya juu kabisa ya picha (picha 5). Ondoa baadhi kwanza.");
      return;
    }

    setIsCompressing(true);
    const newUrls: string[] = [];
    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];

    try {
      for (const file of filesToProcess) {
        if (!file.type.startsWith("image/")) {
          setError("Tafadhali chagua faili za picha tu!");
          continue;
        }
        if (file.size > 12 * 1024 * 1024) {
          setError(`Picha "${file.name}" ni kubwa mno. Tafadhali chagua picha iliyo chini ya MB 12.`);
          continue;
        }

        const base64Url = await compressImage(file);
        newUrls.push(base64Url);
      }

      if (newUrls.length > 0) {
        setImageUrls(prev => [...prev, ...newUrls].slice(0, 5));
      }
      
      if (files.length > remainingSlots) {
        setError(`Umechagua picha nyingi zaidi ya zilizobaki. Picha ${remainingSlots} za mwanzo tu zimepakiwa.`);
      }
    } catch (err) {
      console.error(err);
      setError("Kulitokea hitilafu wakati wa kuandaa picha yako. Tafadhali jaribu tena.");
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !price || !unit || !quantity || !location || !farmerName || !farmerPhone) {
      setError("Tafadhali jaza sehemu zote zenye alama ya nyota (*)");
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseFloat(quantity);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Tafadhali weka bei halali na kubwa kuliko 0");
      return;
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setError("Tafadhali weka kiasi halali na kikubwa kuliko 0");
      return;
    }

    if (!/^\+255\d{9}$/.test(farmerPhone.trim())) {
      setError("Namba ya simu inabidi ianze na +255 ikifuatiwa na namba 9 (mfano: +255712345678)");
      return;
    }

    // Call onSave
    onSave({
      title: title.trim(),
      category,
      price: parsedPrice,
      unit: unit.trim(),
      quantity: parsedQuantity,
      location: location.trim(),
      farmerName: farmerName.trim(),
      farmerPhone: farmerPhone.trim(),
      description: description.trim(),
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div id="add-listing-modal" className="fixed inset-0 z-50 overflow-y-auto bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl border-2 border-emerald-100 flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-emerald-500 bg-emerald-600 text-white">
          <div className="flex items-center space-x-2">
            <Sprout className="h-5 w-5 text-orange-400" />
            <h2 className="font-sans font-black text-lg">Sajili Bidhaa / Mazao Sokoni</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-750 rounded-lg text-emerald-200 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-emerald-50/5">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="font-sans font-black text-xl text-emerald-850">Bidhaa Imesajiliwa Kikamilifu!</h3>
              <p className="text-sm text-emerald-800/80 font-semibold">Inapakiwa sokoni kwa wateja sasa hivi...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center space-x-2 bg-orange-50 text-orange-950 p-4 rounded-2xl border-2 border-orange-100 text-xs font-bold">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0 text-orange-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Grid Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Jina la Bidhaa au Mazao *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Mfano: Nyanya Chotara, Mahindi ya Singida, nk."
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                  />
                </div>

                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Kundi la Bidhaa *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Listing["category"])}
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all"
                  >
                    <option value="Mazao">Mazao ya Kilimo</option>
                    <option value="Mbegu">Mbegu Bora</option>
                    <option value="Mbolea & Pembejeo">Pembejeo & Mbolea</option>
                    <option value="Vifaa vya Kilimo">Zana & Vifaa vya Kilimo</option>
                    <option value="Mifugo">Mifugo</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Bei (TZS) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Mfano: 90000"
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Kipimo cha Bei *</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Mfano: Gunia (100kg), Kilo, Tenga, Debe"
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Kiasi Kilichopo kwa Sasa *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Mfano: 50"
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Mahali ilipo Bidhaa (Mkoa, Wilaya) *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Mfano: Morogoro Mjini, Iringa Ruaha"
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                  />
                </div>

                {/* Farmer/Seller Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Jina la Mkulima / Muuzaji *</label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="Mfano: Mzee Juma"
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Namba ya Simu ya Mkononi (WhatsApp) *</label>
                  <input
                    type="text"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder="+255..."
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                  />
                  <p className="text-[10px] text-emerald-800/60 font-bold">Namba hii inatumiwa kupokea Simu au WhatsApp kutoka kwa wanunuzi</p>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-emerald-900">Maelezo Zaidi kuhusu Bidhaa</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Weka maelezo ya kina kama ubora wa bidhaa, njia za kusafirisha, uzoefu wa mbegu, nk."
                    className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                  />
                </div>

                {/* Product Images Section */}
                <div className="md:col-span-2 border-t border-emerald-100/70 pt-4 space-y-4">
                  {/* Hidden Input File for local device uploads */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLocalFilesUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <Camera className="h-4.5 w-4.5 text-orange-500" />
                      <div>
                        <h4 className="text-xs font-black text-emerald-950">Picha za Bidhaa (Hadi picha 5)</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">Weka picha halisi za bidhaa yako ili kujenga uaminifu kwa wanunuzi.</p>
                      </div>
                    </div>

                    {/* Prominent upload button */}
                    {imageUrls.length < 5 && (
                      <button
                        type="button"
                        disabled={isCompressing}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-350 text-white font-black text-[11px] rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer active:scale-95"
                      >
                        {isCompressing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        <span>{isCompressing ? "Inapakia..." : "Pakia Picha kutoka Simu"}</span>
                      </button>
                    )}
                  </div>

                  {/* Selected images preview list */}
                  <div className="bg-emerald-50/20 border-2 border-dashed border-emerald-100 p-4 rounded-[1.5rem]">
                    {imageUrls.length === 0 ? (
                      <div className="text-center py-6 space-y-3">
                        <ImageIcon className="h-8 w-8 text-emerald-300 mx-auto" />
                        <div className="space-y-1">
                          <p className="text-[11px] text-emerald-800/70 font-black">Bado hujachagua picha yoyote.</p>
                          <p className="text-[9px] text-slate-400">Pakia picha kutoka maktaba ya simu au chagua kutoka picha zetu bora hapa chini.</p>
                        </div>
                        <button
                          type="button"
                          disabled={isCompressing}
                          onClick={() => fileInputRef.current?.click()}
                          className="mx-auto flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-350 text-white font-black text-xs rounded-xl shadow-md shadow-orange-500/15 transition-all cursor-pointer active:scale-95"
                        >
                          {isCompressing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                          <span>{isCompressing ? "Inatayarisha..." : "Chagua Picha Sasa"}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-2.5">
                        {imageUrls.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-sm group">
                            <img src={url} alt={`Bidhaa ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute top-1 right-1">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                                title="Ondoa picha hii"
                              >
                                <X className="h-3 w-3 stroke-[3]" />
                              </button>
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded-lg text-[8px] text-white font-mono font-bold">
                              Picha {idx + 1}
                            </div>
                          </div>
                        ))}
                        {imageUrls.length < 5 && (
                          <button
                            type="button"
                            disabled={isCompressing}
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-emerald-300 hover:border-orange-500 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 transition-all cursor-pointer text-emerald-600 hover:text-orange-600 group active:scale-95 disabled:opacity-50"
                          >
                            {isCompressing ? (
                              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                            ) : (
                              <>
                                <Plus className="h-5 w-5 text-emerald-400 group-hover:text-orange-500 transition-colors" />
                                <span className="text-[9px] font-bold mt-1">Ongeza</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Progress indicator */}
                    <div className="mt-3 flex items-center justify-between text-[10px] font-bold border-t border-emerald-100/50 pt-2.5">
                      <span className="text-emerald-900/60">Idadi ya picha zilizochaguliwa:</span>
                      <span className={`${imageUrls.length === 5 ? 'text-orange-600' : 'text-emerald-800'}`}>{imageUrls.length} kati ya 5</span>
                    </div>
                  </div>

                  {/* Custom URL Input block */}
                  {imageUrls.length < 5 && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-emerald-900">Ingiza URL ya picha yako ya mtandaoni:</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/... au URL nyingine"
                          className="flex-1 px-4 py-2.5 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-emerald-950 transition-all placeholder:text-emerald-900/40"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomUrl}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl flex items-center space-x-1 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Ongeza</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Preset Quick Chooser */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-emerald-900 block">Chagua haraka kutoka kwenye picha zetu bora za kilimo:</span>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 bg-emerald-50/20 border border-emerald-100 rounded-2xl">
                      {PRESET_IMAGES.map((preset, idx) => {
                        const isSelected = imageUrls.includes(preset.url);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleTogglePreset(preset.url)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-orange-500 text-white border-transparent shadow-sm"
                                : "bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-100"
                            }`}
                          >
                            <span className="w-4 h-4 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                              <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </span>
                            <span>{preset.label}</span>
                            {isSelected && <X className="h-2.5 w-2.5 stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t-2 border-emerald-100 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-black rounded-2xl transition-colors"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-2xl shadow-md shadow-orange-100/50 transition-colors"
                >
                  Sajili Sokoni
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
