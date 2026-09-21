// CapShorts Desktop - Rust Core Engine & Tauri v2 Shell

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! CapShorts AI engine is ready.", name)
}

#[tauri::command]
async fn launch_python_sidecar() -> Result<String, String> {
    println!("[tauri] CapShorts sidecar supervisor initialized.");
    Ok("Sidecar daemon managed".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, launch_python_sidecar])
        .setup(|_app| {
            println!("[tauri] CapShorts Desktop App launched successfully.");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running CapShorts application");
}
