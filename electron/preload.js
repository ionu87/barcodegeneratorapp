const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printBarcode: (dataUrl, dims) => {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return;
    ipcRenderer.send('print-barcode', dataUrl, dims || null);
  },
});
