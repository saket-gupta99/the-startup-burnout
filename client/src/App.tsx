import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import Lobby from "./pages/Lobby";
import PageNotFound from "./pages/PageNotFound";
import Game from "./pages/Game";

export default function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        <Route path="/game/:roomCode" element={<Game />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
    <Toaster />
    </>
  );
}
