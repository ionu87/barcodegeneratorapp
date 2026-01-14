import { useState } from 'react';
import { Header } from '@/components/Header';
import { BarcodePreview } from '@/components/BarcodePreview';
import { BarcodeControls } from '@/components/BarcodeControls';
import { ChecksumCalculator } from '@/components/ChecksumCalculator';
import { ImageEffects, ImageEffectsConfig, getDefaultEffectsConfig } from '@/components/ImageEffects';
import { BatchGenerator } from '@/components/BatchGenerator';
import { BarcodeConfig, getDefaultConfig, validateInput } from '@/lib/barcodeUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Calculator, Sparkles, Layers } from 'lucide-react';

const Index = () => {
  const [config, setConfig] = useState<BarcodeConfig>(getDefaultConfig());
  const [effects, setEffects] = useState<ImageEffectsConfig>(getDefaultEffectsConfig());
  const validation = validateInput(config.text, config.format);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[420px_1fr] gap-8">
          {/* Controls Panel */}
          <aside className="space-y-6">
            <Tabs defaultValue="generator" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="generator" className="gap-1 text-xs px-2">
                  <Settings2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Generate</span>
                </TabsTrigger>
                <TabsTrigger value="effects" className="gap-1 text-xs px-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Effects</span>
                </TabsTrigger>
                <TabsTrigger value="batch" className="gap-1 text-xs px-2">
                  <Layers className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Batch</span>
                </TabsTrigger>
                <TabsTrigger value="checksum" className="gap-1 text-xs px-2">
                  <Calculator className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Checksum</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6 p-6 bg-card rounded-xl border border-border shadow-sm max-h-[calc(100vh-250px)] overflow-y-auto">
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
                  <BatchGenerator />
                </TabsContent>
                
                <TabsContent value="checksum" className="mt-0">
                  <ChecksumCalculator />
                </TabsContent>
              </div>
            </Tabs>
          </aside>

          {/* Preview Panel */}
          <section className="bg-card rounded-xl border border-border shadow-sm p-6">
            <BarcodePreview
              config={config}
              effects={effects}
              isValid={validation.valid}
              errorMessage={validation.message}
            />
          </section>
        </div>

        {/* Quick Info */}
        <section className="mt-12 grid sm:grid-cols-4 gap-6">
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Multiple Formats</h3>
            <p className="text-sm text-muted-foreground">
              CODE 39, CODE 128, EAN-13, UPC-A, ITF, MSI, Pharmacode, and more.
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Image Effects</h3>
            <p className="text-sm text-muted-foreground">
              Scale, contrast, blur, noise, rotation – like the original C++ tool.
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Batch Generation</h3>
            <p className="text-sm text-muted-foreground">
              Generate hundreds of barcodes at once with random values.
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Checksum Tools</h3>
            <p className="text-sm text-muted-foreground">
              Mod 10, Mod 11, CODE 39, EAN-13, and UPC check digits.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
