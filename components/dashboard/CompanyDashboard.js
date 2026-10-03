'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, MapPin, Coins, TrendingUp, Loader2, Search, Building2, Eye, Image as ImageIcon, ArrowUpRight } from 'lucide-react';
import { useAuth, useLang } from '@/lib/providers';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const LandLocationMap = dynamic(async () => {
  const Leaflet = (await import('leaflet')).default;
  const { MapContainer, Marker, Popup, TileLayer } = await import('react-leaflet');
  const markerIcon = Leaflet.divIcon({
    className: 'soilcredit-map-pin',
    html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;border:3px solid white;background:#2563eb;box-shadow:0 8px 18px rgba(37,99,235,0.35)"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });

  return function LandLocationMapView({ coordinates, name }) {
    const position = [Number(coordinates.latitude), Number(coordinates.longitude)];
    return (
      <MapContainer key={position.join(',')} center={position} zoom={13} scrollWheelZoom={false} className="h-56 w-full overflow-hidden rounded-lg border border-slate-200">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <Marker position={position} icon={markerIcon}><Popup>{name}</Popup></Marker>
      </MapContainer>
    );
  };
}, { ssr: false, loading: () => <div className="h-56 w-full animate-pulse rounded-lg bg-slate-100" /> });

export default function CompanyDashboard() {
  const { apiFetch } = useAuth(); const { t } = useLang();
  const [tab, setTab] = useState('market');
  const [listings, setListings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [buying, setBuying] = useState(null);
  const [selectedLand, setSelectedLand] = useState(null);
  const [msg, setMsg] = useState('');
  const [qty, setQty] = useState({});

  const load = async () => {
    setLoading(true);
    const [m, p] = await Promise.all([
      fetch('/api/marketplace').then(r => r.json()),
      apiFetch('/api/purchases'),
    ]);
    setListings(m.listings || []);
    setPurchases(p.purchases || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = listings.filter(l => !q || (l.name || '').toLowerCase().includes(q.toLowerCase()) || (l.location || '').toLowerCase().includes(q.toLowerCase()));

  const buy = async (land) => {
    const quantity = Math.min(Math.max(1, Number(qty[land.id] || 1)), land.creditsAvailable || 0);
    if (quantity < 1) { setMsg('No credits available'); return; }
    setBuying(land.id);
    const d = await apiFetch('/api/purchase', { method: 'POST', body: JSON.stringify({ landId: land.id, quantity }) });
    if (d.ok) { setMsg(`✓ ${t('dash.purchaseSuccess')} — ${quantity} credits`); load(); }
    else setMsg(d.error || 'Failed');
    setBuying(null); setTimeout(() => setMsg(''), 3500);
  };

  const totalCredits = purchases.reduce((a, p) => a + (p.quantity || 0), 0);
  const totalSpent = purchases.reduce((a, p) => a + (p.totalUSD || 0), 0);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi icon={Building2} label={t('dash.companyDash')} v="Active" />
        <Kpi icon={ShoppingCart} label={t('dash.purchases')} v={purchases.length} />
        <Kpi icon={Coins} label="Credits owned" v={totalCredits.toFixed(0)} />
        <Kpi icon={TrendingUp} label={t('dash.total')} v={`$${Math.round(totalSpent).toLocaleString()}`} highlight />
      </div>

      <div className="flex items-center gap-1 mb-4 bg-white rounded-xl p-1 border border-slate-200 w-fit">
        <button onClick={() => setTab('market')} className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition ${tab==='market' ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow' : 'text-slate-600'}`}>{t('dash.browseMarket')}</button>
        <button onClick={() => setTab('purchases')} className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition ${tab==='purchases' ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow' : 'text-slate-600'}`}>{t('dash.purchases')}</button>
      </div>

      {msg && <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px]">{msg}</div>}

      {loading ? (<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-blue-500 animate-spin" /></div>) : tab === 'market' ? (
        <>
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('market.search')} className="field pl-10" />
          </div>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-[14px]">{t('market.empty')}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(l => (
                <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-5 flex flex-col">
                  <div className="font-display font-semibold text-[16.5px] text-slate-900 mb-0.5">{l.name}</div>
                  <div className="text-[12px] text-slate-500 flex items-center gap-1 mb-3"><MapPin className="h-3 w-3" /> {l.location || '—'} · {l.area} ha</div>
                  <button type="button" onClick={() => setSelectedLand(l)} className="mb-3 inline-flex items-center gap-1.5 self-start text-[12px] font-semibold text-blue-700 hover:text-blue-900">
                    <Eye className="h-3.5 w-3.5" /> {t('market.view')}
                  </button>
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 mb-3">
                    <div><div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{t('market.credits')}</div><div className="font-display font-bold text-[16px] text-slate-900">{Math.round(l.creditsAvailable || 0).toLocaleString()}</div></div>
                    <div><div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{t('market.per')}</div><div className="font-display font-bold text-[16px] text-gradient-green">${(l.priceCredit || 42.8).toFixed(2)}</div></div>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <input type="number" min="1" max={l.creditsAvailable || 1} value={qty[l.id] ?? 1} onChange={e => setQty({ ...qty, [l.id]: Number(e.target.value) })} className="field !py-2 w-24" />
                    <button onClick={() => buy(l)} disabled={buying === l.id || (l.creditsAvailable || 0) <= 0} className="flex-1 btn-primary rounded-lg px-3 py-2 text-[12.5px] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-1">
                      {buying === l.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><ShoppingCart className="h-3.5 w-3.5" /> {t('dash.buyNow')}</>}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">by {l.ownerName}</div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        purchases.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-[14px]">{t('dash.noPurchases')}</div>
        ) : (
          <div className="space-y-2">
            {purchases.map(p => (
              <div key={p.id} className="card-soft p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center"><Coins className="h-5 w-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-[14px] truncate">{p.landName}</div>
                  <div className="text-[12px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()} · {p.quantity} {t('market.credits')} @ ${p.pricePerCredit.toFixed(2)}</div>
                </div>
                <div className="font-display font-bold text-[18px] text-gradient-blue tabular-nums">${p.totalUSD.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )
      )}

      <LandDetailsDialog land={selectedLand} onOpenChange={(open) => { if (!open) setSelectedLand(null); }} t={t} />
    </div>
  );
}

function LandDetailsDialog({ land, onOpenChange, t }) {
  if (!land) return <Dialog open={false} onOpenChange={onOpenChange} />;

  const coordinates = land.locationCoordinates || land.locationDetails?.coordinates || (
    land.locationDetails?.latitude != null && land.locationDetails?.longitude != null ? land.locationDetails : null
  );
  const latitude = Number(coordinates?.latitude);
  const longitude = Number(coordinates?.longitude);
  const hasCoordinates = coordinates && Number.isFinite(latitude) && Number.isFinite(longitude);
  const photos = Array.isArray(land.images) ? land.images.filter((image) => image?.dataUrl || image?.url) : [];
  const estimate = land.estimate || {};
  const mapUrl = hasCoordinates ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}` : null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto bg-white p-0">
        <DialogHeader className="px-6 pb-4 pt-6 pr-14 text-left">
          <DialogTitle className="font-display text-2xl text-slate-900">{land.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {land.location || [land.city, land.country].filter(Boolean).join(', ') || '—'} · {Number(land.area || 0).toLocaleString()} ha
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 px-6 pb-6 lg:grid-cols-2">
          <div className="space-y-5">
            <section aria-label={t('market.photos')}>
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">{t('market.photos')}</h3>
              {photos.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo, index) => (
                    <div key={photo.id || `${photo.name}-${index}`} className={`relative overflow-hidden rounded-lg bg-slate-100 ${index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]'}`}>
                      <img src={photo.dataUrl || photo.url} alt={photo.name || `${land.name} photo ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <span className="inline-flex items-center gap-2 text-[13px]"><ImageIcon className="h-4 w-4" /> {t('market.noPhotos')}</span>
                </div>
              )}
            </section>

            <section aria-label={t('dash.location')}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">{t('dash.location')}</h3>
                {mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-700 hover:text-blue-900">{t('market.openMap')} <ArrowUpRight className="h-3 w-3" /></a>}
              </div>
              {hasCoordinates ? (
                <>
                  <LandLocationMap coordinates={{ latitude, longitude }} name={land.name} />
                  <p className="mt-2 text-[11.5px] tabular-nums text-slate-500">{latitude.toFixed(5)}, {longitude.toFixed(5)}</p>
                </>
              ) : <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-4 text-[13px] text-slate-500">{land.location || t('market.noLocationCoordinates')}</p>}
            </section>
          </div>

          <div className="space-y-5">
            <section>
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">{t('dash.description')}</h3>
              <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700">{land.description || t('market.noDescription')}</p>
            </section>

            <section>
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">{t('market.landDetails')}</h3>
              <dl className="divide-y divide-slate-100 border-y border-slate-100">
                <DetailRow label={t('dash.area')} value={`${Number(land.area || 0).toLocaleString()} ha`} />
                <DetailRow label={t('calc.soil')} value={t(`calc.soils.${land.soil}`)} />
                <DetailRow label={t('calc.region')} value={t(`calc.regions.${land.region}`)} />
                <DetailRow label={t('calc.forest')} value={t(`calc.forests.${land.forestType}`)} />
                <DetailRow label={t('calc.vegetation')} value={t(`calc.vegs.${land.vegetation}`)} />
                <DetailRow label={t('market.countryCity')} value={[land.city, land.country].filter(Boolean).join(', ') || '—'} />
                <DetailRow label={t('market.landowner')} value={land.ownerName || '—'} />
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">{t('market.carbonCredits')}</h3>
              <dl className="divide-y divide-slate-100 border-y border-slate-100">
                <DetailRow label={t('market.estimatedCarbonYr')} value={estimate.estimatedCarbonPerYear != null ? `${Number(estimate.estimatedCarbonPerYear).toLocaleString()} tCO₂e` : '—'} />
                <DetailRow label={t('market.creditsAvailable')} value={Math.round(land.creditsAvailable || 0).toLocaleString()} />
                <DetailRow label={t('market.pricePerCredit')} value={`$${Number(land.priceCredit || 42.8).toFixed(2)}`} />
              </dl>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }) {
  return <div className="flex items-start justify-between gap-4 py-2.5 text-[12.5px]"><dt className="text-slate-500">{label}</dt><dd className="text-right font-medium text-slate-800">{value || '—'}</dd></div>;
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
