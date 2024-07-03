document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('calculateBtn').addEventListener('click', calculateSchedule);

let pdfDoc = null;

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function () {
        const typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
            pdfDoc = pdf;
            document.getElementById('numPages').textContent = `מספר העמודים: ${pdf.numPages}`;
            document.getElementById('pdfInfo').style.display = 'block';
        });
    };
    fileReader.readAsArrayBuffer(file);
}

function calculateSchedule() {
    if (!pdfDoc) {
        alert('Please upload a PDF file first.');
        return;
    }

    const numDays = parseInt(document.getElementById('daysInput').value);
    const startPage = parseInt(document.getElementById('startPageInput').value);
    const numPages = pdfDoc.numPages - startPage + 1;
    const pagesPerDay = Math.ceil(numPages / numDays);
    let startDate = new Date();

    pdfDoc.getData().then(function(pdfBytes) {
        editAndSavePDF(pdfBytes, startPage, pagesPerDay, startDate);
    });
}

const { PDFDocument, rgb } = PDFLib;

async function editAndSavePDF(pdfBytes, startPage, pagesPerDay, startDate) {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const numPages = pages.length;

    for (let i = startPage - 1; i < numPages; i++) {
        const page = pages[i];
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + Math.floor((i - startPage + 1) / pagesPerDay));
        const dateStr = formatDate(date);
        page.drawText(dateStr, {
            x: 50,
            y: page.getHeight() - 50,
            size: 12,
            color: rgb(0, 0, 0)
        });
    }

    const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
    const link = document.createElement('a');
    link.href = pdfDataUri;
    link.download = 'annotated.pdf';
    link.click();
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

