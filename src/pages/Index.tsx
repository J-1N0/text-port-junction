import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import JSZip from "jszip";
import { ScriptEditor } from "@/components/ScriptEditor";
import { ImportedFilesList } from "@/components/ImportedFilesList";
import { ExportButtons } from "@/components/ExportButtons";

interface FileContent {
  name: string;
  hdContent: string;
  threeDsContent: string;
}

const translations = {
  en: {
    hdVersion: "TGAAC",
    threeDsVersion: "3DS Version",
    importSingleHd: "Import Single HD File",
    importMultipleHd: "Import Multiple HD Files",
    importSingle3ds: "Import Single 3DS File",
    importMultiple3ds: "Import Multiple 3DS Files",
    hdPlaceholder: "HD content will appear here...",
    threeDsPlaceholder: "3DS content will appear here...",
    exportSingle: "Export Single Ported Text",
    exportAll: "Export All as ZIP",
    importedFiles: "Imported Files",
    ready: "Ready",
    missing: "Missing"
  },
  pt: {
    hdVersion: "TGAAC",
    threeDsVersion: "Versões 3DS",
    importSingleHd: "Importar um único arquivo",
    importMultipleHd: "Importar vários arquivos",
    importSingle3ds: "Importar um único arquivo",
    importMultiple3ds: "Importar vários arquivos",
    hdPlaceholder: "Conteúdo do script da versão TGAAC aparecerá aqui...",
    threeDsPlaceholder: "Conteúdo do script da versão 3DS aparecerá aqui...",
    exportSingle: "Exportar Script Portado",
    exportAll: "Exportar Todos como ZIP",
    importedFiles: "Arquivos Importados",
    ready: "Pronto",
    missing: "Faltando"
  }
};

const Index = () => {
  const [fileContents, setFileContents] = useState<FileContent[]>([]);
  const [currentHdContent, setCurrentHdContent] = useState("");
  const [currentThreeDsContent, setCurrentThreeDsContent] = useState("");
  const [language, setLanguage] = useState<"en" | "pt">("en");
  const { toast } = useToast();
  const t = translations[language];

  const portText = (hdContent: string, threeDsContent: string) => {
    if (!hdContent || !threeDsContent) {
      return "";
    }

    try {
      const hdSections = hdContent.split(/\[.*?\]/g);
      const threeDsSections = threeDsContent.split(/\[.*?\]/g);
      const hdHeaders: string[] = hdContent.match(/\[.*?\]/g) || [];
      const threeDsHeaders: string[] = threeDsContent.match(/\[.*?\]/g) || [];
      let newContent = threeDsSections[0] || "";

      for (let i = 0; i < threeDsHeaders.length; i++) {
        const currentHeader = threeDsHeaders[i];
        newContent += currentHeader;

        if (currentHeader.includes("L_META") || 
            currentHeader.includes("$INDICES") || 
            currentHeader.includes("$VERSION") || 
            currentHeader.includes("$HASHES") || 
            currentHeader.includes("$EXTRA")) {
          newContent += threeDsSections[i + 1];
          continue;
        }

        const hdIndex = hdHeaders.indexOf(currentHeader.replace("]", ",0]"));
        if (hdIndex !== -1 && hdSections[hdIndex + 1]) {
          const sectionContent = hdSections[hdIndex + 1];
          const endIndex = sectionContent.indexOf("<FIM>");
          const contentToAdd = endIndex !== -1 
            ? sectionContent.substring(0, endIndex) 
            : sectionContent;
            
          newContent += contentToAdd + "{end}\n\n";
        } else {
          newContent += threeDsSections[i + 1];
        }
      }

      return newContent;
    } catch (error) {
      console.error("Error porting text:", error);
      return "";
    }
  };

  const handleBatchHdFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContents(prev => {
          const existingFile = prev.find(f => f.name === file.name.replace(".txt", ""));
          if (existingFile) {
            return prev.map(f => 
              f.name === existingFile.name 
                ? { ...f, hdContent: content }
                : f
            );
          }
          return [...prev, { name: file.name.replace(".txt", ""), hdContent: content, threeDsContent: "" }];
        });
      };
      reader.readAsText(file);
    });
  };

  const handleBatchThreeDsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContents(prev => {
          const existingFile = prev.find(f => f.name === file.name.replace(".txt", ""));
          if (existingFile) {
            return prev.map(f => 
              f.name === existingFile.name 
                ? { ...f, threeDsContent: content }
                : f
            );
          }
          return [...prev, { name: file.name.replace(".txt", ""), hdContent: "", threeDsContent: content }];
        });
      };
      reader.readAsText(file);
    });
  };

  const handleSingleHdFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCurrentHdContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSingleThreeDsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCurrentThreeDsContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSingleExport = () => {
    if (!currentHdContent || !currentThreeDsContent) {
      toast({
        title: "Error",
        description: "Please import both files first",
        variant: "destructive",
      });
      return;
    }

    try {
      const newContent = portText(currentHdContent, currentThreeDsContent);
      const blob = new Blob([newContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ported_script.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Text has been ported and downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to port text. Please check your files.",
        variant: "destructive",
      });
    }
  };

  const handleBatchExport = async () => {
    if (fileContents.length === 0) {
      toast({
        title: "Error",
        description: "Please import files first",
        variant: "destructive",
      });
      return;
    }

    try {
      const zip = new JSZip();

      fileContents.forEach(file => {
        if (file.hdContent && file.threeDsContent) {
          const portedContent = portText(file.hdContent, file.threeDsContent);
          if (portedContent) {
            zip.file(`${file.name}_ported.txt`, portedContent);
          }
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ported_scripts.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "All files have been ported and downloaded as ZIP",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ZIP file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">TGAAC {'>'} TGAA3DS</h1>
          <Button
            onClick={() => setLanguage(lang => lang === "en" ? "pt" : "en")}
            variant="outline"
            className="px-4 py-2"
          >
            {language === "en" ? "PT" : "EN"}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ScriptEditor
            title={t.hdVersion}
            content={currentHdContent}
            onContentChange={setCurrentHdContent}
            onSingleFileUpload={handleSingleHdFileUpload}
            onMultipleFileUpload={handleBatchHdFileUpload}
            singleUploadText={t.importSingleHd}
            multipleUploadText={t.importMultipleHd}
            placeholder={t.hdPlaceholder}
          />
          <ScriptEditor
            title={t.threeDsVersion}
            content={currentThreeDsContent}
            onContentChange={setCurrentThreeDsContent}
            onSingleFileUpload={handleSingleThreeDsFileUpload}
            onMultipleFileUpload={handleBatchThreeDsFileUpload}
            singleUploadText={t.importSingle3ds}
            multipleUploadText={t.importMultiple3ds}
            placeholder={t.threeDsPlaceholder}
          />
        </div>

        <ExportButtons
          onSingleExport={handleSingleExport}
          onBatchExport={handleBatchExport}
          translations={{
            exportSingle: t.exportSingle,
            exportAll: t.exportAll,
          }}
        />

        <ImportedFilesList
          files={fileContents}
          translations={{
            importedFiles: t.importedFiles,
            ready: t.ready,
            missing: t.missing,
          }}
        />

        <img 
          src="/lovable-uploads/2652aed2-b47c-4555-9d53-a1001b289bda.png" 
          alt="JS Logo" 
          className="fixed bottom-4 right-4 w-16 h-16"
        />
      </div>
    </div>
  );
};

export default Index;
