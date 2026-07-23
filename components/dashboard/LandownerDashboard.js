'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, X, Loader2, MapPin, Leaf, Coins, TrendingUp, Store, CheckCircle2 } from 'lucide-react';
import { useAuth, useLang } from '@/lib/providers';

const SOIL = ['loamy','sandy','clay','peat','silty'];
const REGION = ['caspian','temperate','tropical','arid','mediterranean','boreal'];
const FOREST = ['primary','secondary','plantation','agroforestry','grassland','wetland'];
const VEG = ['moderate','sparse','dense','veryDense'];

export default function LandownerDashboard() {
  const { apiFetch } = useAuth();
  const { t } = useLang();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, land: null });
  const [carbonModal, setCarbonModal] = useState({ open: false, land: null });

  const load = async () => {
    setLoading(true);
    const d = await apiFetch('/api/lands');
    if (d.ok) setLands(d.lands || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm(t('dash.confirmDelete'))) return;
    await apiFetch(`/api/lands/${id}`, { method: 'DELETE' });
    load();
  };

  const toggleSale = async (land) => {
    await apiFetch(`/api/lands/${land.id}`, { method: 'PUT', body: JSON.stringify({ forSale: !land.forSale }) });
    load();
  };

  const totalCredits = lands.reduce((a, l) => a + (l.creditsAvailable || 0), 0);
  const totalSold = lands.reduce((a, l) => a + (l.creditsSold || 0), 0);
  const totalRevenue = lands.reduce((a, l) => a + (l.creditsSold || 0) * (l.priceCredit || 42.8), 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi icon={MapPin} label="Lands" v={lands.length} />
        <Kpi icon={Leaf} label={t('dash.creditsAvailable')} v={totalCredits.toFixed(0)} />
        <Kpi icon={Coins} label={t('dash.creditsSold')} v={totalSold.toFixed(0)} />
        <Kpi icon={TrendingUp} label="Revenue" v={`$${Math.round(totalRevenue).toLocaleString()}`} highlight />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="font-display font-semibold text-xl text-slate-900">{t('dash.myLands')}</div>
        <button onClick={() => setModal({ open: true, land: null })} className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold"><Plus className="h-4 w-4" /> {t('dash.addLand')}</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-blue-500 animate-spin" /></div>
      ) : lands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-4"><Leaf className="h-6 w-6 text-blue-500" /></div>
          <div className="text-slate-600 text-[14.5px] mb-4">{t('dash.noLands')}</div>
          <button onClick={() => setModal({ open: true, land: null })} className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold"><Plus className="h-4 w-4" /> {t('dash.createFirst')}</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lands.map((l) => (
            <div key={l.id} className="card-soft p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <div className="font-display font-semibold text-[16.5px] text-slate-900 truncate">{l.name}</div>
                  <div className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {l.location || '—'} · {l.area} ha</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ open: true, land: l })} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50" title={t('dash.edit')}><Edit3 className="h-3.5 w-3.5 text-slate-500" /></button>
                  <button onClick={() => del(l.id)} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200" title={t('dash.delete')}><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 mb-3">
                <Mini label={t('dash.estimated')} v={(l.estimate?.estimatedCarbonPerYear || 0).toFixed(0)} />
                <Mini label={t('dash.creditsAvailable')} v={(l.creditsAvailable || 0).toFixed(0)} />
                <Mini label="$" v={`$${(l.priceCredit || 42.8).toFixed(2)}`} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <button onClick={() => setCarbonModal({ open: true, land: l })} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50 px-3 py-2 text-[12.5px] font-medium text-slate-700 transition"><Plus className="h-3.5 w-3.5" /> {t('dash.carbonHistory')} ({(l.carbonEntries || []).length})</button>
                <button onClick={() => toggleSale(l)} className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${l.forSale ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'btn-primary'}`}>
                  {l.forSale ? (<><CheckCircle2 className="h-3.5 w-3.5" /> Listed</>) : (<><Store className="h-3.5 w-3.5" /> {t('dash.forSale')}</>)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <LandModal open={modal.open} land={modal.land} onClose={() => setModal({ open: false, land: null })} onSaved={load} />
      <CarbonModal open={carbonModal.open} land={carbonModal.land} onClose={() => setCarbonModal({ open: false, land: null })} onChanged={load} />
    </div>
  );
}

function Kpi({ icon: Icon, label, v, highlight }) {
  return (
    <div className={`rounded-2xl p-4 border ${highlight ? 'bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${highlight ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon className="h-3.5 w-3.5" /></div>
        <span className="text-[11.5px] font-medium text-slate-500">{label}</span>
      </div>
      <div className="font-display font-bold text-[22px] text-slate-900 tabular-nums leading-none">{v}</div>
    </div>
  );
}
function Mini({ label, v }) {
  return (<div><div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{label}</div><div className="font-display font-bold text-[15px] text-slate-900 tabular-nums">{v}</div></div>);
}

