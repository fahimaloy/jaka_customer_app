#![cfg_attr(mobile, allow(unused_imports))]
// mod plugins;
// use plugins::printer;
use tauri_plugin_dialog;
use tauri_plugin_fs;
use tauri_plugin_sql::{Migration, MigrationKind};

use tauri::AppHandle;

#[tauri::command]
fn close_app(app: tauri::AppHandle) -> Result<(), String> {
    app.exit(0);
    Ok(())
}

#[tauri::command]
fn restart_app(app: AppHandle) -> Result<(), String> {
    // This works on Android as well as desktop
    app.restart()
    // .map_err(|e| format!("Failed to restart: {}", e))
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        // Create items table
        Migration {
            version: 1,
            description: "Create items table",
            sql: r#"CREATE TABLE IF NOT EXISTS items (
               id INTEGER PRIMARY KEY,
               item_code TEXT NOT NULL,
               search_name TEXT,
               name TEXT,
               arabic_name TEXT,
               description TEXT,
               arabic_description TEXT,
               available_all_locations INTEGER,
               buying_price REAL,
               selling_price REAL,
               tax_percent REAL,
               discount_amount REAL,
               discount_percentage REAL,
               is_produced INTEGER,
               is_active INTEGER,
               is_deleted INTEGER,
               is_popular INTEGER,
               is_veg INTEGER,
               track_inventory INTEGER,
               available_online INTEGER,
               wac REAL,
               image TEXT,
               created_at TEXT,
               updated_at TEXT,
               category INTEGER,
               item_group TEXT,
               item_brand TEXT,
               kot_device INTEGER,
               available_locations TEXT,
               order_categories TEXT,
               price REAL,
               is_tax_inclusive INTEGER,
               selectedTab TEXT,
               default_price REAL,
               isSpecial INTEGER,
               charge REAL,
               popup_modifier_while_adding_item_to_cart INTEGER,
               allow_selling_price_change INTEGER,
               quantity REAL,
               totalPrice REAL,
               tax REAL,
               special_prices TEXT,
               modifiers TEXT,
               barcode TEXT
             )"#,
            kind: MigrationKind::Up,
        },
        // Create customers table
        Migration {
            version: 2,
            description: "Create customers table",
            sql: r#"CREATE TABLE IF NOT EXISTS customers (
        id INTEGER,
        address TEXT,
        search_name TEXT,
        name TEXT,
        phone TEXT,
        email TEXT,
        tax_reg_num TEXT,
        address_street TEXT,
        address_building TEXT,
        address_district TEXT,
        address_city TEXT,
        address_postal_code TEXT,
        country_code TEXT,
        language TEXT,
        latitude REAL,
        longitude REAL,
        loyalty_points REAL
      )"#,
            kind: MigrationKind::Up,
        },
        // Create orders table
        Migration {
            version: 3,
            description: "Create orders table",
            sql: r#"CREATE TABLE IF NOT EXISTS orders (
        table_number INTEGER,
        online INTEGER,
        phone INTEGER,
        completed INTEGER,
        rejected INTEGER,
        refunded INTEGER,
        cartState TEXT,
        token TEXT,
        orderStatus TEXT,
        ptid TEXT,
        invoice_num TEXT,
        charge_details TEXT,
        split_payment_details TEXT,
        shift_id INTEGER,
        id INTEGER,
        token_counter TEXT,
        notes TEXT,
        time INTEGER,
        jaka_pos_version TEXT,
        pos_device TEXT,
        order_type TEXT,
        order_source TEXT,
        order_destination TEXT,
        paymentMethod TEXT,
        payment_method_id TEXT,
        paymentStatus TEXT,
        store_id INTEGER,
        customer TEXT,
        total TEXT,
        is_synced INTEGER,
        token_no TEXT,
        invoice_printed INTEGER,
        unique_id INTEGER,
        business_date TEXT,
        ordered_at INTEGER,
        user TEXT,
        cashier TEXT,
        waiter TEXT,
        opened INTEGER,
        downloaded INTEGER,
        delivery_agent TEXT,
        refund_details TEXT,
        refunded_items TEXT,
        zatca_qrcode TEXT
      )"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "Create barcodes table",
            sql: r#"
              CREATE TABLE IF NOT EXISTS barcodes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER NOT NULL,
                barcode TEXT NOT NULL,
                FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
              )
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "Add units field to items",
            sql: "ALTER TABLE items ADD COLUMN units TEXT DEFAULT '[]';",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "Add image_url field to items",
            sql: "ALTER TABLE items ADD COLUMN image_url TEXT NULL;",
            kind: MigrationKind::Up,
        },
    ];

    // let mut builder =
    // builder = builder.plugin(tauri_plugin_printer::init());
    // #[cfg(target_os = "android")]
    // {
    //     builder = builder.plugin(tauri_plugin_blec::init());
    // }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![close_app, restart_app])
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:jaka_kiosk_sql_db.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_share::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
