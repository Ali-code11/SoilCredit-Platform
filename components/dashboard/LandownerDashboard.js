'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, X, Loader2, MapPin, Leaf, Coins, TrendingUp, Store, CheckCircle2, UploadCloud } from 'lucide-react';
import { useAuth, useLang } from '@/lib/providers';

const MAX_LAND_IMAGES = 3;

const SOIL = ['loamy','sandy','clay','peat','silty'];
const REGION = ['caspian','temperate','tropical','arid','mediterranean','boreal'];
const FOREST = ['primary','secondary','plantation','agroforestry','grassland','wetland'];
const VEG = ['moderate','sparse','dense','veryDense'];
const COUNTRY_CITY_FOCUS = {
  Azerbaijan: { Baku: { lat: 40.4093, lng: 49.8671 }, Ganja: { lat: 40.6827, lng: 46.3606 }, Shaki: { lat: 41.1979, lng: 47.1716 }, Nakhchivan: { lat: 39.2089, lng: 45.4087 } },
  Turkey: { Istanbul: { lat: 41.0082, lng: 28.9784 }, Ankara: { lat: 39.9334, lng: 32.8597 }, Izmir: { lat: 38.4237, lng: 27.1428 } },
  Kazakhstan: { Astana: { lat: 51.1694, lng: 71.4491 }, Almaty: { lat: 43.222, lng: 76.8512 } },
  Georgia: { Tbilisi: { lat: 41.7151, lng: 44.8271 }, Batumi: { lat: 41.6434, lng: 41.6370 } },
};

const MapPicker = dynamic(async () => {
  const Leaflet = (await import('leaflet')).default;
  const { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } = await import('react-leaflet');

  function getMapPinIcon() {
    if (typeof window === 'undefined') return undefined;
    return Leaflet.divIcon({
      className: 'soilcredit-map-pin',
      html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;border:3px solid white;background:#2563eb;box-shadow:0 8px 18px rgba(37,99,235,0.35)"></span>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10],
    });
  }

  function MapViewFocus({ center }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, Math.max(map.getZoom(), 7));
    }, [map, center]);
    return null;
  }

  function MapMarker({ value, onChange }) {
    const map = useMap();
    const markerIcon = useMemo(() => getMapPinIcon(), []);
    useMapEvents({
      click: (event) => {
        const location = {
          latitude: Number(event.latlng.lat.toFixed(6)),
          longitude: Number(event.latlng.lng.toFixed(6)),
        };
        onChange(location);
      },
    });

    useEffect(() => {
      if (value) {
        map.flyTo([value.latitude, value.longitude], Math.max(map.getZoom(), 11), { duration: 1.2 });
      }
    }, [map, value]);

    if (!value) return null;
    return (
      <Marker
        position={[value.latitude, value.longitude]}
        draggable={true}
        icon={markerIcon}
        eventHandlers={{
          dragend: (event) => {
            const ll = event.target.getLatLng();
            onChange({ latitude: Number(ll.lat.toFixed(6)), longitude: Number(ll.lng.toFixed(6)) });
          },
        }}
      >
        <Popup>Selected land location</Popup>
      </Marker>
    );
  }

  const actual = ({ value, onChange, country, city }) => {
    const center = getCityFocus(country, city);
    return (
      <MapContainer key={`${country}-${city}`} center={[center.lat, center.lng]} zoom={7} minZoom={3} maxZoom={18} scrollWheelZoom className="h-[260px] w-full rounded-2xl overflow-hidden border border-slate-200">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <MapViewFocus center={[center.lat, center.lng]} />
        <MapMarker value={value} onChange={onChange} />
      </MapContainer>
    );
  };
  return actual;
}, { ssr: false });

function getCountryCities(country) {
  return Object.keys(COUNTRY_CITY_FOCUS[country] || COUNTRY_CITY_FOCUS.Azerbaijan || {});
}

function getCityFocus(country, city) {
  const cities = COUNTRY_CITY_FOCUS[country] || COUNTRY_CITY_FOCUS.Azerbaijan;
  if (city && cities?.[city]) return cities[city];
  const firstCity = Object.values(cities || COUNTRY_CITY_FOCUS.Azerbaijan)[0] || { lat: 40.4093, lng: 49.8671 };
  return firstCity;
}

