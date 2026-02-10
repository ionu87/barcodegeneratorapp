import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { BarcodePreview } from '@/components/BarcodePreview';
import { BarcodeControls } from '@/components/BarcodeControls';
import { ChecksumCalculator } from '@/components/ChecksumCalculator';
import { ImageEffects, ImageEffectsConfig, getDefaultEffectsConfig } from '@/components/ImageEffects';
import { BatchGenerator } from '@/components/BatchGenerator';
import { BatchPreview } from '@/components/BatchPreview';
import { BarcodeConfig, getDefaultConfig, validateInput } from '@/lib/barcodeUtils';
import { BarcodeImageResult } from '@/lib/barcodeImageGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Calculator, Sparkles, Layers } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [config, setConfig] = useState<BarcodeConfig>(getDefaultConfig());
  const [effects, setEffects] = useState<ImageEffectsConfig>(getDefaultEffectsConfig());
  const [activeTab, setActiveTab] = useState('generator');
  const [batchImages, setBatchImages] = useState<BarcodeImageResult[]>([]);
  const validation = validateInput(config.text, config.format);

  const handleBatchPrint = useCallback(() => {
    if (batchImages.length === 0) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) { toast.error('Pop-up blocked. Please allow pop-ups.'); return; }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Batch Barcodes</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: monospace; padding: 15mm; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
      .cell { display: flex; flex-direction: column; align-items: center; break-inside: avoid; padding: 10px; }
      .cell img { max-width: 100%; height: auto; image-rendering: crisp-edges; image-rendering: pixelated; }
      .cell span { margin-top: 8px; font-size: 13px; font-family: 'Courier New', monospace; color: #000; font-weight: 600; letter-spacing: 0.05em; }
      @media print { body { padding: 10mm; } .cell { break-inside: avoid; } img { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style></head><body><div class="grid">${
      batchImages.map(img => `<div class="cell"><img src="${img.dataUrl}" /><span>${img.value}</span></div>`).join('')
    }</div><script>
      const imgs = document.querySelectorAll('img');
      let loaded = 0;
      imgs.forEach(i => { if (i.complete) { loaded++; } else { i.onload = () => { loaded++; if(loaded>=imgs.length) window.print(); }; }});
      if(loaded >= imgs.length) window.print();
    </script></body></html>`);
    printWindow.document.close();
    printWindow.addEventListener('afterprint', () => printWindow.close());
  }, [batchImages]);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[460px_1fr] gap-8">
          {/* Controls Panel - Frosted Glass */}
          <aside className="space-y-6">
            <Tabs defaultValue="generator" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 p-1.5 bg-secondary/80 backdrop-blur-sm rounded-2xl h-auto gap-1">
                <TabsTrigger 
                  value="generator" 
                  className="gap-2 py-3 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-200 tab-glow"
                >
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Generate</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="effects" 
                  className="gap-2 py-3 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-200 tab-glow"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Effects</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="batch" 
                  className="gap-2 py-3 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-200 tab-glow"
                >
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Batch</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="checksum" 
                  className="gap-2 py-3 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-200 tab-glow"
                >
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Checksum</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6 p-6 glass-panel rounded-2xl shadow-xl max-h-[calc(100vh-280px)] overflow-y-auto">
                <TabsContent value="generator" className="mt-0">
                  <BarcodeControls
                    config={config}
                    onChange={setConfig}
                    isValid={validation.valid}
                    errorMessage={validation.message}
                  />
                </TabsContent>
                
                <TabsContent value="effects" className="mt-0">
                  <ImageEffects
                    config={effects}
                    onChange={setEffects}
                  />
                </TabsContent>

                <TabsContent value="batch" className="mt-0">
                  <BatchGenerator onImagesGenerated={setBatchImages} />
                </TabsContent>
                
                <TabsContent value="checksum" className="mt-0">
                  <ChecksumCalculator />
                </TabsContent>
              </div>
            </Tabs>
          </aside>

          {/* Preview Panel - Elevated Stage */}
          <section className="glass-panel rounded-2xl shadow-xl p-8">
            {activeTab === 'batch' ? (
              <BatchPreview
                images={batchImages}
                onPrint={handleBatchPrint}
                isGenerating={false}
              />
            ) : (
              <BarcodePreview
                config={config}
                effects={effects}
                isValid={validation.valid}
                errorMessage={validation.message}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
