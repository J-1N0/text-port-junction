import { Button } from "@/components/ui/button";

interface ExportButtonsProps {
  onSingleExport: () => void;
  onBatchExport: () => void;
  translations: {
    exportSingle: string;
    exportAll: string;
  };
}

export const ExportButtons = ({ onSingleExport, onBatchExport, translations }: ExportButtonsProps) => {
  return (
    <div className="text-center space-x-4">
      <Button onClick={onSingleExport} className="px-8 py-4 text-lg">
        {translations.exportSingle}
      </Button>
      <Button onClick={onBatchExport} className="px-8 py-4 text-lg">
        {translations.exportAll}
      </Button>
    </div>
  );
};