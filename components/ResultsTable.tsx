
import React from 'react';
import type { PpeTotals } from '../types';
import { DownloadIcon } from './Icons';

interface ResultsTableProps {
  totals: PpeTotals;
  onSave: () => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ totals, onSave }) => {
  const totalItems = Object.keys(totals);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">2. Итоговая потребность</h2>
        {totalItems.length > 0 && (
           <button
             onClick={onSave}
             className="inline-flex items-center gap-2 justify-center px-4 py-2 font-semibold text-sm text-blue-600 bg-blue-50 rounded-lg shadow-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
             aria-label="Сохранить результат в .txt"
           >
             <DownloadIcon className="h-5 w-5" />
             <span>Сохранить .txt</span>
           </button>
        )}
      </div>
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200/80 shadow-sm">
        {totalItems.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-600 text-sm">Наименование товара</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Ед. изм.</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Количество</th>
              </tr>
            </thead>
            <tbody>
              {totalItems.sort().map(itemName => (
                <tr key={itemName} className="border-b border-slate-200/80 last:border-b-0 hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="p-4 text-slate-800 font-medium">{itemName}</td>
                  <td className="p-4 text-slate-500">{totals[itemName].unit}</td>
                  <td className="p-4 text-slate-800 font-medium text-right">{totals[itemName].totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-12">
            <p className="text-slate-500">Нет выбранных профессий или количество сотрудников равно нулю.</p>
            <p className="text-slate-400 mt-1">Добавьте профессию, чтобы увидеть расчет.</p>
          </div>
        )}
      </div>
    </section>
  );
};
