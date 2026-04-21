export interface Service {
  id: string;
  nameCz: string;
  nameEn: string;
  icon: string;
  color: string;
}

export const SERVICES: Service[] = [
  { id: 'elektrikar', nameCz: 'Elektrikář', nameEn: 'Electrician', icon: '⚡', color: 'bg-yellow-50' },
  { id: 'instalater', nameCz: 'Instalatér', nameEn: 'Plumber', icon: '🔧', color: 'bg-blue-50' },
  { id: 'malir', nameCz: 'Malíř pokojů', nameEn: 'Painter', icon: '🎨', color: 'bg-pink-50' },
  { id: 'tesar', nameCz: 'Tesař', nameEn: 'Carpenter', icon: '🪚', color: 'bg-orange-50' },
  { id: 'truhlar', nameCz: 'Truhlář', nameEn: 'Joiner', icon: '🪵', color: 'bg-amber-50' },
  { id: 'zubar', nameCz: 'Zubař', nameEn: 'Dentist', icon: '🦷', color: 'bg-cyan-50' },
  { id: 'stehovaci-firma', nameCz: 'Stěhování', nameEn: 'Movers', icon: '📦', color: 'bg-purple-50' },
  { id: 'zahradnik', nameCz: 'Zahradník', nameEn: 'Gardener', icon: '🌿', color: 'bg-green-50' },
  { id: 'uklid', nameCz: 'Úklid', nameEn: 'Cleaning', icon: '🧹', color: 'bg-teal-50' },
  { id: 'zednik', nameCz: 'Zedník', nameEn: 'Mason', icon: '🧱', color: 'bg-red-50' },
  { id: 'it-technik', nameCz: 'IT technik', nameEn: 'IT Technician', icon: '💻', color: 'bg-indigo-50' },
  { id: 'ucetni', nameCz: 'Účetní', nameEn: 'Accountant', icon: '📊', color: 'bg-slate-50' },
  { id: 'pravnik', nameCz: 'Právník', nameEn: 'Lawyer', icon: '⚖️', color: 'bg-gray-50' },
  { id: 'autoservis', nameCz: 'Autoservis', nameEn: 'Auto Repair', icon: '🚗', color: 'bg-zinc-50' },
  { id: 'fotograf', nameCz: 'Fotograf', nameEn: 'Photographer', icon: '📷', color: 'bg-violet-50' },
  { id: 'kadernik', nameCz: 'Kadeřník', nameEn: 'Hairdresser', icon: '✂️', color: 'bg-rose-50' },
  { id: 'lekar', nameCz: 'Lékař', nameEn: 'Doctor', icon: '🏥', color: 'bg-emerald-50' },
  { id: 'klempir', nameCz: 'Klempíř', nameEn: 'Tinsmith', icon: '🔨', color: 'bg-lime-50' },
];
