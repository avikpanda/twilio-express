function createWS() {
  console.log("Let's create a WS");
  const socket = new WebSocket(`wss://${location.host}`); // Replace with your server URL

  socket.onopen = () => {
    console.log("Connected to WebSocket server");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received call status update:", data);

    // Update your UI with the latest call status
    // For example, you can display the status in a table or a list
    updateCallStatusUI(data.callSid, data.status, data.answeredBy, data.called);
  };

  socket.onclose = () => {
    console.log("Disconnected from WebSocket server");
  };
}

// Function to update the UI with the latest call status
function updateCallStatusUI(callSid, status, answeredBy, called) {
  // Implement your UI update logic here
  // For example, you could find the call in a list and update its status
  const callElement = document.getElementById(callSid);
  if (!callElement) {
    // Create the call element inside the table in html
    const table = document.getElementById("call-status-table");
    const row = table.insertRow(-1);
    row.id = callSid;
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    const cell4 = row.insertCell(3);
    cell1.textContent = callSid;
    cell2.textContent = called;
    cell3.textContent = status;
    cell4.textContent = answeredBy ?? "";
  } else {
    const row = document.getElementById(callSid);
    const cell3 = row.cells[2];
    const cell4 = row.cells[3];
    cell3.textContent = status;
    cell4.textContent = answeredBy ?? "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  createWS(); // Call your WebSocket function or any other initialization code
});
