function formatCurrency(value, symbol) {
 return `${symbol}${parseFloat(value || 0).toFixed(2)}`;
}

function updateTotals () {
 const rows = document.querySelectorAll("#invoice-rows tr");
 const currency = document.getElementById("currency").value;
 let subtotal = 0;

 rows.forEach(row => {
 const qtyText = row.cells[1].innerText.trim();
 const rateText = row.cells[2].innerText.trim();
 const qty = parseFloat(qtyText);
 const rate = parseFloat(rateText);
 if (!isNaN(qty) && !isNaN(rate)) {
 const lineTotal = qty * rate;
 subtotal += lineTotal;
 row.querySelector(".line-total").innerText = formatCurrency(lineTotal, currency);
 } else {
 row.querySelector(".line-total").innerText = formatCurrency(0, currency);
 }
 });

 const taxRateText = document.getElementById("tax-rate").value.trim();
 const discountRateText = document.getElementById("discount-rate").value.trim();
 const taxRate = parseFloat(taxRateText) || 0;
 const discountRate = parseFloat(discountRateText) || 0;

 const taxAmount = subtotal * (taxRate / 100);
 const discountAmount = subtotal * (discountRate / 100);
 const total = subtotal + taxAmount - discountAmount;

 document.getElementById("subtotal").innerText = formatCurrency(subtotal, currency);
 document.getElementById("total").innerText = formatCurrency(total, currency);
}

document.addEventListener("DOMContentLoaded", () => {
 // Set current date
 const invoiceDate = document.getElementById("invoice-date");
 invoiceDate.value = new Date().toISOString().split("T")[0];

 // Add row
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

 // Update totals on input
 document.getElementById("invoice-rows").addEventListener("input", updateTotals);
 document.getElementById("currency").addEventListener("change", updateTotals);
 document.getElementById("tax-rate").addEventListener("input", updateTotals);
 document.getElementById("discount-rate").addEventListener("input", updateTotals);

 // Logo upload preview
 document.getElementById("logo-input").addEventListener("change", (e) => {
 const file = e.target.files[0];
 if (file && file.type.startsWith("image/")) {
 const reader = new FileReader();
 reader.onload = () => {
 const logo = document.getElementById("logo-preview");
 logo.src = reader.result;
 logo.style.display = "block";
 logo.style.maxWidth = "150px";
 logo.style.maxHeight = "80px";
 logo.style.objectFit = "contain";
 };
 reader.readAsDataURL(file);
 }
 });

 // PDF Download
 document.getElementById("download-btn").addEventListener("click", () => {
 const printArea = document.querySelector(".invoice-container");

 html2canvas(printArea, {
 scale: 2,
 useCORS: true,
 backgroundColor: "#ffffff"
 }).then(canvas => {
 const imgData = canvas.toDataURL("image/png");
 const { jsPDF } = window.jspdf;
 const pdf = new jsPDF("p", "pt", "a4");

 const pdfWidth = pdf.internal.pageSize.getWidth();
 const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

 pdf.addImage(imgData, "PNG", 20, 20, pdfWidth - 40, pdfHeight);
 const fileName = `invoice-${document.getElementById("invoice-number").value || '001'}.pdf`;
 pdf.save(fileName);
 });
 });

 updateTotals();
});
