import { useState, useEffect } from 'react';
import { Loader2, Activity, Mountain, Shield, Sparkles } from 'lucide-react';
import { Header } from './components/Header';
import { AthleteHubPanel } from './components/AthleteHubPanel';
import { AnalysisPanel } from './components/AnalysisPanel';
import { ChatPanel } from './components/ChatPanel';
import { defaultWorkoutMetrics } from './data/mockWorkout';
import { WorkoutMetrics } from './types';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/auth';
import { User } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Auth state
  const [needsAuth, setNeedsAuth] = useState(true);
  const [aiModel, setAiModel] = useState('gemini-3.5-flash');
  const [user, setUser] = useState<User | null>(null);
  
  // Strava State
  const [stravaConnected, setStravaConnected] = useState(false);
  
  useEffect(() => {
    // Check Strava connection status from local storage
    const storedToken = localStorage.getItem('strava_access_token');
    if (storedToken) {
      setStravaConnected(true);
    }

    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.endsWith('.vercel.app')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        if (event.data.token) {
          localStorage.setItem('strava_access_token', event.data.token);
        }
        setStravaConnected(true);
        handleStravaSync();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleStravaConnect = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await fetch(`/api/strava/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        alert('Please allow popups for this site to connect your Strava account.');
      }
    } catch (error) {
      console.error('Strava OAuth error:', error);
      alert('Error initiating Strava connection');
    }
  };

  const handleStravaSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('strava_access_token');
      const response = await fetch('/api/strava/activities', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        if (response.status === 401) {
          setStravaConnected(false);
          localStorage.removeItem('strava_access_token');
          throw new Error('Strava connection expired');
        }
        throw new Error('Failed to fetch Strava activities');
      }
      const activities = await response.json();
      
      if (!activities || activities.length === 0) {
        alert('No data found in Strava.');
        return;
      }

      // Parse activities to historical sessions
      const parsedHistory = activities.map((act: any) => ({
        id: act.id, // Store ID for fetching streams later
        date: new Date(act.start_date).toLocaleDateString('en-GB').slice(0,5).replace('/','-'), // DD-MM
        title: act.name,
        tss: act.suffer_score || Math.round(act.distance / 1000 * 10) || 40, // rough proxy if no suffer score
        avgPower: act.average_watts || 0,
        normPower: act.weighted_average_watts || 0,
        ifFactor: act.average_watts ? (act.average_watts / 225).toFixed(2) : 0,
        avgHr: act.average_heartrate || 0,
        maxHr: act.max_heartrate || 0
      }));

      const latest = parsedHistory[0];

      setMetrics(prev => ({
        ...prev,
        title: latest.title,
        date: latest.date,
        avgPower: latest.avgPower,
        normPower: latest.normPower,
        tss: latest.tss,
        ifFactor: latest.ifFactor,
        avgHr: latest.avgHr,
        maxHr: latest.maxHr,
        history: parsedHistory, // newest to oldest
        telemetryData: [] // reset telemetry until fetched
      }));

      // Fetch streams for latest activity if we have an ID
      if (latest.id) {
        fetchStravaStreams(latest.id);
      }

    } catch (err: any) {
      console.error(err);
      if (err.message !== "Strava connection expired") alert(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const fetchStravaStreams = async (activityId: string) => {
    try {
      const token = localStorage.getItem('strava_access_token');
      const response = await fetch(`/api/strava/activities/${activityId}/streams`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) return;
      const streams = await response.json();
      
      if (streams.time && streams.time.data) {
        const telemetry = streams.time.data.map((t: number, index: number) => ({
          timeMin: Math.round(t / 60),
          power: streams.watts ? streams.watts.data[index] : 0,
          heartRate: streams.heartrate ? streams.heartrate.data[index] : 0,
        }));
        
        // Decimate data if it's too large (e.g. keep max 200 points)
        const step = Math.ceil(telemetry.length / 200);
        const decimated = telemetry.filter((_: any, i: number) => i % step === 0);

        setMetrics(prev => ({
          ...prev,
          telemetryData: decimated
        }));
      }
    } catch(err) {
      console.error("Error fetching streams", err);
    }
  };

  // Google Sheets Config (keeping commented or as fallback)
  const spreadsheetId = '1crrSVAQFTZO8t8Geg1F0ZLM3DFtUBhPnrk0pc0vu7rE';
  const range = 'A:M';
  
  // Active Telemetry Metrics State
  const [metrics, setMetrics] = useState<WorkoutMetrics>(defaultWorkoutMetrics);


  // Chat state
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  // Listen to Firestore chat history
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.chatHistory) {
            setChatHistory(data.chatHistory);
          }
          if (data.strength) {
            setMetrics(prev => ({
              ...prev,
              strength: {
                ...prev.strength,
                ...data.strength
              }
            }));
          }
        }
        setIsChatLoaded(true);
      }, (error) => {
        console.error('Error fetching from Firestore:', error);
        alert('Error leyendo de la nube: ' + error.message);
        setIsChatLoaded(true);
      });
      return () => unsubscribe();
    } else {
      setChatHistory([]);
      setIsChatLoaded(false);
    }
  }, [user]);

  const saveChatHistory = async (newHistory: any[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { chatHistory: newHistory }, { merge: true });
    } catch (e: any) {
      console.error('Error saving chat history to Firestore:', e);
      alert('Error guardando chat: ' + e.message);
    }
  };

  const saveStrengthData = async (newStrength: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { strength: newStrength }, { merge: true });
    } catch (e: any) {
      console.error('Error saving strength data to Firestore:', e);
      alert('Error guardando fuerza: ' + e.message);
    }
  };

  useEffect(() => {
    initAuth(
      (u) => {
        setUser(u);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
  }, []);

  // Auto-sync on initial load if logged in and chat is empty
  useEffect(() => {
    if (!needsAuth && user && isChatLoaded && chatHistory.length === 0 && !loading && !syncing && stravaConnected) {
      handleStravaSync();
    }
  }, [needsAuth, user, isChatLoaded, chatHistory.length, stravaConnected]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      alert(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
  };


  const sendMessageToApex = async (message: string, isAnalysisRequest: boolean = false) => {
    setLoading(true);
    if (isAnalysisRequest) {
      setMetrics(prev => ({ ...prev, verdict: '' }));
    }

    const newHistory = [...chatHistory];
    const tempHistory = [...newHistory];

    newHistory.push({ role: 'user', parts: [{ text: message }] });
    setChatHistory(newHistory);
    saveChatHistory(newHistory);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: tempHistory, message, metrics, model: aiModel })
      });

      if (!response.ok) {
        let errStr = 'Network error';
        try {
            const errData = await response.json();
            errStr = errData.error || errStr;
        } catch(e) {}
        throw new Error(errStr);
      }

      const data = await response.json();
      let botResponse = data.text || '';

      // Parse TENDON_STATE tag
      const tendonMatch = botResponse.match(/\[TENDON_STATE:\s*(Optimal|Recovering|Fatigued|Óptimo|Optimo|Recuperando|Fatigado)\]/i);
      if (tendonMatch) {
        let newState = tendonMatch[1];
        if (newState.toLowerCase() === 'óptimo' || newState.toLowerCase() === 'optimo') newState = 'Optimal';
        if (newState.toLowerCase() === 'recuperando') newState = 'Recovering';
        if (newState.toLowerCase() === 'fatigado') newState = 'Fatigued';
        
        const newStrength = {
          ...metrics.strength,
          readiness: newState as any
        };
        saveStrengthData(newStrength);
        
        setMetrics(prev => ({
          ...prev,
          strength: newStrength
        }));
        // Remove the tag from the text shown to the user
        botResponse = botResponse.replace(/\[TENDON_STATE:\s*(Optimal|Recovering|Fatigued|Óptimo|Optimo|Recuperando|Fatigado)\]/i, '').trim();
      }

      const finalHistory = [...newHistory, { role: 'model', parts: [{ text: botResponse }] }];
      setChatHistory(finalHistory);

      if (isAnalysisRequest) {
        setMetrics(prev => ({ ...prev, verdict: botResponse }));
      }

      saveChatHistory(finalHistory);
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error al contactar con Apex: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (confirm('¿Deseas reiniciar la conversación con Apex?')) {
      setChatHistory([]);
      saveChatHistory([]);
    }
  };

  const handleSelectHistoricalSession = (session: any) => {
    setMetrics(prev => ({
      ...prev,
      title: session.title,
      date: session.date,
      avgPower: session.avgPower || prev.avgPower,
      normPower: session.normPower || prev.normPower,
      tss: session.tss || prev.tss,
      ifFactor: session.ifFactor || prev.ifFactor,
      avgHr: session.avgHr || prev.avgHr,
      maxHr: session.maxHr || prev.maxHr,
      intervals: [],
      telemetryData: [],
      verdict: '',
    }));
    
    if (session.id && stravaConnected) {
      fetchStravaStreams(session.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200 flex flex-col h-screen overflow-hidden">
      
      {/* Top Header matching reference image */}
      <Header
        title={metrics.title}
        date={metrics.date}
        user={user}
        syncing={syncing}
        onSyncStrava={handleStravaSync}
        stravaConnected={stravaConnected}
        onConnectStrava={handleStravaConnect}
        onClearChat={handleClearChat}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />

      {/* Main Workspace Grid */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full max-w-[1700px] mx-auto">
          
          {/* Column 1: Workout Telemetry (Left) */}
          <div className="lg:col-span-3 xl:col-span-3 h-full min-h-[480px]">
            <AthleteHubPanel
              metrics={metrics}
              syncing={syncing}
              isLoggedIn={!!user}
              onSelectSession={handleSelectHistoricalSession}
              onUpdateStrength={(field, value) => {
                const newStrength = {
                  ...metrics.strength,
                  [field]: value
                };
                saveStrengthData(newStrength);
                setMetrics(prev => ({
                  ...prev,
                  strength: newStrength
                }));
              }}
            />
          </div>

          {/* Column 2: Performance Analysis (Center) */}
          <div className="lg:col-span-4 xl:col-span-5 h-full min-h-[480px]">
            <AnalysisPanel 
              metrics={metrics} 
              loading={loading}
              onRequestAnalysis={() => {
                sendMessageToApex(`Analiza mi entrenamiento: ${metrics.title}. Potencia media: ${metrics.avgPower}W, NP: ${metrics.normPower}W, HR: ${metrics.avgHr}bpm. Por favor, entrega un resumen del diagnóstico usando el formato "Feedback de Apex" y "Prescripción Mañana", y añade una breve sección explicando cómo determinas el estado de mis tendones (boulder) basándote en la carga actual y recuperación.`, true);
              }}
            />
          </div>

          {/* Column 3: Consult Apex Chat (Right) */}
          <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[480px]">
            <ChatPanel
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              onSendMessage={sendMessageToApex}
              loading={loading}
              selectedModel={aiModel}
              setSelectedModel={setAiModel}
            />
          </div>

        </div>
      </main>


    </div>
  );
}
