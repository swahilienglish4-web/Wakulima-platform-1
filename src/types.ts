export interface Listing {
  id: string;
  title: string;
  category: "Mazao" | "Mbegu" | "Mbolea & Pembejeo" | "Vifaa vya Kilimo" | "Mifugo";
  price: number;
  unit: string; // kg, gunia, debe, lita, nk.
  quantity: number;
  location: string;
  farmerName: string;
  farmerPhone: string;
  description: string;
  imageUrl?: string;
  imageUrls?: string[];
  createdAt: number;
  status?: "approved" | "pending" | "rejected";
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
  receiverId?: string;
  receiverName?: string;
  listingId?: string;
}

export interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  farmerName: string;
  farmerPhone: string;
  buyerName: string;
  buyerId?: string;
  lastMessage: string;
  lastSenderId?: string;
  updatedAt: number;
  buyerTypingLastActive?: number;
  farmerTypingLastActive?: number;
  buyerLastReadTime?: number;
  farmerLastReadTime?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind color gradient classes
  createdAt: number;
}

export interface GroupTopic {
  id: string;
  groupId: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: "mkulima" | "mnunuzi" | "mtaalamu";
  authorPhone?: string;
  createdAt: number;
  replyCount: number;
}

export interface GroupReply {
  id: string;
  topicId: string;
  content: string;
  authorName: string;
  authorRole: "mkulima" | "mnunuzi" | "mtaalamu";
  createdAt: number;
}

