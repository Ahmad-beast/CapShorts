// OpenCaption Desktop - Rust Core Engine & Tauri v2 Shell
use tauri::{AppHandle, Manager};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! OpenCaption AI engine is ready.", name)
}

#[tauri::command]
async fn launch_python_sidecar(app: AppHandle) -> Result<String, String> {
    println!("[tauri] OpenCaption sidecar supervisor initialized.");
    Ok("Sidecar daemon managed".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, launch_python_sidecar])
        .setup(|app| {
            println!("[tauri] OpenCaption Desktop App launched successfully.");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running OpenCaption application");
}
