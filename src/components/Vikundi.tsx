import React, { useState, useEffect } from "react";
import { dbService } from "../dbService";
import { Group, GroupTopic, GroupReply } from "../types";
import { 
  Sprout, 
  Package, 
  Tag, 
  ShoppingBag, 
  MessageSquare, 
  Users, 
  ArrowLeft, 
  Plus, 
  Send, 
  User, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  MessageCircle, 
  BookOpen, 
  Compass, 
  Search, 
  GraduationCap
} from "lucide-react";

// Helper to map string to Lucide component
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Sprout":
      return <Sprout className="h-6 w-6 text-white" />;
    case "Box":
      return <Package className="h-6 w-6 text-white" />;
    case "Tag":
      return <Tag className="h-6 w-6 text-white" />;
    case "ShoppingBag":
      return <ShoppingBag className="h-6 w-6 text-white" />;
    default:
      return <Users className="h-6 w-6 text-white" />;
  }
};

interface VikundiProps {
  currentRole: "mkulima" | "mnunuzi";
  defaultUserName: string;
}

export default function Vikundi({ currentRole, defaultUserName }: VikundiProps) {
  // State variables
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [topics, setTopics] = useState<GroupTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<GroupTopic | null>(null);

  const [replies, setReplies] = useState<GroupReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState<boolean>(false);

  // Forms
  const [isAddingGroup, setIsAddingGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newGroupDesc, setNewGroupDesc] = useState<string>("");
  const [newGroupIcon, setNewGroupIcon] = useState<string>("Sprout");
  const [newGroupColor, setNewGroupColor] = useState<string>("from-emerald-500 to-teal-500");

  const [isAddingTopic, setIsAddingTopic] = useState<boolean>(false);
  const [newTopicTitle, setNewTopicTitle] = useState<string>("");
  const [newTopicContent, setNewTopicContent] = useState<string>("");

  const [newReplyContent, setNewReplyContent] = useState<string>("");

  // User details
  const [customAuthorName, setCustomAuthorName] = useState<string>(() => {
    return localStorage.getItem("kilimo_buyer_name") || defaultUserName || "Mkulima Mtanzania";
  });
  const [customAuthorRole, setCustomAuthorRole] = useState<"mkulima" | "mnunuzi" | "mtaalamu">(() => {
    return currentRole === "mkulima" ? "mkulima" : "mnunuzi";
  });

  const [groupSearchQuery, setGroupSearchQuery] = useState<string>("");

  // Synchronize role change from parent
  useEffect(() => {
    setCustomAuthorRole(currentRole === "mkulima" ? "mkulima" : "mnunuzi");
  }, [currentRole]);

  // Load groups on mount
  useEffect(() => {
    loadGroupsList();
  }, []);

  const loadGroupsList = async () => {
    setLoadingGroups(true);
    try {
      const data = await dbService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Load topics when group is selected
  const handleSelectGroup = async (group: Group) => {
    setSelectedGroup(group);
    setSelectedTopic(null);
    setLoadingTopics(true);
    try {
      const topicsData = await dbService.getGroupTopics(group.id);
      setTopics(topicsData);
    } catch (err) {
      console.error("Error loading topics:", err);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Load replies when topic is selected
  const handleSelectTopic = async (topic: GroupTopic) => {
    setSelectedTopic(topic);
    setLoadingReplies(true);
    try {
      const repliesData = await dbService.getGroupReplies(topic.id);
      setReplies(repliesData);
    } catch (err) {
      console.error("Error loading replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Submit new group
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDesc.trim()) return;

    try {
      const addedGroup = await dbService.createGroup({
        name: newGroupName,
        description: newGroupDesc,
        icon: newGroupIcon,
        color: newGroupColor,
      });
      setGroups(prev => [...prev, addedGroup]);
      setNewGroupName("");
      setNewGroupDesc("");
      setIsAddingGroup(false);
    } catch (err) {
      console.error("Error saving group:", err);
    }
  };

  // Submit new topic/discussion
  const handleCreateTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;

    try {
      const addedTopic = await dbService.createGroupTopic(selectedGroup.id, {
        groupId: selectedGroup.id,
        title: newTopicTitle,
        content: newTopicContent,
        authorName: customAuthorName.trim() || "Wakulima Member",
        authorRole: customAuthorRole,
      });

      // Update local topics state
      setTopics(prev => [addedTopic, ...prev]);
      setNewTopicTitle("");
      setNewTopicContent("");
      setIsAddingTopic(false);
    } catch (err) {
      console.error("Error creating topic:", err);
    }
  };

  // Submit a reply
  const handleCreateReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !selectedTopic || !newReplyContent.trim()) return;

    try {
      const addedReply = await dbService.createGroupReply(selectedGroup.id, selectedTopic.id, {
        topicId: selectedTopic.id,
        content: newReplyContent,
        authorName: customAuthorName.trim() || "Wakulima Member",
        authorRole: customAuthorRole,
      });

      setReplies(prev => [...prev, addedReply]);
      setNewReplyContent("");
      
      // Increment replyCount in UI topic object
      if (selectedTopic) {
        setSelectedTopic(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
        setTopics(prev => prev.map(t => t.id === selectedTopic.id ? { ...t, replyCount: t.replyCount + 1 } : t));
      }
    } catch (err) {
      console.error("Error saving reply:", err);
    }
  };

  // Helper formatting for timestamps
  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Sasa hivi";
    if (minutes < 60) return `Dakika ${minutes} zilizopita`;
    if (hours < 24) return `Saa ${hours} zilizopita`;
    return `Siku ${days} zilizopita`;
  };

  const getRoleLabelAndStyle = (role: "mkulima" | "mnunuzi" | "mtaalamu") => {
    switch (role) {
      case "mtaalamu":
        return {
          label: "Mtaalamu wa Kilimo",
          classes: "bg-emerald-100 text-emerald-800 border-emerald-200"
        };
      case "mkulima":
        return {
          label: "Mkulima/Mfugaji",
          classes: "bg-orange-100 text-orange-800 border-orange-200"
        };
      case "mnunuzi":
        return {
          label: "Mnunuzi/Mjasiriamali",
          classes: "bg-blue-100 text-blue-800 border-blue-200"
        };
    }
  };

  // Filter groups
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  return (
    <div id="vikundi-community-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. TOP HEADER NAVIGATION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-2 border-emerald-100/50 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-emerald-950">Vikundi vya Jamii (Forums)</h1>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Ungana na wakulima, wafugaji, na wataalamu kubadilishana uzoefu, ushauri, na masoko ya kilimo nchini.
          </p>
        </div>

        {/* User Identity Banner within Forum */}
        <div className="flex items-center bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl">
          <div className="bg-emerald-600 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs mr-3 shadow-md shadow-emerald-500/15">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-800 font-black uppercase tracking-wider">Unachangia Kama:</p>
            <div className="flex items-center space-x-2.5 mt-0.5">
              <input 
                type="text" 
                value={customAuthorName} 
                onChange={(e) => {
                  setCustomAuthorName(e.target.value);
                  localStorage.setItem("kilimo_buyer_name", e.target.value);
                }}
                className="text-xs font-black text-slate-800 bg-transparent border-b border-dashed border-emerald-400 focus:outline-none focus:border-orange-500 w-32 py-0"
                placeholder="Andika Jina lako"
              />
              <select
                value={customAuthorRole}
                onChange={(e) => setCustomAuthorRole(e.target.value as any)}
                className="text-[10px] font-black text-emerald-800 bg-emerald-100 border-none rounded-md px-1.5 py-0.5 focus:ring-0 focus:outline-none"
              >
                <option value="mkulima">Mkulima</option>
                <option value="mnunuzi">Mnunuzi</option>
                <option value="mtaalamu">Mtaalamu</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FORUM ROUTING / PANELS */}
      
      {/* CASE A: SHOW SINGLE TOPIC DISCUSSION WITH ALL REPLIES */}
      {selectedGroup && selectedTopic ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Back Buttons Hierarchy */}
          <div className="flex items-center space-x-3 text-xs font-bold">
            <button 
              onClick={() => handleSelectGroup(selectedGroup)}
              className="flex items-center text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Rudi kwenye {selectedGroup.name}</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 truncate max-w-[200px]">{selectedTopic.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Original Post & Replies (Width 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Original Topic Post Card */}
              <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-xl shadow-emerald-900/[0.02]">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500/10 text-orange-600 h-10 w-10 rounded-2xl flex items-center justify-center font-bold">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{selectedTopic.authorName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleLabelAndStyle(selectedTopic.authorRole).classes}`}>
                          {getRoleLabelAndStyle(selectedTopic.authorRole).label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(selectedTopic.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-2xl border border-emerald-100 flex items-center space-x-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{selectedTopic.replyCount} Majawabu</span>
                  </div>
                </div>

                <h2 className="text-lg font-black text-emerald-950 mb-3">{selectedTopic.title}</h2>
                <p className="text-xs font-semibold leading-relaxed text-slate-600 whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  {selectedTopic.content}
                </p>
              </div>

              {/* Replies Header */}
              <div className="flex items-center justify-between border-b border-emerald-150 pb-2">
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-widest flex items-center">
                  <MessageCircle className="h-4.5 w-4.5 text-orange-500 mr-1.5" />
                  Majawabu na Michango ya Jamii ({replies.length})
                </h3>
              </div>

              {/* Replies List */}
              {loadingReplies ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-[11px] font-bold text-slate-400 mt-2">Inapakia michango ya jamii...</p>
                </div>
              ) : replies.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border-2 border-slate-100 space-y-2">
                  <Sparkles className="h-8 w-8 text-orange-400 mx-auto animate-pulse" />
                  <p className="text-xs font-black text-slate-800">Kuwa wa kwanza kuchangia!</p>
                  <p className="text-[10px] text-slate-400">Andika ushauri wako hapa chini kumsaidia mwanajumuia mwenzako.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className="bg-slate-50/40 hover:bg-slate-50 transition-colors border-2 border-slate-100 rounded-3xl p-5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="bg-emerald-100 text-emerald-700 h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs">
                            {reply.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 mr-2">{reply.authorName}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getRoleLabelAndStyle(reply.authorRole).classes}`}>
                              {getRoleLabelAndStyle(reply.authorRole).label}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {formatTimeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed pl-10 whitespace-pre-line">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Write Reply Form */}
              <div className="bg-white border-2 border-emerald-150 rounded-3xl p-5 shadow-md">
                <form onSubmit={handleCreateReplySubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-emerald-950 flex items-center">
                      <Send className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                      Andika Ushauri au Jawabu Lako
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">Changia kama {customAuthorName}</span>
                  </div>
                  
                  <textarea
                    rows={4}
                    value={newReplyContent}
                    onChange={(e) => setNewReplyContent(e.target.value)}
                    required
                    placeholder="Andika ushauri wako kitaalamu, maoni au majibu ya swali hili..."
                    className="w-full text-xs font-semibold p-4 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs px-5 py-2.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Tuma Jawabu Sasa</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Col: Knowledge Guidelines / Quick Expert Tips */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black flex items-center text-orange-400 uppercase tracking-wider border-b border-emerald-800 pb-2">
                  <GraduationCap className="h-5 w-5 mr-1.5" />
                  Miongozo ya Mijadala
                </h3>
                <ul className="space-y-3 text-xs font-medium text-emerald-100/90 leading-relaxed list-disc list-inside">
                  <li><strong>Lugha ya Staha</strong>: Tumia Kiswahili fasaha, cha upendo na ushirikiano.</li>
                  <li><strong>Uthibitisho wa Ushauri</strong>: Unapomshauri mkulima kuhusu madawa, hakikisha unataja vipimo sahihi ili kuzuia uharibifu wa mazingira.</li>
                  <li><strong>Kuza Biashara</strong>: Ni marufuku kuweka matangazo ya bidhaa zisizohusiana na kilimo kwenye vikundi.</li>
                </ul>
              </div>

              {/* Farmers dynamic success quote card */}
              <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 space-y-3">
                <div className="flex items-center space-x-1.5 text-orange-600 font-black text-xs uppercase tracking-wider">
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Ukweli wa Kilimo</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 italic">
                  &quot;Kubadilishana maarifa kati ya wakulima na wataalamu ndiyo siri kuu ya kuongeza tija, kuzuia hasara za magonjwa ya mazao, na kugundua masoko mapya nchini.&quot;
                </p>
                <p className="text-[10px] text-slate-400 font-bold text-right">— Mshauri wetu wa AI</p>
              </div>
            </div>

          </div>

        </div>
      ) : selectedGroup ? (
        
        /* CASE B: SHOW ACTIVE TOPICS INSIDE A SELECTED GROUP */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Back button */}
          <button 
            onClick={() => setSelectedGroup(null)}
            className="flex items-center text-xs font-black text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-2xl transition-all border border-emerald-150"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Angalia Vikundi Vyote vya Jamii</span>
          </button>

          {/* Group Header Info Banner */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-xl">
            {/* Ambient pattern */}
            <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center p-8 pointer-events-none">
              <Sprout className="h-40 w-40" />
            </div>

            <div className="max-w-2xl relative z-10 space-y-2">
              <span className="text-[10px] font-black uppercase bg-emerald-800/60 text-emerald-300 px-3 py-1 rounded-full border border-emerald-700/50">
                Kundi Maalum la Mjadala
              </span>
              <h2 className="text-xl sm:text-2xl font-black">{selectedGroup.name}</h2>
              <p className="text-xs text-emerald-100/80 font-medium leading-relaxed">
                {selectedGroup.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left/Main Col: Topics List */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-widest">
                  Mada Zinazojadiliwa Sasa
                </h3>
                
                {/* Post New Topic Button */}
                {!isAddingTopic && (
                  <button
                    onClick={() => setIsAddingTopic(true)}
                    className="flex items-center space-x-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>Anzisha Mada Mpya</span>
                  </button>
                )}
              </div>

              {/* Add Topic Dialog Form Inline */}
              {isAddingTopic && (
                <div className="bg-white border-2 border-orange-200 rounded-3xl p-6 shadow-lg animate-in slide-in-from-top-3 duration-200">
                  <form onSubmit={handleCreateTopicSubmit} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                      <div className="flex items-center space-x-1.5">
                        <Plus className="h-5 w-5 text-orange-500" />
                        <h4 className="text-xs font-black text-emerald-950 uppercase">Anzisha Mada au Swali Mpya</h4>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingTopic(false)}
                        className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                      >
                        Funga
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700">Kichwa cha Mada / Swali</label>
                      <input 
                        type="text"
                        required
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder="Mfano: Jinsi ya kuongeza uzalishaji wa maziwa ya ng'ombe..."
                        className="w-full text-xs font-semibold p-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-orange-500 bg-slate-50/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-slate-700">Maelezo Kamili ya Swali au Wazo lako</label>
                      <textarea
                        required
                        rows={5}
                        value={newTopicContent}
                        onChange={(e) => setNewTopicContent(e.target.value)}
                        placeholder="Andika changamoto unayokumbana nayo, jinsi ulivyojaribu kuitatua, na msaada unaohitaji kutoka kwa wengine..."
                        className="w-full text-xs font-semibold p-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-orange-500 bg-slate-50/50"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingTopic(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all"
                      >
                        Ghairi
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all"
                      >
                        Tuma Mada Sasa
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Topics Loader / Output */}
              {loadingTopics ? (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-[11px] font-black text-slate-400 mt-2">Inapakia mada za mijadala...</p>
                </div>
              ) : topics.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-slate-100 space-y-3">
                  <MessageSquare className="h-8 w-8 text-emerald-300 mx-auto" />
                  <p className="text-xs font-black text-slate-800">Bado hakuna mada katika kundi hili</p>
                  <p className="text-[10px] text-slate-400">Anzisha mjadala wa kwanza kwa kubofya kitufe cha &apos;Anzisha Mada Mpya&apos; juu.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <div 
                      key={topic.id}
                      onClick={() => handleSelectTopic(topic)}
                      className="bg-white hover:bg-emerald-50/20 active:scale-[0.99] border-2 border-emerald-100/70 hover:border-emerald-400 rounded-3xl p-5 shadow-sm transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getRoleLabelAndStyle(topic.authorRole).classes}`}>
                            {getRoleLabelAndStyle(topic.authorRole).label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{topic.authorName}</span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{formatTimeAgo(topic.createdAt)}</span>
                        </div>
                        
                        <h4 className="text-sm font-black text-emerald-950 group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {topic.title}
                        </h4>
                        
                        <p className="text-xs font-semibold text-slate-500 line-clamp-2 leading-relaxed">
                          {topic.content}
                        </p>
                      </div>

                      {/* Reply badge right side */}
                      <div className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100 px-4 py-2 rounded-2xl flex flex-col items-center justify-center min-w-[72px] self-start sm:self-center">
                        <span className="text-sm font-black leading-none">{topic.replyCount}</span>
                        <span className="text-[9px] font-black uppercase mt-1 tracking-wider text-emerald-800/80">Majawabu</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Right sidebar: Expert Guidelines & FAQ */}
            <div className="space-y-4">
              <div className="bg-emerald-50 border-2 border-emerald-150 rounded-3xl p-5 space-y-4">
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest border-b border-emerald-200 pb-2 flex items-center">
                  <Compass className="h-4.5 w-4.5 text-orange-500 mr-1.5" />
                  Mada Zinazopendekezwa
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 space-y-1 cursor-pointer hover:border-emerald-500 transition-all">
                    <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Mbegu Bora</p>
                    <p className="text-xs font-black text-emerald-950 line-clamp-1">Mbegu gani ya alizeti inavumilia ukame?</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Majibu 14 • Saa 5 zilizopita</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 space-y-1 cursor-pointer hover:border-emerald-500 transition-all">
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Magonjwa ya Kuku</p>
                    <p className="text-xs font-black text-emerald-950 line-clamp-1">Kuku wanakohoa na kutoa mafua</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Majibu 29 • Jana mchana</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        
        /* CASE C: GENERAL GROUPS LIST VIEW (DASHBOARD) */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Search bar for groups */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/50 p-4 rounded-[2rem] border-2 border-emerald-100/50">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input 
                type="text" 
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                placeholder="Tafuta kikundi kwa jina au mada..."
                className="w-full text-xs font-semibold pl-11 pr-4 py-3 bg-white border-2 border-emerald-100/70 focus:border-emerald-500 rounded-2xl focus:outline-none shadow-inner"
              />
            </div>

            {/* Quick Create Group Button */}
            {!isAddingGroup && (
              <button 
                onClick={() => setIsAddingGroup(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>Anzisha Kikundi Kipya</span>
              </button>
            )}
          </div>

          {/* Create Group Modal / Input inline */}
          {isAddingGroup && (
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-xl animate-in slide-in-from-top-3 duration-200">
              <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center space-x-1.5">
                    <Plus className="h-5 w-5 text-emerald-600" />
                    <h4 className="text-xs font-black text-emerald-950 uppercase">Anzisha Kikundi Kipya cha Jamii</h4>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingGroup(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                  >
                    Funga
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700">Jina la Kikundi</label>
                    <input 
                      type="text"
                      required
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Mfano: Wakulima wa Pilipili kichaa..."
                      className="w-full text-xs font-semibold p-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700">Chagua Rangi ya Kikundi</label>
                    <select
                      value={newGroupColor}
                      onChange={(e) => setNewGroupColor(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                    >
                      <option value="from-emerald-500 to-teal-500">Kijani Bora (Emerald)</option>
                      <option value="from-blue-500 to-indigo-500">Buluu Safi (Blue)</option>
                      <option value="from-amber-500 to-orange-500">Njano/Chungwa (Orange)</option>
                      <option value="from-purple-500 to-pink-500">Zambarau (Purple)</option>
                      <option value="from-rose-500 to-red-500">Nyekundu (Rose)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700">Maelezo Kuhusu Kikundi Hiki</label>
                  <input 
                    type="text"
                    required
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Mjadala huu unahusu nini hasa na utasaidia vipi..."
                    className="w-full text-xs font-semibold p-3 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingGroup(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition-all"
                  >
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all"
                  >
                    Unda Kikundi
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Group Grid List */}
          {loadingGroups ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-xs font-bold text-slate-400 mt-3">Inapakia vikundi vya jamii...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-slate-100 space-y-3">
              <Compass className="h-10 w-10 text-emerald-300 mx-auto animate-pulse" />
              <p className="text-xs font-black text-slate-800">Hakuna vikundi vilivyopatikana</p>
              <p className="text-[10px] text-slate-400">Jaribu kubadilisha maneno ya utafutaji au anzisha kikundi chako mwenyewe!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGroups.map((group) => (
                <div 
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className="group bg-white hover:bg-emerald-50/[0.1] active:scale-[0.99] border-2 border-emerald-100/70 hover:border-emerald-500 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-900/[0.03] transition-all duration-300 cursor-pointer flex items-start space-x-5"
                >
                  {/* Styled Gradient Circle Icon */}
                  <div className={`h-14 w-14 bg-gradient-to-tr ${group.color} rounded-[1.4rem] flex items-center justify-center shadow-lg shadow-emerald-500/10 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {getIconComponent(group.icon)}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h3 className="text-sm font-black text-emerald-950 group-hover:text-emerald-700 transition-colors truncate">
                      {group.name}
                    </h3>
                    
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed line-clamp-2">
                      {group.description}
                    </p>

                    <div className="flex items-center space-x-4 pt-1.5">
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>Mijadala</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Iliundwa: {new Date(group.createdAt).toLocaleDateString("sw-TZ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
