import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
  buttonText: string;
  multiple?: boolean;
}

export const FileUploader = ({ onFileUpload, id, buttonText, multiple = false }: FileUploaderProps) => {
  return (
    <>
      <input
        type="file"
        onChange={onFileUpload}
        accept=".txt"
        multiple={multiple}
        className="hidden"
        id={id}
      />
      <Button
        onClick={() => document.getElementById(id)?.click()}
        className="flex-1"
      >
        {buttonText}
      </Button>
    </>
  );
};