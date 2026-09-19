import React from 'react';
interface NavbarProps { hasData: boolean; onReset: () => void; onExport: () => void; activeTab: string; setActiveTab: (tab: string) => void; }
export function Navbar({ hasData, onReset, onExport, activeTab, setActiveTab }: NavbarProps) {
  const tabs = [['prs', 'Polygenic scores'], ['pgx', 'Drug response'], ['clinvar', 'Clinical variants'], ['gwas', 'Study markers'], ['explorer', 'Variant search'], ['overview', 'File quality'], ['methods', 'Methods']];
  return <header className="site-header"><div className="header-inner">
    <div className="header-top"><span className="wordmark">iGenetic<span>Genotype notebook</span></span>{hasData && <div className="header-actions"><button onClick={onExport}>Export</button><button onClick={onReset}>Clear data</button></div>}</div>
    {hasData && <nav aria-label="Analysis views">{tabs.map(([id, label]) => <button key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}>{label}</button>)}</nav>}
  </div></header>;
}
