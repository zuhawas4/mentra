const appUrlInput = document.getElementById("appUrl");
const joinCodeInput = document.getElementById("joinCode");
const frame = document.getElementById("frame");
const status = document.getElementById("status");

function baseUrl() {
  return (appUrlInput.value || "http://localhost:3000").replace(/\/$/, "");
}

function openPath(path) {
  const url = `${baseUrl()}${path}`;
  frame.src = url;
  status.textContent = `Loaded ${url}`;
}

async function bootstrap() {
  try {
    const invoke = window.__TAURI__?.core?.invoke;
    if (invoke) {
      const url = await invoke("mentra_default_url");
      if (url) appUrlInput.value = url;
    }
  } catch {
    /* running outside Tauri */
  }

  document.getElementById("joinBtn").addEventListener("click", () => {
    const code = joinCodeInput.value.trim().toUpperCase();
    openPath(`/join/${encodeURIComponent(code || "CALC32")}`);
  });
  document.getElementById("dashBtn").addEventListener("click", () => {
    openPath("/dashboard");
  });
  document.getElementById("loginBtn").addEventListener("click", () => {
    openPath("/login");
  });

  openPath("/login");
}

bootstrap();
