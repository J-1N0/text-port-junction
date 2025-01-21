import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileUploader } from "./FileUploader";

interface ScriptEditorProps {
  title: string;
  content: string;
  onContentChange: (content: string) => void;
  onSingleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMultipleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  singleUploadText: string;
  multipleUploadText: string;
  placeholder: string;
}

export const ScriptEditor = ({
  title,
  content,
  onContentChange,
  onSingleFileUpload,
  onMultipleFileUpload,
  singleUploadText,
  multipleUploadText,
  placeholder,
}: ScriptEditorProps) => {
  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex gap-4 mb-4">
        <FileUploader
          onFileUpload={onSingleFileUpload}
          id={`${title.toLowerCase()}Single`}
          buttonText={singleUploadText}
        />
        <FileUploader
          onFileUpload={onMultipleFileUpload}
          id={`${title.toLowerCase()}Multiple`}
          buttonText={multipleUploadText}
          multiple
        />
      </div>
      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="h-[500px] font-mono bg-gray-900 text-gray-100"
        placeholder={placeholder}
      />
    </Card>
  );
};