'use client';

interface PDFViewerProps {
  title: string;
  fileKey?: string | null;
}

function getPdfUrlFromFileKey(fileKey: string): string {
  return `/api/proxy-pdf?fileKey=${encodeURIComponent(fileKey)}`;
}

export default function PDFViewer({ title, fileKey }: PDFViewerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {fileKey ? (
        <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <iframe
            src={getPdfUrlFromFileKey(fileKey)}
            className="w-full h-[400px] md:h-[500px] border-0"
            title={title}
          />
        </div>
      ) : (
        <div className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-500 text-center">
          Kein Dokument verfügbar.
        </div>
      )}
    </div>
  );
}


