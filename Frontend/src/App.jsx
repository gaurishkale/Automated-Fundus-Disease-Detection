import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Analyze from "./Analyze";
import FindDoctors from "./components/FindDoctors";
import Prevention from "./components/Prevention";
import History from "./History";
import Home from "./Home";
import Progress from "./Progress";
import ChatbotWidget from "./components/Chatbot/ChatbotWidget";

function App() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = window.setTimeout(() => setVisible(true), 30);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/history" element={<History />} />
        <Route path="/find-doctors" element={<FindDoctors />} />
        <Route path="/prevention" element={<Prevention />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
      <ChatbotWidget />
    </div>
  );
}

export default App;