function LandModal({ open, land, onClose, onSaved }) {
  const { apiFetch } = useAuth(); const { t } = useLang();
  const [f, setF] = useState({ name: '', location: '', area: 100, soil: 'loamy', region: 'caspian', forestType: 'primary', vegetation: 'moderate', description: '', priceCredit: 42.8 });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (land) setF({ name: land.name || '', location: land.location || '', area: land.area || 100, soil: land.soil || 'loamy', region: land.region || 'caspian', forestType: land.forestType || 'primary', vegetation: land.vegetation || 'moderate', description: land.description || '', priceCredit: land.priceCredit || 42.8 });
    else setF({ name: '', location: '', area: 100, soil: 'loamy', region: 'caspian', forestType: 'primary', vegetation: 'moderate', description: '', priceCredit: 42.8 });
  }, [land, open]);

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    if (land) await apiFetch(`/api/lands/${land.id}`, { method: 'PUT', body: JSON.stringify(f) });
    else await apiFetch('/api/lands', { method: 'POST', body: JSON.stringify(f) });
    setSaving(false); onSaved(); onClose();
  };
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  return (
    <AnimatePresence>{open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="font-display font-semibold text-lg text-slate-900">{land ? t('dash.editLand') : t('dash.addLand')}</div>
            <button onClick={onClose} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={save} className="px-6 py-5 space-y-4 overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-3">
              <L label={t('dash.landName')}><input value={f.name} onChange={e => set('name', e.target.value)} required className="field" placeholder="Ganja Foothills" /></L>
              <L label={t('dash.location')}><input value={f.location} onChange={e => set('location', e.target.value)} className="field" placeholder="Ganja, Azerbaijan" /></L>
              <L label={t('dash.area')}><input type="number" min="1" value={f.area} onChange={e => set('area', Number(e.target.value))} required className="field" /></L>
              <L label={t('dash.priceCredit')}><input type="number" step="0.01" min="1" value={f.priceCredit} onChange={e => set('priceCredit', Number(e.target.value))} className="field" /></L>
              <L label={t('calc.soil')}><Sel value={f.soil} opts={SOIL} onChange={v => set('soil', v)} tr={(v) => t('calc.soils.' + v)} /></L>
              <L label={t('calc.region')}><Sel value={f.region} opts={REGION} onChange={v => set('region', v)} tr={(v) => t('calc.regions.' + v)} /></L>
              <L label={t('calc.forest')}><Sel value={f.forestType} opts={FOREST} onChange={v => set('forestType', v)} tr={(v) => t('calc.forests.' + v)} /></L>
              <L label={t('calc.vegetation')}><Sel value={f.vegetation} opts={VEG} onChange={v => set('vegetation', v)} tr={(v) => t('calc.vegs.' + v)} /></L>
            </div>
            <L label={t('dash.description')}><textarea value={f.description} onChange={e => set('description', e.target.value)} rows={3} className="field resize-none" /></L>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-[14px] font-semibold text-slate-700">{t('dash.cancel')}</button>
              <button type="submit" disabled={saving} className="flex-1 btn-primary rounded-xl py-3 text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-70">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t('dash.save')}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  );
}

