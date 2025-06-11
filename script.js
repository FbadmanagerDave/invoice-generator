function getCurrencySymbol() {
  return document.getElementById("currency").value || "$";
}

function formatCurrency(amount) {
  const symbol = getCurrencySymbol();
  return `${symbol}${amount.toFixed(2)}`;
}

function updateTotal() {
  let total = 0;
  const symbol = getCurrencySymbol();
  document.querySelectorAll("#invoice-items tr").forEach(row => {
    const qty = parseFloat(row.cells[1]?.innerText || 0);
    const price = parseFloat(row.cells[2]?.innerText || 0);
    const lineTotal = qty * price;
    if (!isNaN(lineTotal)) {
      row.cells[3].innerText = formatCurrency(lineTotal);
      total += lineTotal;
    }
  });
  document.getElementById("invoice-total").innerText = formatCurrency(total);
}

document.addEventListener("DOMContentLoaded", function () {
  const currencySelector = document.getElementById("currency");
  const dateInput = document.getElementById("invoice-date");
  dateInput.value = new Date().toISOString().substring(0, 10);

  document.getElementById("add-row").addEventListener("click", function () {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td contenteditable="true">New Item</td>
      <td contenteditable="true">1</td>
      <td contenteditable="true">0</td>
      <td>${getCurrencySymbol()}0.00</td>
    `;
    document.getElementById("invoice-items").appendChild(row);
    updateTotal();
  });

  document.getElementById("invoice-items").addEventListener("input", updateTotal);
  currencySelector.addEventListener("change", updateTotal);
  updateTotal();

  document.getElementById("download-btn").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const companyName = document.querySelector("h2").innerText;
    const companyInfo = document.getElementById("company-info").value;
    const clientInfo = document.getElementById("client-info").value;
    const invoiceNumber = document.getElementById("invoice-number").value;
    const invoiceDate = document.getElementById("invoice-date").value;
    const notes = document.getElementById("invoice-notes").value;
    const currency = getCurrencySymbol();

    let y = 20;
    doc.setFontSize(16);
    doc.text(companyName, 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(companyInfo, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text("Bill To:", 20, y);
    doc.text(`Invoice #: ${invoiceNumber}`, 130, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(clientInfo, 20, y);
    doc.text(`Date: ${invoiceDate}`, 130, y);
    y += 15;

    // Table header
    doc.setFontSize(11);
    doc.text("Description", 20, y);
    doc.text("Qty", 100, y);
    doc.text("Price", 120, y);
    doc.text("Total", 150, y);
    y += 5;
    doc.line(20, y, 190, y);
    y += 5;

    // Line items
    document.querySelectorAll("#invoice-items tr").forEach(row => {
      const desc = row.cells[0]?.innerText || "";
      const qty = row.cells[1]?.innerText || "";
      const price = row.cells[2]?.innerText || "";
      const total = row.cells[3]?.innerText || "";
      doc.text(desc, 20, y);
      doc.text(qty, 100, y);
      doc.text(`${currency}${parseFloat(price).toFixed(2)}`, 120, y);
      doc.text(total, 150, y);
      y += 7;
    });

    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    // Total
    const totalText = document.getElementById("invoice-total").innerText;
    doc.setFontSize(12);
    doc.text(`Total: ${totalText}`, 150, y);

    // Notes
    y += 15;
    doc.setFontSize(10);
    doc.text("Notes:", 20, y);
    y += 7;
    doc.text(notes, 20, y, { maxWidth: 170 });

    doc.save(`Invoice-${invoiceNumber || "001"}.pdf`);
  });
});
