interface ImportedFilesListProps {
  files: Array<{
    name: string;
    hdContent: string;
    threeDsContent: string;
  }>;
  translations: {
    importedFiles: string;
    ready: string;
    missing: string;
  };
}

export const ImportedFilesList = ({ files, translations }: ImportedFilesListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{translations.importedFiles}</h2>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
            <span>{file.name}</span>
            <div className="space-x-2">
              <span className={`px-2 py-1 rounded ${file.hdContent ? 'bg-green-600' : 'bg-red-600'}`}>
                HD: {file.hdContent ? translations.ready : translations.missing}
              </span>
              <span className={`px-2 py-1 rounded ${file.threeDsContent ? 'bg-green-600' : 'bg-red-600'}`}>
                3DS: {file.threeDsContent ? translations.ready : translations.missing}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};