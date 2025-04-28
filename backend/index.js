const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const WebSocket = require('ws');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });
puppeteer.use(StealthPlugin());
let wsClient = null, browser = null, page = null;
let streaming = false; 
let sendFrameTimeout;  

app.use(cors());

wss.on('connection', async (ws) => {
  console.log('WebSocket client connected!');
  wsClient = ws;
  if(!browser || browser.connected === false) {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  }
});

//logged-in-user
// card-input-container card-input-login
// const test = document.getElementsByClassName("mf-dots")
// Array.from(test[0].children).forEach((ele, idx) => { ele.innerHTML = idx + 1})


//search-AB-Testing - > closest input div

  // Type into the input field inside the #search-AB-Testing div
//   await page.type('#search-AB-Testing input', 'Test Search');

  // Press Enter key
//   await page.keyboard.press('Enter');


app.get("/start", async (req, res) => {
  let responseSent = false;

  try {
    streaming = true;
    async function sendtoClient () {
      if (!streaming) return;
      try{
        const base64Screenshot = await page.screenshot({ type: 'jpeg', quality: 80, encoding: 'base64' });
        if (wsClient && wsClient.readyState === WebSocket.OPEN) {
            console.log("Sending frame")
            wsClient.send(JSON.stringify({
              type: "FRAME",
              data: base64Screenshot
            }));
        }
      }
     catch (err) {
        if (err.message.includes('Target closed')) {
          console.error("Browser closed during screenshot capture. Stopping recording.");
          return; 
        }
        throw err; 
      }
      sendFrameTimeout = setTimeout(sendtoClient, 100);
    } 
    await sendtoClient();

    await page.goto('https://www.croma.com', {   timeout: 30000,  waitUntil: 'networkidle0' });
    page.waitForNavigation({ waitUntil: 'networkidle0' })
    await new Promise(resolve => setTimeout(resolve, 10000));
    await page.waitForSelector('#search-AB-Testing input');
    await page.type('#search-AB-Testing input', 'IPhone 16');
    await page.keyboard.press('Enter');
    if(!responseSent) {
      res.status(200).send('Started');
      responseSent = true;
    }
  }
  catch(e) {
    if (e.message.includes('Navigating frame was detached')) {
      console.error("Browser closed during operation.");
      if(!responseSent) {
        responseSent = true;
        return res.status(200).send('Browser Closed');
      }
      
    }
    if(!responseSent) {
      res.status(500).send(e.message)
      responseSent = true;
    }
  }
})


app.get("/cancel", async (req, res)=> {
  try{
    recording = false; 
    if (sendFrameTimeout) {
      clearTimeout(sendFrameTimeout); 
    }

    if (browser) {
      await browser.close(); 
    }

    res.status(200).send(true);
  }
  catch(e) {
    res.status(500).send(e.message);
  }

})




server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});


