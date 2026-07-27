import React, { useState } from "react";
import { Sprout, CheckCircle2, User, Phone, Mail, AlertTriangle, X } from "lucide-react";
import { dbService } from "../dbService";

interface RegistrationModalProps {
  onRegisterSuccess: (name: string, phone: string, email: string) => void;
  onClose?: () => void;
}

export default function RegistrationModal({ onRegisterSuccess, onClose }: RegistrationModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-numeric characters except maybe leading +
    let cleaned = input.replace(/[^\d+]/g, "");
    
    // If it starts with "0", replace it with "+255"
    if (cleaned.startsWith("0")) {
      cleaned = "+255" + cleaned.substring(1);
    }
    
    // If it starts with "255" (no +), prepend "+"
    if (cleaned.startsWith("255") && !cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }
    
    // If it's just 9 digits (e.g. 712345678) and doesn't start with 0 or +, prepend +255
    if (cleaned.length === 9 && !cleaned.startsWith("+") && !cleaned.startsWith("0")) {
      cleaned = "+255" + cleaned;
    }

    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      setError("Tafadhali jaza sehemu zote!");
      return;
    }

    if (trimmedName.length < 3) {
      setError("Jina lazima liwe na herufi zisizopungua 3!");
      return;
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(trimmedPhone);
    // Validate phone pattern (+2557XXXXXXXX or +2556XXXXXXXX, etc.)
    if (!/^\+255\d{9}$/.test(formattedPhone)) {
      setError("Namba ya simu sio sahihi! Mfano: 0712345678 au +255712345678");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Barua pepe (Email) sio sahihi! Mfano: mkulima@gmail.com");
      return;
    }

    setIsLoading(true);
    try {
      // Create or get local user ID
      let userId = localStorage.getItem("kilimo_user_id");
      if (!userId) {
        userId = "user_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("kilimo_user_id", userId);
      }

      // Save to Firestore and LocalStorage via dbService
      await dbService.saveUserProfile(userId, {
        name: trimmedName,
        phone: formattedPhone,
        email: trimmedEmail,
      });

      // Save user details to localStorage
      localStorage.setItem("kilimo_user_name", trimmedName);
      localStorage.setItem("kilimo_user_phone", formattedPhone);
      localStorage.setItem("kilimo_user_email", trimmedEmail);
      localStorage.setItem("kilimo_buyer_name", trimmedName); // sync with default buyer name
      localStorage.setItem("kilimo_farmer_phone", formattedPhone); // sync with default farmer phone
      localStorage.setItem("kilimo_registered", "true");

      setSuccess(true);
      setTimeout(() => {
        onRegisterSuccess(trimmedName, formattedPhone, trimmedEmail);
      }, 1800);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Kuna hitilafu iliyotokea wakati wa usajili. Tafadhali jaribu tena.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-md">
      <div className="relative bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border-2 border-emerald-100/50 animate-in fade-in zoom-in duration-300">
        
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="absolute top-6 right-6 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Endelea kama mgeni"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header Decoration */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="p-4 bg-emerald-100 rounded-[2rem] text-emerald-800 shadow-inner">
            <Sprout className="h-10 w-10 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-sans font-black text-emerald-900 tracking-tight">Karibu WAKULIMA!</h2>
            <p className="text-xs text-emerald-800/70 font-semibold mt-1">Sajili wasifu wako kuanza kupata soko na ushauri wa kitaalamu</p>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
            <CheckCircle2 className="h-20 w-20 text-emerald-500 animate-bounce" />
            <div>
              <h3 className="text-xl font-sans font-black text-emerald-950">Usajili Umekamilika!</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Asante sana <strong>{name}</strong>, akaunti yako imetengenezwa. Programu inafunguka sasa...
              </p>
            </div>
            <div className="w-12 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-full animate-loading-bar rounded-full"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error banner */}
            {error && (
              <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl flex items-start space-x-2.5 text-xs text-orange-950 font-semibold animate-shake">
                <AlertTriangle className="h-4.5 w-4.5 text-orange-600 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider">Majina Kamili *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-600/50 h-4.5 w-4.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mfano: Juma Bakari"
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-emerald-100/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all"
                />
              </div>
            </div>

            {/* Phone input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider">Namba ya Simu *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-600/50 h-4.5 w-4.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Mfano: 0712345678"
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-emerald-100/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400">Inatumika kuwasiliana na wanunuzi/wakulima kupitia Soga au Simu.</p>
            </div>

            {/* Email input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider">Anwani ya Barua Pepe (Email) *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-600/50 h-4.5 w-4.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Mfano: juma@gmail.com"
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-emerald-100/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400">Inatumika kwa ajili ya mawasiliano ya mfumo na usalama.</p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-black rounded-xl text-xs shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? "Inasajili..." : "Sajili Wasifu Wako"}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black rounded-xl text-xs active:scale-98 transition-all flex items-center justify-center"
              >
                Endelea kama Mgeni
              </button>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
