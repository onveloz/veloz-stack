// Suprime o terminal do Windows em release builds; em dev mostra prints.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;

/// Comando IPC simples — chamado do frontend via `invoke('greet', { name })`.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Olá, {}! Mensagem do Rust 🦀", name)
}

#[derive(Serialize)]
struct SystemInfo {
    os: String,
    arch: String,
    family: String,
}

/// Retorna info do SO. O frontend recebe como objeto tipado.
#[tauri::command]
fn system_info() -> SystemInfo {
    SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        family: std::env::consts::FAMILY.to_string(),
    }
}

/// Lê uma variável de ambiente do processo Rust. Útil pra acessar segredos
/// que você NÃO quer expor no frontend (ex.: ANTHROPIC_API_KEY).
#[tauri::command]
fn env_var(key: &str) -> Option<String> {
    std::env::var(key).ok()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, system_info, env_var])
        .run(tauri::generate_context!())
        .expect("erro fatal ao iniciar o app Tauri");
}
