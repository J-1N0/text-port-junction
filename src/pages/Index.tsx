import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [hdContent, setHdContent] = useState("");
  const [threeDsContent, setThreeDsContent] = useState("");
  const { toast } = useToast();

  const handleHdFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setHdContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleThreeDsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setThreeDsContent(content);
      };
      reader.readAsText(file);
    }
  };

  const portText = () => {
    if (!hdContent || !threeDsContent) {
      toast({
        title: "Error",
        description: "Please import both files first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Split content into sections while preserving the original content
      const hdSections = hdContent.split(/\[.*?\]/g);
      const threeDsSections = threeDsContent.split(/\[.*?\]/g);

      // Get the section headers with explicit type
      const hdHeaders: string[] = hdContent.match(/\[.*?\]/g) || [];
      const threeDsHeaders: string[] = threeDsContent.match(/\[.*?\]/g) || [];

      // Create the new content starting with any content before the first section
      let newContent = threeDsSections[0] || "";

      // Process each section from the 3DS file
      for (let i = 0; i < threeDsHeaders.length; i++) {
        const currentHeader = threeDsHeaders[i];
        newContent += currentHeader;

        // Special handling for metadata sections
        if (currentHeader.includes("L_META") || 
            currentHeader.includes("$INDICES") || 
            currentHeader.includes("$VERSION") || 
            currentHeader.includes("$HASHES") || 
            currentHeader.includes("$EXTRA")) {
          // Keep the 3DS content for these sections
          newContent += threeDsSections[i + 1];
          continue;
        }

        // Find matching HD section
        const hdIndex = hdHeaders.indexOf(currentHeader.replace("]", ",0]"));
        if (hdIndex !== -1 && hdSections[hdIndex + 1]) {
          // Get content up to <FIM> or end of section
          const sectionContent = hdSections[hdIndex + 1];
          const endIndex = sectionContent.indexOf("<FIM>");
          const contentToAdd = endIndex !== -1 
            ? sectionContent.substring(0, endIndex) 
            : sectionContent;
            
          newContent += contentToAdd + "{end}\n\n";
        } else {
          // If no matching HD section found, keep the 3DS content
          newContent += threeDsSections[i + 1];
        }
      }

      // Create and trigger download
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Script Porter</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold mb-4">HD Version</h2>
            <div className="mb-4">
              <input
                type="file"
                onChange={handleHdFileUpload}
                accept=".txt"
                className="hidden"
                id="hdFile"
              />
              <Button
                onClick={() => document.getElementById("hdFile")?.click()}
                className="w-full"
              >
                Import HD File
              </Button>
            </div>
            <Textarea
              value={hdContent}
              onChange={(e) => setHdContent(e.target.value)}
              className="h-[500px] font-mono bg-gray-900 text-gray-100"
              placeholder="HD content will appear here..."
            />
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-xl font-semibold mb-4">3DS Version</h2>
            <div className="mb-4">
              <input
                type="file"
                onChange={handleThreeDsFileUpload}
                accept=".txt"
                className="hidden"
                id="threeDsFile"
              />
              <Button
                onClick={() => document.getElementById("threeDsFile")?.click()}
                className="w-full"
              >
                Import 3DS File
              </Button>
            </div>
            <Textarea
              value={threeDsContent}
              onChange={(e) => setThreeDsContent(e.target.value)}
              className="h-[500px] font-mono bg-gray-900 text-gray-100"
              placeholder="3DS content will appear here..."
            />
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={portText} className="px-8 py-4 text-lg">
            Export Ported Text
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
