#[tauri::command]
fn mentra_default_url() -> String {
    std::env::var("MENTRA_APP_URL").unwrap_or_else(|_| "http://localhost:3000".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![mentra_default_url])
        .run(tauri::generate_context!())
        .expect("error while running Mentra desktop");
}
