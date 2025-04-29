# ProductScrapper


# How to Start the App

## Backend Setup

1. Go to the `backend` folder:
    ```bash
    cd backend
    ```
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Start the backend server:
    ```bash
    node index.js
    ```

## Frontend Setup

1. Go to the `frontend` folder:
    ```bash
    cd frontend
    ```
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Start the frontend server:
    ```bash
    npm start
    ```

The app will be running at: [http://localhost:3000](http://localhost:3000)

By default backend will be serving in [http://localhost:5000](http://localhost:5000)

## Inputs

1. #### Perform Login - will initiate login process with your given username / mobile by sending OTP.
2. #### SearchParam - will get the item you search in the site.
3. #### waitTimeout - allow us to configure the waitin timeout wherever it used.
4. #### pageTimeout - allow us to configure the initial page waiting period.
5. #### live preview - toggle preview option to see live web page stream of headless browser.
6. #### start/ stop - allows us to start with all required parameters and cancel the operation.

## Outputs

1. #### Logs - will print the logs that puppeteer script sends while performing the operation.
2. #### Response - will return the JSON of he searched product.


This app runs croma.com  as sample 
---

![app screenshot](https://github.com/user-attachments/assets/72e6faa2-476f-4c9f-b4a2-bc794f2ae691)



## Play with it!
