// Doctor names are stored as typed at registration, so some already start with
// "Dr." (e.g. "Dr. Kamal Perera"). Add the prefix only when it's missing so the
// UI never shows "Dr. Dr. Kamal Perera".
export const formatDoctorName = (name) => {
  const n = (name || '').trim();
  if (!n) return 'Doctor';
  return /^dr\.?\s/i.test(n) ? n : `Dr. ${n}`;
};
