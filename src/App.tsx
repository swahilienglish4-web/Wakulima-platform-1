import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ListingCard from "./components/ListingCard";
import AddListingModal from "./components/AddListingModal";
import ChatWindow from "./components/ChatWindow";
import ComingSoon from "./components/ComingSoon";
import BrandingModal from "./components/BrandingModal";
import Vikundi from "./components/Vikundi";
import UlikuwaUnajua, { InLineFactCard, FARMING_FACTS, Fact } from "./components/UlikuwaUnajua";
import RegistrationModal from "./components/RegistrationModal";
import { dbService } from "./dbService";
import { Listing, Chat } from "./types";
import { Search, MapPin, Grid, Sprout, AlertCircle, ShoppingCart, UserCheck, Sparkles, MessageSquare, Bell, X, Check, Save, Lightbulb } from "lucide-react";

export default function App() {
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("sokoni");
  const [userRole, setUserRole] = useState<"mkulima" | "mnunuzi">("mnunuzi");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  const [selectedCategory, setSelectedCategory] = useState<string>("Zote");
  const [selectedLocation, setSelectedLocation] = useState<string>("Zote");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<{ chatId: string; title: string; body: string } | null>(null);
  const mountTime = useRef<number>(Date.now());
  const [chatCount, setChatCount] = useState<number>(0);
  const [userId] = useState<string>(() => {
    let id = localStorage.getItem("kilimo_user_id");
    if (!id) {
      id = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("kilimo_user_id", id);
    }
    return id;
  });
  const [buyerName, setBuyerName] = useState<string>(() => {
    let name = localStorage.getItem("kilimo_buyer_name");
    if (!name) {
      // Create a unique default like "Mteja 382" so different devices have different names initially
      const code = Math.floor(100 + Math.random() * 900);
      name = `Mteja_${code}`;
      localStorage.setItem("kilimo_buyer_name", name);
    }
    return name;
  });
  const [isNameSaved, setIsNameSaved] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return localStorage.getItem("kilimo_registered") === "true";
  });
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireRegistration = (action: () => void) => {
    if (localStorage.getItem("kilimo_registered") === "true") {
      action();
    } else {
      setPendingAction(() => action);
      setShowRegisterModal(true);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "soga" || tab === "vikundi") {
      requireRegistration(() => {
        setActiveTab(tab);
      });
    } else {
      setActiveTab(tab);
    }
  };
  
  // States for floating Ulikuwa Unajua? notifications
  const [activeFactToast, setActiveFactToast] = useState<Fact | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const handleBuyerNameChange = (val: string) => {
    setBuyerName(val);
    localStorage.setItem("kilimo_buyer_name", val);
  };

  const handleSaveBuyerNameClick = () => {
    localStorage.setItem("kilimo_buyer_name", buyerName);
    setIsNameSaved(true);
    setTimeout(() => {
      setIsNameSaved(false);
    }, 2500);
  };

  // Branding Customization States
  const [platformLogo, setPlatformLogo] = useState<string>(() => {
    return localStorage.getItem("custom_platform_logo") || "";
  });
  const [platformName, setPlatformName] = useState<string>(() => {
    return localStorage.getItem("custom_platform_name") || "WAKULIMA";
  });
  const [platformTagline, setPlatformTagline] = useState<string>(() => {
    return localStorage.getItem("custom_platform_tagline") || "Kilimo Tech Africa";
  });
  const [adminPin, setAdminPin] = useState<string>("2026");
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [hasExited, setHasExited] = useState<boolean>(false);

  const handleSaveBranding = async (newLogo: string, newName: string, newTagline: string, newPin?: string) => {
    setPlatformLogo(newLogo);
    setPlatformName(newName);
    setPlatformTagline(newTagline);
    localStorage.setItem("custom_platform_logo", newLogo);
    localStorage.setItem("custom_platform_name", newName);
    localStorage.setItem("custom_platform_tagline", newTagline);
    if (newPin) {
      setAdminPin(newPin);
    }

    try {
      await dbService.saveBranding({ 
        logo: newLogo, 
        name: newName, 
        tagline: newTagline, 
        adminPin: newPin || adminPin 
      });
    } catch (err) {
      console.error("Error saving branding globally:", err);
    }
  };

  const handleResetBranding = async () => {
    setPlatformLogo("");
    setPlatformName("WAKULIMA");
    setPlatformTagline("Kilimo Tech Africa");
    setAdminPin("2026");
    localStorage.removeItem("custom_platform_logo");
    localStorage.removeItem("custom_platform_name");
    localStorage.removeItem("custom_platform_tagline");

    try {
      await dbService.saveBranding({ 
        logo: "", 
        name: "WAKULIMA", 
        tagline: "Kilimo Tech Africa", 
        adminPin: "2026" 
      });
    } catch (err) {
      console.error("Error resetting branding globally:", err);
    }
  };

  // Load branding on startup
  const fetchBranding = async () => {
    try {
      const customBranding = await dbService.getBranding();
      if (customBranding) {
        setPlatformLogo(customBranding.logo);
        setPlatformName(customBranding.name);
        setPlatformTagline(customBranding.tagline);
        if (customBranding.adminPin) {
          setAdminPin(customBranding.adminPin);
        }
      }
    } catch (err) {
      console.error("Error fetching global branding:", err);
    }
  };

  // Load listings on startup
  const fetchListings = async () => {
    try {
      setLoading(true);
      const items = await dbService.getListings();
      setListings(items);
    } catch (err) {
      console.error("Error loading listings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch count of chats
  const fetchChatCount = async () => {
    try {
      const allChats = await dbService.getChats();
      setChatCount(allChats.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        await Promise.all([
          fetchListings(),
          fetchChatCount(),
          fetchBranding()
        ]);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setTimeout(() => {
          setInitialLoading(false);
        }, 1600);
      }
    };
    initApp();
  }, []);

  // Floating "Ulikuwa Unajua?" notification loop
  useEffect(() => {
    // Show first fact after 6 seconds
    const initialTimer = setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * FARMING_FACTS.length);
      setActiveFactToast(FARMING_FACTS[randomIdx]);
      setToastVisible(true);
    }, 6000);

    // Then trigger a new fact every 45 seconds
    const intervalTimer = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * FARMING_FACTS.length);
      setActiveFactToast(FARMING_FACTS[randomIdx]);
      setToastVisible(true);
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  // Automatically dismiss the fact toast after 14 seconds
  useEffect(() => {
    if (toastVisible) {
      const dismissTimer = setTimeout(() => {
        setToastVisible(false);
      }, 14000);
      return () => clearTimeout(dismissTimer);
    }
  }, [toastVisible]);

  // Listen for real-time chat updates and show in-app notifications
  useEffect(() => {
    const unsubscribe = dbService.listenToChats((updatedChats) => {
      // 1. Update the chat count reactively based on our UNREAD chats
      const currentFarmerPhone = localStorage.getItem("kilimo_farmer_phone") || "+255";
      const unreadChats = updatedChats.filter(chat => {
        // Verify this chat belongs to the user
        const isMyChatAsBuyer = chat.buyerId === userId;
        const isMyChatAsFarmer = chat.farmerPhone === currentFarmerPhone;
        
        if (userRole === "mnunuzi" && isMyChatAsBuyer) {
          const isLastSenderMe = chat.lastSenderId === userId;
          if (isLastSenderMe) return false;
          return !chat.buyerLastReadTime || chat.buyerLastReadTime < chat.updatedAt;
        } else if (userRole === "mkulima" && isMyChatAsFarmer) {
          const isLastSenderMe = chat.lastSenderId === currentFarmerPhone;
          if (isLastSenderMe) return false;
          return !chat.farmerLastReadTime || chat.farmerLastReadTime < chat.updatedAt;
        }
        return false;
      });
      setChatCount(unreadChats.length);

      // 2. Scan for any extremely recent new messages to trigger notification
      const now = Date.now();
      
      updatedChats.forEach((chat) => {
        // Only trigger if updated within last 12 seconds and after our mount time
        const isRecent = now - chat.updatedAt < 12000;
        const isAfterMount = chat.updatedAt > mountTime.current;
        
        if (isRecent && isAfterMount) {
          // Check if we are the recipient of the last message
          const isBuyerRecipient = chat.buyerId === userId && chat.lastSenderId !== userId;
          const isFarmerRecipient = chat.farmerPhone === currentFarmerPhone && chat.lastSenderId !== currentFarmerPhone;
          
          if (isBuyerRecipient || isFarmerRecipient) {
            // Check if we are currently looking at this specific chat in the Soga tab
            const isCurrentlyViewingChat = activeTab === "soga" && activeChatId === chat.id;
            
            if (!isCurrentlyViewingChat) {
              const senderName = isBuyerRecipient ? chat.farmerName : chat.buyerName;
              setActiveNotification({
                chatId: chat.id,
                title: `Ujumbe Mpya kutoka ${senderName}`,
                body: chat.lastMessage,
              });

              // Play a subtle high-quality chime notification sound
              try {
                const context = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = context.createOscillator();
                const gain = context.createGain();
                osc.connect(gain);
                gain.connect(context.destination);
                osc.frequency.setValueAtTime(587.33, context.currentTime); // D5
                gain.gain.setValueAtTime(0.08, context.currentTime);
                osc.start();
                osc.stop(context.currentTime + 0.12);
                
                setTimeout(() => {
                  const osc2 = context.createOscillator();
                  const gain2 = context.createGain();
                  osc2.connect(gain2);
                  gain2.connect(context.destination);
                  osc2.frequency.setValueAtTime(880, context.currentTime); // A5
                  gain2.gain.setValueAtTime(0.08, context.currentTime);
                  osc2.start();
                  osc2.stop(context.currentTime + 0.18);
                }, 120);
              } catch (audioError) {
                // Ignore safely if blocked by browser autoplay policy
              }
            }
          }
        }
      });

      // Update mountTime to prevent duplicated alarms, but set it to the max updatedAt found
      const maxUpdatedAt = Math.max(...updatedChats.map(c => c.updatedAt), mountTime.current);
      mountTime.current = maxUpdatedAt;
    });

    return () => unsubscribe();
  }, [userId, activeTab, activeChatId, userRole]);

  // Auto-hide notifications after 6 seconds
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  // Keep track of active state using a ref to prevent recreation of popstate listener
  const stateRef = useRef({ isAddModalOpen, isBrandingModalOpen, activeChatId, activeTab });
  useEffect(() => {
    stateRef.current = { isAddModalOpen, isBrandingModalOpen, activeChatId, activeTab };
  }, [isAddModalOpen, isBrandingModalOpen, activeChatId, activeTab]);

  // Back button interception for Android & PWAs (Run once on mount)
  useEffect(() => {
    // Push a dummy state so there's always a state to pop when hitting the hardware back button
    window.history.pushState({ page: "app" }, "");

    const handlePopState = (e: PopStateEvent) => {
      // Re-push state immediately so we can intercept the subsequent back button clicks as well
      window.history.pushState({ page: "app" }, "");

      const { isAddModalOpen: addOpen, isBrandingModalOpen: brandOpen, activeChatId: chatActive, activeTab: tabActive } = stateRef.current;

      if (addOpen) {
        setIsAddModalOpen(false);
      } else if (brandOpen) {
        setIsBrandingModalOpen(false);
      } else if (chatActive) {
        setActiveChatId(null);
      } else if (tabActive !== "sokoni") {
        setActiveTab("sokoni");
      } else {
        // Show exit confirmation modal
        setShowExitConfirm(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Filter listings based on search, category and location
  const filteredListings = listings.filter((listing) => {
    // Only show approved listings, or listings created by the current user
    const currentUserPhone = localStorage.getItem("kilimo_user_phone") || "";
    const isApproved = listing.status === "approved" || !listing.status;
    const isMyListing = currentUserPhone && listing.farmerPhone === currentUserPhone;

    if (!isApproved && !isMyListing) {
      return false;
    }

    const matchesSearch =
      searchQuery.trim() === "" ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.farmerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Zote" || listing.category === selectedCategory;

    const matchesLocation =
      selectedLocation === "Zote" ||
      listing.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Extract all distinct locations for the filter
  const locations = ["Zote", ...Array.from(new Set(listings.map((l) => {
    // Just get the first word or clean string (e.g. "Iringa" from "Iringa Ruaha")
    return l.location.split(",")[0].split(" ")[0].trim();
  })))].filter(Boolean);

  // Post crop
  const handleSaveListing = async (newListingData: Omit<Listing, "id" | "createdAt">) => {
    try {
      await dbService.addListing(newListingData);
      fetchListings();
    } catch (err) {
      console.error("Failed to post:", err);
    }
  };

  // Initiate chat connection
  const handleOpenChat = async (listing: Listing) => {
    requireRegistration(async () => {
      try {
        // Create chat log
        const newChat = await dbService.createChat({
          listingId: listing.id,
          listingTitle: listing.title,
          farmerName: listing.farmerName,
          farmerPhone: listing.farmerPhone,
          buyerName: buyerName,
          buyerId: userId,
        });

        // Auto send a friendly starting message from buyer
        await dbService.sendMessage(newChat.id, {
          senderId: userId,
          senderName: buyerName,
          receiverId: listing.farmerPhone,
          receiverName: listing.farmerName,
          text: `Habari ${listing.farmerName}, napenda kuulizia kuhusu bidhaa yako ya "${listing.title}" uliyoweka sokoni. Je, ipo tayari kwa mauzo?`,
          listingId: listing.id
        });

        setActiveChatId(newChat.id);
        setActiveTab("soga");
        fetchChatCount();
      } catch (err) {
        console.error("Failed to initialize chat:", err);
      }
    });
  };

  if (hasExited) {
    return (
      <div id="farewell-exit-view" className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 border border-emerald-400/30">
            <Sprout className="h-10 w-10 animate-pulse" />
          </div>
          <h2 className="text-2xl font-sans font-black tracking-tight text-white mb-2">Kwaheri na Karibu Tena!</h2>
          <p className="text-xs font-black text-emerald-400 tracking-wider uppercase mb-6">{platformTagline}</p>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5.5 mb-8 text-xs text-left space-y-3.5 leading-relaxed text-emerald-100/90">
            <div className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
              <span className="font-semibold">Umetoka kwenye programu kwa usalama ili kulinda betri yako na kuzuia matumizi yasiyo ya lazima ya data.</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0"></span>
              <span className="font-semibold">Sasa unaweza kufunga tabo hii, au kubonyeza kitufe cha kati (Home button) cha simu yako kurudi kwenye kioo kikuu cha simu yako.</span>
            </div>
          </div>

          <button
            onClick={() => {
              setHasExited(false);
              setShowExitConfirm(false);
            }}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all transform active:scale-98"
          >
            Fungua Programu Tena
          </button>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div id="app-splash-screen" className="fixed inset-0 z-[999] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden">
        {/* Background ambient glowing circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-ring"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-ring" style={{ animationDelay: "1s" }}></div>
        
        {/* Abstract rotating farm grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none animate-spin-slow">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="splash-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <circle cx="50%" cy="50%" r="45%" fill="url(#splash-grid)" />
          </svg>
        </div>

        <div className="relative text-center max-w-sm w-full flex flex-col items-center justify-center space-y-8">
          
          {/* Main animated Logo Container */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing concentric rings in the background */}
            <div className="absolute w-36 h-36 bg-emerald-500/20 rounded-[2.5rem] animate-ping opacity-40"></div>
            <div className="absolute w-44 h-44 bg-emerald-500/10 rounded-[3rem] animate-ping opacity-25" style={{ animationDelay: "0.5s" }}></div>
            
            {/* The actual floating logo/icon box ("move kuja mbele na kurudi nyuma") */}
            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-[2.2rem] flex items-center justify-center shadow-2xl border-2 border-emerald-300/40 z-10 animate-float-3d">
              {platformLogo ? (
                <img 
                  src={platformLogo} 
                  alt={platformName} 
                  className="w-16 h-16 object-contain rounded-2xl" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to Sprout if logo breaks
                    (e.target as any).style.display = 'none';
                    const fallback = document.getElementById('splash-fallback-icon');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div id="splash-fallback-icon" className={platformLogo ? "hidden" : ""}>
                <Sprout className="h-12 w-12 stroke-[2.5] text-white drop-shadow-md" />
              </div>
            </div>
          </div>

          {/* Texts with elegant fade-in-up stagger styling */}
          <div className="space-y-2.5 z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h1 className="text-3xl font-display font-black tracking-tight text-white drop-shadow-sm">
              {platformName}
            </h1>
            <p className="text-[10px] font-black text-emerald-400 tracking-widest uppercase bg-emerald-950/60 px-4 py-1.5 rounded-full border border-emerald-800/50 w-fit mx-auto">
              {platformTagline}
            </p>
          </div>

          {/* High quality dynamic loading progress indicator */}
          <div className="w-48 bg-white/10 h-1.5 rounded-full overflow-hidden relative border border-white/5 p-[1px] z-10">
            <div className="bg-gradient-to-r from-orange-400 via-emerald-400 to-teal-400 h-full rounded-full animate-loading-bar w-2/3 absolute left-0"></div>
          </div>
          
          <div className="text-[10px] font-bold text-emerald-200/70 tracking-wider font-mono z-10 animate-pulse">
            Inatayarisha soko la kisasa...
          </div>
        </div>

        {/* Brand footer inside splash */}
        <div className="absolute bottom-6 text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest z-10">
          Kilimo Tech Africa © 2026
        </div>
      </div>
    );
  }

  return (
    <div id="wakulima-platform-app" className="min-h-screen bg-emerald-50/45 flex flex-col text-slate-800 font-sans relative w-full max-w-full overflow-x-hidden">
      
      {/* In-app Notification Banner */}
      {activeNotification && (
        <div 
          id="in-app-notification-toast"
          className="fixed top-4 right-4 z-50 max-w-md w-[calc(100%-2rem)] sm:w-96 bg-white border-2 border-orange-150 rounded-[1.8rem] p-4.5 shadow-xl shadow-orange-100/30 flex items-start space-x-3.5 transition-all duration-300 transform translate-y-0"
        >
          <div className="bg-orange-500 text-white p-2.5 rounded-2xl flex-shrink-0 shadow-md shadow-orange-500/20">
            <Bell className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-emerald-950 truncate">{activeNotification.title}</h4>
            <p className="text-xs font-semibold text-emerald-900/80 mt-1 line-clamp-2 bg-emerald-50/40 p-2 rounded-xl border border-emerald-100/40">
              {activeNotification.body}
            </p>
            <div className="flex items-center space-x-2 mt-2.5">
              <button
                onClick={() => {
                  setActiveChatId(activeNotification.chatId);
                  handleTabChange("soga");
                  setActiveNotification(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Fungua Soga</span>
              </button>
              <button
                onClick={() => setActiveNotification(null)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-2 rounded-xl transition-all"
              >
                Funga
              </button>
            </div>
          </div>
          <button 
            onClick={() => setActiveNotification(null)}
            className="text-emerald-900/40 hover:text-emerald-950 transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenAddModal={() => requireRegistration(() => setIsAddModalOpen(true))}
        chatCount={chatCount}
        platformLogo={platformLogo}
        platformName={platformName}
        platformTagline={platformTagline}
        onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
        onExitClick={() => setShowExitConfirm(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* SOKONI TAB */}
        {activeTab === "sokoni" && (
          <div className="space-y-0">
            {/* Hero Section */}
            <Hero
              onStartBuying={() => {
                const element = document.getElementById("soko-listings-section");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              onStartSelling={() => {
                requireRegistration(() => {
                  setUserRole("mkulima");
                  setIsAddModalOpen(true);
                });
              }}
              onOpenAI={() => setActiveTab("mshauri")}
              platformName={platformName}
              platformTagline={platformTagline}
            />

            {/* Soko Grid & Filter Panel */}
            <div id="soko-listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-emerald-100 pb-5">
                <div>
                  <h2 className="font-sans font-black text-3xl text-emerald-900 tracking-tight">Soko Kuu la Bidhaa za Kilimo</h2>
                  <p className="text-sm text-emerald-800/80 mt-1.5 font-medium">Gundua mazao safi, mbegu bora, na pembejeo za kisasa bila madalali</p>
                </div>

                {/* Profile setting */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border-2 border-emerald-100/80 shadow-sm w-fit">
                    <UserCheck className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-bold text-emerald-900/70">Jina lako la Mnunuzi:</span>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => handleBuyerNameChange(e.target.value)}
                      className="bg-transparent border-none text-xs font-black text-emerald-900 focus:outline-none w-36 font-sans"
                      title="Bonyeza kubadilisha jina lako la mnunuzi unapoanzisha soga"
                      placeholder="Mteja..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveBuyerNameClick}
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-black transition-all ${
                      isNameSaved
                        ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-200"
                        : "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/10 border-2 border-transparent cursor-pointer"
                    }`}
                  >
                    {isNameSaved ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>Imehifadhiwa!</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>Hifadhi Jina</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              <div className="bg-white border-2 border-emerald-100 rounded-[2rem] p-6 shadow-md shadow-emerald-100/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Search input */}
                <div className="md:col-span-5 relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-600/70 h-4.5 w-4.5" />
                  <input
                    type="text"
                    value={searchQuery === " " ? "" : searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tafuta mahindi, nyanya, mbolea, jina la mkulima..."
                    className="w-full pl-11 pr-4 py-3 bg-emerald-50/50 border-2 border-emerald-100/70 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all"
                  />
                </div>

                {/* Category Selector */}
                <div className="md:col-span-4 flex items-center space-x-2">
                  <span className="text-xs font-black text-emerald-900/70 flex-shrink-0">Kundi:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-100/70 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all"
                  >
                    <option value="Zote">Makundi Yote</option>
                    <option value="Mazao">Mazao ya Kilimo</option>
                    <option value="Mbegu">Mbegu Bora</option>
                    <option value="Mbolea & Pembejeo">Pembejeo & Mbolea</option>
                    <option value="Vifaa vya Kilimo">Zana & Vifaa</option>
                    <option value="Mifugo">Mifugo</option>
                  </select>
                </div>

                {/* Location selector */}
                <div className="md:col-span-3 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-emerald-50/50 border-2 border-emerald-100/70 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all"
                  >
                    <option value="Zote">Mikoa Yote</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Listings Display */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800"></div>
                  <p className="text-xs text-slate-500">Inapakia bidhaa za kilimo kutoka sokoni...</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                  <h3 className="font-display font-bold text-lg text-slate-800">Soko halina bidhaa kwa sasa</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hakuna bidhaa inayolingana na vigezo vyako vya utafutaji au soko letu lipo wazi kwa msimu mpya. Mkulima? Kuwa wa kwanza kuweka tangazo lako sasa!
                  </p>
                  <button
                    onClick={() => {
                      requireRegistration(() => {
                        setUserRole("mkulima");
                        setIsAddModalOpen(true);
                      });
                    }}
                    className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
                  >
                    <span>Sajili Bidhaa Yako Hapa</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.flatMap((listing, idx) => {
                    const elements = [
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        onOpenChat={handleOpenChat}
                        userRole={userRole}
                      />
                    ];
                    // Inject a beautiful "Did you know?" card after every 3 listings
                    if ((idx + 1) % 3 === 0) {
                      elements.push(
                        <InLineFactCard key={`inline-fact-${idx}`} factIndex={Math.floor(idx / 3)} />
                      );
                    }
                    return elements;
                  })}
                </div>
              )}

            </div>
          </div>
        )}

        {/* AI ADVISOR TAB */}
        {activeTab === "mshauri" && (
          <div className="py-6">
            <ComingSoon/>
          </div>
        )}

        {/* VIKUNDI (COMMUNITY GROUP) TAB */}
        {activeTab === "vikundi" && (
          <div className="py-4">
            <Vikundi currentRole={userRole} defaultUserName={buyerName} />
          </div>
        )}

        {/* ELIMU (ULIKUWA UNAJUA) TAB */}
        {activeTab === "elimu" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <UlikuwaUnajua />
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === "soga" && (
          <div className="py-4">
            <ChatWindow
              activeChatId={activeChatId}
              onBackToSogaList={() => setActiveChatId(null)}
              buyerName={buyerName}
              userId={userId}
              userRole={userRole}
            />
          </div>
        )}

      </main>

      {/* Add Crop Listing Modal */}
      {isAddModalOpen && (
        <AddListingModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveListing}
        />
      )}

      {/* Branding Modal */}
      {isBrandingModalOpen && (
        <BrandingModal
          onClose={() => setIsBrandingModalOpen(false)}
          logo={platformLogo}
          name={platformName}
          tagline={platformTagline}
          adminPin={adminPin}
          onSave={handleSaveBranding}
          onReset={handleResetBranding}
          listings={listings}
          onUpdateListingStatus={async (id, status) => {
            try {
              await dbService.updateListingStatus(id, status);
              await fetchListings();
            } catch (err) {
              console.error("Failed to update listing status in UI:", err);
            }
          }}
        />
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div id="exit-confirmation-modal" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-[2.5rem] max-w-sm w-full p-8 shadow-2xl border-2 border-emerald-100/60 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4.5 shadow-md shadow-red-100/20">
              <AlertCircle className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-sans font-black text-emerald-950 tracking-tight mb-2">Je, unataka kutoka?</h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6">
              Una uhakika unataka kufunga jukwaa la <span className="font-black text-emerald-700">{platformName}</span> kwa sasa?
            </p>

            <div className="flex flex-col space-y-2.5">
              <button
                onClick={() => {
                  setHasExited(true);
                  setShowExitConfirm(false);
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/10 transition-all transform active:scale-98"
              >
                Ndio, Toka Sasa
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl transition-all transform active:scale-98"
              >
                Hapana, Baki Kwenye Programu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Ulikuwa Unajua? Toast Notification */}
      {toastVisible && activeFactToast && (
        <div 
          id="floating-fact-toast" 
          className="fixed sm:bottom-6 sm:right-6 bottom-24 left-4 right-4 sm:left-auto sm:max-w-md z-40 bg-gradient-to-br from-emerald-50 to-emerald-100/90 border-2 border-emerald-200/80 rounded-3xl p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 bg-emerald-600/10 text-emerald-800 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase">
              <Lightbulb className="h-3 w-3 text-orange-500 animate-pulse" />
              <span>Ulikuwa Unajua? 🤔</span>
            </div>
            <button 
              onClick={() => setToastVisible(false)}
              className="text-emerald-900/40 hover:text-emerald-900 hover:bg-emerald-200/50 p-1.5 rounded-full transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-3 space-y-2">
            <p className="text-emerald-950 font-black text-sm tracking-tight leading-snug">
              {activeFactToast.fact}
            </p>
            <p className="text-slate-600 font-bold text-xs line-clamp-2 leading-relaxed">
              {activeFactToast.explanation}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200/50 flex items-center justify-between">
            <button
              onClick={() => {
                setActiveTab("elimu");
                setToastVisible(false);
              }}
              className="flex items-center space-x-1.5 text-[11px] font-black text-emerald-700 hover:text-emerald-900 active:scale-95 transition-all bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              <span>Soma Sayansi Yake 🔬</span>
            </button>

            <span className="text-[10px] text-slate-500 font-bold">Inapotea hivi karibuni...</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white text-emerald-950 py-10 border-t-2 border-emerald-100 text-xs font-semibold mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></span>
              <span className="font-sans font-black text-emerald-900 tracking-tight text-sm">{platformTagline.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-6 text-emerald-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="font-bold">Wakulima: 12,450+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span className="font-bold">Mikoa: 26 Tanzania</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-6 text-emerald-800/60 font-black">
            <span className="hover:text-emerald-700 cursor-pointer transition-colors">Usalama wa Chakula</span>
            <span className="hover:text-emerald-700 cursor-pointer transition-colors">Mkataba wa Huduma</span>
            <span className="hover:text-emerald-700 cursor-pointer transition-colors">Msaada wa Mkulima</span>
          </div>
        </div>
      </footer>

      {showRegisterModal && (
        <RegistrationModal
          onRegisterSuccess={(name, phone, email) => {
            setIsRegistered(true);
            setShowRegisterModal(false);
            setBuyerName(name);
            if (pendingAction) {
              pendingAction();
              setPendingAction(null);
            }
          }}
          onClose={() => {
            setShowRegisterModal(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}
