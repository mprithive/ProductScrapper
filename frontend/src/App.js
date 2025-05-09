import React, { useEffect, useState, useRef  } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import './App.css';
import { isNumberString } from './utils';
import { startOperation, cancelOperation } from './api';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function App() {

    const [userName, setUsername] = useState("");
    const [searchParam, setSearchParam] = useState("");
    const [waitTimeout, setWaitTimeout] = useState("");
    const [pageTimeout, setPageTimeout] = useState("");
    const [pagelogs, setPagelogs] = useState([]);
    const [doLogin, setDoLogin] = useState(false);
    const [response, setResponse] = useState(null);

    const [userNameErr, setUserNameErr] = useState(false);
    const [searchParamErr, setSearchParamErr] = useState(false);
    const [waitTimeoutErr, setWaitTimeoutErr] = useState(false);
    const [pageTimeoutErr, setPageTimeoutErr] = useState(false);

    const [showStream, setShowStream] = useState(false);
    const [started, setStarted] = useState(false);
    const canvasRef = useRef(null);
    

    const onEnableLiveStream = (e) => {
      setShowStream(e.target.checked);
    }

    const Start = () => {
      if(!userName || userName === "") {
        setUserNameErr(true)
        return
      }

      if(!searchParam || searchParam === "") {
        setSearchParamErr(true)
        return
      }

      if(!waitTimeout || waitTimeout === "" || !isNumberString(waitTimeout)) {
        setWaitTimeoutErr(true)
        return
      }

      if(!pageTimeout || pageTimeout === "" || !isNumberString(pageTimeout)) {
        setPageTimeoutErr(true)
        return
      }
      setStarted(true);
      startOperation({userName, searchParam, waitTimeout, pageTimeout, doLogin})
    }

    const Cancel = () => {
      cancelOperation().then(() => {
        setStarted(false);
        setTimeout(() => {
            window.location.reload();
        }, 1000)
      });
    } 

    useEffect(() => {
      const ws = new WebSocket('ws://localhost:5000/ws');
  
      ws.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        switch(parsed.type) {
          case "FRAME":
            if(showStream) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
        
              const base64Data = parsed.data;
              const img = new Image();
              img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              };
              img.src = 'data:image/jpeg;base64,' + base64Data;
            }
            return
          case "LOGS":
            setPagelogs((prevLogs) => [...prevLogs, parsed.data]);
            console.log(parsed.data);
            return
          case "OTP":
            const valueToSend = prompt(parsed.userInput); 
            ws.send(valueToSend);
            return
          case "RESPONSE":
            setResponse(parsed.data)
            return
        }
       
      };
  
      return () => {
        ws.close();
      };
    }, [showStream]);
  



    
    return (
      <div>
        <div className="container">
        <div style={{height : "40px"}}></div>
              <div className='row'>
                <div className='col-md-3'>
                    <div style={{backgroundColor : "#fff", height : "300px"}}>

                      <h6>Input Parameters</h6>
                        <FormGroup>
                          <FormControlLabel control={<Checkbox onChange={() => {
                            setDoLogin(() => {
                               return doLogin ? false : true
                            });
                          }} 
                          />} label="Perform login" />
                        </FormGroup>

                        <TextField  
                        onChange={(e) => {
                            setUserNameErr(false)
                            setUsername(e.target.value)
                        }} 
                        id="standard-basic"
                        label="Email / Mobile No"
                        variant="standard"
                        error={userNameErr}
                        disabled={started}
                        />

                        <TextField 
                        onChange={(e) => {
                          setSearchParamErr(false)
                          setSearchParam(e.target.value)
                        }} 
                        style={{marginTop : "30px"}}
                        id="standard-basic" 
                        label="Search Param" 
                        disabled={started}
                        error={searchParamErr}
                        variant="standard" />
                    </div>
                </div>
                <div className='col-md-4'>
                  <div style={{backgroundColor : "#fff", height : "300px"}}>
                    <h6>Configuration</h6>

                    <TextField 
                      id="standard-basic"
                      label="Wait Timeout"
                      variant="standard"
                      onChange={(e) => {
                        setWaitTimeoutErr(false);
                        setWaitTimeout(e.target.value)
                      }} 
                      error={waitTimeoutErr}
                      disabled={started}
                    />

                    <TextField 
                      id="standard-basic"
                      label="Page Timeout"
                      variant="standard"
                      style={{marginLeft : "10px"}}
                      onChange={(e) => {
                        setPageTimeoutErr(false);
                        setPageTimeout(e.target.value)
                      }} 
                      error={pageTimeoutErr}
                      disabled={started}
                    />
                    <div style={{marginTop : "30px"}}>
                      <h6> Live Preview </h6>
                      <Switch onChange={onEnableLiveStream}/>
                    </div>
                    <div style={{marginTop : "30px"}}>
                      <h6> Start / Stop</h6>
                      <Button  disabled={started} variant="contained" onClick={Start} color='string'>Start</Button>
                      <Button  disabled={!started} variant="contained" onClick={Cancel}   color='string' style={{marginLeft : "10px"}}>Cancel</Button>
                    </div>
                
                  </div>
                </div>


                <div className='col-md-5'>
                  {showStream ? 
                  <div style={{display : "flex", justifyContent : "center"}}>
                      <canvas   ref={canvasRef} width="530" height="300" style={{borderRadius : "10px", backgroundColor : "#000"}}></canvas>
                  </div>
                  : 
                  <div style={{display : "flex", justifyContent : "center"}}>
                    <div style={{display : "flex", justifyContent : "center", width : "530px", backgroundColor : "#000", height : "300px", border : "1px solid #ddd", borderRadius : "10px"}}>
                      <h6 style={{marginTop : "10%", color : "#fff"}}> Preview Paused!</h6>
                    </div>
                   
                  </div>
                  }
                  
                  
                </div>
              </div>
              <div className='row' style={{marginTop : "20px"}}>
                <div className='col-md-5'>
                <h6>Logs</h6>
                    <div className="inner-shadow" style={{borderRadius : "10px", backgroundColor : "#fff", height : "350px", maxHeight: "400px", overflow:"scroll", width : "500px"}}>
                      {pagelogs && pagelogs.map((log, idx) => (
                          <p key={idx}>{log}</p>
                      ))}
                    </div>
                </div>
                <div className='col-md-7' >
                <h6>Response</h6>
                <div className="inner-shadow" style={{borderRadius : "10px", backgroundColor : "#fff", height : "350px", width : "760px", maxWidth : "760px", overflow : "scroll"}}>
                {response  &&
                      <div style={{marginTop:"25px", marginLeft : "15px"}}>
                        <h5>Json : </h5>
                        <p>{JSON.stringify(response, null, 2)}</p>
                      </div>}
                     

                      {response && <div style={{marginTop:"25px", marginLeft : "15px"}}>
                          <h5>Order Cart:</h5>
                          <h6>Product Title : {response.productTitle}</h6>
                          <h6>Product Price : {response.productPrice}</h6>
                      </div>}
                    </div>
                </div>
              </div>
        </div>
      </div>
    );
    
}

export default App;
