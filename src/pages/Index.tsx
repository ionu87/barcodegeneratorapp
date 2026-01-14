import { useState } from 'react';
import { Header } from '@/components/Header';
import { BarcodePreview } from '@/components/BarcodePreview';
import { BarcodeControls } from '@/components/BarcodeControls';
import { ChecksumCalculator } from '@/components/ChecksumCalculator';
import { BarcodeConfig, getDefaultConfig, validateInput } from '@/lib/barcodeUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Calculator } from 'lucide-react';

const Index = () => {
  const [config, setConfig] = useState<BarcodeConfig>(getDefaultConfig());
  const validation = validateInput(config.text, config.format);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Controls Panel */}
          <aside className="space-y-6">
            <Tabs defaultValue="generator" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generator" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Generator
                </TabsTrigger>
                <TabsTrigger value="checksum" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  Checksum
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6 p-6 bg-card rounded-xl border border-border shadow-sm">
                <TabsContent value="generator" className="mt-0">
                  <BarcodeControls
                    config={config}
                    onChange={setConfig}
                    isValid={validation.valid}
                    errorMessage={validation.message}
                  />
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
              isValid={validation.valid}
              errorMessage={validation.message}
            />
          </section>
        </div>

        {/* Quick Info */}
        <section className="mt-12 grid sm:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Multiple Formats</h3>
            <p className="text-sm text-muted-foreground">
              Support for CODE 39, CODE 128, EAN-13, UPC-A, ITF, MSI, Pharmacode, and more.
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Customizable</h3>
            <p className="text-sm text-muted-foreground">
              Adjust dimensions, colors, margins, and fonts to match your requirements.
            </p>
          </div>
          <div className="p-6 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-2">Checksum Tools</h3>
            <p className="text-sm text-muted-foreground">
              Calculate Mod 10, Mod 11, CODE 39, EAN-13, and UPC check digits instantly.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
