// src/utils/sriLankaData.js
//
// Single source of truth for Sri Lanka's 25 districts, used by doctor
// registration, the "Find a Vet" search filters, and matched by the
// backend's district-centroid fallback (DoctorSearchController). If you
// add/rename a district here, keep its `id` in sync with the matching key
// in DISTRICT_CENTROIDS on the backend, or distance-based search will
// silently treat that district's doctors as having no location.
export const districts = [
  { id: 'colombo', name: 'Colombo' },
  { id: 'gampaha', name: 'Gampaha' },
  { id: 'kalutara', name: 'Kalutara' },
  { id: 'kandy', name: 'Kandy' },
  { id: 'matale', name: 'Matale' },
  { id: 'nuwara-eliya', name: 'Nuwara Eliya' },
  { id: 'galle', name: 'Galle' },
  { id: 'matara', name: 'Matara' },
  { id: 'hambantota', name: 'Hambantota' },
  { id: 'jaffna', name: 'Jaffna' },
  { id: 'kilinochchi', name: 'Kilinochchi' },
  { id: 'mannar', name: 'Mannar' },
  { id: 'mullaitivu', name: 'Mullaitivu' },
  { id: 'vavuniya', name: 'Vavuniya' },
  { id: 'puttalam', name: 'Puttalam' },
  { id: 'kurunegala', name: 'Kurunegala' },
  { id: 'kegalle', name: 'Kegalle' },
  { id: 'ratnapura', name: 'Ratnapura' },
  { id: 'badulla', name: 'Badulla' },
  { id: 'monaragala', name: 'Monaragala' },
  { id: 'ampara', name: 'Ampara' },
  { id: 'batticaloa', name: 'Batticaloa' },
  { id: 'trincomalee', name: 'Trincomalee' },
  { id: 'polonnaruwa', name: 'Polonnaruwa' },
  { id: 'anuradhapura', name: 'Anuradhapura' },
];

export const cities = {
  colombo: ['Colombo 01', 'Colombo 02', 'Colombo 03', 'Colombo 04', 'Colombo 05', 'Dehiwala', 'Mount Lavinia', 'Moratuwa'],
  gampaha: ['Negombo', 'Gampaha', 'Wattala', 'Kadawatha', 'Minuwangoda', 'Katunayake', 'Ja-Ela'],
  kalutara: ['Kalutara', 'Panadura', 'Horana', 'Wadduwa', 'Beruwala', 'Aluthgama'],
  kandy: ['Kandy', 'Peradeniya', 'Gampola', 'Katugastota', 'Kundasale', 'Akurana'],
  matale: ['Matale', 'Dambulla', 'Galewela', 'Ukuwela'],
  'nuwara-eliya': ['Nuwara Eliya', 'Hatton', 'Talawakele', 'Ginigathhena'],
  galle: ['Galle', 'Hikkaduwa', 'Ahangama', 'Ambalangoda', 'Elpitiya'],
  matara: ['Matara', 'Weligama', 'Devinuwara', 'Dikwella', 'Hakmana'],
  hambantota: ['Hambantota', 'Tangalle', 'Tissamaharama', 'Ambalantota'],
  jaffna: ['Jaffna', 'Chavakachcheri', 'Point Pedro', 'Nallur'],
  kilinochchi: ['Kilinochchi', 'Pallai'],
  mannar: ['Mannar', 'Pesalai'],
  mullaitivu: ['Mullaitivu', 'Oddusuddan'],
  vavuniya: ['Vavuniya', 'Nedunkeni'],
  puttalam: ['Puttalam', 'Chilaw', 'Wennappuwa', 'Marawila'],
  kurunegala: ['Kurunegala', 'Kuliyapitiya', 'Narammala', 'Wariyapola', 'Pannala'],
  kegalle: ['Kegalle', 'Mawanella', 'Kitulgala', 'Warakapola', 'Ruwanwella'],
  ratnapura: ['Ratnapura', 'Balangoda', 'Kalawana', 'Rakwana', 'Eheliyagoda'],
  badulla: ['Badulla', 'Bandarawela', 'Haputale', 'Welimada'],
  monaragala: ['Monaragala', 'Wellawaya', 'Bibile'],
  ampara: ['Ampara', 'Kalmunai', 'Sammanthurai', 'Akkaraipattu'],
  batticaloa: ['Batticaloa', 'Kattankudy', 'Eravur'],
  trincomalee: ['Trincomalee', 'Kinniya', 'Kantale'],
  polonnaruwa: ['Polonnaruwa', 'Kaduruwela', 'Medirigiriya'],
  anuradhapura: ['Anuradhapura', 'Kebithigollewa', 'Kekirawa', 'Kalawewa'],
};
