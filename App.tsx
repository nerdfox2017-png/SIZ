
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { ProfessionSelector } from './components/ProfessionSelector';
import { ResultsTable } from './components/ResultsTable';
import { CalculationSteps } from './components/CalculationSteps';
import { NORMS_DATA, NORM_PERIODS } from './constants';
import type { SelectedProfession, PpeTotals, Profession } from './types';
import { UploadIcon } from './components/Icons';

const LOGO_URL = `https://eniseiteplokom.ru/_next/image?url=%2Flogoetk.png&w=128&q=75`;

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });


function App() {
  const [normsData, setNormsData] = useState(NORMS_DATA);
  const [selectedPeriod, setSelectedPeriod] = useState(NORM_PERIODS[0]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const professionsList = useMemo(() => normsData[selectedPeriod] || [], [selectedPeriod, normsData]);

  const [selectedProfessions, setSelectedProfessions] = useState<SelectedProfession[]>(() => {
    const initialProfessionName = professionsList.length > 0 ? professionsList[0].name : '';
    return [{ id: crypto.randomUUID(), name: initialProfessionName, count: 1 }];
  });
  
  useEffect(() => {
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

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Название профессии.' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Наименование СИЗ.' },
                  unit: { type: Type.STRING, description: 'Единица измерения (например, "пар", "шт").' },
                  quantity: { type: Type.NUMBER, description: 'Количество.' },
                },
                required: ['name', 'unit', 'quantity'],
              },
              description: 'Список СИЗ для профессии.',
            },
          },
          required: ['name', 'items'],
        },
      };

      const prompt = `Проанализируй таблицу с нормами СИЗ в этом PDF. Таблица содержит колонки: "Должность", "Наименование товара", "ед. изм", "кол-во". В колонке "Должность" одна ячейка может относиться к нескольким строкам с товарами. Твоя задача - извлечь данные и сгруппировать их по должностям. Извлеки данные только для периода "${selectedPeriod}". Если период в документе не указан, считай, что все данные относятся к запрашиваемому периоду. Результат верни в виде JSON-массива объектов, где каждый объект представляет профессию.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: base64Data } },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      let jsonText = response.text.trim();
      
      // Clean up potential markdown code block fences from the response
      if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
        const startIndex = jsonText.indexOf('\n') + 1;
        const endIndex = jsonText.lastIndexOf('```');
        jsonText = jsonText.substring(startIndex, endIndex).trim();
      }
      
      const newProfessions: Profession[] = JSON.parse(jsonText);
      
      setNormsData(prevNorms => ({
        ...prevNorms,
        [selectedPeriod]: newProfessions,
      }));

    } catch (e) {
      console.error(e);
      setError('Не удалось обработать PDF. Убедитесь, что файл содержит таблицу с нормами и повторите попытку.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800 p-4 sm:p-8 flex items-center justify-center">
      <main className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-300/30 p-6 sm:p-10">
        <header className="mb-8 flex items-center justify-between gap-6">
           <div className="text-left">
            <h1 className="text-4xl font-bold text-slate-900">Калькулятор СИЗ</h1>
            <p className="text-slate-500 mt-2 text-lg">Рассчитайте потребность в средствах индивидуальной защиты</p>
           </div>
           <img src={LOGO_URL} alt="Company Logo" className="h-32 w-32 rounded-full" />
        </header>

        <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Выберите или обновите период норм</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white border border-slate-300 rounded-lg shadow-sm px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-100"
              >
                {NORM_PERIODS.map(period => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
              <div className="md:text-right">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePdfUpload}
                    accept="application/pdf"
                    className="hidden"
                    disabled={isLoading}
                 />
                 <button
                    onClick={triggerFileUpload}
                    disabled={isLoading}
                    className="w-full md:w-auto inline-flex items-center gap-2 justify-center px-6 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <UploadIcon className="h-5 w-5" />
                    <span>{isLoading ? 'Обработка...' : 'Загрузить нормы (PDF)'}</span>
                 </button>
              </div>
            </div>
            {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
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
