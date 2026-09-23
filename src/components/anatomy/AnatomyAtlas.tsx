'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import manifest from '@/data/anatomyModelManifest.json';
import { ATLAS_CODES, ATLAS_QUIZ, ATLAS_SOURCES, ATLAS_SPECIALTIES, REGIONS, atlasSourceUrl, type AtlasLayer, type RegionId } from '@/data/anatomyEducation';

const Viewer = dynamic(() => import('./AnatomyViewer'), { ssr: false, loading: () => <div className="flex h-[680px] items-center justify-center rounded-2xl bg-[#0B2545] p-8 text-white" role="status">Preparing the interactive anatomy viewer…</div> });
const field = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:border-teal-700 focus:outline-2 focus:outline-teal-700';
const label = 'block text-sm font-semibold text-slate-800';
const layers: { id: AtlasLayer; name: string }[] = [{ id: 'all', name: 'Bones + organs + nervous system' }, { id: 'skeleton', name: 'Skeletal reference' }, { id: 'organs', name: 'Internal organs' }, { id: 'nervous', name: 'Brain reference' }, { id: 'surface', name: 'External surface' }];

export default function AnatomyAtlas() {
  const [region, setRegion] = useState<RegionId>('whole');
  const [layer, setLayer] = useState<AtlasLayer>('all');
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [codeSearch, setCodeSearch] = useState('');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const select = useCallback((id: string) => {
    const item = manifest.structures.find(s => s.id === id);
    setSelected(id);
    if (item) { setRegion(item.region as RegionId); if (item.layer === 'surface') setLayer('surface'); }
    setSpecialty(''); setCodeSearch(''); setSearch('');
  }, []);
  const lesson = REGIONS.find(r => r.id === region)!;
  const structure = manifest.structures.find(s => s.id === selected);
  const pathway = ATLAS_SPECIALTIES.find(s => s.name === specialty);
  const list = manifest.structures.filter(s => (region === 'whole' || s.region === region) && (layer === 'all' || s.layer === layer) && s.name.toLowerCase().includes(search.trim().toLowerCase()));
  const codes = ATLAS_CODES.filter(code => (pathway ? pathway.examples.includes(code.code) : region === 'whole' || code.regions.includes(region)) && `${code.code} ${code.title} ${code.system}`.toLowerCase().includes(codeSearch.trim().toLowerCase()));
  function changeRegion(value: RegionId) { setRegion(value); setSelected(''); setSearch(''); setSpecialty(''); setCodeSearch(''); setLayer(value === 'surface' ? 'surface' : 'all'); }
  return <>
    <section id="explore" className="scroll-mt-24" aria-labelledby="explore-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-widest text-teal-800">01 / Explore the anatomy</p><h2 id="explore-heading" className="mt-2 text-3xl font-semibold text-slate-950">Find the structure. Understand the context.</h2></div><a href="#specialty-lessons" className="text-sm font-semibold text-teal-800 underline">Go to coding lessons ↓</a></div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <Viewer region={region} layer={layer} selected={selected} onSelect={select} />
        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5" aria-label="Anatomy selection">
          <label className={label}>Body region<select aria-label="Body region" className={field} value={region} onChange={e => changeRegion(e.target.value as RegionId)}>{REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
          <label className={`${label} mt-5`}>Visible layer<select aria-label="Visible layer" className={field} value={layer} onChange={e => { setLayer(e.target.value as AtlasLayer); setSelected(''); }}>{layers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
          <label className={`${label} mt-5`}>Find a structure<input className={field} type="search" placeholder="Try heart, kidney or femur" value={search} onChange={e => setSearch(e.target.value)} /></label>
          <p className="mt-4 text-xs text-slate-600">{list.length} structures in this list · select to isolate</p>
          <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-slate-200" role="group" aria-label="Named anatomical structures">{list.map(s => <button key={s.id} aria-pressed={selected === s.id} onClick={() => select(s.id)} className={`block w-full border-b border-slate-100 px-3 py-3 text-left text-sm last:border-0 ${selected === s.id ? 'bg-teal-100 font-semibold text-teal-950' : 'text-slate-800 hover:bg-slate-100'}`}>{s.name}</button>)}{list.length === 0 && <p className="p-4 text-sm text-slate-600">No matching structures. Try another region, layer or search.</p>}</div>
          {structure && <div className="mt-4 rounded-lg bg-teal-50 p-4 text-sm" aria-live="polite"><h3 className="font-semibold text-teal-950">Selected: {structure.name}</h3><p className="mt-2 text-slate-700">Source identifier: {structure.id}. This isolates a reference structure, not a diagnosis or procedure.</p><button className="mt-3 font-semibold text-teal-800 underline" onClick={() => setSelected('')}>Show region again</button></div>}
          <p className="mt-4 text-xs leading-relaxed text-slate-600">{manifest.structures.length} selectable structures, including grouped bones. This is a curated adult male model, not a complete dissection atlas. <a href="#sources" className="text-teal-800 underline">Model scope & attribution</a></p>
        </aside>
      </div>
      <article className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-6 sm:p-8" aria-live="polite"><p className="text-xs font-semibold uppercase tracking-widest text-teal-800">Regional study notes</p><h3 className="mt-2 text-xl font-semibold text-slate-950">{lesson.name}</h3><p className="mt-3 max-w-4xl leading-relaxed text-slate-700">{lesson.lesson}</p><ul className="mt-5 grid gap-4 text-sm leading-relaxed text-slate-700 sm:grid-cols-3">{lesson.checkpoints.map((check, i) => <li key={check}><span className="mb-2 block font-semibold text-teal-800">0{i + 1}</span>{check}</li>)}</ul><a href={ATLAS_SOURCES.anatomy.url} className="mt-5 inline-block text-sm font-semibold text-teal-800 underline">Study the anatomy reference ↗</a></article>
    </section>
    <section id="specialty-lessons" className="scroll-mt-24" aria-labelledby="lessons-heading">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-800">02 / Connect anatomy and documentation</p><h2 id="lessons-heading" className="mt-2 text-3xl font-semibold text-slate-950">{ATLAS_SPECIALTIES.length} specialty learning paths</h2><p className="mt-4 max-w-3xl leading-relaxed text-slate-600">Explore common documentation questions across medical, surgical, dental and therapy services. The {ATLAS_CODES.length} selected examples include individual codes, code families and modifiers. They are a starting point for study, not comprehensive specialty code lists.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className={label}>Specialty learning path<select aria-label="Specialty learning path" className={field} value={specialty} onChange={e => { const s = ATLAS_SPECIALTIES.find(item => item.name === e.target.value); setSpecialty(e.target.value); setCodeSearch(''); if (s) { setRegion(s.region); setSelected(''); setSearch(''); setLayer(s.region === 'surface' ? 'surface' : 'all'); } }}>{<option value="">Examples for the selected body region</option>}{ATLAS_SPECIALTIES.map(s => <option key={s.name}>{s.name}</option>)}</select></label><label className={label}>Search these coding examples<input type="search" className={field} placeholder="Code, procedure or code system" value={codeSearch} onChange={e => setCodeSearch(e.target.value)} /></label></div>
      {pathway && <article className="mt-5 rounded-xl bg-[#0B2545] p-6 text-white"><h3 className="text-xl font-semibold">{pathway.name}</h3><p className="mt-3 leading-relaxed text-slate-200">{pathway.focus}</p><p className="mt-4 text-sm text-slate-200">Examples below illustrate selected concepts; they do not cover every procedure in this specialty.</p><a href="#explore" className="mt-4 inline-block font-semibold text-[#88e1d1] underline">Explore the related body region ↑</a></article>}
      <p className="mt-6 text-sm text-slate-600" role="status">{codes.length} coding examples shown</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{codes.map(code => <article key={code.code} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-wider text-teal-800">{code.system} · educational example</p><h3 className="mt-3 text-xl font-semibold text-[#0B2545]">{code.code}</h3><p className="mt-2 font-semibold text-slate-900">{code.title}</p><p className="mt-3 grow text-sm leading-relaxed text-slate-600">{code.checkpoint}</p><a className="mt-5 text-sm font-semibold text-teal-800 underline underline-offset-4" href={atlasSourceUrl(code)}>Read the supporting {code.source === 'dental' ? 'ADA' : 'CMS'} reference{code.page ? ` · PDF p. ${code.page}` : ''} ↗<span className="sr-only"> for {code.code}</span></a></article>)}</div>
      {codes.length === 0 && <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6"><p>No selected coding examples match this view. The specialty focus and general guidance remain available.</p><a href={ATLAS_SOURCES.ncci.url} className="mt-3 inline-block text-teal-800 underline">Review the CMS NCCI policy manual ↗</a></div>}
      <p className="mt-6 max-w-4xl text-sm leading-relaxed text-slate-600">Use the full, current licensed code set and payer instructions for the date of service. CPT examples concern services, CDT concerns dental procedures, and JW/JZ are modifiers. Diagnosis coding requires a separate ICD-10-CM review. Neither model selection nor these examples establishes medical necessity, separate reportability, coverage or payment.</p>
    </section>
    <section id="knowledge-check" className="scroll-mt-24" aria-labelledby="quiz-heading"><p className="text-sm font-semibold uppercase tracking-widest text-teal-800">03 / Check your understanding</p><h2 id="quiz-heading" className="mt-2 text-3xl font-semibold text-slate-950">Three questions before you code</h2><div className="mt-6 grid gap-5 lg:grid-cols-3">{ATLAS_QUIZ.map((question, index) => <fieldset key={question.question} className="min-w-0 rounded-xl border border-slate-200 bg-white p-6"><legend className="px-1 font-semibold text-slate-950">{index + 1}. {question.question}</legend><div className="space-y-3">{question.answers.map((answer, answerIndex) => <label key={answer} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed"><input type="radio" name={`atlas-question-${index}`} checked={answers[index] === answerIndex} onChange={() => setAnswers(previous => ({ ...previous, [index]: answerIndex }))} className="mt-1 accent-teal-800" />{answer}</label>)}</div>{answers[index] !== undefined && <p role="status" className="mt-5 rounded-lg bg-teal-50 p-3 text-sm leading-relaxed text-teal-950"><strong>{answers[index] === question.correct ? 'Correct.' : 'Review this point.'}</strong> {question.explanation} <a className="underline" href={ATLAS_SOURCES[question.source].url}>Source ↗</a></p>}</fieldset>)}</div><button className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-teal-800" onClick={() => setAnswers({})}>Reset knowledge check</button></section>
  </>;
}
