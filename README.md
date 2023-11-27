# Gmail-VacationResponder-with-Google-OAuth2
This Node.js script is designed to interact with the Gmail API, specifically for checking emails, sending automated replies, and labeling/moving emails to a specific category.

Required Modules:

fs: File system module for reading and writing files.
googleapis: The Google APIs Node.js client library for accessing Google APIs.
promisify: Converts callback-based functions to Promise-based functions.
readline: Reads input from the command line.
Credentials and OAuth2 Setup:

base64url: Encodes a string to base64url format.
getAuthorizationCode: Generates an authorization URL and prompts the user to enter the code.
getAccessToken: Retrieves or obtains a new access token.
Gmail Initialization:

The initializeGmail function sets up the Gmail API client, retrieves or obtains access tokens, and returns a configured Gmail client.
Main Application Loop:

The runApplication function is the main loop of the application.
It repeatedly checks for new emails, sends automated replies, labels/moves emails, and sleeps for a random interval between 45 to 120 seconds.
Check for New Emails:

The checkForNewEmails function uses the Gmail API to check for the latest email in the inbox.
If a new email is found, it retrieves details such as sender and recipient addresses.
Send Replies:

The sendReplies function sends automated replies to the sender of the new email.
It encodes the reply message and sends it using the Gmail API.
Label and Move Email:

The labelAndMoveEmail function labels the processed email with a specified label.
If the label doesn't exist, it creates the label before applying it.
Running the Application:

The script runs the main application loop indefinitely, periodically checking for new emails and responding to them.
Note: Ensure that the Gmail API is enabled in the Google Cloud Console, and the OAuth2 credentials are correctly set up. The Gmail API client is initialized, and the script continuously checks for new emails, sends a predefined reply, and labels/moves the emails.

Note: I have removed the client_id and client_secret tokens from this repository, as Google was blocking access.
