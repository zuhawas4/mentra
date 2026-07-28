const DEFAULT_APP = "https://mentra-sable.vercel.app";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("mentra-payments-check", { periodInMinutes: 60 });
  chrome.storage.sync.get({ appUrl: DEFAULT_APP }, (stored) => {
    if (!stored.appUrl || /localhost|127\.0\.0\.1/i.test(stored.appUrl)) {
      chrome.storage.sync.set({ appUrl: DEFAULT_APP });
    }
  });
});

/** Reliable tab opener — popup may close before chrome.tabs.create finishes. */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "OPEN_TAB" && typeof message.url === "string") {
    chrome.tabs.create({ url: message.url, active: true }, (tab) => {
      const err = chrome.runtime.lastError;
      sendResponse({ ok: !err, tabId: tab?.id, error: err?.message });
    });
    return true; // keep channel open for async response
  }
  return false;
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "mentra-payments-check") return;
  const { appUrl } = await chrome.storage.sync.get({ appUrl: DEFAULT_APP });
  const base = (appUrl || DEFAULT_APP).replace(/\/$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${base}/api/extension/snapshot`, {
      signal: controller.signal,
      cache: "no-store",
    });
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
    /* silent */
  } finally {
    clearTimeout(timer);
  }
});
