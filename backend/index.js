const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const WebSocket = require('ws');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });
const log = require("./helpers/logging");
const preview = require("./helpers/preview");
const response = require("./helpers/response");

puppeteer.use(StealthPlugin());
let wsClient = null, browser = null, page = null;
let streaming = false; 
let sendFrameTimeout;  
let pendingInputResolve = null;

app.use(cors());

wss.on('connection', async (ws) => {
  console.log('WebSocket client connected!');
  wsClient = ws;
  if(!browser || browser.connected === false) {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  }

  ws.on('message', function(message) {
    console.log('Received from client:', message.toString());
   
    if (pendingInputResolve) {
        pendingInputResolve(message.toString());
        pendingInputResolve = null;
    }
  });
});


app.get("/start", async (req, res) => {
  let responseSent = false;
  const searchParam = req.query.searchParam;
  const doLogin = req.query.doLogin;
  const userName = req.query.user_name;
  const waitTimeOut = req.query.waitTimeout;
  const pageTimeout = req.query.pageTimeout;
  
  try {
    streaming = true;
    async function sendtoClient () {
      if (!streaming) return;
      try{
        const base64Screenshot = await page.screenshot({ type: 'jpeg', quality: 80, encoding: 'base64' });
        preview(wsClient, base64Screenshot)
      }
     catch (err) {
        if (err.message.includes('Target closed')) {
          console.error("Browser closed during screenshot capture. Stopping recording.");
          log(wsClient, "Browser closed");
          return; 
        }
        throw err; 
      }
      sendFrameTimeout = setTimeout(sendtoClient, 100);
    } 
    function requestInput(text) {
      return new Promise((resolve) => {
          if (wsClient && wsClient.readyState === WebSocket.OPEN) {
              wsClient.send(JSON.stringify({ type: 'OTP', userInput: text }));
              pendingInputResolve = resolve;
          } else {
              console.error('connection error');
              resolve(null);
          }
      });
    }

    log(wsClient, "Process Started");
    await sendtoClient();

    await page.goto('https://www.croma.com', {   timeout: pageTimeout,  waitUntil: 'networkidle0' });
    // page.waitForNavigation({ waitUntil: 'networkidle0' })
    log(wsClient, `Waiting for ${waitTimeOut} ms`);
    await new Promise(resolve => setTimeout(resolve, waitTimeOut));

    if(JSON.parse(doLogin)) {
      await page.waitForSelector('.logged-in-user a');
      await page.click('.logged-in-user a');
      await page.waitForSelector('.MuiDialogContent-root input');
      await page.type('.MuiDialogContent-root input', userName);
      await page.waitForSelector('.MuiDialogContent-root button');
      await page.click('.MuiDialogContent-root button');
      await page.waitForSelector('#divInner input');
  
      const userInput = await requestInput('Please enter the OTP');
  
      console.log('input:', userInput);
  
      if(userInput) {
        await page.type('#divInner input', userInput);
        await new Promise(resolve => setTimeout(resolve, waitTimeOut));
        await page.keyboard.press('Enter');
      }
    }

    await page.waitForSelector('#search-AB-Testing input');
    await page.type('#search-AB-Testing input', searchParam);
    await page.keyboard.press('Enter');

    await page.waitForSelector('.cat-title-wrap');
    
    const h1Text = await page.$eval('.cat-title-wrap h1', el => el.textContent.trim());
    const h1Count = await page.$eval('.cat-title-wrap h1 span', el => el.textContent.trim());
    log(wsClient, `[Data] - ${h1Text} - ${h1Count}`);

    const firstProductLink = await page.$eval(
      'ul.product-list li.product-item:first-child a',
      a => a.href
    );
    log(wsClient, `[Data] - First Product Link - ${firstProductLink}`);

  let imgSrc = null;
  const firstProductImg = await page.$('ul.product-list li.product-item:first-child a div.product-img img');
  if (firstProductImg) {
    imgSrc = await page.evaluate(img => img.getAttribute('src'), firstProductImg);
    log(wsClient, `[Data] - Getting Image of it - ${imgSrc}`);
  }


   const productTitle = await page.$eval('ul.product-list li.product-item:first-child div.product-info h3 a', el => el.textContent.trim());
   log(wsClient, `[Data] - Getting title of  it - ${productTitle}`);

   const productPrice = await page.$eval('ul.product-list li.product-item:first-child div.product-info div.new-price span', el => el.textContent.trim());
   log(wsClient, `[Data] - Getting Price of it - ${productPrice}`);
   

    const firstProductAnchor = await page.$('ul.product-list li.product-item:first-child a');
    await firstProductAnchor.click();

    log(wsClient, `[Data] - Getting inside it - ${firstProductLink}`);

    await new Promise(resolve => setTimeout(resolve, waitTimeOut));

    response(wsClient, {productTitle, productPrice, imgSrc})
     
    if(!responseSent) {
      log(wsClient, "All Process Initiated");
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
      log(wsClient, `[Error] - ${JSON.stringify(e.message)}`);
      res.status(200).send(e.message)
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
    res.status(200).send(e.message);
  }

})




server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});


