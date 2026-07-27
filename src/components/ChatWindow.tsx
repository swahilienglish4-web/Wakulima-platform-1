import React, { useState, useEffect, useRef } from "react";
import { Chat, Message } from "../types";
import { dbService } from "../dbService";
import { Send, Phone, MessageSquare, ArrowLeft, Loader2, RefreshCw, ShoppingCart, UserCheck, Trash2 } from "lucide-react";

interface ChatWindowProps {
  activeChatId: string | null;
  onBackToSogaList: () => void;
  buyerName: string;
  userId: string;
  userRole: "mkulima" | "mnunuzi";
}

export default function ChatWindow({
  activeChatId,
  onBackToSogaList,
  buyerName,
  userId,
  userRole,
}: ChatWindowProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Toggle mode inside the Chat window so that users can view as a buyer or farmer
  const [viewMode, setViewMode] = useState<"mnunuzi" | "mkulima">(userRole);

  // Persist farmer phone search input to let sellers view inquiries addressed to them
  const [farmerPhoneInput, setFarmerPhoneInput] = useState<string>(() => {
    return localStorage.getItem("kilimo_farmer_phone") || "+255";
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTypingUpdateTime = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [otherUserIsTyping, setOtherUserIsTyping] = useState(false);

  useEffect(() => {
    const checkTyping = () => {
      if (!selectedChat) {
        setOtherUserIsTyping(false);
        return;
      }
      const now = Date.now();
      let active = false;
      if (viewMode === "mnunuzi") {
        active = !!selectedChat.farmerTypingLastActive && (now - selectedChat.farmerTypingLastActive < 5000);
      } else {
        active = !!selectedChat.buyerTypingLastActive && (now - selectedChat.buyerTypingLastActive < 5000);
      }
      setOtherUserIsTyping(active);
    };

    // Run check immediately
    checkTyping();

    // Check every 1000ms to handle exact timing transitions
    const timer = setInterval(checkTyping, 1000);

    return () => clearInterval(timer);
  }, [selectedChat, viewMode]);

  const getOtherUserName = () => {
    if (!selectedChat) return "";
    return viewMode === "mnunuzi" ? selectedChat.farmerName : selectedChat.buyerName;
  };

  // Load all chats from Firestore
  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const allChats = await dbService.getChats();
      setChats(allChats);
      
      if (activeChatId) {
        const found = allChats.find(c => c.id === activeChatId);
        if (found) {
          setSelectedChat(found);
          const currentRole = found.buyerId === userId ? "mnunuzi" : "mkulima";
          dbService.markChatAsRead(found.id, currentRole);
          // Auto adjust view mode to match who started or owns the chat
          if (found.buyerId === userId) {
            setViewMode("mnunuzi");
          } else if (found.farmerPhone === farmerPhoneInput.trim()) {
            setViewMode("mkulima");
          }
        }
      }
    } catch (err) {
      console.error("Failed loading chats:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  // Load messages for selected chat
  const loadMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      const msgs = await dbService.getMessages(chatId);
      setMessages(msgs);
    } catch (err) {
      console.error("Failed loading messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Reset and load chats on initial load and when activeChatId or viewMode changes
  useEffect(() => {
    loadChats();
  }, [activeChatId, viewMode, farmerPhoneInput]);

  useEffect(() => {
    if (selectedChat) {
      const chatId = selectedChat.id;
      loadMessages(chatId);
      
      // Mark as read immediately on open
      dbService.markChatAsRead(chatId, viewMode);

      const interval = setInterval(async () => {
        // Poll latest messages
        try {
          const msgs = await dbService.getMessages(chatId);
          setMessages(msgs);
        } catch (err) {
          console.error("Error polling messages:", err);
        }

        // Poll chat metadata to get live typing updates and read receipts
        try {
          const latestChat = await dbService.getChatById(chatId);
          if (latestChat) {
            setSelectedChat(prev => {
              if (prev && prev.id === latestChat.id) {
                return {
                  ...prev,
                  buyerTypingLastActive: latestChat.buyerTypingLastActive,
                  farmerTypingLastActive: latestChat.farmerTypingLastActive,
                  buyerLastReadTime: latestChat.buyerLastReadTime,
                  farmerLastReadTime: latestChat.farmerLastReadTime,
                  updatedAt: latestChat.updatedAt,
                  lastSenderId: latestChat.lastSenderId,
                  lastMessage: latestChat.lastMessage
                };
              }
              return prev;
            });
          }
        } catch (err) {
          console.error("Error polling chat metadata:", err);
        }
      }, 2500);

      return () => {
        clearInterval(interval);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [selectedChat?.id, viewMode]);

  // Automatically mark as read if new messages arrive from the other party while soga is open
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const isMe = viewMode === "mnunuzi"
        ? lastMsg.senderId === userId
        : lastMsg.senderId === farmerPhoneInput.trim();
      
      if (!isMe) {
        dbService.markChatAsRead(selectedChat.id, viewMode);
      }
    }
  }, [messages.length, selectedChat?.id, viewMode, userId, farmerPhoneInput]);

  // Scroll to bottom on new messages or typing indicator changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserIsTyping]);

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (!selectedChat) return;

    // Throttle Firestore writes for typing indicator to once every 2 seconds
    const now = Date.now();
    if (now - lastTypingUpdateTime.current > 2000) {
      lastTypingUpdateTime.current = now;
      dbService.updateTypingStatus(selectedChat.id, viewMode, true);
    }

    // Debounce to stop typing status after 4 seconds of silence
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedChat) {
        dbService.updateTypingStatus(selectedChat.id, viewMode, false);
      }
    }, 4000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    dbService.updateTypingStatus(selectedChat.id, viewMode, false);

    try {
      setSendingMessage(true);
      const text = inputText.trim();
      setInputText("");

      // Establish sender/receiver identity based on current viewMode
      const senderId = viewMode === "mnunuzi" ? userId : selectedChat.farmerPhone;
      const senderName = viewMode === "mnunuzi" ? buyerName : selectedChat.farmerName;
      const receiverId = viewMode === "mnunuzi" ? selectedChat.farmerPhone : (selectedChat.buyerId || "unknown");
      const receiverName = viewMode === "mnunuzi" ? selectedChat.farmerName : selectedChat.buyerName;

      const newMsg = await dbService.sendMessage(selectedChat.id, {
        senderId,
        senderName,
        receiverId,
        receiverName,
        text,
        listingId: selectedChat.listingId
      });

      // Optimistically append message
      setMessages(prev => [...prev, newMsg]);
      
      // Update chats list immediately to show last message
      setChats(prev => {
        const updated = prev.map(c => {
          if (c.id === selectedChat.id) {
            return { ...c, lastMessage: text, updatedAt: Date.now() };
          }
          return c;
        });
        return updated.sort((a, b) => b.updatedAt - a.updatedAt);
      });

    } catch (err) {
      console.error("Failed sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedChat) return;
    try {
      // Optimistically remove from UI
      setMessages(prev => prev.filter(m => m.id !== messageId));
      
      await dbService.deleteMessage(selectedChat.id, messageId);
      
      // Fetch latest chats list to update lastMessage in side menu
      const allChats = await dbService.getChats();
      setChats(allChats);
    } catch (err) {
      console.error("Failed to delete message:", err);
      // Restore messages if it failed
      loadMessages(selectedChat.id);
    } finally {
      setMessageToDelete(null);
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    dbService.markChatAsRead(chat.id, viewMode);
  };

  // Filter chats list based on user's identity and role
  const filteredChats = chats.filter(chat => {
    if (viewMode === "mnunuzi") {
      return chat.buyerId === userId || (!chat.buyerId && chat.buyerName === buyerName);
    } else {
      return chat.farmerPhone === farmerPhoneInput.trim();
    }
  });

  return (
    <div id="chat-window-layout" className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-160px)]">
      
      {/* Chats List (Left Column) - Hidden on mobile if a chat is active */}
      <div className={`md:col-span-4 bg-white border-2 border-emerald-100 rounded-[2rem] p-5 flex flex-col h-full shadow-md shadow-emerald-100/10 ${
        selectedChat ? "hidden md:flex" : "flex"
      }`}>
        <div className="pb-4 border-b-2 border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-black text-emerald-900 text-lg">Mazungumzo (Soga)</h3>
              <p className="text-xs text-emerald-800/70 font-bold">Mawasiliano ya moja kwa moja</p>
            </div>
            <button
              onClick={loadChats}
              title="Pakia upya soga"
              className="p-2 hover:bg-emerald-50 text-emerald-800 hover:text-emerald-950 rounded-xl border-2 border-emerald-100/60 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Segment control for view mode */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-emerald-50/55 p-1 rounded-2xl border border-emerald-100">
            <button
              onClick={() => {
                setViewMode("mnunuzi");
                setSelectedChat(null);
              }}
              className={`py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1 ${
                viewMode === "mnunuzi"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-850 hover:bg-emerald-100/40"
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Nipo Mnunuzi</span>
            </button>
            <button
              onClick={() => {
                setViewMode("mkulima");
                setSelectedChat(null);
              }}
              className={`py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1 ${
                viewMode === "mkulima"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-855 hover:bg-emerald-100/40"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Nipo Mkulima</span>
            </button>
          </div>

          {/* Seller Phone Identification input if viewMode is Farmer */}
          {viewMode === "mkulima" && (
            <div className="mt-3 space-y-1 bg-orange-50/70 p-3.5 rounded-2xl border border-orange-100">
              <label className="text-[9px] font-black text-orange-950 uppercase tracking-wider block">Namba yako ya Simu kama Mkulima (WhatsApp) *</label>
              <input
                type="text"
                value={farmerPhoneInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setFarmerPhoneInput(val);
                  localStorage.setItem("kilimo_farmer_phone", val);
                }}
                placeholder="+255..."
                className="w-full px-3 py-2 bg-white border border-emerald-100 rounded-xl text-xs font-mono font-bold text-emerald-950 focus:outline-none"
              />
              <p className="text-[9px] text-orange-900/75 font-semibold">Tafadhali ingiza namba ya simu sawa na uliyosajili kwenye mazao yako kuona ujumbe wa wateja.</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2.5">
          {loadingChats ? (
            <div className="flex flex-col items-center justify-center py-12 text-emerald-800 space-y-2 text-xs">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              <span>Inapakia soga...</span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <MessageSquare className="h-10 w-10 text-emerald-200 mx-auto" />
              <p className="text-sm font-black text-emerald-900">Hakuna mazungumzo bado</p>
              {viewMode === "mnunuzi" ? (
                <p className="text-xs max-w-xs mx-auto text-emerald-800/70 font-bold">
                  Nenda Sokoni ufungue bidhaa unayoipenda, kisha bonyeza "Tuma Soga" kuwasiliana na mkulima moja kwa moja.
                </p>
              ) : (
                <p className="text-xs max-w-xs mx-auto text-emerald-800/70 font-bold">
                  Hakuna soga zilizopokelewa kwa namba hii ({farmerPhoneInput}) kwa sasa. Wakulima wanapokea maswali hapa pale wateja wanapoanzisha mazungumzo sokoni.
                </p>
              )}
            </div>
          ) : (
            filteredChats.map((chat) => {
              // Determine if this chat is unread for our current viewMode
              const isUnread = viewMode === "mnunuzi"
                ? (chat.lastSenderId !== userId && (!chat.buyerLastReadTime || chat.buyerLastReadTime < chat.updatedAt))
                : (chat.lastSenderId !== farmerPhoneInput.trim() && (!chat.farmerLastReadTime || chat.farmerLastReadTime < chat.updatedAt));

              return (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 relative ${
                    selectedChat?.id === chat.id
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm"
                      : isUnread
                      ? "bg-orange-50/50 border-orange-100 text-slate-900 shadow-sm shadow-orange-50/25"
                      : "border-transparent hover:bg-emerald-50/40 text-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-1.5">
                      <h4 className={`text-xs ${isUnread ? "font-black text-emerald-950" : "font-black text-emerald-900"}`}>
                        {viewMode === "mnunuzi" ? chat.farmerName : chat.buyerName}
                      </h4>
                      {isUnread && (
                        <span className="bg-orange-500 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Mpya
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-800/60 font-mono font-bold">
                      {new Date(chat.updatedAt).toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-[11px] font-black text-orange-600 mt-1 truncate">
                    Bidhaa: {chat.listingTitle}
                  </div>
                  <div className={`text-xs mt-0.5 truncate ${isUnread ? "text-emerald-950 font-black" : "text-emerald-950/70 font-semibold"}`}>
                    {chat.lastMessage}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Feed (Right Column) - Shown on mobile if a chat is active */}
      <div className={`md:col-span-8 bg-white border-2 border-emerald-100 rounded-[2rem] flex flex-col h-full shadow-md shadow-emerald-100/10 overflow-hidden ${
        selectedChat ? "flex" : "hidden md:flex items-center justify-center text-slate-400"
      }`}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between border-b-2 border-emerald-500">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-200 hover:text-white mr-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="font-sans font-black text-sm text-white">
                    {viewMode === "mnunuzi" ? selectedChat.farmerName : selectedChat.buyerName}
                  </h3>
                  <p className="text-xs text-emerald-100 font-bold truncate">
                    Soga ya: <span className="text-orange-300 font-black">{selectedChat.listingTitle}</span>
                  </p>
                </div>
              </div>

              {/* Direct call option for buyer to farmer, or farmer to buyer if phone known */}
              {viewMode === "mnunuzi" && (
                <a
                  href={`tel:${selectedChat.farmerPhone}`}
                  className="flex items-center space-x-1.5 bg-orange-500 hover:bg-orange-600 text-xs text-white font-black px-4 py-2.5 rounded-2xl transition-all shadow-sm shadow-orange-100/40"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Piga Simu</span>
                </a>
              )}
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-emerald-50/15">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-emerald-900 space-y-2 text-xs font-bold">
                  <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                  <span>Inapakia ujumbe...</span>
                </div>
              ) : (
                messages.map((msg) => {
                  // Determine alignment dynamically
                  const isMe = viewMode === "mnunuzi"
                    ? msg.senderId === userId
                    : msg.senderId === selectedChat.farmerPhone;

                  // Determine if the message has been read by the other party
                  let isReadByOther = false;
                  if (isMe) {
                    if (viewMode === "mnunuzi") {
                      isReadByOther = !!selectedChat.farmerLastReadTime && msg.createdAt <= selectedChat.farmerLastReadTime;
                    } else {
                      isReadByOther = !!selectedChat.buyerLastReadTime && msg.createdAt <= selectedChat.buyerLastReadTime;
                    }
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] group ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`flex items-center gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`px-4 py-3 rounded-2xl text-xs font-sans shadow-sm font-bold ${
                          isMe
                            ? "bg-orange-500 text-white rounded-br-none"
                            : "bg-white text-emerald-950 border-2 border-emerald-100 rounded-tl-none"
                        }`}>
                          {msg.text}
                        </div>
                        <button
                          type="button"
                          onClick={() => setMessageToDelete(msg.id)}
                          title="Futa ujumbe"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50/80 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-all duration-150 flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="text-[9px] text-emerald-800/60 font-mono font-bold">
                          Ulipokelewa: {new Date(msg.createdAt).toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isMe && (
                          <span 
                            title={isReadByOther ? "Imesomwa na mwenzako" : "Imefika lakini haijasomwa bado"}
                            className={`text-[10px] font-bold ${isReadByOther ? "text-emerald-600" : "text-slate-400"}`}
                          >
                            {isReadByOther ? "✓✓ Imesomwa" : "✓ Imetumwa"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {otherUserIsTyping && (
                <div className="flex items-center space-x-2 max-w-[75%] mr-auto p-2 animate-in fade-in duration-200">
                  <div className="bg-white text-emerald-950 px-4 py-3 rounded-2xl rounded-tl-none border-2 border-emerald-100 flex items-center space-x-1.5 font-bold text-xs shadow-sm">
                    <span>{getOtherUserName()} anaandika</span>
                    <span className="flex space-x-1 items-center pt-1.5 pl-1">
                      <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-emerald-100 bg-white flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={viewMode === "mnunuzi" ? "Andika ujumbe wako wa majadiliano kwa mkulima..." : "Andika majibu yako hapa kwa mteja..."}
                className="flex-1 px-4 py-3.5 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all placeholder:text-emerald-900/40"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sendingMessage}
                className="p-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-emerald-100 text-white disabled:text-emerald-300 rounded-2xl transition-colors active:scale-95 shadow"
              >
                {sendingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center p-12 space-y-3">
            <MessageSquare className="h-14 w-14 text-emerald-200 mx-auto animate-bounce" />
            <h3 className="font-sans font-black text-emerald-900 text-base">Hakuna soga iliyofunguliwa</h3>
            <p className="text-xs max-w-sm mx-auto text-emerald-800/70 font-bold">Chagua soga kwenye orodha ili uanze kujadili bei ya mazao au pembejeo.</p>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {messageToDelete && (
        <div id="delete-message-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border-2 border-emerald-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-sans font-black text-emerald-950 mb-1">Futa Ujumbe?</h3>
            <p className="text-[11px] font-bold text-slate-500 mb-6 leading-relaxed">
              Je, una uhakika unataka kufuta ujumbe huu? Kitendo hiki hakiwezi kubatilishwa.
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl transition-all"
              >
                Hapana
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMessage(messageToDelete)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md shadow-red-500/10 transition-all"
              >
                Ndio, Futa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
