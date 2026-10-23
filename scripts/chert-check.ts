// Read-only check of the Chert iMessage setup: `npm run chert:check`.
// Shows your lines and the shape of recent messages (phone numbers masked). Sends nothing.
import { chertConfigured, lineId, listLines, listMessages } from "../lib/server/chert";

const mask = (s: unknown) => (typeof s === "string" ? s.replace(/\d(?=\d{2})/g, "•") : s);

async function main() {
  if (!chertConfigured()) {
    console.log("CHERT_API_KEY is not set in .env.local");
    return;
  }
  const lines = await listLines();
  console.log(`lines (${lines.length}):`);
  for (const l of lines) console.log(" ", JSON.stringify(l, (k, v) => (/phone|number|address|handle/i.test(k) ? mask(v) : v)));
  console.log("line used for texts:", await lineId());
  const messages = await listMessages();
  console.log(`messages (${messages.length}), newest 5:`);
  for (const m of messages.slice(-5)) console.log(" ", { ...m, handle: mask(m.handle), text: m.text.slice(0, 60) });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
