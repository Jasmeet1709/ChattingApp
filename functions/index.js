/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Note: You will edit this file in the follow up codelab about the Cloud Functions for Firebase.

// Done: Import the Cloud Functions for Firebase and the Firebase Admin modules here.
    const functions = require('firebase-functions');
    const admin = require('firebase-admin');
    const nodemailer = require('nodemailer');
    admin.initializeApp();


    const gmailEmail = functions.config().gmail.email;
    const gmailPassword = functions.config().gmail.password;
    const mailTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailEmail,
            pass: gmailPassword,
        },
    });

    const APP_NAME = 'Chatting app';

    // Done: Write the addWelcomeMessages Function here.
    exports.addWelcomeMessages = functions.auth.user().onCreate(user => {
        console.log('A new user signed in for the first time.');
        const fullName = user.displayName || 'Anonymous';

        return admin.database().ref('messages').push({
            name: 'Firebase Bot',
            photoUrl: '/images/firebase-logo.png',
            text: `${fullName} signed in for the first time! Welcome!`,
        }).then(() => {
            console.log('Welcome message written to database.');
        });
    });
    //sending welcome mail
    exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
    // [END onCreateTrigger]
        // [START eventAttributes]
        const email = user.email; // The email of the user.
        const displayName = user.displayName; // The display name of the user.
        // [END eventAttributes]

        return sendWelcomeEmail(email, displayName);
    });

    // Sends a welcome email to the given user.
    function sendWelcomeEmail(email, displayName) {
        const mailOptions = {
            from: `${APP_NAME} <noreply@firebase.com>`,
            to: email,
        };

        // The user subscribed to the newsletter.
        mailOptions.subject = `Welcome to ${APP_NAME}!`;
        mailOptions.text = `Hey ${displayName || ''}! Welcome to ${APP_NAME}. I hope you will enjoy this app.`;
        return mailTransport.sendMail(mailOptions).then(() => {
            return console.log('New welcome email sent to:', email);
        });
    }

// Sends a notifications to all users when a new message is posted.
    exports.sendNotifications = functions.database.ref('/messages/{messageId}').onCreate(snapshot => {
        // Notification details.
        const text = snapshot.val().text;
        const payload = {
            notification: {
                title: `${snapshot.val().name} posted ${text ? 'a message' : 'an image'}`,
                body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
                icon: snapshot.val().photoUrl || '/images/profile_placeholder.png',
                click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
            }
        };

        let tokens = []; // All Device tokens to send a notification to.
        // Get the list of device tokens.
        return admin.database().ref('fcmTokens').once('value').then(allTokens => {
            if (allTokens.val()) {
                // Listing all tokens.
                tokens = Object.keys(allTokens.val());

                // Send notifications to all tokens.
                return admin.messaging().sendToDevice(tokens, payload);
            }
            return {results: []};
        }).then(response => {
            // For each notification we check if there was an error.
            const tokensToRemove = {};
            response.results.forEach((result, index) => {
                const error = result.error;
                if (error) {
                    console.error('Failure sending notification to', tokens[index], error);
                    // Cleanup the tokens who are not registered anymore.
                    if (error.code === 'messaging/invalid-registration-token' ||
                        error.code === 'messaging/registration-token-not-registered') {
                        tokensToRemove[`/fcmTokens/${tokens[index]}`] = null;
                    }
                }
            });
            return admin.database().ref().update(tokensToRemove);
        }).then(() => {
            console.log('Notifications have been sent and tokens cleaned up.');
            return null;
        });
    });