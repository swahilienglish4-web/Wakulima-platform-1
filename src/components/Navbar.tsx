import React from "react";
import { Sprout, MessageSquare, BrainCircuit, PlusCircle, ShoppingBag, Sliders, LogOut, Users, Lightbulb } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: "mkulima" | "mnunuzi";
  setUserRole: (role: "mkulima" | "mnunuzi") => void;
  onOpenAddModal: () => void;
  chatCount: number;
  platformLogo: string;
  platformName: string;
  platformTagline: string;
  onOpenBrandingModal: () => void;
  onExitClick: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenAddModal,
  chatCount,
  platformLogo,
  platformName,
  platformTagline,
  onOpenBrandingModal,
  onExitClick,
}: NavbarProps) {
  return (
    <nav id="app-navbar" className="sticky top-0 z-40 bg-white text-slate-800 shadow-sm border-b-2 border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("sokoni")}>
            {platformLogo ? (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-white border border-emerald-100 overflow-hidden">
                <img src={platformLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-white font-black text-xl">{platformName ? platformName.charAt(0) : "W"}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-emerald-900 font-black leading-none tracking-tight text-lg">{platformName}</span>
              <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">{platformTagline}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 h-full">
            <button
              id="nav-sokoni"
              onClick={() => setActiveTab("sokoni")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-150 ${
                activeTab === "sokoni"
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-emerald-900/60 hover:text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Sokoni</span>
            </button>

            <button
              id="nav-mshauri"
              onClick={() => setActiveTab("mshauri")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-150 ${
                activeTab === "mshauri"
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-emerald-900/60 hover:text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              <BrainCircuit className="h-4 w-4 text-orange-500" />
              <span className="flex items-center space-x-1">
                <span>Mshauri wa AI</span>
                <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.2 rounded uppercase font-extrabold">Tech</span>
              </span>
            </button>

            <button
              id="nav-vikundi"
              onClick={() => setActiveTab("vikundi")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-150 ${
                activeTab === "vikundi"
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-emerald-900/60 hover:text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              <Users className="h-4 w-4 text-emerald-600" />
              <span>Vikundi (Forums)</span>
            </button>

            <button
              id="nav-elimu"
              onClick={() => setActiveTab("elimu")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-150 ${
                activeTab === "elimu"
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-emerald-900/60 hover:text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              <Lightbulb className="h-4 w-4 text-orange-500 animate-pulse" />
              <span>Ulikuwa Unajua?</span>
            </button>

            <button
              id="nav-soga"
              onClick={() => setActiveTab("soga")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-150 relative ${
                activeTab === "soga"
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-emerald-900/60 hover:text-emerald-900 hover:bg-emerald-50"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Soga Zangu</span>
              {chatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-black text-[10px] h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                  {chatCount}
                </span>
              )}
            </button>
          </div>

          {/* User Controls & Quick Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Listing Post button (For Farmers) */}
            {userRole === "mkulima" && (
              <button
                id="btn-quick-post"
                onClick={onOpenAddModal}
                className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-orange-100 active:scale-95 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline font-bold">Uza Mazao</span>
                <span className="inline sm:hidden font-bold">Uza</span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="flex items-center bg-emerald-50 p-1 rounded-full border border-emerald-100">
              <button
                id="role-mnunuzi"
                onClick={() => setUserRole("mnunuzi")}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                  userRole === "mnunuzi"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                    : "text-emerald-900/60 hover:text-emerald-900"
                }`}
              >
                Mnunuzi
              </button>
              <button
                id="role-mkulima"
                onClick={() => setUserRole("mkulima")}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                  userRole === "mkulima"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                    : "text-emerald-900/60 hover:text-emerald-900"
                }`}
              >
                Mkulima
              </button>
            </div>

            {/* Branding Settings Toggle */}
            <button
              onClick={onOpenBrandingModal}
              title="Kubadilisha Logo na Jina la Kampuni"
              className="p-2.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              <Sliders className="h-4 w-4" />
            </button>

            {/* Exit App button */}
            <button
              onClick={onExitClick}
              title="Toka kwenye Programu"
              className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex border-t border-emerald-100 bg-white text-slate-600">
        <button
          id="mobile-nav-sokoni"
          onClick={() => setActiveTab("sokoni")}
          className={`flex-1 flex flex-col items-center py-2.5 text-xs font-bold ${
            activeTab === "sokoni" ? "text-emerald-600 bg-emerald-50/50" : "text-slate-500"
          }`}
        >
          <ShoppingBag className="h-4 w-4 mb-0.5" />
          Sokoni
        </button>
        <button
          id="mobile-nav-mshauri"
          onClick={() => setActiveTab("mshauri")}
          className={`flex-1 flex flex-col items-center py-2.5 text-xs font-bold ${
            activeTab === "mshauri" ? "text-emerald-600 bg-emerald-50/50" : "text-slate-500"
          }`}
        >
          <BrainCircuit className="h-4 w-4 mb-0.5" />
          Mshauri
        </button>
        <button
          id="mobile-nav-vikundi"
          onClick={() => setActiveTab("vikundi")}
          className={`flex-1 flex flex-col items-center py-2.5 text-xs font-bold ${
            activeTab === "vikundi" ? "text-emerald-600 bg-emerald-50/50" : "text-slate-500"
          }`}
        >
          <Users className="h-4 w-4 mb-0.5 text-emerald-600" />
          Vikundi
        </button>
        <button
          id="mobile-nav-elimu"
          onClick={() => setActiveTab("elimu")}
          className={`flex-1 flex flex-col items-center py-2.5 text-xs font-bold ${
            activeTab === "elimu" ? "text-emerald-600 bg-emerald-50/50" : "text-slate-500"
          }`}
        >
          <Lightbulb className="h-4 w-4 mb-0.5 text-orange-500 animate-pulse" />
          Darasa
        </button>
        <button
          id="mobile-nav-soga"
          onClick={() => setActiveTab("soga")}
          className={`flex-1 flex flex-col items-center py-2.5 text-xs font-bold relative ${
            activeTab === "soga" ? "text-emerald-600 bg-emerald-50/50" : "text-slate-500"
          }`}
        >
          <MessageSquare className="h-4 w-4 mb-0.5" />
          Soga Zangu
          {chatCount > 0 && (
            <span className="absolute top-1 right-8 bg-orange-500 text-white font-bold text-[9px] h-3.5 w-3.5 rounded-full flex items-center justify-center">
              {chatCount}
            </span>
          )}
        </button>
        <button
          id="mobile-nav-toka"
          onClick={onExitClick}
          className="flex-1 flex flex-col items-center py-2.5 text-xs font-bold text-red-500 hover:bg-red-50/50"
        >
          <LogOut className="h-4 w-4 mb-0.5" />
          Toka
        </button>
      </div>
    </nav>
  );
}
