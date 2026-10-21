'use client';

import React, { useState } from 'react';
import { ActiveTab } from '@/types';
import { SAMPLES } from '@/lib/json';
import { Header } from '@/components/Header';
import { FormatStudio } from '@/components/FormatStudio';
import { TreeInspector } from '@/components/TreeInspector';
import { Converters } from '@/components/Converters';
import { JsonPathStudio } from '@/components/JsonPathStudio';
import { DiffStudio } from '@/components/DiffStudio';

export default function JsonPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('format');
  const [rawInput, setRawInput] = useState<string>(
    JSON.stringify(SAMPLES.ecommerce, null, 2)
  );
  const [parsedData, setParsedData] = useState<any>(SAMPLES.ecommerce);

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-surface-darker text-slate-100">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeTab === 'format' && (
          <FormatStudio
            rawInput={rawInput}
            setRawInput={setRawInput}
            parsedData={parsedData}
            setParsedData={setParsedData}
          />
        )}
        {activeTab === 'tree' && <TreeInspector data={parsedData} />}
        {activeTab === 'convert' && <Converters data={parsedData} />}
        {activeTab === 'query' && <JsonPathStudio data={parsedData} />}
        {activeTab === 'diff' && <DiffStudio />}
      </div>
    </main>
  );
}
