import React, { useState, useEffect } from "react";
import { X, Upload, Sliders, RotateCcw, CheckCircle, KeyRound, AlertCircle, Eye, EyeOff, Users, Search, Download, Copy, Phone, Mail, Calendar, Check, ShieldCheck, Sprout, MapPin } from "lucide-react";
import { dbService } from "../dbService";
import { Listing } from "../types";

interface BrandingModalProps {
  onClose: () => void;
  logo: string;
  name: string;
  tagline: string;
  adminPin: string;
  onSave: (newLogo: string, newName: string, newTagline: string, newPin?: string) => void;
  onReset: () => void;
  listings?: Listing[];
  onUpdateListingStatus?: (id: string, status: "approved" | "rejected") => Promise<void>;
}

export default function BrandingModal({
  onClose,
  logo,
  name,
  tagline,
  adminPin,
  onSave,
  onReset,
  listings = [],
  onUpdateListingStatus,
}: BrandingModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);

  // Form Fields State
  const [tempLogo, setTempLogo] = useState<string>(logo);
  const [tempName, setTempName] = useState<string>(name);
  const [tempTagline, setTempTagline] = useState<string>(tagline);
  const [tempPin, setTempPin] = useState<string>(adminPin);
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Admin Dashboard Tabs & Users State
  const [activeSubTab, setActiveSubTab] = useState<"branding" | "users" | "reviews">("branding");
  const [usersList, setUsersList] = useState<{ id: string; name: string; phone: string; email: string; createdAt?: number }[]>([]);
  const [reviewFilter, setReviewFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const pendingCount = listings ? listings.filter(l => l.status === "pending").length : 0;

  const reviewFilteredListings = (listings || []).filter((listing) => {
    if (reviewFilter === "pending") {
      return listing.status === "pending";
    } else if (reviewFilter === "approved") {
      return listing.status === "approved" || !listing.status;
    } else {
      return listing.status === "rejected";
    }
  });

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    if (!onUpdateListingStatus) return;
    setStatusUpdatingId(id);
    try {
      await onUpdateListingStatus(id, newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setStatusUpdatingId(null);
    }
  };
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === adminPin) {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Nenosiri la siri (PIN) si sahihi! Tafadhali jaribu tena.");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setTempLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPin = isChangingPin && tempPin.trim() ? tempPin.trim() : adminPin;
    onSave(tempLogo, tempName, tempTagline, finalPin);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  const handleResetClick = () => {
    if (window.confirm("Je, una uhakika unataka kurudisha logo na majina ya jukwaa kwenye mpangilio asilia wa Wakulima Platform na kurudisha PIN kuwa 2026?")) {
      onReset();
      setTempLogo("");
      setTempName("WAKULIMA");
      setTempTagline("Kilimo Tech Africa");
      setTempPin("2026");
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }
  };

  // Fetch users when the "users" sub-tab is activated
  useEffect(() => {
    if (isAuthenticated && activeSubTab === "users") {
      const fetchUsers = async () => {
        setIsUsersLoading(true);
        try {
          const list = await dbService.getAllUsers();
          setUsersList(list);
        } catch (error) {
          console.error("Failed to load users:", error);
        } finally {
          setIsUsersLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isAuthenticated, activeSubTab]);

  // Filter users based on search term
  const filteredUsers = usersList.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  // Handle single copy to clipboard
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // Copy all phone numbers (CSV/space-separated format) for Bulk SMS
  const handleCopyAllPhones = () => {
    if (filteredUsers.length === 0) return;
    const phones = filteredUsers.map(u => u.phone).join(", ");
    navigator.clipboard.writeText(phones);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Download users as CSV file
  const handleDownloadCSV = () => {
    if (filteredUsers.length === 0) return;
    
    const headers = ["Jina Kamili", "Namba ya Simu", "Barua Pepe (Email)", "Tarehe ya Usajili"];
    const rows = filteredUsers.map(user => {
      const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString("sw-TZ") : "N/A";
      return [
        `"${user.name.replace(/"/g, '""')}"`,
        `"${user.phone}"`,
        `"${user.email}"`,
        `"${dateStr}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `watumiaji_waliojisajili_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-[2rem] max-w-2xl w-full p-8 shadow-2xl border-2 border-emerald-100 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-800 shadow-sm">
            <Sliders className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-sans font-black text-emerald-900 tracking-tight">Eneo la Usimamizi na Chapa</h2>
            <p className="text-xs text-slate-500">Marekebisho ya chapa na orodha ya watumiaji kwa wasimamizi pekee</p>
          </div>
        </div>

        {/* Admin Navigation (Only visible when authenticated) */}
        {isAuthenticated && !success && (
          <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              onClick={() => setActiveSubTab("branding")}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 rounded-xl font-black text-[11px] transition-all ${
                activeSubTab === "branding"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Chapa & Logo</span>
            </button>
            <button
              onClick={() => setActiveSubTab("users")}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 rounded-xl font-black text-[11px] transition-all ${
                activeSubTab === "users"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="h-3.5 w-3.5 text-orange-500" />
              <span className="flex items-center space-x-1">
                <span>Watumiaji</span>
                <span className="bg-orange-100 text-orange-700 px-1 rounded-md font-bold text-[9px]">
                  {usersList.length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab("reviews")}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 rounded-xl font-black text-[11px] transition-all ${
                activeSubTab === "reviews"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sprout className="h-3.5 w-3.5 text-emerald-600" />
              <span className="flex items-center space-x-1">
                <span>Uhakiki Soko</span>
                {pendingCount > 0 && (
                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black text-[9px] animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
            <p className="text-sm font-black text-emerald-900">Mabadiliko Yamehifadhiwa kikamilifu!</p>
            <p className="text-xs text-slate-500">Jukwaa sasa litajirekebisha kwa chapa yako mpya.</p>
          </div>
        ) : !isAuthenticated ? (
          /* Authentication Screen */
          <form onSubmit={handleVerifyPin} className="space-y-5">
            <div className="bg-orange-50/75 border border-orange-200 p-4 rounded-2xl flex items-start space-x-3">
              <KeyRound className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0 animate-pulse" />
              <div className="text-xs">
                <span className="font-black text-orange-900 block">Eneo la Ulinzi (Admin Only)</span>
                <span className="text-orange-950/80 leading-relaxed mt-0.5 block">
                  Kipengele hiki ni cha mmiliki pekee. Ili kuingia, tafadhali weka nenosiri lako la siri (PIN ya Usimamizi).
                </span>
                <span className="text-[10px] font-black text-orange-600 mt-2 block bg-orange-100/60 w-fit px-2 py-0.5 rounded">
                  💡 PIN ya Awali kwa sasa ni: <code className="font-mono text-xs">2026</code>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider">PIN ya Admin</label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="Weka nenosiri..."
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-emerald-100/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-mono font-bold tracking-widest transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-emerald-900/40 hover:text-emerald-900 transition-colors"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pinError && (
                <div className="flex items-center space-x-1.5 text-red-500 text-xs font-bold mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <KeyRound className="h-4 w-4" />
              <span>Thibitisha na Uingie</span>
            </button>
          </form>
        ) : activeSubTab === "branding" ? (
          /* Main Branding Configuration Screen */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider">Logo ya Kampuni yako</label>
              <div className="flex items-center space-x-6 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <div className="relative w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden border border-emerald-100">
                  {tempLogo ? (
                    <img src={tempLogo} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-2xl">
                      {tempName ? tempName.charAt(0) : "W"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all">
                    <Upload className="h-4 w-4" />
                    <span>Pakia Logo Mpya</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1.5">Tunapendekeza picha ya mraba (PNG au JPG) yenye background nyeupe au isiyo na rangi.</p>
                </div>
              </div>
            </div>

            {/* Platform Name Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider">Jina la Jukwaa (Platform Name)</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value.toUpperCase())}
                required
                placeholder="MFANO: WAKULIMA"
                className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100/70 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-black transition-all"
              />
              <p className="text-[10px] text-slate-400">Jina hili litatokea kwenye upau wa juu (Navbar) na kichwa cha habari.</p>
            </div>

            {/* Tagline Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider">Kaulimbiu au Jina la Kampuni yako (Tagline)</label>
              <input
                type="text"
                value={tempTagline}
                onChange={(e) => setTempTagline(e.target.value)}
                required
                placeholder="MFANO: Kilimo Tech Africa"
                className="w-full px-4 py-3 bg-emerald-50/30 border-2 border-emerald-100/70 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all"
              />
              <p className="text-[10px] text-slate-400">Hili ni jina ndogo linalofuata chini ya jina la jukwaa lako.</p>
            </div>

            {/* Change Admin PIN Section */}
            <div className="bg-slate-50 border border-emerald-100 p-4.5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950">Badilisha PIN ya Admin</span>
                <button
                  type="button"
                  onClick={() => setIsChangingPin(!isChangingPin)}
                  className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 underline"
                >
                  {isChangingPin ? "Ghairi mabadiliko ya PIN" : "Kubadili PIN"}
                </button>
              </div>

              {isChangingPin && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-black text-emerald-900 uppercase tracking-wider">PIN Mpya ya Admin</label>
                  <input
                    type="text"
                    value={tempPin}
                    onChange={(e) => setTempPin(e.target.value)}
                    required
                    placeholder="MFANO: 9988"
                    className="w-full px-4 py-2.5 bg-white border-2 border-emerald-100 rounded-xl text-xs font-bold tracking-widest text-emerald-950 font-mono focus:outline-none focus:border-emerald-600"
                  />
                  <p className="text-[9px] text-slate-400">Hakikisha umeitunza PIN hii vizuri, utaihitaji unapotaka kubadilisha chapa tena.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetClick}
                className="flex items-center space-x-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Rudisha Asilia</span>
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border-2 border-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all"
                >
                  Hifadhi Chapa
                </button>
              </div>
            </div>

          </form>
        ) : activeSubTab === "reviews" ? (
          /* Eneo la Uhakiki wa Bidhaa (Product Review Panel) */
          <div className="space-y-5">
            {/* Review Tab Sub-categories: Pending / Approved / Rejected */}
            <div className="flex space-x-2 border-b border-slate-100 pb-3">
              <button
                onClick={() => setReviewFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === "pending"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                Inasubiri Uhakiki ({listings?.filter(l => l.status === "pending").length || 0})
              </button>
              <button
                onClick={() => setReviewFilter("approved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === "approved"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                Zilizokubaliwa ({listings?.filter(l => l.status === "approved" || !l.status).length || 0})
              </button>
              <button
                onClick={() => setReviewFilter("rejected")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === "rejected"
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                Zilizokataliwa ({listings?.filter(l => l.status === "rejected").length || 0})
              </button>
            </div>

            {/* List Container */}
            <div className="max-h-[350px] overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/50">
              {reviewFilteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <Sprout className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-500">Hakuna bidhaa katika kundi hili!</p>
                  <p className="text-[10px] text-slate-400 mt-1">Bidhaa mpya zikisajiliwa zitatokea hapa kwa ajili ya uhakiki wako.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-150">
                  {reviewFilteredListings.map((listing) => {
                    const formattedDate = listing.createdAt 
                      ? new Date(listing.createdAt).toLocaleDateString("sw-TZ", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "N/A";

                    return (
                      <div key={listing.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex space-x-3">
                            {/* Product preview image */}
                            <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                              {listing.imageUrls && listing.imageUrls.length > 0 ? (
                                <img src={listing.imageUrls[0]} alt={listing.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center">
                                  {listing.title.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 leading-snug">{listing.title}</h4>
                              <span className="inline-block bg-emerald-50 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-md mt-1">
                                {listing.category}
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono mt-1 font-bold">
                                Bei: {listing.price.toLocaleString()} TZS / {listing.unit} | Kiasi: {listing.quantity}
                              </div>
                            </div>
                          </div>
                          
                          {/* Seller info right side */}
                          <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-800">{listing.farmerName}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{listing.farmerPhone}</span>
                            <span className="text-[9px] text-slate-400 mt-1">Sajili: {formattedDate}</span>
                          </div>
                        </div>

                        {/* Description */}
                        {listing.description && (
                          <p className="text-[10px] text-slate-600 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-xl">
                            {listing.description}
                          </p>
                        )}

                        {/* Actions block */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span className="text-[9px] text-slate-500 font-bold">{listing.location}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* If status is pending, show Approve & Reject buttons */}
                            {listing.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(listing.id, "rejected")}
                                  disabled={statusUpdatingId === listing.id}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                  {statusUpdatingId === listing.id ? (
                                    <div className="w-3 h-3 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                  <span>Kataa Bidhaa</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(listing.id, "approved")}
                                  disabled={statusUpdatingId === listing.id}
                                  className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                                >
                                  {statusUpdatingId === listing.id ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                  <span>Thibitisha (Post)</span>
                                </button>
                              </>
                            )}

                            {/* If status is approved, allow Reject (Ghairi) */}
                            {(listing.status === "approved" || !listing.status) && (
                              <button
                                onClick={() => handleUpdateStatus(listing.id, "rejected")}
                                disabled={statusUpdatingId === listing.id}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                                <span>Ghairi Post (Kataa)</span>
                              </button>
                            )}

                            {/* If status is rejected, allow Approve (Re-approve) */}
                            {listing.status === "rejected" && (
                              <button
                                onClick={() => handleUpdateStatus(listing.id, "approved")}
                                disabled={statusUpdatingId === listing.id}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                                <span>Kubali Tena</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Moderation Warning */}
            <div className="bg-orange-50/70 border border-orange-200 p-3.5 rounded-2xl flex items-start space-x-2.5 text-[10px] text-orange-950 leading-relaxed font-semibold">
              <ShieldCheck className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Udhibiti wa Maudhui:</strong> Tafadhali kagua bidhaa hizi kwa uangalifu ili kuhakikisha zote zinahusiana tu na masuala ya <strong>kilimo, mbegu, pembejeo, mifugo, na vifaa vya shambani</strong> ili kuzuia matangazo yasiyohusika kwenye jukwaa la {tempName}.
              </span>
            </div>
          </div>
        ) : (
          /* Orodha ya Watumiaji (Registered Users Panel) Screen */
          <div className="space-y-5">
            {/* Action Bar (Search & Export Buttons) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Search box */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Tafuta kwa jina, simu, au barua pepe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-bold text-slate-800 transition-all"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyAllPhones}
                  className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    copiedAll 
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200"
                  }`}
                  title="Copy all phone numbers for Bulk SMS campaigns"
                >
                  {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedAll ? "Zimenakiliwa!" : "Copy Namba Zote"}</span>
                </button>

                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                  title="Download all registered users as CSV file for Excel"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Pakua CSV</span>
                </button>
              </div>
            </div>

            {/* Statistics Banner */}
            <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/50">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-black text-emerald-800/60 uppercase tracking-wider block">Jumla ya Watumiaji</span>
                <span className="text-2xl font-black text-emerald-950 font-sans mt-0.5 block">{usersList.length}</span>
              </div>
              <div className="text-center sm:text-left border-l border-emerald-100 pl-3">
                <span className="text-[10px] font-black text-emerald-800/60 uppercase tracking-wider block">Matokeo ya Utafutaji</span>
                <span className="text-2xl font-black text-orange-600 font-sans mt-0.5 block">{filteredUsers.length}</span>
              </div>
            </div>

            {/* Users List Container */}
            <div className="max-h-[320px] overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/50">
              {isUsersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-bold">Inapakia orodha ya watumiaji...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <Users className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-500">Hakuna mtumiaji aliyepatikana!</p>
                  <p className="text-[10px] text-slate-400 mt-1">Hakikisha umeandika kwa usahihi au wasubiri wakulima wajisajili.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredUsers.map((user, idx) => {
                    const formattedDate = user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString("sw-TZ", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "N/A";

                    return (
                      <div key={user.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3">
                        <div className="flex items-center space-x-3">
                          {/* User Avatar Initials */}
                          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white shadow-sm shadow-emerald-100 flex-shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                              <span>{user.name}</span>
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.2 rounded flex items-center space-x-0.5">
                                <ShieldCheck className="h-3 w-3" />
                                <span>Mwanachama</span>
                              </span>
                            </div>
                            <div className="flex flex-col space-y-0.5 mt-1">
                              <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span className="font-mono">{user.phone}</span>
                              </span>
                              <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <span>{user.email}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons and date */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                          <span className="text-[9px] text-slate-400 flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Sajili: {formattedDate}</span>
                          </span>

                          <div className="flex items-center space-x-1.5">
                            {/* Copy phone button */}
                            <button
                              onClick={() => handleCopy(user.phone, idx)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 transition-all ${
                                copiedIndex === idx
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                              title="Nakili namba ya simu"
                            >
                              {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              <span>Sima</span>
                            </button>

                            {/* Copy Email button */}
                            <button
                              onClick={() => handleCopy(user.email, idx + 1000)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 transition-all ${
                                copiedIndex === (idx + 1000)
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                              title="Nakili anwani ya barua pepe"
                            >
                              {copiedIndex === (idx + 1000) ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tip for the Director */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-start space-x-2.5 text-[10px] text-slate-600 leading-relaxed font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Mwongozo wa Mkurugenzi:</strong> Unaweza kunakili namba zote za simu kwa mara moja kwa kubonyeza <strong>&quot;Copy Namba Zote&quot;</strong> na kuzipaste kwenye mfumo wako wa Bulk SMS kwa ajili ya kutuma matangazo, au bofya <strong>&quot;Pakua CSV&quot;</strong> ili kupata faili kamili la Excel la wasifu wote.
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
