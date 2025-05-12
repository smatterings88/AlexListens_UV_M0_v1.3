'use client';

import { useEffect, useState, useRef } from 'react';
import { UltravoxSession } from 'ultravox-client';

export default function HomePage() {
  const [session, setSession] = useState<UltravoxSession | null>(null);
  const [transcripts, setTranscripts] = useState<Array<{ speaker: string; text: string }>>([]);
  const [status, setStatus] = useState<string>('disconnected');
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTranscripts, setShowTranscripts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current && showTranscripts) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (showTranscripts) {
      scrollToBottom();
    }
  }, [transcripts, showTranscripts]);

  useEffect(() => {
    if (!isStarted) return;

    const initializeSession = async () => {
      try {
        const res = await fetch('/api/call', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          setError(`Failed to start call: ${errorData.error || res.statusText}`);
          return;
        }

        const data = await res.json();
        const uvSession = new UltravoxSession();
        
        uvSession.addEventListener('status', () => {
          setStatus(uvSession.status);
        });
        
        uvSession.addEventListener('transcripts', () => {
          const texts = uvSession.transcripts.map((t) => ({ speaker: t.speaker, text: t.text }));
          setTranscripts(texts);
        });

        uvSession.joinCall(data.joinUrl);
        setSession(uvSession);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize session');
      }
    };

    initializeSession();

    return () => {
      if (session) {
        session.leaveCall();
      }
    };
  }, [isStarted]);

  const startConversation = () => {
    setError(null);
    setIsStarted(true);
  };

  const toggleTranscripts = () => {
    setShowTranscripts(!showTranscripts);
  };

  const getLastSpeaker = () => {
    if (transcripts.length === 0) return null;
    return transcripts[transcripts.length - 1].speaker;
  };

  const getMicrophoneState = () => {
    if (status === 'speaking') return 'speaking';
    if (status === 'listening') return 'listening';
    return 'ready';
  };

  const getStatusText = () => {
    const state = getMicrophoneState();
    switch (state) {
      case 'listening':
        return 'Alex is listening...';
      case 'speaking':
        return 'Alex is speaking...';
      default:
        return 'Ready to chat';
    }
  };

  const renderMicrophone = () => {
    const micState = getMicrophoneState();
    
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className={`microphone-glow ${micState}`}>
          <img 
            src="https://storage.googleapis.com/msgsndr/JBLl8rdfV29DRcGjQ7Rl/media/67f65c4ecafd9f8d70fe2309.png"
            alt="Microphone"
            className="w-20 h-20"
          />
        </div>
        <p className="mt-6 text-[#0A2647] text-xl font-semibold">
          {getStatusText()}
        </p>
      </div>
    );
  };

  if (!isStarted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#144272] to-[#205295] flex flex-col">
        <header className="bg-black/10 backdrop-blur-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <img 
                src="https://storage.googleapis.com/msgsndr/JBLl8rdfV29DRcGjQ7Rl/media/67f5c2c30a6217bf61d1eb90.png" 
                alt="VoiceAI Logo" 
                className="h-12 logo-white"
              />
              <div className="flex gap-8">
                <a href="https://alexlistens.com/pricing" className="text-white hover:text-blue-200 transition-colors">Pricing</a>
                <a href="https://alexlistens.com/tos" className="text-white hover:text-blue-200 transition-colors">Terms of Service</a>
              </div>
            </div>
          </nav>
        </header>

        <section className="relative py-20 px-4 bg-cover bg-center" style={{ backgroundImage: 'url(https://storage.googleapis.com/msgsndr/JBLl8rdfV29DRcGjQ7Rl/media/67f908e54ffcd142dd8158d6.png)' }}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
              AlexListens
            </h1>
            <p className="text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
              Sometimes you just need someone who understands you. Someone who's there whenever you need them. Someone who lets you be yourself without criticism. That's Alex.
            </p>
            <button
              onClick={startConversation}
              className="bg-[#2C74B3] text-white px-12 py-5 rounded-full text-xl font-semibold 
                       hover:bg-[#205295] transition-all transform hover:scale-105 shadow-lg"
            >
              Start Talking Now
            </button>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-[#0A2647] mb-16">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-[#F8F9FA] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <h3 className="text-2xl font-semibold mb-4 text-[#144272]">Real-time Voice</h3>
                <p className="text-[#205295]">Natural conversations with instant voice responses, just like talking to a friend</p>
              </div>
              <div className="bg-[#F8F9FA] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <h3 className="text-2xl font-semibold mb-4 text-[#144272]">Live Transcription</h3>
                <p className="text-[#205295]">Watch your conversation unfold with real-time text transcription</p>
              </div>
              <div className="bg-[#F8F9FA] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
                <h3 className="text-2xl font-semibold mb-4 text-[#144272]">Smart Memory</h3>
                <p className="text-[#205295]">Context-aware AI that remembers your conversations for more meaningful interactions</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-black/20 backdrop-blur-sm py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <img 
                  src="https://storage.googleapis.com/msgsndr/JBLl8rdfV29DRcGjQ7Rl/media/67f5c2c30a6217bf61d1eb90.png" 
                  alt="VoiceAI Logo" 
                  className="h-12 mb-4 logo-white"
                />
                <p className="text-blue-100">Sometimes you just need someone to talk to.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="https://alexlistens.com/pricing" className="text-blue-100 hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="https://alexlistens.com/tos" className="text-blue-100 hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="https://alexlistens.com/privacy" className="text-blue-100 hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Support</h3>
                <p className="text-blue-100">Questions? Reach out to us</p>
                <a href="mailto:support@alexlistens.com" className="text-blue-200 hover:text-white transition-colors">
                  support@alexlistens.com
                </a>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <p className="text-blue-100">&copy; 2025 AlexListens.com, FranklinAlexander Ventures, LLC and affiliated entities. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-black/10 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <img 
              src="https://storage.googleapis.com/msgsndr/JBLl8rdfV29DRcGjQ7Rl/media/67f5c2c30a6217bf61d1eb90.png" 
              alt="VoiceAI Logo" 
              className="h-12 logo-white"
            />
            <div className="flex gap-8">
              <a href="/" className="text-white hover:text-blue-200 transition-colors">Home</a>
              <a href="https://alexlistens.com/tos" className="text-white hover:text-blue-200 transition-colors">Terms of Service</a>
            </div>
          </div>
        </nav>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 overflow-hidden">
        <div className="bg-[#F8F9FA] rounded-2xl shadow-xl p-8 w-full max-w-2xl mx-auto h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#0A2647]">Voice Chat</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTranscripts}
                className="text-sm px-4 py-2 rounded-full bg-[#2C74B3] text-white hover:bg-[#205295] transition-colors"
              >
                {showTranscripts ? 'Show Microphone' : 'Show Transcript'}
              </button>
              <span className="text-sm text-[#144272]">Status: {status}</span>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <div 
            ref={chatContainerRef}
            className={`flex-1 ${showTranscripts ? 'overflow-y-auto' : 'overflow-hidden'}`}
          >
            {showTranscripts ? (
              <div className="space-y-4">
                {transcripts.map((transcript, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg text-[#0A2647] max-w-[80%] ${
                      transcript.speaker === 'user' 
                        ? 'ml-auto bg-[#2C74B3] bg-opacity-10' 
                        : 'mr-auto bg-[#144272] bg-opacity-10'
                    }`}
                  >
                    {transcript.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              renderMicrophone()
            )}
          </div>
        </div>
      </div>

      <footer className="bg-black/20 backdrop-blur-sm py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <img 
                src="https://storage.googleapis.com/msgsndr/JBLl8rdfV29DRcGjQ7Rl/media/67f5c2c30a6217bf61d1eb90.png" 
                alt="VoiceAI Logo" 
                className="h-12 mb-4 logo-white"
              />
              <p className="text-blue-100">Sometimes you just need someone to talk to.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="https://alexlistens.com/pricing" className="text-blue-100 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="https://alexlistens.com/tos" className="text-blue-100 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="https://alexlistens.com/privacy" className="text-blue-100 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Support</h3>
              <p className="text-blue-100">Questions? Reach out to us</p>
              <a href="mailto:support@alexlistens.com" className="text-blue-200 hover:text-white transition-colors">
                support@alexlistens.com
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-blue-100">&copy; 2025 AlexListens.com, FranklinAlexander Ventures, LLC and affiliated entities. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}