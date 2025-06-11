function updateTotal() {
  const currencySymbol = document.getElementById("currency").value || "$";
  let total = 0;

  document.querySelectorAll("#invoice-items tr").forEach(row => {
    const qty = parseFloat(row.cells[1]?.innerText || 0);
    const price = parseFloat(row.cells[2]?.innerText || 0);
    const lineTotal = qty * price;
    if (!isNaN(lineTotal)) {
      row.cells[3].innerText = `${currencySymbol}${lineTotal.toFixed(2)}`;
      total += lineTotal;
    }
  });

  document.getElementById("invoice-total").innerText = `${currencySymbol}${total.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Auto set today’s date
  document.getElementById("invoice-date").valueAsDate = new Date();

  document.getElementById("add-row").addEventListener("click", () => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td contenteditable="true">New Item</td>
      <td contenteditable="true">1</td>
      <td contenteditable="true">0</td>
      <td>$0.00</td>
    `;
    document.getElementById("invoice-items").appendChild(row);
    updateTotal();
  });

  document.getElementById("invoice-items").addEventListener("input", updateTotal);
  document.getElementById("currency").addEventListener("change", updateTotal);
  updateTotal();

  document.getElementById("download-btn").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");

    const content = document.getElementById("invoice-generator");

    html2canvas(content, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 20, 20, pdfWidth - 40, pdfHeight);
      const invoiceNum = document.getElementById("invoice-number").value || "invoice";
      pdf.save(`${invoiceNum}.pdf`);
    });
  });
});
