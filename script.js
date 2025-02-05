const ssUrl = "https://script.google.com/macros/s/AKfycbyb4r9S_tNeXIc54rxeXieHvZyEj6GmEfVc6vEalstKW4k9zGxSkwQ1LOTrGtF-YySHwQ/exec"; // Replace with your Apps Script URL

document.addEventListener('DOMContentLoaded', () => {
  loadSalesData();
});

async function loadSalesData() {
  const response = await fetch(ssUrl + "?action=getSalesData");
  const data = await response.json();
  populateTable(data);
}

function populateTable(data) {
  const tableBody = document.getElementById('sales-table');
  tableBody.innerHTML = ''; // Clear existing rows

  data.forEach(row => {
    const newRow = tableBody.insertRow();
    const food = row[0]; // Food name
    const price = row[1]; // Price

    // Food and Price cells
    newRow.insertCell().textContent = food;
    newRow.insertCell().textContent = price;

    // Quantity (Cash) cell with buttons
    const cashQtyCell = newRow.insertCell();
    let cashQty = 0;
    const cashQtySpan = document.createElement('span'); // To display quantity
    cashQtySpan.textContent = cashQty;
    const cashPlusButton = createButton("+", () => updateQty(food, 'cash', 1, cashQtySpan));
    const cashMinusButton = createButton("-", () => updateQty(food, 'cash', -1, cashQtySpan));
    cashQtyCell.appendChild(cashMinusButton); // Minus button first
    cashQtyCell.appendChild(cashQtySpan);
    cashQtyCell.appendChild(cashPlusButton); // Then plus button

    // Quantity (QR) cell with buttons
    const qrQtyCell = newRow.insertCell();
    let qrQty = 0;
    const qrQtySpan = document.createElement('span'); // To display quantity
    qrQtySpan.textContent = qrQty;
    const qrPlusButton = createButton("+", () => updateQty(food, 'qr', 1, qrQtySpan));
    const qrMinusButton = createButton("-", () => updateQty(food, 'qr', -1, qrQtySpan));
    qrQtyCell.appendChild(qrMinusButton); // Minus button first
    qrQtyCell.appendChild(qrQtySpan);
    qrQtyCell.appendChild(qrPlusButton); // Then plus button

    // Money Received cell (initially 0)
    newRow.insertCell().textContent = 0;
  });
}


function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

async function updateQty(food, paymentType, change, qtySpan) {
    let currentQty = parseInt(qtySpan.textContent);
    if (currentQty + change >= 0) { // Prevent negative quantities
      qtySpan.textContent = currentQty + change;
      // Update Google Sheets (only when quantity changes)
      const response = await fetch(ssUrl + "?action=updateSalesData&food=" + food + "&paymentType=" + paymentType + "&quantity=" + (currentQty + change));
      const result = await response.text();
      if (result === "Data updated") {
        loadSalesData(); // Refresh the table to show the updated data
      } else {
        alert("Error updating data: " + result);
      }
    }
}

async function updateSalesData(food, paymentType, quantity) {
    const response = await fetch(ssUrl + "?action=updateSalesData&food=" + food + "&paymentType=" + paymentType + "&quantity=" + quantity);
    const result = await response.text();
    if (result === "Data updated") {
        loadSalesData(); // Refresh the table to show the updated data
    } else {
        alert("Error updating data: " + result);
    }
}
