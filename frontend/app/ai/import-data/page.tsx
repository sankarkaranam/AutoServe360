'use client';
import { useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Upload, Bot, Loader2, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { aiImportCsv, type AIImportCsvOutput } from '@/ai/flows/ai-import-csv';
import { useToast } from '@/hooks/use-toast';

function AiImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<'customer' | 'vehicle'>('customer');
  const [result, setResult] = useState<AIImportCsvOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcessFile = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a CSV file to process.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const csvDataUri = await convertFileToDataUri(file);
      const importResult = await aiImportCsv({
        csvDataUri,
        dataType,
      });
      setResult(importResult);
      toast({
        title: 'Processing Complete',
        description: 'AI analysis of your CSV file is finished.',
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not process the file. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">AI Data Importer</h1>
            <p className="text-muted-foreground">
              Upload a CSV file and let AI automatically map columns and validate your data.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Select File and Data Type</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">
                  Choose the CSV file you want to import.
                </p>
              </div>
              <div className="space-y-2">
                <Label>What type of data are you importing?</Label>
                <RadioGroup
                  value={dataType}
                  onValueChange={(value: 'customer' | 'vehicle') => setDataType(value)}
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">Customers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vehicle" id="vehicle" />
                    <Label htmlFor="vehicle">Vehicles</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleProcessFile} disabled={isLoading || !file}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bot className="mr-2 h-4 w-4" />
              )}
              Process with AI
            </Button>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>AI is analyzing your file... this may take a moment.</p>
            </div>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-accent"/>
                    AI Analysis Results
                </CardTitle>
                <CardDescription>
                  Review the AI's findings before finalizing the import.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Field Mapping</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(result.fieldMapping).map(([csv, db]) => (
                      <div key={csv} className="text-sm p-2 bg-muted rounded-md">
                        <p className="font-medium text-muted-foreground">{csv}</p>
                        <p className="font-semibold">&#8618; {db}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold mb-2">Validation Report</h3>
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>AI Validation</AlertTitle>
                        <AlertDescription className="font-mono whitespace-pre-wrap text-xs">
                            {result.validationReport}
                        </AlertDescription>
                    </Alert>
                </div>
                <Separator/>
                <div>
                    <h3 className="font-semibold mb-2">Import Summary</h3>
                    <p className="text-sm">{result.importSummary}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}

export default function AIImportDataPage() {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <SidebarInset>
                    <AiImportPage />
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
