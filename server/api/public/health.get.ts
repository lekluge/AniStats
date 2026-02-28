export default defineEventHandler(() => {
  const now = new Date().toISOString();
  return {
    ok: true,
    time: now,
  };
});
