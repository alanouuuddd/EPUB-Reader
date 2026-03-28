const fileInput = document.getElementById('fileInput');
const pdfCanvas = document.getElementById('pdfCanvas');
const epubContainer = document.getElementById('epubContainer');
const controls = document.getElementById('controls');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let epubBook = null;
let epubRendition = null;

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileExt = file.name.split('.').pop().toLowerCase();

  if (fileExt === 'pdf') {
    epubContainer.style.display = 'none';
    pdfCanvas.style.display = 'block';
    controls.style.display = 'block';
    renderPDF(file);
  } else if (fileExt === 'epub') {
    pdfCanvas.style.display = 'none';
    epubContainer.style.display = 'block';
    controls.style.display = 'block';
    renderEPUB(file);
  } else {
    alert('Unsupported file type!');
  }
});

function renderPDF(file) {
  const reader = new FileReader();
  reader.onload = function() {
    const typedArray = new Uint8Array(this.result);
    pdfjsLib.getDocument(typedArray).promise.then((doc) => {
      pdfDoc = doc;
      totalPages = pdfDoc.numPages;
      currentPage = 1;
      showPDFPage(currentPage);
    });
  };
  reader.readAsArrayBuffer(file);
}

function showPDFPage(pageNum) {
  pdfDoc.getPage(pageNum).then(page => {
    const viewport = page.getViewport({scale: 1.5});
    const context = pdfCanvas.getContext('2d');
    pdfCanvas.height = viewport.height;
    pdfCanvas.width = viewport.width;
    page.render({canvasContext: context, viewport: viewport});
    pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
  });
}

prevBtn.addEventListener('click', () => {
  if (currentPage <= 1) return;
  currentPage--;
  showPDFPage(currentPage);
});

nextBtn.addEventListener('click', () => {
  if (currentPage >= totalPages) return;
  currentPage++;
  showPDFPage(currentPage);
});

function renderEPUB(file) {
  const reader = new FileReader();
  reader.onload = function() {
    const blob = new Blob([this.result], {type: "application/epub+zip"});
    epubBook = ePub(blob);
    epubRendition = epubBook.renderTo("epubContainer", {
      width: "100%",
      height: "100%"
    });
    epubRendition.display();
    pageInfo.textContent = "EPUB Loaded";
    
    prevBtn.onclick = () => epubRendition.prev();
    nextBtn.onclick = () => epubRendition.next();
  };
  reader.readAsArrayBuffer(file);
}