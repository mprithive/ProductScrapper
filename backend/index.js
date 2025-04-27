const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const WebSocket = require('ws');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' }); // Important: WebSocket path set
puppeteer.use(StealthPlugin());
let wsClient = null;


wss.on('connection', (ws) => {
  console.log('WebSocket client connected!');
  wsClient = ws;
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


app.get("/", async (req, res) => {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    async function sendtoClient () {
      const screenshot = await page.screenshot({ encoding: 'base64' });
      if (wsClient && wsClient.readyState === WebSocket.OPEN) {
          console.log("Sending frame")
          wsClient.send(screenshot);
      }  
      setTimeout(sendtoClient, 40);
    } 
    await sendtoClient();

    await page.goto('https://www.croma.com', {   timeout: 30000,  waitUntil: 'networkidle0' });
    page.waitForNavigation({ waitUntil: 'networkidle0' })
    await new Promise(resolve => setTimeout(resolve, 10000));

    await page.waitForSelector('#search-AB-Testing input');
    await page.type('#search-AB-Testing input', 'IPhone 16e');
    await page.keyboard.press('Enter');
    res.send('Screenshot streaming started');


    // wss.on('connection', ws => {
    //     console.log('Client connected');
    
    //     const sendScreenshot = async () => {
    //       const screenshot = await page.screenshot({ encoding: 'base64' });
    //       if (ws.readyState === WebSocket.OPEN) {
    //         ws.send(screenshot);
    //       }
    //       setTimeout(sendScreenshot, 500); // Capture every 500ms
    //     };
    
    //     sendScreenshot();
    //   });


    // const sendScreenshot = async () => {
    //     const screenshotBuffer = await page.screenshot();
        
    //     fs.writeFileSync(`screenshot-${Date.now()}.png`, screenshotBuffer);
    //     // setTimeout(sendScreenshot, 500); // Capture every 500ms
    //   };
  
    // await sendScreenshot();

    // res.send("Success")
})





// (async () => {

//   wss.on('connection', ws => {
//     console.log('Client connected');


//   });
// })();

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});


