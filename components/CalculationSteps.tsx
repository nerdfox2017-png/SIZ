
import React from 'react';
import type { PpeTotals, SelectedProfession, Profession } from '../types';

interface CalculationStepsProps {
  totals: PpeTotals;
  selectedProfessions: SelectedProfession[];
  professionsList: Profession[];
}

export const CalculationSteps: React.FC<CalculationStepsProps> = ({
  totals,
  selectedProfessions,
  professionsList,
}) => {
  const totalItems = Object.keys(totals);

  if (totalItems.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 pt-8 border-t border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">3. Детализация расчета</h2>
      <div className="space-y-6">
        {totalItems.sort().map(itemName => {
          const itemTotal = totals[itemName];
          const contributingProfessions = selectedProfessions
            .map(selection => {
              const professionData = professionsList.find(p => p.name === selection.name);
              const ppeItem = professionData?.items.find(i => i.name === itemName);
              if (selection.count > 0 && ppeItem) {
                return {
                  professionName: selection.name,
                  count: selection.count,
                  quantityPerUnit: ppeItem.quantity,
                  subtotal: ppeItem.quantity * selection.count,
                };
              }
              return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

          return (
            <div key={itemName} className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 transition-shadow hover:shadow-md">
              <div className="flex justify-between items-baseline flex-wrap gap-2">
                <h3 className="font-semibold text-slate-800">{itemName}</h3>
                <p className="font-bold text-lg text-blue-600">
                  {itemTotal.totalQuantity} <span className="text-sm font-medium text-slate-500">{itemTotal.unit}</span>
                </p>
              </div>
              {contributingProfessions.length > 0 && (
                 <ul className="mt-3 space-y-1.5 text-sm text-slate-600 pl-4 border-l-2 border-slate-200">
                    {contributingProfessions.map((contrib, index) => (
                    <li key={index} className="flex justify-between flex-wrap gap-x-4">
                        <span className="flex-shrink-0">{contrib.professionName}:</span>
                        <span className="font-mono text-slate-700 text-right flex-shrink-0">
                        {contrib.quantityPerUnit}&nbsp;{itemTotal.unit} &times; {contrib.count}&nbsp;чел. = {contrib.subtotal}&nbsp;{itemTotal.unit}
                        </span>
                    </li>
                    ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
