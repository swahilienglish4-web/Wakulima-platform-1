import { db, auth, isFirebaseAvailable } from "./firebase";
import { collection, addDoc, getDocs, doc, setDoc, query, orderBy, onSnapshot, getDoc, deleteDoc } from "firebase/firestore";
import { Listing, Chat, Message, Group, GroupTopic, GroupReply } from "./types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mock Initial Listings
const MOCK_LISTINGS: Listing[] = [
  {
    id: "mock-1",
    title: "Mahindi Meupe ya Njombe (Safi)",
    category: "Mazao",
    price: 85000,
    unit: "Gunia (100kg)",
    quantity: 150,
    location: "Njombe Mjini",
    farmerName: "Mzee Juma Kabatila",
    farmerPhone: "+255712345678",
    description: "Mahindi meupe yaliyokaushwa vizuri sana, hayana unyevu kabisa (unyevu chini ya 12%). Yamevunwa msimu huu na kuhifadhiwa kitaalamu. Yapo tayari kwa usagaji wa unga safi wa sembe na dona.",
    imageUrls: [
      "https://images.unsplash.com/photo-1551754625-70c9048718bd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1530071437248-26665840d7e6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531250390176-904895db1c11?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: Date.now() - 3600000 * 24, // 1 day ago
    status: "approved",
  },
  {
    id: "mock-2",
    title: "Nyanya Ngumu za Shambani (Iringa)",
    category: "Mazao",
    price: 24000,
    unit: "Tenga Kubwa",
    quantity: 45,
    location: "Ruaha, Iringa",
    farmerName: "Mama Maria Mwakatobe",
    farmerPhone: "+255754987654",
    description: "Nyanya ngumu aina ya Assila, haziharibiki haraka wakati wa kusafirisha. Zimevunwa leo asubuhi shambani kwangu Ruaha. Zinafaa sana kwa soko la jumla na rejareja.",
    imageUrls: [
      "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591886851605-7f1396a58bf3?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: Date.now() - 3600000 * 5, // 5 hours ago
    status: "approved",
  },
  {
    id: "mock-3",
    title: "Mbegu Bora za Alizeti (Hysun 33)",
    category: "Mbegu",
    price: 9500,
    unit: "Mfuko (2kg)",
    quantity: 500,
    location: "Singida Mjini",
    farmerName: "Kilimo Tech Seed Agency",
    farmerPhone: "+255788123456",
    description: "Mbegu chotara zilizothibitishwa na TOSCI. Zina uwezo mkubwa wa kutoa mafuta mengi (hadi 45%) na zinavumilia magonjwa na ukame wa kiasi. Mavuno ni mengi kwa heka.",
    imageUrls: [
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1501436513145-30f24e19fbc8?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: Date.now() - 3600000 * 12, // 12 hours ago
    status: "approved",
  },
  {
    id: "mock-4",
    title: "Mbolea ya Kupandia (DAP - Minjingu Organic)",
    category: "Mbolea & Pembejeo",
    price: 68000,
    unit: "Mfuko (50kg)",
    quantity: 80,
    location: "Arusha Mjini",
    farmerName: "AgroTech Tanzania Ltd",
    farmerPhone: "+255655789012",
    description: "Mbolea asilia ya kupandia yenye virutubisho vya Phosphorus, Calcium, na Nitrogen. Inazalishwa Arusha na inafaa kuongeza rutuba ya udongo na kukuza mizizi ya mazao haraka.",
    imageUrls: [
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: Date.now() - 3600000 * 48, // 2 days ago
    status: "approved",
  },
  {
    id: "mock-5",
    title: "Kuku wa Kienyeji Waliochanjwa",
    category: "Mifugo",
    price: 14000,
    unit: "Kuku Mmoja",
    quantity: 200,
    location: "Dodoma, Chamwino",
    farmerName: "Frank Mwakasege",
    farmerPhone: "+255762345699",
    description: "Kuku safi wa kienyeji waliofugwa katika mazingira ya nusu-huru. Wamepewa chanjo zote muhimu ikiwemo mdondo na gumboro. Wana uzito mzuri kuanzia kilo 1.5 hadi 2.2.",
    imageUrls: [
      "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587593817642-8ba99485165a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1604848698030-c434ba08eca1?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: Date.now() - 3600000 * 2, // 2 hours ago
    status: "approved",
  },
  {
    id: "mock-6",
    title: "Power Tiller (Kipandikizi cha Mkono) HP 15",
    category: "Vifaa vya Kilimo",
    price: 3600000,
    unit: "Mashine Moja",
    quantity: 5,
    location: "Kurasini, Dar es Salaam",
    farmerName: "KILIMO TECH AFRICA SUPPLIERS",
    farmerPhone: "+255711223344",
    description: "Trekta la mkono (Power Tiller) lenye injini yenye nguvu ya HP 15 ya dizeli. Inakuja na jembe la kupasulia mifereji, jembe la kuvunjia mabonge na kigari cha kukokotwa. Inarahisisha kilimo kwa mkulima mdogo.",
    imageUrls: [
      "https://images.unsplash.com/photo-1530268578403-df6e89da0d30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80"
    ],
    createdAt: Date.now() - 3600000 * 72, // 3 days ago
    status: "approved",
  }
];

// Helper to load items from local storage
const getLocal = <T>(key: string, defaults: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaults;
  } catch {
    return defaults;
  }
};

const setLocal = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error("Local storage error:", err);
  }
};

export const dbService = {
  // --- LISTINGS ---
  async getListings(): Promise<Listing[]> {
    if (isFirebaseAvailable && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "listings"));
        const fbListings: Listing[] = [];
        querySnapshot.forEach((doc) => {
          fbListings.push({ id: doc.id, ...doc.data() } as Listing);
        });
        
        // Merge with mock listings to ensure the app is always richly populated
        const localAdded = getLocal<Listing[]>("local_listings", []);
        const all = [...fbListings, ...localAdded, ...MOCK_LISTINGS];
        // Remove duplicates if any
        const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        return unique.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.error("Error reading listings from Firestore:", error);
        handleFirestoreError(error, OperationType.GET, "listings");
      }
    }
    
    // Fallback
    const localAdded = getLocal<Listing[]>("local_listings", []);
    return [...localAdded, ...MOCK_LISTINGS].sort((a, b) => b.createdAt - a.createdAt);
  },

  async addListing(listing: Omit<Listing, "id" | "createdAt">): Promise<Listing> {
    const newListing: Listing = {
      ...listing,
      id: "listing_" + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      status: "pending", // Default to 'pending' for review
    };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "listings", newListing.id), newListing);
        console.log("Listing saved to Firestore with pending status!");
      } catch (error) {
        console.error("Error saving listing to Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `listings/${newListing.id}`);
      }
    }

    // Always keep a local copy for resilience
    const local = getLocal<Listing[]>("local_listings", []);
    local.unshift(newListing);
    setLocal("local_listings", local);

    return newListing;
  },

  async updateListingStatus(listingId: string, status: "approved" | "rejected"): Promise<void> {
    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "listings", listingId), { status }, { merge: true });
        console.log(`Listing ${listingId} status updated to ${status} in Firestore!`);
      } catch (error) {
        console.error("Error updating listing status in Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `listings/${listingId}`);
      }
    }

    // Always keep a local copy updated for offline resilience
    const local = getLocal<Listing[]>("local_listings", []);
    const idx = local.findIndex(l => l.id === listingId);
    if (idx !== -1) {
      local[idx].status = status;
      setLocal("local_listings", local);
    } else {
      // If it exists in Firestore but not in local listings (e.g. from other user)
      // fetchListings will sync, but we can also store it.
    }
  },

  // --- CHATS & MESSAGES ---
  async getChats(): Promise<Chat[]> {
    if (isFirebaseAvailable && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "chats"));
        const fbChats: Chat[] = [];
        querySnapshot.forEach((doc) => {
          fbChats.push({ id: doc.id, ...doc.data() } as Chat);
        });
        const localChats = getLocal<Chat[]>("local_chats", []);
        const all = [...fbChats, ...localChats];
        const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        return unique.sort((a, b) => b.updatedAt - a.updatedAt);
      } catch (error) {
        console.error("Error fetching chats from Firestore:", error);
        handleFirestoreError(error, OperationType.GET, "chats");
      }
    }
    return getLocal<Chat[]>("local_chats", []).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async createChat(chat: Omit<Chat, "id" | "updatedAt" | "lastMessage">): Promise<Chat> {
    const buyerSuffix = chat.buyerId ? chat.buyerId : chat.buyerName.replace(/\s+/g, "_");
    const chatId = `chat_${chat.listingId}_${buyerSuffix}`;
    const newChat: Chat = {
      ...chat,
      id: chatId,
      lastMessage: "Soga imeanzishwa...",
      lastSenderId: chat.buyerId || "unknown",
      updatedAt: Date.now(),
    };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "chats", chatId), newChat);
      } catch (error) {
        console.error("Error creating chat in Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}`);
      }
    }

    const local = getLocal<Chat[]>("local_chats", []);
    const exists = local.find(c => c.id === chatId);
    if (!exists) {
      local.unshift(newChat);
      setLocal("local_chats", local);
    }
    return newChat;
  },

  async getChatById(chatId: string): Promise<Chat | null> {
    if (isFirebaseAvailable && db) {
      try {
        const chatDoc = await getDoc(doc(db, "chats", chatId));
        if (chatDoc.exists()) {
          return { id: chatDoc.id, ...chatDoc.data() } as Chat;
        }
      } catch (error) {
        console.error("Error fetching chat by ID from Firestore:", error);
      }
    }
    const local = getLocal<Chat[]>("local_chats", []);
    return local.find(c => c.id === chatId) || null;
  },

  async updateTypingStatus(chatId: string, role: "mnunuzi" | "mkulima", isTyping: boolean): Promise<void> {
    const timestamp = isTyping ? Date.now() : 0;
    const updateData: Partial<Chat> = role === "mnunuzi" 
      ? { buyerTypingLastActive: timestamp } 
      : { farmerTypingLastActive: timestamp };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "chats", chatId), updateData, { merge: true });
      } catch (error) {
        console.error("Error updating typing status in Firestore:", error);
      }
    }

    // Local storage fallback
    const local = getLocal<Chat[]>("local_chats", []);
    const idx = local.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updateData };
      setLocal("local_chats", local);
    }
  },

  async markChatAsRead(chatId: string, role: "mnunuzi" | "mkulima"): Promise<void> {
    const timestamp = Date.now();
    const updateData: Partial<Chat> = role === "mnunuzi"
      ? { buyerLastReadTime: timestamp }
      : { farmerLastReadTime: timestamp };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "chats", chatId), updateData, { merge: true });
      } catch (error) {
        console.error("Error marking chat as read in Firestore:", error);
      }
    }

    // Local storage fallback
    const local = getLocal<Chat[]>("local_chats", []);
    const idx = local.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updateData };
      setLocal("local_chats", local);
    }
  },

  async getMessages(chatId: string): Promise<Message[]> {
    if (isFirebaseAvailable && db) {
      try {
        const querySnapshot = await getDocs(collection(db, `chats/${chatId}/messages`));
        const fbMsgs: Message[] = [];
        querySnapshot.forEach((doc) => {
          fbMsgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        const localMsgs = getLocal<Message[]>(`messages_${chatId}`, []);
        const all = [...fbMsgs, ...localMsgs];
        const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        return unique.sort((a, b) => a.createdAt - b.createdAt);
      } catch (error) {
        console.error("Error reading messages from Firestore:", error);
        handleFirestoreError(error, OperationType.GET, `chats/${chatId}/messages`);
      }
    }
    return getLocal<Message[]>(`messages_${chatId}`, []).sort((a, b) => a.createdAt - b.createdAt);
  },

  async sendMessage(chatId: string, message: Omit<Message, "id" | "chatId" | "createdAt">): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      chatId,
      createdAt: Date.now(),
    };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, `chats/${chatId}/messages`, newMessage.id), newMessage);
        // Update last message in chat document
        await setDoc(doc(db, "chats", chatId), {
          lastMessage: newMessage.text,
          lastSenderId: newMessage.senderId,
          updatedAt: Date.now()
        }, { merge: true });
      } catch (error) {
        console.error("Error sending message to Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages/${newMessage.id}`);
      }
    }

    // Local storage persistence
    const localMsgs = getLocal<Message[]>(`messages_${chatId}`, []);
    localMsgs.push(newMessage);
    setLocal(`messages_${chatId}`, localMsgs);

    // Update the local chat list too
    const localChats = getLocal<Chat[]>("local_chats", []);
    const chatIndex = localChats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      localChats[chatIndex].lastMessage = newMessage.text;
      localChats[chatIndex].lastSenderId = newMessage.senderId;
      localChats[chatIndex].updatedAt = Date.now();
      // Move to top
      const chat = localChats.splice(chatIndex, 1)[0];
      localChats.unshift(chat);
      setLocal("local_chats", localChats);
    }

    return newMessage;
  },

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    if (isFirebaseAvailable && db) {
      try {
        await deleteDoc(doc(db, `chats/${chatId}/messages`, messageId));
      } catch (error) {
        console.error("Error deleting message from Firestore:", error);
        handleFirestoreError(error, OperationType.DELETE, `chats/${chatId}/messages/${messageId}`);
      }
    }

    // Local storage update
    const localMsgs = getLocal<Message[]>(`messages_${chatId}`, []);
    const filtered = localMsgs.filter(m => m.id !== messageId);
    setLocal(`messages_${chatId}`, filtered);

    // Update last message in chat if the deleted message was the last one
    const textValue = filtered.length > 0 ? filtered[filtered.length - 1].text : "Ujumbe ulifutwa...";
    const lastSender = filtered.length > 0 ? filtered[filtered.length - 1].senderId : "system";

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "chats", chatId), {
          lastMessage: textValue,
          lastSenderId: lastSender,
          updatedAt: Date.now()
        }, { merge: true });
      } catch (err) {
        console.error("Error updating chat last message after deletion:", err);
      }
    }

    const localChats = getLocal<Chat[]>("local_chats", []);
    const chatIndex = localChats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      localChats[chatIndex].lastMessage = textValue;
      localChats[chatIndex].lastSenderId = lastSender;
      localChats[chatIndex].updatedAt = Date.now();
      setLocal("local_chats", localChats);
    }
  },

  // --- BRANDING ---
  async getBranding(): Promise<{ logo: string; name: string; tagline: string; adminPin?: string } | null> {
    if (isFirebaseAvailable && db) {
      try {
        const docRef = doc(db, "settings", "branding");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as { logo: string; name: string; tagline: string; adminPin?: string };
        }
      } catch (error) {
        console.error("Error reading branding from Firestore:", error);
      }
    }
    return null;
  },

  async saveBranding(branding: { logo: string; name: string; tagline: string; adminPin?: string }): Promise<void> {
    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "settings", "branding"), branding);
        console.log("Branding saved to Firestore!");
      } catch (error) {
        console.error("Error saving branding to Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, "settings/branding");
      }
    }
  },

  listenToChats(callback: (chats: Chat[]) => void): () => void {
    if (isFirebaseAvailable && db) {
      const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fbChats: Chat[] = [];
        snapshot.forEach((doc) => {
          fbChats.push({ id: doc.id, ...doc.data() } as Chat);
        });
        const localChats = getLocal<Chat[]>("local_chats", []);
        const all = [...fbChats, ...localChats];
        const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        callback(unique.sort((a, b) => b.updatedAt - a.updatedAt));
      }, (error) => {
        console.error("Error in chats snapshot listener:", error);
      });
      return unsubscribe;
    }
    
    // Fallback: poll local storage every 5 seconds
    const interval = setInterval(() => {
      const localChats = getLocal<Chat[]>("local_chats", []);
      callback(localChats.sort((a, b) => b.updatedAt - a.updatedAt));
    }, 5000);
    return () => clearInterval(interval);
  },

  // --- VIKUNDI (COMMUNITY GROUPS) ---
  async getGroups(): Promise<Group[]> {
    const DEFAULT_GROUPS: Group[] = [
      {
        id: "grp_mazao",
        name: "Kilimo cha Mazao & Mbogamboga",
        description: "Mjadala kuhusu kilimo cha mahindi, mpunga, nyanya, mbogamboga na matunda.",
        icon: "Sprout",
        color: "from-emerald-500 to-teal-500",
        createdAt: 1710000000000
      },
      {
        id: "grp_mifugo",
        name: "Ufugaji wa Kuku & Wanyama",
        description: "Mijadala juu ya ufugaji wa kuku wa kienyeji na kisasa, ng'ombe wa maziwa, mbuzi na wengine.",
        icon: "Box",
        color: "from-blue-500 to-indigo-500",
        createdAt: 1710000001000
      },
      {
        id: "grp_pembejeo",
        name: "Pembejeo, Mbolea & Dawa",
        description: "Ushauri kuhusu mbolea bora, viuatilifu (dawa) salama za wadudu, na jinsi ya kurutubisha udongo.",
        icon: "Tag",
        color: "from-amber-500 to-orange-500",
        createdAt: 1710000002000
      },
      {
        id: "grp_masoko",
        name: "Soko & Bei za Bidhaa",
        description: "Mijadala kuhusu bei za sasa za mazao sokoni na kuunganisha wakulima na wanunuzi wakubwa.",
        icon: "ShoppingBag",
        color: "from-purple-500 to-pink-500",
        createdAt: 1710000003000
      }
    ];

    if (isFirebaseAvailable && db) {
      try {
        const querySnapshot = await getDocs(collection(db, "groups"));
        if (querySnapshot.empty) {
          // Seed the default groups so they are available in Firestore
          for (const g of DEFAULT_GROUPS) {
            await setDoc(doc(db, "groups", g.id), g);
          }
          return DEFAULT_GROUPS;
        }
        const fbGroups: Group[] = [];
        querySnapshot.forEach((doc) => {
          fbGroups.push({ id: doc.id, ...doc.data() } as Group);
        });
        return fbGroups.sort((a, b) => a.createdAt - b.createdAt);
      } catch (error) {
        console.error("Error fetching groups from Firestore:", error);
      }
    }

    // Local storage fallback
    const local = getLocal<Group[]>("local_groups", []);
    if (local.length === 0) {
      setLocal("local_groups", DEFAULT_GROUPS);
      return DEFAULT_GROUPS;
    }
    return local.sort((a, b) => a.createdAt - b.createdAt);
  },

  async createGroup(group: Omit<Group, "id" | "createdAt">): Promise<Group> {
    const newGroup: Group = {
      ...group,
      id: "grp_" + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "groups", newGroup.id), newGroup);
      } catch (error) {
        console.error("Error creating group in Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `groups/${newGroup.id}`);
      }
    }

    const local = getLocal<Group[]>("local_groups", []);
    local.push(newGroup);
    setLocal("local_groups", local);
    return newGroup;
  },

  async getGroupTopics(groupId: string): Promise<GroupTopic[]> {
    const DEFAULT_TOPICS: Record<string, GroupTopic[]> = {
      grp_mazao: [
        {
          id: "tpc_mazao_1",
          groupId: "grp_mazao",
          title: "Jinsi ya kukabiliana na funza wa msumeno kwenye mahindi?",
          content: "Habari zenu wakulima wenzangu. Mwaka huu nimepanda mahindi lakini funza wa msumeno wameshambulia karibu heka mbili. Nimetumia dawa kadhaa lakini bado hawatoki. Je, ni dawa gani bora zaidi mliyojaribu yenye matokeo ya haraka?",
          authorName: "Mzee Juma Kabatila",
          authorRole: "mkulima",
          createdAt: Date.now() - 3600000 * 48,
          replyCount: 3
        },
        {
          id: "tpc_mazao_2",
          groupId: "grp_mazao",
          title: "Muda sahihi wa kupandisha mbolea ya kukuzia (urea) kwenye nyanya",
          content: "Naomba mnishauri, nyanya zangu zina wiki nne tangu nilipohamishia shambani. Je, huu ni muda sahihi wa kuweka Urea, au nianze na mbolea gani ili matunda yawe makubwa na yenye ubora wa soko?",
          authorName: "Mama Maria Mwakatobe",
          authorRole: "mkulima",
          createdAt: Date.now() - 3600000 * 24,
          replyCount: 1
        }
      ],
      grp_mifugo: [
        {
          id: "tpc_mifugo_1",
          groupId: "grp_mifugo",
          title: "Kuku wa kienyeji hawatagi vizuri, shida inaweza kuwa nini?",
          content: "Ninamiradi mdogo wa kuku 80 wa kienyeji. Wana umri vya miezi 7 sasa lakini kwa siku napata mayai 5 hadi 8 tu. Nawapa chakula cha pumba na maji safi. Naomba mbinu za kuongeza utagaji wa mayai.",
          authorName: "Masanja Charles",
          authorRole: "mkulima",
          createdAt: Date.now() - 3600000 * 72,
          replyCount: 2
        }
      ]
    };

    if (isFirebaseAvailable && db) {
      try {
        const querySnapshot = await getDocs(collection(db, `groups/${groupId}/topics`));
        if (querySnapshot.empty) {
          const defaults = DEFAULT_TOPICS[groupId] || [];
          for (const t of defaults) {
            await setDoc(doc(db, `groups/${groupId}/topics`, t.id), t);
          }
          return defaults;
        }
        const fbTopics: GroupTopic[] = [];
        querySnapshot.forEach((doc) => {
          fbTopics.push({ id: doc.id, ...doc.data() } as GroupTopic);
        });
        return fbTopics.sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.error("Error fetching group topics from Firestore:", error);
      }
    }

    const localKey = `topics_${groupId}`;
    const local = getLocal<GroupTopic[]>(localKey, []);
    if (local.length === 0 && DEFAULT_TOPICS[groupId]) {
      setLocal(localKey, DEFAULT_TOPICS[groupId]);
      return DEFAULT_TOPICS[groupId];
    }
    return local.sort((a, b) => b.createdAt - a.createdAt);
  },

  async createGroupTopic(groupId: string, topic: Omit<GroupTopic, "id" | "replyCount" | "createdAt">): Promise<GroupTopic> {
    const newTopic: GroupTopic = {
      ...topic,
      id: "tpc_" + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      replyCount: 0
    };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, `groups/${groupId}/topics`, newTopic.id), newTopic);
      } catch (error) {
        console.error("Error creating topic in Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `groups/${groupId}/topics/${newTopic.id}`);
      }
    }

    const localKey = `topics_${groupId}`;
    const local = getLocal<GroupTopic[]>(localKey, []);
    local.unshift(newTopic);
    setLocal(localKey, local);
    return newTopic;
  },

  async getGroupReplies(topicId: string): Promise<GroupReply[]> {
    const DEFAULT_REPLIES: Record<string, GroupReply[]> = {
      tpc_mazao_1: [
        {
          id: "rpl_1",
          topicId: "tpc_mazao_1",
          content: "Mzee Juma, pole sana kwa changamoto hiyo. Mimi nilitumia dawa inayoitwa 'Belt' au 'Spinetoram' ikafanya kazi vizuri sana. Muhimu ni kupiga dawa asubuhi sana au jioni wakati funza wapo wazi juu ya majani.",
          authorName: "Dkt. Kelvin Mwakyusa",
          authorRole: "mtaalamu",
          createdAt: Date.now() - 3600000 * 40
        },
        {
          id: "rpl_2",
          topicId: "tpc_mazao_1",
          content: "Ni kweli, Belt ni nzuri sana. Lakini pia hakikisha unabadilisha dawa usitumie moja tu kila mara ili wasijenge usugu. Unaweza kuunganisha na pigo la 'Emamectin benzoate'.",
          authorName: "Mama Maria Mwakatobe",
          authorRole: "mkulima",
          createdAt: Date.now() - 3600000 * 30
        },
        {
          id: "rpl_3",
          topicId: "tpc_mazao_1",
          content: "Ahsante sana kwa ushauri wenu wataalamu, kesho asubuhi nawahi dukani kununua Belt nianze kupiga mara moja!",
          authorName: "Mzee Juma Kabatila",
          authorRole: "mkulima",
          createdAt: Date.now() - 3600000 * 20
        }
      ],
      tpc_mazao_2: [
        {
          id: "rpl_4",
          topicId: "tpc_mazao_2",
          content: "Wiki 4 ni nzuri kuanza kuweka mbolea ya kukuzia. Lakini badala ya Urea pekee, jaribu kutumia CAN au NPK 20:10:10 kwani Urea ikizidi inakuza tu majani na kupunguza uwezo wa kutoa matunda mengi ngumu.",
          authorName: "Dkt. Kelvin Mwakyusa",
          authorRole: "mtaalamu",
          createdAt: Date.now() - 3600000 * 12
        }
      ],
      tpc_mifugo_1: [
        {
          id: "rpl_5",
          topicId: "tpc_mifugo_1",
          content: "Masanja, pumba pekee hazitoshi kumpa kuku nguvu ya kutaga vizuri. Lazima uongeze 'Layers Mash' yenye madini ya chokaa (calcium) kwa ajili ya maganda ya mayai, pia ongeza mbogamboga kama mchicha au chainizi.",
          authorName: "Elizabeth Joseph",
          authorRole: "mkulima",
          createdAt: Date.now() - 3600000 * 60
        },
        {
          id: "rpl_6",
          topicId: "tpc_mifugo_1",
          content: "Pia kumbuka kuwapa chanjo ya mdondo na mkojo wa njano (gumboro) kwa wakati na kuwapa vitamini za utagaji kwenye maji mara kwa mara.",
          authorName: "Mzee Juma Kabatila",
          authorRole: "mkulima",
          createdAt: Date.now() - 3600000 * 50
        }
      ]
    };

    if (isFirebaseAvailable && db) {
      try {
        const querySnapshot = await getDocs(collection(db, `topics/${topicId}/replies`));
        if (querySnapshot.empty) {
          const defaults = DEFAULT_REPLIES[topicId] || [];
          for (const r of defaults) {
            await setDoc(doc(db, `topics/${topicId}/replies`, r.id), r);
          }
          return defaults;
        }
        const fbReplies: GroupReply[] = [];
        querySnapshot.forEach((doc) => {
          fbReplies.push({ id: doc.id, ...doc.data() } as GroupReply);
        });
        return fbReplies.sort((a, b) => a.createdAt - b.createdAt);
      } catch (error) {
        console.error("Error fetching replies from Firestore:", error);
      }
    }

    const localKey = `replies_${topicId}`;
    const local = getLocal<GroupReply[]>(localKey, []);
    if (local.length === 0 && DEFAULT_REPLIES[topicId]) {
      setLocal(localKey, DEFAULT_REPLIES[topicId]);
      return DEFAULT_REPLIES[topicId];
    }
    return local.sort((a, b) => a.createdAt - b.createdAt);
  },

  async createGroupReply(groupId: string, topicId: string, reply: Omit<GroupReply, "id" | "createdAt">): Promise<GroupReply> {
    const newReply: GroupReply = {
      ...reply,
      id: "rpl_" + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, `topics/${topicId}/replies`, newReply.id), newReply);
        
        // Fetch existing topic to increment count
        const topicRef = doc(db, `groups/${groupId}/topics`, topicId);
        const topicSnap = await getDoc(topicRef);
        if (topicSnap.exists()) {
          const tData = topicSnap.data();
          const currentCount = tData.replyCount || 0;
          await setDoc(topicRef, { replyCount: currentCount + 1 }, { merge: true });
        }
      } catch (error) {
        console.error("Error creating reply in Firestore:", error);
        handleFirestoreError(error, OperationType.WRITE, `topics/${topicId}/replies/${newReply.id}`);
      }
    }

    const localKey = `replies_${topicId}`;
    const local = getLocal<GroupReply[]>(localKey, []);
    local.push(newReply);
    setLocal(localKey, local);

    // Update topic counter in local storage
    const topicLocalKey = `topics_${groupId}`;
    const localTopics = getLocal<GroupTopic[]>(topicLocalKey, []);
    const topicIdx = localTopics.findIndex(t => t.id === topicId);
    if (topicIdx !== -1) {
      localTopics[topicIdx].replyCount = (localTopics[topicIdx].replyCount || 0) + 1;
      setLocal(topicLocalKey, localTopics);
    }

    return newReply;
  },

  // --- USER PROFILES ---
  async saveUserProfile(userId: string, profile: { name: string; phone: string; email: string }): Promise<void> {
    const userProfile = {
      ...profile,
      id: userId,
      createdAt: Date.now()
    };
    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "users", userId), userProfile);
        console.log("User profile saved to Firestore!");
      } catch (error) {
        console.error("Error saving user profile to Firestore:", error);
      }
    }
    setLocal(`user_profile_${userId}`, userProfile);
  },

  async getUserProfile(userId: string): Promise<{ name: string; phone: string; email: string } | null> {
    if (isFirebaseAvailable && db) {
      try {
        const docSnap = await getDoc(doc(db, "users", userId));
        if (docSnap.exists()) {
          return docSnap.data() as { name: string; phone: string; email: string };
        }
      } catch (error) {
        console.error("Error reading user profile from Firestore:", error);
      }
    }
    return getLocal<{ name: string; phone: string; email: string } | null>(`user_profile_${userId}`, null);
  },

  async getAllUsers(): Promise<{ id: string; name: string; phone: string; email: string; createdAt?: number }[]> {
    if (isFirebaseAvailable && db) {
      try {
        const querySnapshot = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
        const users: any[] = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        return users;
      } catch (error) {
        console.error("Error fetching all users from Firestore:", error);
      }
    }
    // Return local fallback or empty
    const users: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("user_profile_")) {
        const data = getLocal<any>(key, null);
        if (data) {
          users.push(data);
        }
      }
    }
    return users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
};
