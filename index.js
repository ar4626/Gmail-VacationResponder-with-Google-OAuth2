const fs = require('fs');
const { google } = require('googleapis');
const { promisify } = require('util');
const sleep = promisify(setTimeout); 

const client_id = "CLIENT ID";
const client_secret = "cLIENT sECRET";
const redirect_uris = REDIRECT URI;
const refreshToken = REFRESH TOKEN;
const SCOPES = SCOPE;

// Function to initialize Gmail API
async function initializeGmail() {
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    oAuth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) console.log('Refresh token:', tokens.refresh_token);
        console.log('Access token:', tokens.access_token);
    });

    try {
        oAuth2Client.setCredentials({ refresh_token: refreshToken });
        return google.gmail({ version: 'v1', auth: oAuth2Client, userEmail: 'ar2646@srmist.edu.in' });
    } catch (err) {
        console.error('Error loading credentials:', err);
        return null;
    }
}

function base64url(source) {
    let encoded = Buffer.from(source).toString('base64');
    encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return encoded;
}

// Function to check for new emails
async function checkForNewEmails(gmail) {
    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            labelIds: ['INBOX'],
            maxResults: 1,
        });

        const messages = response.data.messages || [];

        if (messages.length > 0) {
            const firstMessageId = messages[0].id;
            const messageDetails = await gmail.users.messages.get({
                userId: 'me',
                id: firstMessageId,
            });

            const toHeader = messageDetails.data.payload.headers.find(header => header.name === 'To');
            const fromHeader = messageDetails.data.payload.headers.find(header => header.name === 'From');
            const recipientAddress = toHeader ? toHeader.value : null;
            const senderAddress = fromHeader ? fromHeader.value : null;

            console.log('Recipient Address:', recipientAddress);
            console.log('Sender Address:', senderAddress);

            return {
                id: messageDetails.data.threadId,
                messages: [messageDetails.data],
                recipientAddress,
                senderAddress,
            };
        } else {
            console.log('No new emails found.');
            return null;
        }
    } catch (error) {
        console.error('Error checking for new emails:', error);
        return null;
    }
}

// Function to send replies to emails
async function sendReplies(gmail, emailDetails, userEmail) {
    try {
        if (emailDetails && emailDetails.messages && emailDetails.messages.length > 0) {
            const recipientAddress = emailDetails.senderAddress;
            const receivedSubject = emailDetails.messages[0].payload.headers.find(header => header.name === 'Subject').value;

            if (recipientAddress) {
                const rawMessage = `To: ${recipientAddress}\r\nFrom: ${userEmail}\r\nSubject: Re: ${receivedSubject}\r\n\r\nI am on vacation, will contact you soon.`;
                const encodedReply = base64url(rawMessage);
                
                const response = await gmail.users.messages.send({
                    userId: 'me',
                    requestBody: {
                        threadId: emailDetails.id,
                        raw: encodedReply,
                    },
                });
            
                if (response.status === 200) {
                    console.log('Reply sent successfully.');
                    return true;
                } else {
                    console.error('Error sending replies. Status code:', response.status);
                    return false;
                }
            } else {
                console.error('Error: Recipient address not found.');
                return false;
            }
        } else {
            console.error('Error: Email messages are undefined or empty.');
            return false;
        }
    } catch (error) {
        console.error('Error sending replies:', error);
        return false;
    }
}

// Function to label and move the email
async function labelAndMoveEmail(gmail, threadId, labelName) {
    try {
        // Use the Gmail API to get the list of labels
        const labels = await gmail.users.labels.list({
            userId: 'me',
        });

        // Check if the desired label exists
        const label = labels.data.labels.find(label => label.name === labelName);

        if (label) {
            // Apply the label to the thread
            await gmail.users.threads.modify({
                userId: 'me',
                id: threadId,
                requestBody: {
                    addLabelIds: [label.id],
                },
            });

            console.log(`Email labeled with "${labelName}"`);
            return true;
        } else {
            // If the label doesn't exist, create it
            const createdLabel = await gmail.users.labels.create({
                userId: 'me',
                requestBody: {
                    name: labelName,
                    labelListVisibility: 'labelShow',
                    messageListVisibility: 'show',
                },
            });

            if (createdLabel.status === 200) {
                console.log(`Label "${labelName}" created.`);
                // Apply the label to the thread
                await gmail.users.threads.modify({
                    userId: 'me',
                    id: threadId,
                    requestBody: {
                        addLabelIds: [createdLabel.data.id],
                    },
                });

                console.log(`Email labeled with "${labelName}"`);
                return true;
            } else {
                console.error(`Error creating label "${labelName}". Status code:`, createdLabel.status);
                return false;
            }
        }
    } catch (error) {
        console.error('Error labeling and moving email:', error);
        return false;
    }
}


// Main function to run the app
async function runApplication() {
    const gmail = await initializeGmail();

    if (!gmail) {
        console.error('Error initializing Gmail API');
        return;
    }
 
    while (true) {
        try {
            const emailDetails = await checkForNewEmails(gmail);

            if (emailDetails) {
                const success = await sendReplies(gmail, emailDetails, 'ar2646@srmist.edu.in');
                console.log(`New email received with ID: ${emailDetails.id}`);
                console.log(`Recipient Address: ${emailDetails.recipientAddress}`);

                if (success) {
                    // Label and move the email
                    await labelAndMoveEmail(gmail, emailDetails.id, 'VACATION');
                }
            }

            // Generate random interval between 45 to 120 seconds
            // const interval = Math.floor(Math.random() * (60 - 20 + 1) + 20);
            const interval = Math.floor(Math.random() * (120 - 45 + 1) + 45);

            console.log(`Waiting for ${interval} seconds...`);
            await sleep(interval * 1000); // Convert seconds to milliseconds
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// Run the application
runApplication();
