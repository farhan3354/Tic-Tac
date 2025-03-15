import React from "react";
import { Routes ,Route } from "react-router-dom";
import "./App.css";
import AudioUploader from "./components/AudioInput";
import Board from "./components/Tick";

function App() {


  return (
    <Routes>
    <Route path="/" element={<AudioUploader/>} />
    <Route path="/board" element={<Board/>} />
    </Routes>
  
  );
}

export default App;
