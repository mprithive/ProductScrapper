import React, { useEffect, useState } from 'react';
import './App.css';


function App() {

    const [imgSrc, setImgSrc] = useState('');
  
    useEffect(() => {
      const ws = new WebSocket('ws://localhost:5000/ws');
  
      ws.onmessage = (event) => {
        setImgSrc('data:image/png;base64,' + event.data);
      };
  
      return () => {
        ws.close();
      };
    }, []);
  



    
    return (
      <div>
        <h1>Live Browser Stream</h1>
        {imgSrc && <img src={imgSrc} alt="Live Stream" />}
      </div>
    );
    
}

export default App;
