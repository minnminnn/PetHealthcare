export function getClinicDisplayName(name: string) {
  return name.replace(/^\[DEMO\]\s*/i, "");
}
