export default function StatusVersoesPage() {
  return (
    <div className="h-[calc(100vh-85px)] overflow-hidden bg-[var(--color-surface)]">
      <iframe
        title="Daily Report"
        src="https://app.powerbi.com/reportEmbed?reportId=0b37a37f-e68d-4a35-840c-525a1cae5c4e&autoAuth=true&ctid=1a407a2d-7675-4d17-8692-b3ac285306e4&navContentPaneEnabled=false&filterPaneEnabled=false"
        frameBorder="0"
        allowFullScreen
        className="block w-full h-full"
      />
    </div>
  );
}