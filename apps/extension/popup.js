const DEFAULT_APP = "https://mentra-sable.vercel.app";

const appUrlInput = document.getElementById("appUrl");
const healthLine = document.getElementById("healthLine");
const invoiceList = document.getElementById("invoiceList");
const alertList = document.getElementById("alertList");
const studentList = document.getElementById("studentList");
const openStatus = document.getElementById("openStatus");

function money(cents, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format((cents || 0) / 100);
  } catch {
    return `$${((cents || 0) / 100).toFixed(0)}`;
  }
}

function normalizeBase(url) {
  let raw = (url || DEFAULT_APP).trim();
  if (!raw || /localhost|127\.0\.0\.1/i.test(raw)) raw = DEFAULT_APP;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  return raw.replace(/\/$/, "");
}

function currentBase() {
  return normalizeBase(appUrlInput?.value || DEFAULT_APP);
}

/**
 * Open Mentra in a new tab via the service worker.
 * This is reliable in MV3 (popup often closes mid chrome.tabs.create).
 */
function openApp(path) {
  const base = currentBase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${cleanPath}`;

  if (openStatus) openStatus.textContent = `Opening ${cleanPath}…`;

  void chrome.storage.sync.set({
    appUrl: base,
    lastJoinCode:
      document.getElementById("joinCode")?.value.trim().toUpperCase() ||
      "CALC32",
    lastStudent: document.getElementById("payStudent")?.value.trim() || "",
  });

  chrome.runtime.sendMessage({ type: "OPEN_TAB", url }, (response) => {
    const err = chrome.runtime.lastError;
    if (err || !response?.ok) {
      // Fallback if messaging fails
      chrome.tabs.create({ url, active: true });
    }
    if (openStatus) {
      openStatus.textContent = err
        ? `Could not open tab: ${err.message}`
        : `Opened ${url}`;
    }
  });
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get({
    appUrl: DEFAULT_APP,
    lastJoinCode: "CALC32",
    lastStudent: "Daniel Miller",
  });
  let appUrl = stored.appUrl || DEFAULT_APP;
  if (/localhost|127\.0\.0\.1/i.test(appUrl)) {
    appUrl = DEFAULT_APP;
    void chrome.storage.sync.set({ appUrl });
  }
  appUrlInput.value = appUrl;
  document.getElementById("joinCode").value = stored.lastJoinCode;
  document.getElementById("payStudent").value = stored.lastStudent;
}

function renderSnapshot(data) {
  const payments = data.payments || {};
  document.getElementById("statStudents").textContent = String(
    data.students?.length ?? "—",
  );
  document.getElementById("statSessions").textContent = String(
    data.sessions?.length ?? "—",
  );
  document.getElementById("statOpen").textContent = money(
    payments.openCents || 0,
  );

  healthLine.textContent = `Mode: ${data.mode} · Supabase ${
    data.supabase ? "on" : "off"
  } · Prisma ${data.prisma ? "on" : "off"} · ${
    payments.invoiceCount ?? 0
  } invoices`;

  studentList.innerHTML = "";
  (data.students || []).forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.fullName;
    studentList.appendChild(opt);
  });

  invoiceList.innerHTML = "";
  const invoices = data.invoices || payments.recent || [];
  if (!invoices.length) {
    invoiceList.innerHTML = `<li class="muted">No invoices found.</li>`;
  } else {
    invoices.slice(0, 10).forEach((inv) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="row">
          <strong>${inv.title}</strong>
          <span class="badge ${inv.status}">${inv.status}</span>
        </div>
        <div class="row">
          <span class="muted">${inv.studentName}</span>
          <strong>${money(inv.amountCents, inv.currency)}</strong>
        </div>`;
      invoiceList.appendChild(li);
    });
  }

  alertList.innerHTML = "";
  const alerts = [];
  if ((payments.overdueCount || 0) > 0) {
    alerts.push({
      title: `${payments.overdueCount} overdue invoice(s)`,
      body: `Outstanding ${money(payments.openCents || 0)}`,
      tone: "overdue",
    });
  }
  const live = (data.sessions || []).filter((s) => s.status === "live");
  if (live.length) {
    alerts.push({
      title: `${live.length} live session(s)`,
      body: live.map((s) => s.title).join(", "),
      tone: "sent",
    });
  }
  alerts.push({
    title: "Notifications center",
    body: "Open Mentra for realtime chat, joins, and session alerts.",
    tone: "sent",
  });
  alerts.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="row">
        <strong>${a.title}</strong>
        <span class="badge ${a.tone}">alert</span>
      </div>
      <span class="muted">${a.body}</span>`;
    alertList.appendChild(li);
  });
}

async function refreshSnapshot() {
  const base = currentBase();
  healthLine.textContent = "Loading app data…";

  try {
    const cached = await chrome.storage.local.get("lastSnapshot");
    if (cached.lastSnapshot) renderSnapshot(cached.lastSnapshot);
  } catch {
    /* ignore */
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${base}/api/extension/snapshot`, {
      credentials: "omit",
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderSnapshot(data);
    await chrome.storage.local.set({ lastSnapshot: data });
  } catch {
    healthLine.textContent =
      "Could not refresh data. Buttons still open Mentra — check App URL.";
  } finally {
    clearTimeout(timer);
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".panel")
      .forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

document.getElementById("dashboardBtn").addEventListener("click", () => {
  openApp("/dashboard");
});
document.getElementById("paymentsPageBtn").addEventListener("click", () => {
  openApp("/payments");
});
document.getElementById("viewAllInvoicesBtn").addEventListener("click", () => {
  openApp("/payments");
});
document.getElementById("notifyBtn").addEventListener("click", () => {
  openApp("/notifications");
});
document.getElementById("refreshBtn").addEventListener("click", () => {
  void chrome.storage.sync.set({ appUrl: currentBase() });
  void refreshSnapshot();
});
document.getElementById("joinBtn").addEventListener("click", () => {
  const code = document.getElementById("joinCode").value.trim().toUpperCase();
  openApp(`/join/${encodeURIComponent(code || "CALC32")}`);
});

document.getElementById("recordPayBtn").addEventListener("click", () => {
  const student = document.getElementById("payStudent").value.trim();
  const title = document.getElementById("payTitle").value.trim();
  const amount = document.getElementById("payAmount").value.trim();
  const notes = document.getElementById("payNotes").value.trim();
  const status = document.getElementById("payStatus").value;
  const qs = new URLSearchParams({
    student,
    title,
    amount,
    notes,
    status,
  });
  openApp(`/payments?${qs.toString()}`);
});

appUrlInput.addEventListener("change", () => {
  void chrome.storage.sync.set({ appUrl: currentBase() });
  void refreshSnapshot();
});

void (async () => {
  await loadSettings();
  await refreshSnapshot();
})();
