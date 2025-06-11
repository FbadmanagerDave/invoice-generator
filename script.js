function formatCurrency(value, symbol) {
  return `${symbol}${parseFloat(value || 0).toFixed(2)}`;
}

function updateTotals() {
  const rows = document.querySelectorAll("#invoice-rows tr");
  const currency = document.getElementById("currency").value;
  let subtotal = 0;

  rows.forEach(row => {
    const qty = parseFloat(row.cells[1].innerText) || 0;
    const rate = parseFloat(row.cells[2].innerText) || 0;
    const lineTotal = qty * rate;
    subtotal += lineTotal;
    row.querySelector(".line-total").innerText = formatCurrency(lineTotal, currency);
  });

  document.getElementById("subtotal").innerText = formatCurrency(subtotal, currency);
  document.getElementById("total").innerText = formatCurrency(subtotal, currency);
}

document.addEventListener("DOMContentLoaded", () => {
  const invoiceDate = document.getElementById("invoice-date");
  invoiceDate.value = new Date().toISOString().split("T")[0];

  document.getElementById("add-row").addEventListener("click", () => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td contenteditable="true">New Item</td>
      <td contenteditable="true">1</td>
      <td contenteditable="true">0</td>
      <td class="line-total">$0.00</td>
    `;
    document.getElementById("invoice-rows").appendChild(tr);
    updateTotals();
  });

  document.getElementById("invoice-rows").addEventListener("input", updateTotals);
  document.getElementById("currency").addEventListener("change", updateTotals);

  updateTotals();

  document.getElementById("download-btn").addEventListener("click", () => {
    const container = document.querySelector(".invoice-container");

    html2canvas(container, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "pt", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 20, 20, pdfWidth - 40, pdfHeight);
      pdf.save(`invoice-${document.getElementById("invoice-number").value || '001'}.pdf`);
    });
  });
});