function getLocationText(country, city) {
  return [city, country].filter(Boolean).join(', ');
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((img) => img && (img.dataUrl || img.url))
    .map((img, index) => ({
      id: img.id || `img-${index}-${Date.now()}`,
      name: img.name || `land-image-${index + 1}`,
      type: img.type || 'image/jpeg',
      size: img.size || 0,
      dataUrl: img.dataUrl || img.url || '',
    }));
}

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
  const { apiFetch } = useAuth();
  const { t } = useLang();
  const [f, setF] = useState({
    name: '', country: 'Azerbaijan', city: 'Baku', location: '', area: 100, soil: 'loamy', region: 'caspian', forestType: 'primary', vegetation: 'moderate', description: '', priceCredit: 42.8, locationCoordinates: null,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    const country = (land?.country) || 'Azerbaijan';
    const city = (land?.city) || getCountryCities(country)[0] || 'Baku';
    const coords = land?.locationCoordinates || land?.locationDetails?.coordinates || null;
    setF({
      name: land?.name || '',
      country,
      city,
      location: land?.location || getLocationText(country, city),
      area: land?.area || 100,
      soil: land?.soil || 'loamy',
      region: land?.region || 'caspian',
      forestType: land?.forestType || 'primary',
      vegetation: land?.vegetation || 'moderate',
      description: land?.description || '',
      priceCredit: land?.priceCredit || 42.8,
      locationCoordinates: coords,
    });
    setSelectedImages(normalizeImages(land?.images || []));
    setLocationError('');
    setImageError('');
  }, [land, open]);

  const cityOptions = useMemo(() => getCountryCities(f.country), [f.country]);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const handleCountryChange = (country) => {
    const nextCity = getCountryCities(country)[0] || 'Baku';
    setF((x) => ({ ...x, country, city: nextCity, location: getLocationText(country, nextCity) }));
  };

  const handleImageSelect = async (event) => {
    const nextFiles = Array.from(event.target.files || []);
    if (!nextFiles.length) return;
    const totalAfter = nextFiles.length + selectedImages.length;
    if (totalAfter > MAX_LAND_IMAGES) {
      setImageError('You can upload a maximum of 3 images.');
      event.target.value = '';
      return;
    }

    const mapped = await Promise.all(nextFiles.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: String(reader.result) });
      reader.onerror = () => reject(new Error('Unable to read file'));
      reader.readAsDataURL(file);
    })));

    setSelectedImages((prev) => [...prev, ...mapped]);
    setImageError('');
    event.target.value = '';
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImageError('');
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setLocationError('');
    setImageError('');

    if (!f.locationCoordinates || !Number.isFinite(f.locationCoordinates.latitude) || !Number.isFinite(f.locationCoordinates.longitude)) {
      setLocationError('Please select the location of your land on the map.');
      setSaving(false);
      return;
    }

    if (selectedImages.length > MAX_LAND_IMAGES) {
      setImageError('You can upload a maximum of 3 images.');
      setSaving(false);
      return;
    }

    const payload = {
      ...f,
      location: f.location || getLocationText(f.country, f.city),
      country: f.country || 'Azerbaijan',
      city: f.city || 'Baku',
      locationCoordinates: {
        latitude: Number(f.locationCoordinates.latitude),
        longitude: Number(f.locationCoordinates.longitude),
      },
      locationDetails: {
        country: f.country || 'Azerbaijan',
        city: f.city || 'Baku',
        latitude: Number(f.locationCoordinates.latitude),
        longitude: Number(f.locationCoordinates.longitude),
      },
      images: selectedImages,
    };

    if (land) await apiFetch(`/api/lands/${land.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await apiFetch('/api/lands', { method: 'POST', body: JSON.stringify(payload) });

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <AnimatePresence>{open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="font-display font-semibold text-lg text-slate-900">{land ? t('dash.editLand') : t('dash.addLand')}</div>
            <button onClick={onClose} className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={save} className="px-6 py-5 space-y-4 overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-3">
              <FormLabel label={t('dash.landName')}><input value={f.name} onChange={e => set('name', e.target.value)} required className="field" placeholder="Ganja Foothills" /></FormLabel>
              <FormLabel label="Country"><select value={f.country} onChange={(e) => handleCountryChange(e.target.value)} className="field">
                {Object.keys(COUNTRY_CITY_FOCUS).map((country) => <option key={country} value={country}>{country}</option>)}
              </select></FormLabel>
              <FormLabel label="City / Region"><select value={f.city} onChange={(e) => { set('city', e.target.value); set('location', getLocationText(f.country, e.target.value)); }} className="field">
                {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
              </select></FormLabel>
              <FormLabel label={t('dash.location')}><input value={f.location} onChange={e => set('location', e.target.value)} className="field" placeholder="Ganja, Azerbaijan" /></FormLabel>
              <FormLabel label={t('dash.area')}><input type="number" min="1" value={f.area} onChange={e => set('area', Number(e.target.value))} required className="field" /></FormLabel>
              <FormLabel label={t('dash.priceCredit')}><input type="number" step="0.01" min="1" value={f.priceCredit} onChange={e => set('priceCredit', Number(e.target.value))} className="field" /></FormLabel>
              <FormLabel label={t('calc.soil')}><Sel value={f.soil} opts={SOIL} onChange={v => set('soil', v)} tr={(v) => t('calc.soils.' + v)} /></FormLabel>
              <FormLabel label={t('calc.region')}><Sel value={f.region} opts={REGION} onChange={v => set('region', v)} tr={(v) => t('calc.regions.' + v)} /></FormLabel>
              <FormLabel label={t('calc.forest')}><Sel value={f.forestType} opts={FOREST} onChange={v => set('forestType', v)} tr={(v) => t('calc.forests.' + v)} /></FormLabel>
              <FormLabel label={t('calc.vegetation')}><Sel value={f.vegetation} opts={VEG} onChange={v => set('vegetation', v)} tr={(v) => t('calc.vegs.' + v)} /></FormLabel>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[13px] font-semibold text-slate-800 mb-2">📍 Torpağın konumu</div>
              <MapPicker value={f.locationCoordinates} onChange={(value) => { set('locationCoordinates', value); set('location', getLocationText(f.country, f.city)); setLocationError(''); }} country={f.country} city={f.city} />
              <div className="mt-2 text-[12px] text-slate-500">{f.locationCoordinates ? `Selected coordinates: ${f.locationCoordinates.latitude.toFixed(4)}, ${f.locationCoordinates.longitude.toFixed(4)}` : 'Select the exact location of your land by clicking the map.'}</div>
              {locationError && <div className="mt-2 text-[12px] text-rose-600">{locationError}</div>}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[13px] font-semibold text-slate-800 mb-1">📷 Torpaq şəkilləri</div>
              <div className="text-[12px] text-slate-500">Torpağınızın şəkillərini əlavə edə bilərsiniz. Bu bölmə istəyə bağlıdır.</div>
              <div className="mt-3 flex items-center gap-2">
                <label htmlFor="land-photo-upload" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12.5px] font-medium text-slate-700">
                  <UploadCloud className="h-4 w-4" /> Upload images
                </label>
                <span className="text-[11.5px] text-slate-400">Up to 3 images</span>
              </div>
              <input id="land-photo-upload" type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              {selectedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedImages.map((image, index) => (
                    <div key={`${image.id || index}`} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img src={image.dataUrl} alt={image.name} className="h-24 w-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-slate-900">&times;</button>
                    </div>
                  ))}
                </div>
              )}
              {imageError && <div className="mt-2 text-[12px] text-rose-600">{imageError}</div>}
            </div>

            <FormLabel label={t('dash.description')}><textarea value={f.description} onChange={e => set('description', e.target.value)} rows={3} className="field resize-none" /></FormLabel>
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
              <FormLabel label={t('dash.carbonDate')}><input type="date" value={f.date} onChange={e => setF({...f, date: e.target.value})} className="field !py-2" /></FormLabel>
              <FormLabel label={t('dash.carbonAmount')}><input type="number" step="0.1" value={f.tCO2} onChange={e => setF({...f, tCO2: Number(e.target.value)})} required className="field !py-2" /></FormLabel>
              <FormLabel label={t('dash.carbonMethod')}>
                <select value={f.method} onChange={e => setF({...f, method: e.target.value})} className="field !py-2">
                  <option value="satellite">Satellite</option><option value="in-situ">In-situ</option><option value="lidar">LiDAR</option><option value="drone">Drone</option>
                </select>
              </FormLabel>
              <FormLabel label={t('dash.carbonNote')}><input value={f.note} onChange={e => setF({...f, note: e.target.value})} className="field !py-2" placeholder="Optional" /></FormLabel>
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

function FormLabel({ label, children }) { return (<label className="block"><div className="text-[12px] font-medium text-slate-600 mb-1">{label}</div>{children}</label>); }
function Sel({ value, opts, onChange, tr }) { return (<select value={value} onChange={e => onChange(e.target.value)} className="field">{opts.map(o => <option key={o} value={o}>{tr(o)}</option>)}</select>); }
