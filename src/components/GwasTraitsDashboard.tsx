import React, { useState } from 'react';
import { GWASTraitResult } from '@/types/genomics';
import { Sparkles, ExternalLink, Activity, Search, ArrowUpRight, Lightbulb } from 'lucide-react';

interface GwasTraitsDashboardProps {
  traits: GWASTraitResult[];
}

export const GwasTraitsDashboard: React.FC<GwasTraitsDashboardProps> = ({ traits }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['All', 'Nutrition & Diet', 'Fitness & Performance', 'Sleep & Chronotype', 'Metabolism'];

  const filteredTraits = traits.filter(t => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.trait.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.gene.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.rsid.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getPunchyVerdict = (rsid: string, genotype: string) => {
    const gt = genotype.toUpperCase();
    if (rsid === 'rs762551') {
      if (gt === 'AA') return { title: 'Fast Coffee Processor ☕', tip: 'You clear caffeine quickly. Coffee in the morning gives you clean energy with minimal jitter.' };
      return { title: 'Slow Coffee Processor ☕', tip: 'Caffeine lingers in your system longer. Avoid coffee or energy drinks after 12 PM to protect deep sleep.' };
    }
    if (rsid === 'rs4988235') {
      if (gt.includes('A') || gt.includes('T')) return { title: 'Lactose Tolerant (Milk Friendly) 🥛', tip: 'Your body keeps producing lactase into adulthood. You can digest milk and dairy without issue.' };
      return { title: 'Lactose Sensitive (Non-Persistent) 🥛', tip: 'You produce less lactase enzyme as an adult. Choose lactose-free dairy or lactase tablets.' };
    }
    if (rsid === 'rs1815739') {
      if (gt === 'CC') return { title: 'Fast-Twitch Sprint / Power ⚡', tip: 'Your muscles produce alpha-actinin-3, optimizing fast-twitch fibers for explosive power and sprinting.' };
      if (gt === 'TT') return { title: 'Endurance & Stamina Engine 🏃', tip: 'Your muscle fibers favor slow-twitch oxidative efficiency, favoring distance running and cycling.' };
      return { title: 'Hybrid Muscle Profile 🏋️‍♂️', tip: 'You have a balanced blend of power and endurance muscle fibers.' };
    }
    if (rsid === 'rs671') {
      if (gt === 'GG') return { title: 'Normal Alcohol Breakdown 🍷', tip: 'Your liver enzymes clear acetaldehyde efficiently.' };
      return { title: 'Alcohol Flushing / Sensitivity 🍷', tip: 'Your liver clears alcohol breakdown products slowly, causing facial flushing. Moderate your intake.' };
    }
    if (rsid === 'rs1801260') {
      if (gt === 'TT') return { title: 'Early Bird / Morning Lark 🌅', tip: 'Your natural internal clock thrives with early wakeups and morning focus.' };
      return { title: 'Night Owl / Evening Peak 🌙', tip: 'Your natural alertness peaks in the late afternoon and evening.' };
    }
    if (rsid === 'rs5082') {
      if (gt === 'CC') return { title: 'High Saturated Fat Sensitivity 🥩', tip: 'Your body is sensitive to saturated fats (butter, fatty meats). Emphasize olive oil, avocados, and omega-3s.' };
      return { title: 'Standard Fat Metabolism 🥑', tip: 'Standard metabolic response to dietary saturated fats.' };
    }
    return { title: 'Normal Genetic Variation', tip: 'Standard population trait variation.' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-base rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Everyday Genetic Traits & Lifestyle Wiring
              </h2>
            </div>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Genome-Wide Association Study (GWAS) findings translated into practical everyday impacts—how you process caffeine, digest dairy, build muscle fibers, and sleep.
            </p>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4.5" />
          <input
            type="text"
            placeholder="Search by trait, gene (e.g. ACTN3, MCM6, CYP1A2), or rsID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-800 font-mono placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Traits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTraits.map(trait => {
          const punchy = getPunchyVerdict(trait.rsid, trait.patientGenotype);

          return (
            <div
              key={trait.rsid}
              className="surface-base rounded-2xl p-6 sm:p-7 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono font-semibold">
                    {trait.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{punchy.title}</h3>
                  <p className="text-xs text-slate-500 font-mono">{trait.trait}</p>
                </div>

                <div className="text-right font-mono">
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/snp/${trait.rsid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center space-x-1"
                  >
                    <span>{trait.rsid}</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  </a>
                  <span className="block text-xs text-slate-500 mt-0.5">{trait.gene}</span>
                </div>
              </div>

              {/* Genotype Box */}
              <div className="p-3 rounded-xl surface-inset flex items-center justify-between font-mono text-xs border border-slate-200">
                <span className="text-slate-500 font-medium">Your Genotype:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200 shadow-sm">
                    {trait.patientGenotype}
                  </span>
                </div>
              </div>

              {/* Practical Everyday Tip */}
              <div className="p-4 rounded-xl surface-inset space-y-1 text-xs border border-slate-200">
                <strong className="text-emerald-700 font-bold block font-mono text-[11px] uppercase flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Practical Takeaway For You:</span>
                </strong>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {punchy.tip}
                </p>
              </div>

              {/* Scientific Interpretation */}
              <p className="text-xs text-slate-600 leading-relaxed font-sans px-1">
                {trait.userInterpretation}
              </p>

              {/* Stats & Literature */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 font-mono border-t border-slate-200">
                <span>Confidence: p = {trait.pValue.toExponential(1)}</span>
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${trait.pubmedId}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 hover:underline flex items-center space-x-1 font-semibold"
                >
                  <span>PMID:{trait.pubmedId}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
