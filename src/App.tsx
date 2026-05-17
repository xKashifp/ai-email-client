import React, { useState, useEffect } from 'react';
import { Search, Menu, Inbox, Send, Archive, Settings, Sparkles, Plus, Loader2, RefreshCw } from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inbox');
  
  // Data States
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);

  // AI States
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [draft, setDraft] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Add Account States
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imapForm, setImapForm] = useState({ email: '', password: '', host: 'imap.gmail.com', port: '993' });

  // Initial Load
  useEffect(() => {
    fetchEmailsFromDB();
  }, []);

  const fetchEmailsFromDB = async () => {
    setIsLoadingEmails(true);
    try {
      // In local dev, this would hit Express. On Vercel, it might fail.
      const response = await fetch('/api/emails').catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setEmails(data);
          if (!selectedEmail) setSelectedEmail(data[0]);
          setIsLoadingEmails(false);
          return;
        }
      }
      
      // FALLBACK FOR VERCEL DEMO
      const mockData = [{
        id: "mock-1",
        sender_name: "OpenAI Team",
        sender_email: "noreply@openai.com",
        subject: "Important updates to your API usage",
        snippet: "Hello Developer,\n\nWe are writing to let you know about upcoming changes to our API pricing structure and new models being released next month.\n\nEffective November 1st, we will be transitioning all legacy models to our new unified pricing tiers. In addition, we are releasing the new v2 endpoints which provide faster inference times and structured JSON outputs natively.\n\nAction Required: Please review your current integrations and migrate any v1 endpoint usage to v2 before November 30th. Legacy endpoints will be deprecated after this date.\n\nBest,\nThe OpenAI Team",
        date: new Date().toISOString()
      }];
      setEmails(mockData);
      if (!selectedEmail) setSelectedEmail(mockData[0]);
      
    } catch (err) {
      console.error("Failed to load emails");
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleSummarize = async () => {
    if (!selectedEmail) return;
    setIsSummarizing(true);
    try {
      // Use relative path so it maps to Vercel Serverless Functions in production
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailBody: selectedEmail.snippet })
      });
      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary("Failed to generate summary.");
      }
    } catch (error) {
      setSummary("Error connecting to backend server.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDraft = async (tone: string) => {
    if (!selectedEmail) return;
    setIsDrafting(true);
    setDraft('');
    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailContext: selectedEmail.snippet, tone: tone })
      });
      const data = await response.json();
      if (data.draft) {
        setDraft(data.draft);
      } else {
        setDraft("Failed to generate draft.");
      }
    } catch (error) {
      setDraft("Error connecting to backend server.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const response = await fetch('/api/accounts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imapForm)
      });
      const data = await response.json();
      
      if (data.success) {
        setShowAddAccount(false);
        setIsLoadingEmails(true);
        await fetch('/api/emails/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: data.accountId })
        });
        await fetchEmailsFromDB();
      } else {
        alert(data.error || "Failed to connect account.");
      }
    } catch (err) {
      alert("IMAP account management requires the local server. AI features (summarize & draft) are fully functional in this demo.");
    } finally {
      setIsAdding(false);
    }
  };

  const selectEmail = (email: any) => {
    setSelectedEmail(email);
    setSummary(null); // Clear summary for new email
    setDraft('');
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className={`w-64 glass-panel border-r border-border flex flex-col transition-all duration-300 z-20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full absolute h-full'}`}>
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Sparkles size={20} />
            <span>AI Email</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-textMuted hover:text-textMain">
            <Menu size={20} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full btn-primary flex items-center justify-center gap-2 shadow-primary/20">
            <Plus size={18} /> Compose
          </button>
          <button onClick={() => setShowAddAccount(true)} className="w-full btn-secondary text-xs flex items-center justify-center gap-2">
            <Settings size={14} /> Add IMAP Account
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          <SidebarItem icon={<Inbox size={18} />} label="Inbox" badge={emails.length.toString()} active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
          <SidebarItem icon={<Send size={18} />} label="Sent" active={activeTab === 'sent'} onClick={() => setActiveTab('sent')} />
          <SidebarItem icon={<Archive size={18} />} label="Archive" active={activeTab === 'archive'} onClick={() => setActiveTab('archive')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative">
        <header className="h-16 glass-panel border-b border-border/50 flex items-center justify-between px-4 sticky top-0">
          <div className="flex items-center w-full max-w-xl">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-textMuted hover:text-textMain mr-3 transition-colors">
                <Menu size={20} />
              </button>
            )}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
              <input type="text" placeholder="Search emails or ask AI..." className="input-field pl-10 h-10 rounded-full bg-surface border-transparent" />
            </div>
          </div>
          <button onClick={fetchEmailsFromDB} className="text-textMuted hover:text-primary transition-colors">
            <RefreshCw size={18} className={isLoadingEmails ? "animate-spin" : ""} />
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Email List */}
          <div className="w-full md:w-2/5 lg:w-1/3 border-r border-border/50 flex flex-col bg-background/50">
             <div className="flex-1 overflow-y-auto">
               {isLoadingEmails && emails.length === 0 ? (
                 <div className="p-8 text-center text-textMuted flex flex-col items-center">
                   <Loader2 className="animate-spin mb-2" size={24} />
                   <p>Loading emails...</p>
                 </div>
               ) : emails.length === 0 ? (
                 <div className="p-8 text-center text-textMuted">
                   <Inbox size={32} className="mx-auto mb-2 opacity-50" />
                   <p>Your inbox is empty.</p>
                   <p className="text-xs mt-1">Connect an IMAP account to start.</p>
                 </div>
               ) : (
                 emails.map(email => (
                   <div 
                     key={email.id} 
                     onClick={() => selectEmail(email)}
                     className={`p-4 border-b border-border/20 cursor-pointer transition-colors relative ${selectedEmail?.id === email.id ? 'bg-surface/80' : 'bg-surface/20 hover:bg-surface/50'}`}
                   >
                      {selectedEmail?.id === email.id && <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>}
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-xs text-textMain">{email.sender_name}</span>
                        <span className="text-[10px] text-textMuted">
                          {new Date(email.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm mb-1 truncate font-semibold text-textMain">{email.subject}</div>
                      <div className="text-xs text-textMuted line-clamp-2 leading-relaxed">{email.snippet}</div>
                   </div>
                 ))
               )}
             </div>
          </div>

          {/* Email Detail View */}
          {selectedEmail ? (
            <div className="hidden md:flex flex-1 flex-col bg-background">
               <div className="p-6 border-b border-border/50 flex justify-between items-start">
                 <div>
                   <h1 className="text-xl font-semibold mb-4 text-textMain leading-tight">{selectedEmail.subject}</h1>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold">
                       {selectedEmail.sender_name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <div className="font-medium text-sm flex items-center gap-2">
                         {selectedEmail.sender_name} <span className="text-xs text-textMuted font-normal">&lt;{selectedEmail.sender_email}&gt;</span>
                       </div>
                       <div className="text-xs text-textMuted mt-0.5">To: you, {new Date(selectedEmail.date).toLocaleString()}</div>
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* AI Summary Section */}
               <div className="px-6 py-4 border-b border-border/20">
                 {!summary && !isSummarizing ? (
                   <button onClick={handleSummarize} className="btn-secondary text-xs flex items-center gap-2 text-primary border-primary/30">
                     <Sparkles size={14} /> Generate AI Summary
                   </button>
                 ) : (
                   <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3 relative">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl"></div>
                      {isSummarizing ? (
                        <Loader2 className="animate-spin text-primary mt-0.5" size={18} />
                      ) : (
                        <Sparkles className="text-primary mt-0.5" size={18} />
                      )}
                      <div>
                        <h3 className="font-medium text-primary text-xs mb-1">AI Summary</h3>
                        <p className="text-sm text-textMain/90 leading-relaxed whitespace-pre-wrap">
                          {isSummarizing ? "Analyzing email content..." : summary}
                        </p>
                      </div>
                   </div>
                 )}
               </div>

               {/* Email Body */}
               <div className="p-6 flex-1 overflow-y-auto text-sm text-textMain/80 whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.snippet}
               </div>

               {/* AI Reply Area */}
               <div className="p-4 border-t border-border/50 bg-surface/30">
                 <div className="bg-background border border-border rounded-xl p-3 shadow-sm">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                      <button onClick={() => handleDraft('Professional Acknowledge')} disabled={isDrafting} className="whitespace-nowrap text-xs bg-surface hover:bg-surface/80 border border-border px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors text-textMuted disabled:opacity-50">
                        <Sparkles size={12} className="text-primary"/> Draft: Acknowledge
                      </button>
                      <button onClick={() => handleDraft('Push Back / Decline')} disabled={isDrafting} className="whitespace-nowrap text-xs bg-surface hover:bg-surface/80 border border-border px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors text-textMuted disabled:opacity-50">
                        <Sparkles size={12} className="text-primary"/> Draft: Push Back
                      </button>
                    </div>
                    
                    <textarea 
                      value={isDrafting ? "AI is typing..." : draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Reply..." 
                      className="w-full bg-transparent resize-none outline-none text-sm min-h-[80px]"
                    />
                    
                    <div className="flex justify-between items-center mt-2 border-t border-border/50 pt-2">
                      <button className="p-2 text-textMuted hover:text-textMain"><Settings size={16}/></button>
                      <button className="btn-primary py-1.5 px-4 text-xs font-medium flex items-center gap-2">
                        Send <Send size={14} />
                      </button>
                    </div>
                 </div>
               </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-background/50 text-textMuted">
              Select an email to view it.
            </div>
          )}
        </div>
      </main>

      {/* Add Account Modal Overlay */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-border shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-textMain">Connect IMAP Account</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-xs text-textMuted mb-1">Email Address</label>
                <input type="email" required value={imapForm.email} onChange={e => setImapForm({...imapForm, email: e.target.value})} className="input-field" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs text-textMuted mb-1">App Password (Not your normal password)</label>
                <input type="password" required value={imapForm.password} onChange={e => setImapForm({...imapForm, password: e.target.value})} className="input-field" placeholder="xxxx xxxx xxxx xxxx" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-textMuted mb-1">IMAP Host</label>
                  <input type="text" required value={imapForm.host} onChange={e => setImapForm({...imapForm, host: e.target.value})} className="input-field" placeholder="imap.gmail.com" />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-textMuted mb-1">Port</label>
                  <input type="number" required value={imapForm.port} onChange={e => setImapForm({...imapForm, port: e.target.value})} className="input-field" placeholder="993" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button type="button" onClick={() => setShowAddAccount(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={isAdding} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {isAdding ? <Loader2 className="animate-spin" size={16} /> : 'Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, label, badge, active, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${active ? 'bg-primary/10 text-primary font-medium' : 'text-textMuted hover:bg-surface hover:text-textMain'}`}>
      <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
      {badge && <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}
