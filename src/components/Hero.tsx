import React from "react";
import { Search, MapPin, Sparkles, Sprout, ArrowRight, TrendingUp, ShieldCheck } from "lucide-react";

interface HeroProps {
  onStartBuying: () => void;
  onStartSelling: () => void;
  onOpenAI: () => void;
  platformName: string;
  platformTagline: string;
}

export default function Hero({ onStartBuying, onStartSelling, onOpenAI, platformName, platformTagline }: HeroProps) {
  return (
    <div id="app-hero" className="relative overflow-hidden bg-emerald-600 text-white py-12 md:py-16 px-4 sm:px-8 mx-4 sm:mx-8 mt-6 rounded-[2.5rem] shadow-xl shadow-emerald-950/15 border border-emerald-500">
      
      {/* Decorative shapes exactly from Design HTML */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500 rounded-full opacity-40" />
      <div className="absolute right-10 bottom-10 w-48 h-48 bg-orange-400 rounded-full opacity-35 filter blur-sm" />
      <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-emerald-700 rounded-full opacity-30" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-800/50 border border-emerald-500/30 px-4 py-2 rounded-full text-xs font-bold text-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-orange-300 animate-spin" />
              <span>Teknolojia ya Kisasa ya Kilimo na Soko la Afrika</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight leading-[1.1] text-white">
              Soko la Kidijitali kwa <br />
              <span className="text-orange-300 italic">Mkulima wa Kesho.</span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-50 font-medium leading-relaxed max-w-2xl opacity-90">
              Karibu kwenye <span className="font-extrabold text-white">{platformName}</span> ya <strong>{platformTagline.toUpperCase()}</strong>. Jukwaa hili linaondoa madalali na kuwawezesha wakulima kuwasiliana moja kwa moja na wanunuzi ili kupata bei ya haki na soko la uhakika.
            </p>

            {/* Core Action CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                id="hero-btn-buy"
                onClick={onStartBuying}
                className="flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white font-black px-7 py-3.5 rounded-full text-sm shadow-md shadow-orange-700/20 transition-all transform active:scale-95"
              >
                <span>Nenda Sokoni Kununua</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                id="hero-btn-sell"
                onClick={onStartSelling}
                className="flex items-center justify-center space-x-2 bg-emerald-850 hover:bg-emerald-900 text-white font-bold px-7 py-3.5 rounded-xl text-sm border-2 border-emerald-700 shadow-md transition-all transform active:scale-95"
              >
                <span>Sajili/Uza Mazao Yako</span>
                <Sprout className="h-4 w-4 text-orange-300" />
              </button>

              <button
                id="hero-btn-ai"
                onClick={onOpenAI}
                className="flex items-center justify-center space-x-2 bg-emerald-900/60 hover:bg-emerald-950 text-white font-semibold px-6 py-3.5 rounded-xl text-sm border border-emerald-500/40 transition-all transform active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-orange-300" />
                <span>Uliza AI Mshauri</span>
              </button>
            </div>

            {/* Quick value props */}
            <div className="flex flex-wrap gap-4 pt-4 text-xs font-bold text-emerald-100">
              <div className="flex items-center space-x-2 bg-emerald-800/40 px-3 py-2 rounded-xl border border-emerald-700/30">
                <ShieldCheck className="h-4 w-4 text-orange-300" />
                <span>Hakuna Madalali (Bei Safi)</span>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-800/40 px-3 py-2 rounded-xl border border-emerald-700/30">
                <TrendingUp className="h-4 w-4 text-orange-300" />
                <span>Ushauri wa Kilimo wa AI</span>
              </div>
            </div>
          </div>

          {/* Hero Right Stats & Brand Card */}
          <div className="lg:col-span-5">
            <div className="bg-emerald-800/40 backdrop-blur-md border-2 border-emerald-500/30 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-duration-1000"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-6">
                <div>
                  <h3 className="font-sans font-black text-lg text-white">Taarifa za Jukwaa</h3>
                  <p className="text-xs text-emerald-200 mt-0.5">Takwimu za moja kwa moja Tanzania & Afrika Mashariki</p>
                </div>
                <Sprout className="h-7 w-7 text-orange-300 animate-pulse" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/20">
                  <span className="text-xs text-emerald-100 font-bold">Wakulima Waliosajiliwa</span>
                  <span className="font-sans font-black text-lg text-orange-300">5,432+</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/20">
                  <span className="text-xs text-emerald-100 font-bold">Mazao na Bidhaa Sokoni</span>
                  <span className="font-sans font-black text-lg text-orange-300">1,280+</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/20">
                  <span className="text-xs text-emerald-100 font-bold">Mikoa Inayohudumiwa</span>
                  <span className="font-sans font-black text-sm text-emerald-100 flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-400 mr-1" />
                    <span>Mikoa 26</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-500/20 text-center">
                <p className="text-xs text-emerald-100 italic opacity-95">
                  "Kujenga usalama wa chakula na kumuongezea kipato mkulima wa Afrika kupitia teknolojia."
                </p>
                <div className="mt-2 text-[10px] text-orange-300 font-mono tracking-widest uppercase font-black">
                  — {platformTagline.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
