import React, { useState, useEffect, useRef } from 'react';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Layout, 
  Image as ImageIcon, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Monitor, 
  Smartphone,
  Eye,
  Type,
  Plus,
  Trash2,
  MoreHorizontal,
  Twitter,
  Youtube,
  Settings,
  Sparkles,
  Bot,
  X,
  Zap
} from 'lucide-react';

const PALETTE = {
  bg: 'bg-black',
  card: 'bg-[#1E293B]',
  accent: 'text-indigo-400',
  primary: 'bg-indigo-600',
  secondary: 'bg-slate-700',
  border: 'border-slate-800',
  textDim: 'text-slate-400',
  textLight: 'text-slate-100'
};

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', supportsStories: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', supportsStories: true },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', supportsStories: false },
  { id: 'pinterest', name: 'Pinterest', icon: Layout, color: 'text-red-500', supportsStories: false },
  { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-200', supportsStories: false },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', supportsStories: true }
];

const App = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram']);
  const [postType, setPostType] = useState('feed'); // 'feed' | 'story'
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('mobile');
  const [pinterestBoard, setPinterestBoard] = useState('');
  const [link, setLink] = useState('');

  // Config & API Keys State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configTab, setConfigTab] = useState('ai'); // 'ai' | 'social'
  const [aiProvider, setAiProvider] = useState('gemini');
  const [apiKeys, setApiKeys] = useState({ chatgpt: '', gemini: '', claude: '' });
  const [socialKeys, setSocialKeys] = useState({ ayrshare: '', facebook: '', instagram: '', linkedin: '', pinterest: '', twitter: '', youtube: '' });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);

  const fileInputRef = useRef(null);

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('p0stmaster_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.aiProvider) setAiProvider(parsed.aiProvider);
        if (parsed.apiKeys) setApiKeys(prev => ({ ...prev, ...parsed.apiKeys }));
        if (parsed.socialKeys) setSocialKeys(prev => ({ ...prev, ...parsed.socialKeys }));
      } catch (e) {
        console.error('Failed to parse config');
      }
    }
  }, []);

  const saveConfiguration = () => {
    const configToSave = { aiProvider, apiKeys, socialKeys };
    localStorage.setItem('p0stmaster_config', JSON.stringify(configToSave));
    setIsConfigOpen(false);
  };

  const handleAiAction = async (action) => {
    if (!apiKeys[aiProvider]) {
      setConfigTab('ai');
      setIsConfigOpen(true);
      return;
    }

    setIsAiGenerating(true);
    setIsAiMenuOpen(false);
    
    // Simulate API latency for the demo
    await new Promise(resolve => setTimeout(resolve, 1500));

    let generatedText = content;
    if (action === 'generate') {
      generatedText = "We are thrilled to announce our latest features. Stay tuned for more updates as we continue to build tools that empower creators and marketers alike. #Innovation #Growth";
    } else if (action === 'professional') {
      generatedText = "We are pleased to share our recent developments. Our team remains dedicated to providing industry-leading solutions. #BusinessStrategy #Leadership";
    } else if (action === 'hashtags') {
      generatedText = content + "\n\n#DigitalMarketing #SocialMediaStrategy #ContentCreation #BrandGrowth";
    }

    setContent(generatedText);
    setIsAiGenerating(false);
  };

  const togglePlatform = (id) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file
    }));
    setMedia(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (id) => {
    setMedia(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedPlatforms.length === 0 || (!content && media.length === 0)) return;

    // Verify API keys exist for selected platforms (or aggregator)
    const missingKeys = selectedPlatforms.filter(p => !socialKeys[p]);
    if (!socialKeys.ayrshare && missingKeys.length > 0) {
      setConfigTab('social');
      setIsConfigOpen(true);
      return;
    }

    setIsUploading(true);
    setUploadStatus('Processing assets...');
    
    // Simulate API calls to different platforms
    for (let platform of selectedPlatforms) {
      setUploadStatus(`Uploading to ${platform}...`);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    setUploadStatus('success');
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus(null);
      // Reset form if successful
      setContent('');
      setMedia([]);
      setLink('');
    }, 2000);
  };

  return (
    <div className={`min-h-screen ${PALETTE.bg} ${PALETTE.textLight} font-sans selection:bg-indigo-500/30`}>
      {/* Top Navigation */}
      <nav className={`h-16 border-b ${PALETTE.border} flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md bg-black/80`}>
        <div className="flex items-center gap-2">
          <div className={`${PALETTE.primary} p-1.5 rounded-lg`}>
            <Smartphone size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">p0stmaster</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">API: Connected</span>
          </div>
          <button 
            onClick={() => setIsConfigOpen(true)}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <Settings size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Composer */}
        <section className="lg:col-span-5 border-r border-slate-800 min-h-[calc(100vh-64px)] p-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Create Content</h1>
            <p className={PALETTE.textDim}>Draft your masterpiece for all channels in one place.</p>
          </header>

          <div className="space-y-8">
            {/* Platform Selection */}
            <div>
              <label className="text-sm font-semibold mb-4 block text-slate-300 uppercase tracking-wider">Select Platforms</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? `border-indigo-500 bg-indigo-500/10 ${platform.color}` 
                          : `${PALETTE.border} ${PALETTE.card} grayscale hover:grayscale-0 hover:border-slate-600`
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-xs mt-2 font-medium">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Type */}
            <div className="flex gap-4">
              <button 
                onClick={() => setPostType('feed')}
                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  postType === 'feed' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 bg-slate-800/40 text-slate-400'
                }`}
              >
                <Layout size={18} />
                <span className="font-semibold">Feed Post</span>
              </button>
              <button 
                onClick={() => setPostType('story')}
                disabled={!selectedPlatforms.every(p => PLATFORMS.find(pl => pl.id === p)?.supportsStories)}
                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                  postType === 'story' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 bg-slate-800/40 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                <Plus size={18} />
                <span className="font-semibold">Story</span>
              </button>
            </div>

            {/* Media Upload */}
            <div>
              <label className="text-sm font-semibold mb-4 block text-slate-300 uppercase tracking-wider">Media Assets</label>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className={`flex-shrink-0 w-32 h-32 rounded-xl border-2 border-dashed ${PALETTE.border} ${PALETTE.card} flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 hover:border-indigo-500 transition-all`}
                >
                  <ImageIcon size={28} />
                  <span className="text-xs font-medium">Add Media</span>
                </button>
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  multiple 
                  onChange={handleMediaUpload} 
                  accept="image/*,video/*"
                />
                {media.map((item) => (
                  <div key={item.id} className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden group">
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} className="w-full h-full object-cover" />
                    )}
                    <button 
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Caption/Description */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Caption</label>
                  <span className={`text-xs ${content.length > 2000 ? 'text-red-400' : 'text-slate-500'}`}>
                    {content.length} / 2200
                  </span>
                </div>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className={`w-full min-h-[160px] p-4 rounded-xl ${PALETTE.card} border ${PALETTE.border} focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none placeholder:text-slate-600`}
                />
                
                {/* AI Assist Toolbar */}
                <div className="relative mt-2">
                  <button 
                    onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
                    disabled={isAiGenerating}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      isAiGenerating 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                    }`}
                  >
                    {isAiGenerating ? (
                      <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    {isAiGenerating ? 'Generating...' : 'AI Assist'}
                  </button>

                  {isAiMenuOpen && (
                    <div className={`absolute top-full left-0 mt-2 w-48 ${PALETTE.card} border ${PALETTE.border} rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
                      <button onClick={() => handleAiAction('generate')} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">Generate Caption</button>
                      <button onClick={() => handleAiAction('professional')} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">Make Professional</button>
                      <button onClick={() => handleAiAction('hashtags')} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">Add Hashtags</button>
                    </div>
                  )}
                </div>
              </div>

              {selectedPlatforms.includes('pinterest') && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Pinterest Board</label>
                    <select 
                      value={pinterestBoard}
                      onChange={(e) => setPinterestBoard(e.target.value)}
                      className={`w-full p-3 rounded-lg ${PALETTE.card} border ${PALETTE.border} text-sm outline-none`}
                    >
                      <option>Select Board</option>
                      <option>Marketing Inspo</option>
                      <option>Tech Trends</option>
                      <option>Product Shots</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Source Link</label>
                    <input 
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                      className={`w-full p-3 rounded-lg ${PALETTE.card} border ${PALETTE.border} text-sm outline-none`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                disabled={isUploading || selectedPlatforms.length === 0}
                onClick={handleSubmit}
                className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 transition-all ${
                  isUploading ? 'bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{uploadStatus === 'success' ? 'Published' : uploadStatus}</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Publish Now</span>
                  </>
                )}
              </button>
              <button className="px-6 py-4 rounded-xl bg-slate-800 font-bold hover:bg-slate-700 transition-colors">
                <Clock size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Preview */}
        <section className={`lg:col-span-7 ${PALETTE.bg} p-8 flex flex-col items-center sticky top-16 h-[calc(100vh-64px)] overflow-y-auto`}>
          <div className="w-full max-w-4xl">
            <header className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Eye size={20} className={PALETTE.accent} />
                p0stmaster Preview
              </h2>
              <div className="flex bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Smartphone size={18} />
                </button>
                <button 
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Monitor size={18} />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Instagram Feed Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Instagram size={16} className="text-pink-500" />
                  <span className="text-sm font-bold opacity-80 uppercase tracking-tight">Instagram Feed</span>
                </div>
                <div className={`w-full ${PALETTE.card} rounded-2xl border ${PALETTE.border} overflow-hidden shadow-2xl`}>
                  <div className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5">
                      <div className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-900" />
                    </div>
                    <span className="text-xs font-bold">yourbrand.digital</span>
                  </div>
                  <div className="aspect-square bg-slate-900 relative flex items-center justify-center">
                    {media.length > 0 ? (
                      media[0].type === 'video' ? (
                        <video src={media[0].url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={media[0].url} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <ImageIcon size={48} className="text-slate-800" />
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex gap-3 text-slate-300">
                      <div className="w-5 h-5 rounded-sm border-2 border-current" />
                      <div className="w-5 h-5 rounded-sm border-2 border-current" />
                      <div className="w-5 h-5 rounded-sm border-2 border-current ml-auto" />
                    </div>
                    <p className="text-xs leading-relaxed">
                      <span className="font-bold mr-2">yourbrand.digital</span>
                      {content || <span className="text-slate-600 italic">Capturing the moment...</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* LinkedIn Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Linkedin size={16} className="text-blue-600" />
                  <span className="text-sm font-bold opacity-80 uppercase tracking-tight">LinkedIn Feed</span>
                </div>
                <div className={`w-full ${PALETTE.card} rounded-sm border ${PALETTE.border} shadow-xl p-4 space-y-3`}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-sm" />
                    <div>
                      <div className="text-xs font-bold">Your Professional Brand</div>
                      <div className="text-[10px] text-slate-500">Digital Strategist • 1h</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-3">
                    {content || "Sharing insights on the future of digital marketing and social orchestration..."}
                  </p>
                  <div className="aspect-[1.91/1] bg-slate-900 overflow-hidden border border-slate-800 rounded-sm">
                    {media.length > 0 ? (
                      <img src={media[0].url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-slate-800" />
                      </div>
                    )}
                  </div>
                  <div className="pt-2 flex justify-between border-t border-slate-800">
                    <div className="flex gap-4 text-slate-400 text-[10px] font-bold">
                      <span>Like</span>
                      <span>Comment</span>
                      <span>Repost</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* X (Twitter) Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Twitter size={16} className="text-slate-200" />
                  <span className="text-sm font-bold opacity-80 uppercase tracking-tight">X Feed</span>
                </div>
                <div className={`w-full ${PALETTE.card} rounded-xl border ${PALETTE.border} shadow-xl p-4 space-y-3`}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex-shrink-0" />
                    <div className="w-full">
                      <div className="text-sm font-bold">Your Brand <span className="text-slate-500 font-normal">@yourbrand · 1m</span></div>
                      <p className="text-sm text-slate-200 mt-1">
                        {content || "What is happening?!"}
                      </p>
                      {media.length > 0 && (
                        <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 mt-3">
                          {media[0].type === 'video' ? (
                            <video src={media[0].url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={media[0].url} className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instagram Story Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Plus size={16} className="text-purple-400" />
                  <span className="text-sm font-bold opacity-80 uppercase tracking-tight">Story Preview</span>
                </div>
                <div className="relative w-full aspect-[9/16] max-w-[280px] mx-auto bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-800 overflow-hidden shadow-2xl">
                   {/* Story Progress Bars */}
                   <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                      <div className="flex-1 h-0.5 bg-white/40 rounded-full" />
                      <div className="flex-1 h-0.5 bg-white/20 rounded-full" />
                   </div>
                   
                   {/* Media Content */}
                   {media.length > 0 ? (
                     <div className="w-full h-full">
                       <img src={media[0].url} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                       {/* Floating UI Elements */}
                       <div className="absolute top-8 left-4 flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-400" />
                         <span className="text-[10px] font-bold text-white">Your Story</span>
                       </div>
                     </div>
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-8 text-center">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-800 mb-4 flex items-center justify-center">
                          <Plus size={32} />
                        </div>
                        <p className="text-sm font-medium">Add media to see Story preview</p>
                     </div>
                   )}
                   
                   {/* Story Footer */}
                   <div className="absolute bottom-6 left-4 right-4 flex gap-3 items-center">
                     <div className="flex-1 h-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 flex items-center">
                       <span className="text-[10px] text-white/60">Send message...</span>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                        <Send size={16} />
                     </div>
                   </div>
                </div>
              </div>

              {/* Success Notification - Overlay */}
              {uploadStatus === 'success' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-500">
                  <div className="bg-slate-900 p-8 rounded-3xl border border-indigo-500/30 flex flex-col items-center shadow-2xl scale-110 animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Campaign Published</h3>
                    <p className="text-slate-400 text-center max-w-[240px]">
                      Your post is now live across {selectedPlatforms.length} social networks.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      {/* Bottom Floating Stats (Mock) */}
      <div className="fixed bottom-6 right-6 flex gap-4 pointer-events-none">
        <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl shadow-2xl pointer-events-auto hover:translate-y-[-4px] transition-transform">
           <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Estimated Reach</div>
           <div className="text-xl font-bold text-indigo-400">~14.2k</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl shadow-2xl pointer-events-auto hover:translate-y-[-4px] transition-transform">
           <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Optimal Time</div>
           <div className="text-xl font-bold text-emerald-400">14:00 PM</div>
        </div>
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`${PALETTE.card} border ${PALETTE.border} w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
            <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Settings size={20} className={PALETTE.accent} />
                Platform Configuration
              </h3>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex border-b border-slate-800 shrink-0 px-6 pt-2">
              <button 
                onClick={() => setConfigTab('ai')}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${configTab === 'ai' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                AI Assistants
              </button>
              <button 
                onClick={() => setConfigTab('social')}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${configTab === 'social' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Social APIs
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {configTab === 'ai' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Select Provider</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['gemini', 'chatgpt', 'claude'].map(provider => (
                        <button
                          key={provider}
                          onClick={() => setAiProvider(provider)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all ${
                            aiProvider === provider 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {provider}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      {aiProvider} API Key
                    </label>
                    <input 
                      type="password"
                      value={apiKeys[aiProvider]}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, [aiProvider]: e.target.value }))}
                      placeholder={`Enter your ${aiProvider} API key`}
                      className={`w-full p-3 rounded-xl bg-black border ${PALETTE.border} focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono`}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                      <Zap size={14} /> Aggregator (Recommended)
                    </label>
                    <input 
                      type="password"
                      value={socialKeys.ayrshare}
                      onChange={(e) => setSocialKeys(prev => ({ ...prev, ayrshare: e.target.value }))}
                      placeholder="Ayrshare or Nylas API Key"
                      className={`w-full p-3 rounded-xl bg-black border ${PALETTE.border} focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono mb-4`}
                    />
                  </div>
                  
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Individual Platform APIs</label>
                    {PLATFORMS.map(platform => (
                      <div key={platform.id}>
                        <label className="text-xs text-slate-500 block mb-1">{platform.name} API Key</label>
                        <input 
                          type="password"
                          value={socialKeys[platform.id] || ''}
                          onChange={(e) => setSocialKeys(prev => ({ ...prev, [platform.id]: e.target.value }))}
                          placeholder={`${platform.name} Key`}
                          className={`w-full p-2.5 rounded-lg bg-black border border-slate-800 focus:border-slate-600 outline-none text-sm font-mono`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                Keys are stored locally in your browser session and are never sent to our servers.
              </p>
            </div>
            
            <div className="p-6 pt-0 shrink-0">
              <button 
                onClick={saveConfiguration}
                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
