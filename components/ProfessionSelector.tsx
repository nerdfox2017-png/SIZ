
import React from 'react';
import type { Profession, SelectedProfession } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface ProfessionSelectorProps {
  selectedProfessions: SelectedProfession[];
  professionsList: Profession[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'name' | 'count', value: string | number) => void;
}

export const ProfessionSelector: React.FC<ProfessionSelectorProps> = ({
  selectedProfessions,
  professionsList,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  return (
    <section className="mb-8 border-b pb-8 border-slate-200">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">1. Выберите профессии</h2>
      <div className="space-y-4">
        {selectedProfessions.map((selection, index) => (
          <div key={selection.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-200/80 transition-all duration-300 hover:shadow-sm hover:border-slate-300">
            <div className="flex-grow">
              <label htmlFor={`profession-${selection.id}`} className="block text-sm font-medium text-slate-600 mb-1">
                Должность
              </label>
              <select
                id={`profession-${selection.id}`}
                value={selection.name}
                onChange={(e) => onUpdate(selection.id, 'name', e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg shadow-sm px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {professionsList.map(prof => (
                  <option key={prof.name} value={prof.name}>
                    {prof.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`count-${selection.id}`} className="block text-sm font-medium text-slate-600 mb-1">
                Кол-во сотрудников
              </label>
              <input
                id={`count-${selection.id}`}
                type="number"
                min="0"
                value={selection.count}
                onChange={(e) => onUpdate(selection.id, 'count', e.target.value)}
                className="w-full sm:w-32 bg-white border border-slate-300 rounded-lg shadow-sm px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div className="self-end">
              <button
                onClick={() => onRemove(selection.id)}
                className="w-full sm:w-auto flex items-center justify-center p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
                aria-label="Удалить профессию"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button
          onClick={onAdd}
          className="w-full sm:w-auto inline-flex items-center gap-2 justify-center px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Добавить профессию</span>
        </button>
      </div>
    </section>
  );
};
