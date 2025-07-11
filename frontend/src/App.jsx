import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Explore from './pages/Explore';
import Favorites from './pages/Favorites';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        {/* Main content area - allows scrolling by default */}
        <main className="flex-1">
          <Routes>
            <Route path="/chat" element={<Chat />} />
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;