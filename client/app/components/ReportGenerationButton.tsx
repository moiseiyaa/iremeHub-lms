'use client';

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Props {
  filename?: string;
  className?: string;
  rows?: ReadonlyArray<Record<string, string | number | null | undefined>>;
}
const safeCell = (value: string | number | null | undefined) => {
  // A downloaded CSV may be opened in spreadsheet software. Prevent formula evaluation.
  let text = String(value ?? '');
  if (/^[\s\t\r\n]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export default function ReportGenerationButton({filename='iremehub-report.csv',className='',rows}:Props){
  const [working,setWorking]=useState(false);
  const available=Boolean(rows?.length);
  const download=()=>{
    if(!available || !rows || working)return;
    setWorking(true);
    try {
      const headers=[...new Set(rows.flatMap(row=>Object.keys(row)))];
      const csv=[headers.map(safeCell).join(','),...rows.map(row=>headers.map(k=>safeCell(row[k])).join(','))].join('\r\n');
      const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download=filename.endsWith('.csv')?filename:filename.replace(/\.pdf$/i,'.csv')+'.csv';a.click();
      URL.revokeObjectURL(url);
    } finally {setWorking(false);}
  };
  return <button type="button" disabled={!available||working} title={available?'Download current summary as CSV':'No report data is available yet'}
    onClick={download} className={`ih-btn ih-btn-primary !min-h-[40px] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
    <ArrowDownTrayIcon className="w-4 h-4"/>{working?'Preparing...':available?'Export summary (CSV)':'Report unavailable'}
  </button>;
}
