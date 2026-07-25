const DEFAULT_APP = "http://localhost:3000";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("mentra-payments-check", { periodInMinutes: 60 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "mentra-payments-check") return;
  const { appUrl } = await chrome.storage.sync.get({ appUrl: DEFAULT_APP });
  const base = (appUrl || DEFAULT_APP).replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/extension/snapshot`);
    if (!res.ok) throw new Error("unreachable");
    const data = await res.json();
    await chrome.storage.local.set({ lastSnapshot: data });
    const overdue = data.payments?.overdueCount || 0;
    if (overdue > 0) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "Mentra payment reminder",
        message: `You have ${overdue} overdue invoice(s). Open Mentra Payments to follow up.`,
      });
    }
  } catch {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Mentra unreachable",
      message: "Could not reach your Mentra app URL.",
    });
  }
});
