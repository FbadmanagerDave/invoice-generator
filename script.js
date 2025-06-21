function formatCurrency(value, symbol) {
  return `${symbol}${parseFloat(value || 0).toFixed(2)}`;
}

function updateTotals() {
  const rows = document.querySelectorAll("#invoice-rows tr");
  const currency = document.getElementById("currency").value;
  let subtotal = 0;

  rows.forEach(row => {
    const qty = parseFloat(row.cells[1].innerText.trim()) || 0;
    const rate = parseFloat(row.cells[2].innerText.trim()) || 0;
    const lineTotal = qty * rate;
    subtotal += lineTotal;
    row.querySelector(".line-total").innerText = formatCurrency(lineTotal, currency);
  });

  const taxRate = parseFloat(document.getElementById("tax-rate").value.trim()) || 0;
  const discountRate = parseFloat(document.getElementById("discount-rate").value.trim()) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const discountAmount = subtotal * (discountRate / 100);
  const total = subtotal + taxAmount - discountAmount;

  document.getElementById("subtotal").innerText = formatCurrency(subtotal, currency);
  document.getElementById("total").innerText = formatCurrency(total, currency);
}

document.addEventListener("DOMContentLoaded", () => {
  // Set today's date
  document.getElementById("invoice-date").value = new Date().toISOString().split("T")[0];

  // Add new row
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

  // Update when inputs change
  document.getElementById("invoice-rows").addEventListener("input", updateTotals);
  document.getElementById("currency").addEventListener("change", updateTotals);
  document.getElementById("tax-rate").addEventListener("input", updateTotals);
  document.getElementById("discount-rate").addEventListener("input", updateTotals);

  // Logo upload
  document.getElementById("logo-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const logo = document.getElementById("logo-preview");
        logo.src = reader.result;
        logo.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // Download as PDF
  document.getElementById("download-btn").addEventListener("click", async () => {
    const hiddenElements = document.querySelectorAll(".no-print");
    hiddenElements.forEach(el => el.style.display = "none");

    const printArea = document.querySelector(".invoice-container");

    const canvas = await html2canvas(printArea, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 20, 20, pdfWidth - 40, pdfHeight);
    const filename = `invoice-${document.getElementById("invoice-number").value || "001"}.pdf`;
    pdf.save(filename);

    hiddenElements.forEach(el => el.style.display = "");
  });

  updateTotals();
});
