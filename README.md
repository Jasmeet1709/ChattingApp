# Firebase Chatting App

The link to run this app  [Firebase: Chatting app](https://webchatapp-4e5a3.firebaseapp.com/).

# Setting up a project on your machine
#### 1. Add project on [Firebase Console](https://console.firebase.google.com/)
#### 2. Enable Google Auth at Firebase console 
#### 3. Enable Google Cloud Storage at Firebase console 
#### 4. Install or uprade thr CLI by running the following npm command
    npm -g install firebase-tools
#### 5. Authorrize the firebase CLI by running 
    firebase login
#### 6. Open the clonned repositry in any editor which support node and set up th firebase CLI in app
    firebase use --add
#### 7. Install Cloud Functions dependencies locally by running
    cd functions
    npm install
#### 8. To be able to send emails with your Gmail account: enable access to [Less Secure Apps](https://www.google.com/settings/security/lesssecureapps) and [Display Unlock Captcha](https://accounts.google.com/DisplayUnlockCaptcha). For accounts with 2-step verification enabled [Generate an App Password](https://support.google.com/accounts/answer/185833).
#### 9. Set the ```gmail.email``` and ```gmail.password``` Google Cloud environment variables to match the email and password of the Gmail account used to send emails (or the app password if your account has 2-step verification enabled). For this use:
    firebase functions:config:set gmail.email="myusername@gmail.com" gmail.password="secretpassword"
# To run locally 
#### After setting up a project run the following command
    firebase serve
# Deploy and test
#### 1. Deploy your project using ```firebase deploy```
#### 2. Open the app using ```firebase open hosting:site```, this will open a browser.
#### 3. Sign in the web app in the browser using Google Sign-In and chat with friends by sharing your app link with friend.Each user should receive email confirmations with welcome message for first time sign up in app.
