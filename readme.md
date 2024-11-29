# Twilio Express Caller

This project is a simple web application that utilizes Twilio's API to initiate phone calls and manage call statuses in real-time using WebSockets. It provides a user-friendly interface to monitor the status of calls made through the Twilio service.

## Features

- Initiate calls to multiple phone numbers.
- Real-time updates on call statuses (e.g., initiated, ringing, answered, completed).
- WebSocket connection for live updates on call statuses.
- User-friendly interface to display call information.

## Prerequisites

- Node.js (v16 or higher)
- Twilio account with a phone number
- Environment variables set up for Twilio credentials

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/twilio-express.git
   cd twilio-express
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Twilio credentials:

   ```plaintext
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_CALLER_ID=your_twilio_phone_number
   YOUR_PHONE_NUMBER=your_personal_phone_number
   PORT=3000
   ```

## Usage

1. Start the server:

   ```bash
   npm run dev
   ```

2. Open your web browser and navigate to `http://localhost:3000`.

3. Use the interface to input phone numbers and initiate calls.

## File Structure

```
twilio-express/
├── app.js                # Main application file
├── public/               # Public assets
│   ├── index.html       # HTML file for the frontend
│   └── script.js         # JavaScript file for handling WebSocket connections
├── .env                  # Environment variables
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express**: Web framework for Node.js.
- **Twilio**: API for making and receiving phone calls.
- **WebSocket**: Protocol for real-time communication.
- **HTML/CSS/JavaScript**: Frontend technologies for the user interface.
