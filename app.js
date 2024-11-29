const express = require("express");
const twilio = require("twilio");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const WebSocket = require("ws");

dotenv.config({ path: ".env" });
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Store call statuses
const callStatuses = {};
const callAnsweredBy = {};

// Function to broadcast call status to all connected clients
function broadcastCallStatus(callSid, status, answeredBy, called) {
  const message = JSON.stringify({ callSid, status, answeredBy, called });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_CALLER_ID,
  YOUR_PHONE_NUMBER,
} = process.env;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

let activeCallSid = null;

app.post("/start-calls", async (req, res) => {
  const { phoneNumbers } = req.body; // List of numbers to call
  console.log("Request to call:", phoneNumbers);
  const calls = [];

  // Construct the server URL from the request
  const serverUrl = `${req.protocol}://${req.get("host")}`;
  console.log(serverUrl);

  try {
    // Start parallel calls
    for (const number of phoneNumbers) {
      const call = client.calls.create({
        to: number,
        from: TWILIO_CALLER_ID,
        url: `${serverUrl}/amd`, // Use the constructed server URL
        machineDetection: "Enable",
        statusCallback: `${serverUrl}/call-status`, // Use the constructed server URL
        statusCallbackEvent: [
          "initiated",
          "ringing",
          "answered",
          "completed",
          "busy",
          "failed",
          "no-answer",
          "canceled",
        ],
      });
      calls.push(call);
    }

    res.status(200).json({ message: "Calls initiated." });
  } catch (err) {
    console.error("Error initiating calls:", err);
    res.status(500).json({ message: "Error initiating calls", error: err });
  }
});

// Handle AMD Detection
app.get("/amd", (req, res) => {
  const { CallSid, AnsweredBy, Called } = req.query;
  console.log(`AMD:  ${CallSid} :: ${Called} was answered by ${AnsweredBy}`);

  // Update the call status
  callAnsweredBy[CallSid] = AnsweredBy;
  // Broadcast the updated status to all connected clients
  broadcastCallStatus(CallSid, "answered", AnsweredBy, Called);

  // Construct the server URL from the request
  const serverUrl = `${req.protocol}://${req.get("host")}`;

  if (AnsweredBy !== "machine_start" && !activeCallSid) {
    activeCallSid = CallSid;

    // Hang up all other calls
    hangUpOtherCalls(CallSid);

    res.send(`
    <Response>
      <Dial>
        <Number>${YOUR_PHONE_NUMBER}</Number>
        <Say>Please hold while we connect your call.</Say>
      </Dial>
    </Response>
  `);
  } else {
    res.send("<Response><Hangup /></Response>"); // Hang up if not human
  }
});

// Handle call statuses
app.get("/call-status", (req, res) => {
  const { CallSid, CallStatus, Called } = req.query;
  console.log(
    `CallStatus:  ${CallSid} :: ${Called} status updated to ${CallStatus}`
  );

  // Update the call status
  callStatuses[CallSid] = CallStatus;
  // Broadcast the updated status to all connected clients
  broadcastCallStatus(CallSid, CallStatus, callAnsweredBy[CallSid], Called);

  if (CallStatus === "completed" && activeCallSid === CallSid) {
    console.log(`Call ${CallSid} connected to human and completed.`);
    activeCallSid = null; // Reset after call ends
  }

  res.status(200).send("OK");
});

// Helper to hang up other calls
async function hangUpOtherCalls(activeSid) {
  try {
    const calls = await client.calls.list({ status: "in-progress" });
    calls.forEach((call) => {
      console.log("call");
      if (call.sid !== activeSid) {
        client.calls(call.sid).update({ status: "completed" });
      }
    });
  } catch (err) {
    console.error("Error hanging up other calls:", err);
  }
}

// Upgrade HTTP server to WebSocket server
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
