import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import ChatInterface from './components/ChatInterface';
import { analyzeFoodImage, sendFollowUpMessage } from './services/geminiService';
import { NutritionAnalysis, AppState, ChatMessage } from './types';
import { Loader2, ArrowLeft, Leaf, Sparkles, AlertTriangle, FileWarning } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisData, setAnalysisData] = useState<NutritionAnalysis | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    try {
      setAppState(AppState.ANALYZING);
      setErrorMsg(null);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        console.log("Image successfully converted to Base64 format for analysis.");
        setImagePreview(base64String);
        
        const base64Data = base64String.split(',')[1];
        
        try {
          // Normalize mime type for JPG
          let mimeType = file.type;
          if (mimeType === 'image/jpg') {
            mimeType = 'image/jpeg';
          }

          const result = await analyzeFoodImage(base64Data, mimeType);
          setAnalysisData(result);
          setAppState(AppState.RESULTS);
          setChatHistory([]); 
        } catch (err: any) {
          console.error(err);
          // Show specific error message from the service
          setErrorMsg(err.message || "Failed to analyze the image. Please try again.");
          setAppState(AppState.ERROR);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setErrorMsg("Error reading the image file.");
      setAppState(AppState.ERROR);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!analysisData) return;

    const newUserMsg: ChatMessage = { role: 'user', text };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setIsChatSending(true);

    try {
      const apiHistory = updatedHistory.slice(0, -1).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const responseText = await sendFollowUpMessage(apiHistory, text, analysisData);
      
      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I couldn't process that request." }]);
    } finally {
      setIsChatSending(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setAnalysisData(null);
    setImagePreview(null);
    setChatHistory([]);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-green-100 selection:text-green-900 pb-20">
      
      {/* Navbar - Premium Frosted Look */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={resetApp}>
            <div className="bg-gradient-to-br from-green-400 to-green-600 p-2 rounded-xl text-white shadow-lg shadow-green-200 group-hover:shadow-green-300 transition-all">
              <Leaf size={20} fill="currentColor" className="opacity-90" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Nutri<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">Vision</span>
            </h1>
          </div>
          {appState === AppState.RESULTS && (
             <button 
                onClick={resetApp}
                className="text-sm font-medium text-gray-500 hover:text-green-600 flex items-center gap-1.5 transition-colors px-4 py-2 rounded-full hover:bg-gray-50"
             >
               <ArrowLeft size={16} />
               New Scan
             </button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-10">
        
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 animate-fade-in-up">
            <div className="text-center max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-100 mb-2">
                <Sparkles size={14} />
                <span>AI-Powered Nutrition Analysis</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Know what you eat <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">in seconds.</span>
              </h2>
              <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                Upload a photo of your meal. Our AI identifies ingredients, estimates portions, and breaks down the calories instantly.
              </p>
            </div>
            
            <ImageUploader onImageSelect={handleImageSelect} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
              {[
                { title: "Smart Vision", desc: "Recognizes complex dishes instantly" },
                { title: "Calorie Split", desc: "See where your calories come from" },
                { title: "Health Insights", desc: "Get actionable nutrition advice" }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
                  <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-white p-6 rounded-full shadow-xl shadow-green-100 border border-green-50">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Analyzing your meal...</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Our AI is identifying ingredients and calculating nutritional values.
            </p>
            {imagePreview && (
              <div className="mt-10 w-64 h-64 rounded-3xl overflow-hidden shadow-2xl shadow-green-100/50 border-4 border-white">
                <img src={imagePreview} className="w-full h-full object-cover" alt="Analyzing" />
              </div>
            )}
          </div>
        )}

        {appState === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
             <div className="bg-red-50 p-6 rounded-full mb-6">
                {/* Visual distinction for config errors vs image errors */}
               {errorMsg?.includes('API Key') ? (
                  <FileWarning className="w-10 h-10 text-red-500" />
               ) : (
                  <AlertTriangle className="w-10 h-10 text-red-500" />
               )}
             </div>
             <h3 className="text-2xl font-bold text-gray-900 mb-3">
               {errorMsg?.includes('API Key') ? "Configuration Error" : "Analysis Failed"}
             </h3>
             <p className="text-gray-500 mb-8 leading-relaxed">
               {errorMsg || "We couldn't recognize the food in this image. Please try a clearer photo."}
             </p>
             <button 
               onClick={resetApp}
               className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
             >
               Try Another Photo
             </button>
           </div>
        )}

        {appState === AppState.RESULTS && analysisData && (
          <div className="space-y-10">
            <AnalysisResult data={analysisData} imagePreview={imagePreview} />
            <ChatInterface 
              chatHistory={chatHistory} 
              onSendMessage={handleSendMessage} 
              isSending={isChatSending} 
            />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;