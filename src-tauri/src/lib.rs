use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct List {
    id: String,
    title: String,
    #[serde(rename = "titleColor")]
    title_color: Option<String>,
    description: String,
    lists: Vec<List>,
    #[serde(rename = "createdAt")]
    created_at: i64,
    #[serde(rename = "updatedAt")]
    updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    name: String,
    version: String,
    lists: Vec<List>,
    #[serde(rename = "createdAt")]
    created_at: i64,
    #[serde(rename = "updatedAt")]
    updated_at: i64,
}

#[tauri::command]
fn create_project(path: String, project: Project) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&project)
        .map_err(|e| format!("Failed to serialize project: {}", e))?;
    
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write project file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
fn load_project(path: String) -> Result<Project, String> {
    if !Path::new(&path).exists() {
        return Err(format!("Project file not found: {}", path));
    }
    
    let contents = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read project file: {}", e))?;
    
    let project: Project = serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse project file: {}", e))?;
    
    Ok(project)
}

#[tauri::command]
fn save_project(path: String, project: Project) -> Result<(), String> {
    let json = serde_json::to_string_pretty(&project)
        .map_err(|e| format!("Failed to serialize project: {}", e))?;
    
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write project file: {}", e))?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            create_project,
            load_project,
            save_project
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
