
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ProfessionSelector } from './components/ProfessionSelector';
import { ResultsTable } from './components/ResultsTable';
import { CalculationSteps } from './components/CalculationSteps';
import { NORMS_DATA, NORM_PERIODS } from './constants';
import type { SelectedProfession, PpeTotals } from './types';

const LOGO_URL = `https://eniseiteplokom.ru/_next/image?url=%2Flogoetk.png&w=128&q=75`;

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState(NORM_PERIODS[0]);
  
  const professionsList = useMemo(() => NORMS_DATA[selectedPeriod] || [], [selectedPeriod]);

  const [selectedProfessions, setSelectedProfessions] = useState<SelectedProfession[]>(() => {
    const initialProfessionName = professionsList.length > 0 ? professionsList[0].name : '';
    return [{ id: crypto.randomUUID(), name: initialProfessionName, count: 1 }];
  });
  
  useEffect(() => {
    // Sync selected professions when the period (and thus professions list) changes.
    // This preserves selections if the profession still exists, otherwise resets to default.
    setSelectedProfessions(prev => {
      const newProfessionsListNames = new Set(professionsList.map(p => p.name));
      const newDefaultProfessionName = professionsList.length > 0 ? professionsList[0].name : '';

      const updated = prev
        .map(p => ({
          ...p,
          name: newProfessionsListNames.has(p.name) ? p.name : newDefaultProfessionName,
        }))
        .filter(p => p.name);

      if (updated.length === 0 && newDefaultProfessionName) {
        return [{ id: crypto.randomUUID(), name: newDefaultProfessionName, count: 1 }];
      }
      return updated.length > 0 ? updated : [];
    });
  }, [professionsList]);

  const addProfession = useCallback(() => {
    if (professionsList.length > 0) {
      setSelectedProfessions(prev => [
        ...prev,
        { id: crypto.randomUUID(), name: professionsList[0].name, count: 1 }
      ]);
    }
  }, [professionsList]);

  const removeProfession = useCallback((id: string) => {
    setSelectedProfessions(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateProfession = useCallback((id: string, field: 'name' | 'count', value: string | number) => {
    setSelectedProfessions(prev =>
      prev.map(p => {
        if (p.id === id) {
          if (field === 'count') {
            const count = Math.max(0, Number(value));
            return { ...p, count };
          }
          return { ...p, name: String(value) };
        }
        return p;
      })
    );
  }, []);

  const totals = useMemo<PpeTotals>(() => {
    const calculatedTotals: PpeTotals = {};

    selectedProfessions.forEach(selection => {
      if (selection.count > 0) {
        const professionData = professionsList.find(p => p.name === selection.name);
        if (professionData) {
          professionData.items.forEach(item => {
            if (!calculatedTotals[item.name]) {
              calculatedTotals[item.name] = { unit: item.unit, totalQuantity: 0 };
            }
            calculatedTotals[item.name].totalQuantity += item.quantity * selection.count;
          });
        }
      }
    });

    return calculatedTotals;
  }, [selectedProfessions, professionsList]);

  const handleSaveTxt = useCallback(() => {
    const totalItems = Object.keys(totals);
    if (totalItems.length === 0) {
      alert("Нет данных для сохранения. Пожалуйста, выберите профессии и укажите количество сотрудников.");
      return;
    }

    const header = `Итоговая потребность в СИЗ\nПериод: ${selectedPeriod}\n${'-'.repeat(40)}\n\n`;

    const content = totalItems.sort().map(itemName => {
      const item = totals[itemName];
      return `- ${itemName}: ${item.totalQuantity} ${item.unit}`;
    }).join('\n');

    const fileContent = header + content;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedPeriod = selectedPeriod.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
    link.download = `potrebnost_siz_${sanitizedPeriod}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [totals, selectedPeriod]);

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800 p-4 sm:p-8 flex items-center justify-center">
      <main className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-300/30 p-6 sm:p-10">
        <header className="mb-8 flex items-center justify-between gap-6">
           <div className="text-left">
            <h1 className="text-4xl font-bold text-slate-900">Калькулятор СИЗ</h1>
            <p className="text-slate-500 mt-2 text-lg">Рассчитайте потребность в средствах индивидуальной защиты</p>
           </div>
           <img src={LOGO_URL} alt="Company Logo" className="h-16 w-16 rounded-full" />
        </header>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Выберите период норм</h2>
            <div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg shadow-sm px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {NORM_PERIODS.map(period => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
        </section>

        <ProfessionSelector
          selectedProfessions={selectedProfessions}
          professionsList={professionsList}
          onAdd={addProfession}
          onRemove={removeProfession}
          onUpdate={updateProfession}
        />

        <ResultsTable totals={totals} onSave={handleSaveTxt} />

        <CalculationSteps
          totals={totals}
          selectedProfessions={selectedProfessions}
          professionsList={professionsList}
        />
      </main>
    </div>
  );
}

export default App;
