const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load your app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Allow print dialog
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('about:')) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });
}

// FIXED: Handle print request with NATIVE Windows print preview
ipcMain.on('print-barcode', (event, imageDataUrl) => {
  // Create a hidden print window
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Create HTML with the barcode image
  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Barcode</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: white;
        }
        img {
          max-width: 90%;
          height: auto;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
          -ms-interpolation-mode: nearest-neighbor;
        }
        @media print {
          @page {
            margin: 0;
          }
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img {
            max-width: 90%;
            height: auto;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            image-rendering: pixelated;
            -ms-interpolation-mode: nearest-neighbor;
          }
        }
      </style>
    </head>
    <body>
      <img src="${imageDataUrl}" alt="Barcode" />
    </body>
    </html>
  `;

  // Load the HTML into the print window
  printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(printHTML));

  // Wait for content to load, then open NATIVE print dialog with preview
  printWindow.webContents.on('did-finish-load', () => {
    // IMPORTANT: silent: false shows the native Windows print dialog with preview!
    printWindow.webContents.print({
      silent: false,           // ← FALSE = Shows native print dialog with preview
      printBackground: true,
      color: true,
      margins: {
        marginType: 'none'
      },
      pageSize: 'A4'          // Can be: A4, Letter, Legal, etc.
    }, (success, errorType) => {
      if (!success) {
        console.log('Print failed:', errorType);
      }
      // Close the hidden window after printing (or if user cancels)
      printWindow.close();
    });
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
