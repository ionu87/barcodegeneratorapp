import { useState } from 'react';
import { Header } from '@/components/Header';
import { BarcodePreview } from '@/components/BarcodePreview';
import { BarcodeControls } from '@/components/BarcodeControls';
import { ChecksumCalculator } from '@/components/ChecksumCalculator';
import { ImageEffects, ImageEffectsConfig, getDefaultEffectsConfig } from '@/components/ImageEffects';
import { BatchGenerator } from '@/components/BatchGenerator';
import { BarcodeConfig, getDefaultConfig, validateInput } from '@/lib/barcodeUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Calculator, Sparkles, Layers, Zap, Shield, Download, QrCode } from 'lucide-react';

const Index = () => {
  const [config, setConfig] = useState<BarcodeConfig>(getDefaultConfig());
  const [effects, setEffects] = useState<ImageEffectsConfig>(getDefaultEffectsConfig());
  const validation = validateInput(config.text, config.format);

  return (
    <div className="min-h-screen bg-background grid-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[460px_1fr] gap-8">
          {/* Controls Panel */}
          <aside className="space-y-6">
            <Tabs defaultValue="generator" className="w-full">
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
              
              <div className="mt-6 p-6 bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl max-h-[calc(100vh-280px)] overflow-y-auto">
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
          <section className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl p-8">
            <BarcodePreview
              config={config}
              effects={effects}
              isValid={validation.valid}
              errorMessage={validation.message}
            />
          </section>
        </div>

        {/* Features Section */}
        <section className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Powerful Features</h2>
            <p className="text-muted-foreground">Everything you need to create perfect barcodes</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="feature-card p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg group">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Multiple Formats</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CODE 39, CODE 128, EAN-13, QR Code, DataMatrix, Aztec, and more.
              </p>
            </div>
            <div className="feature-card p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg group">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Image Effects</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Scale, contrast, blur, noise, rotation – full control over output.
              </p>
            </div>
            <div className="feature-card p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg group">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Batch Generation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate hundreds of barcodes at once with random values.
              </p>
            </div>
            <div className="feature-card p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg group">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Checksum Tools</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mod 10, Mod 11, Mod 43, Luhn, and many more algorithms.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;