function CarbonModal({ open, land, onClose, onChanged }) {
  const { apiFetch } = useAuth(); const { t } = useLang();
  const [entries, setEntries] = useState([]);
  const [f, setF] = useState({ date: new Date().toISOString().slice(0,10), tCO2: 100, note: '', method: 'satellite' });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open && land) setEntries(land.carbonEntries || []); }, [open, land]);

  const add = async (e) => {
    e.preventDefault(); setSaving(true);
    const d = await apiFetch(`/api/lands/${land.id}/carbon`, { method: 'POST', body: JSON.stringify(f) });
    if (d.ok) setEntries((prev) => [...prev, d.entry]);
    setF({ date: new Date().toISOString().slice(0,10), tCO2: 100, note: '', method: 'satellite' });
    setSaving(false); onChanged();
  };
  const del = async (id) => {
    if (!confirm(t('dash.confirmDelete'))) return;
    await apiFetch(`/api/lands/${land.id}/carbon/${id}`, { method: 'DELETE' });
    setEntries((prev) => prev.filter(e => e.id !== id));
    onChanged();
  };

  return (
    <AnimatePresence>{open && land && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div><div className="font-display font-semibold text-lg text-slate-900">{t('dash.carbonHistory')}</div><div className="text-[12px] text-slate-500">{land.name}</div></div>
            <button onClick={onClose} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center"><X className="h-4 w-4" /></button>
          </div>
          <div className="px-6 py-4 border-b border-slate-100">
            <form onSubmit={add} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
              <L label={t('dash.carbonDate')}><input type="date" value={f.date} onChange={e => setF({...f, date: e.target.value})} className="field !py-2" /></L>
              <L label={t('dash.carbonAmount')}><input type="number" step="0.1" value={f.tCO2} onChange={e => setF({...f, tCO2: Number(e.target.value)})} required className="field !py-2" /></L>
              <L label={t('dash.carbonMethod')}>
                <select value={f.method} onChange={e => setF({...f, method: e.target.value})} className="field !py-2">
                  <option value="satellite">Satellite</option><option value="in-situ">In-situ</option><option value="lidar">LiDAR</option><option value="drone">Drone</option>
                </select>
              </L>
              <L label={t('dash.carbonNote')}><input value={f.note} onChange={e => setF({...f, note: e.target.value})} className="field !py-2" placeholder="Optional" /></L>
              <button type="submit" disabled={saving} className="btn-primary rounded-xl py-2.5 text-[13px] font-semibold flex items-center justify-center gap-1 disabled:opacity-70">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Add</>}</button>
            </form>
          </div>
          <div className="px-6 py-4 overflow-y-auto flex-1">
            {entries.length === 0 ? (<div className="text-center text-slate-500 py-8 text-[13.5px]">No entries yet.</div>) : (
              <div className="space-y-2">{entries.slice().reverse().map(e => (
                <div key={e.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center"><Leaf className="h-4 w-4 text-white" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-slate-900">{e.tCO2.toLocaleString()} tCO₂ <span className="text-slate-400 font-normal text-[12px] ml-2">{e.method}</span></div>
                    <div className="text-[11.5px] text-slate-500">{e.date}{e.note ? ` · ${e.note}` : ''}</div>
                  </div>
                  <button onClick={() => del(e.id)} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-200"><Trash2 className="h-3.5 w-3.5 text-rose-500" /></button>
                </div>
              ))}</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  );
}

function L({ label, children }) { return (<label className="block"><div className="text-[12px] font-medium text-slate-600 mb-1">{label}</div>{children}</label>); }
function Sel({ value, opts, onChange, tr }) { return (<select value={value} onChange={e => onChange(e.target.value)} className="field">{opts.map(o => <option key={o} value={o}>{tr(o)}</option>)}</select>); }
