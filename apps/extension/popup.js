const DEFAULT_APP = "http://localhost:3000";

const appUrlInput = document.getElementById("appUrl");
const healthLine = document.getElementById("healthLine");
const invoiceList = document.getElementById("invoiceList");
const alertList = document.getElementById("alertList");
const studentList = document.getElementById("studentList");

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
  return (url || DEFAULT_APP).replace(/\/$/, "");
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get({
    appUrl: DEFAULT_APP,
    lastJoinCode: "CALC32",
    lastStudent: "Daniel Miller",
  });
  appUrlInput.value = stored.appUrl;
  document.getElementById("joinCode").value = stored.lastJoinCode;
  document.getElementById("payStudent").value = stored.lastStudent;
}

async function saveSettings(extra = {}) {
  await chrome.storage.sync.set({
    appUrl: normalizeBase(appUrlInput.value),
    lastJoinCode: document.getElementById("joinCode").value.trim().toUpperCase(),
    lastStudent: document.getElementById("payStudent").value.trim(),
    ...extra,
  });
}

function openApp(path) {
  const base = normalizeBase(appUrlInput.value);
  chrome.tabs.create({ url: `${base}${path}` });
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
  const base = normalizeBase(appUrlInput.value);
  healthLine.textContent = "Loading app data…";
  try {
    const res = await fetch(`${base}/api/extension/snapshot`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    renderSnapshot(data);
    await chrome.storage.local.set({ lastSnapshot: data });
  } catch (err) {
    healthLine.textContent =
      "App unreachable. Start Mentra (`npm run dev`) or set your Vercel URL.";
    const cached = await chrome.storage.local.get("lastSnapshot");
    if (cached.lastSnapshot) renderSnapshot(cached.lastSnapshot);
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

document.getElementById("dashboardBtn").addEventListener("click", async () => {
  await saveSettings();
  openApp("/dashboard");
});
document.getElementById("paymentsPageBtn").addEventListener("click", async () => {
  await saveSettings();
  openApp("/payments");
});
document.getElementById("viewAllInvoicesBtn").addEventListener("click", async () => {
  await saveSettings();
  openApp("/payments");
});
document.getElementById("notifyBtn").addEventListener("click", async () => {
  await saveSettings();
  openApp("/notifications");
});
document.getElementById("refreshBtn").addEventListener("click", async () => {
  await saveSettings();
  await refreshSnapshot();
});
document.getElementById("joinBtn").addEventListener("click", async () => {
  await saveSettings();
  const code = document.getElementById("joinCode").value.trim().toUpperCase();
  openApp(`/join/${encodeURIComponent(code || "CALC32")}`);
});

document.getElementById("recordPayBtn").addEventListener("click", async () => {
  await saveSettings();
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

  // Also try authenticated API create when the tutor is logged into Mentra.
  const base = normalizeBase(appUrlInput.value);
  try {
    await fetch(`${base}/api/payments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: student,
        title,
        amountCents: Math.round(Number(amount) * 100),
        notes,
        status,
      }),
    });
  } catch {
    /* demo / CORS / offline — page open still works */
  }
});

appUrlInput.addEventListener("change", async () => {
  await saveSettings();
  await refreshSnapshot();
});

await loadSettings();
await refreshSnapshot();
