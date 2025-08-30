import { remove, BaseDirectory } from "@tauri-apps/plugin-fs";

export const deleteDatabaseFiles = async () => {
  const filesToDelete = [
    "jaka_kiosk_sql_db.db",
    "jaka_kiosk_sql_db.db-shm",
    "jaka_kiosk_sql_db.db-wal",
  ];

  await Promise.all(
    filesToDelete.map(async (file) => {
      try {
        await remove(file, { baseDir: BaseDirectory.AppConfig });
        console.log(`${file} removed successfully.`);
      } catch (error) {
        const errorMsg = error && error.toString ? error.toString() : "";
        if (errorMsg.includes("NotFound") || errorMsg.includes("ENOENT")) {
          console.warn(`${file} not found. Skipping...`);
        } else {
          console.error(`Error deleting ${file}:`, error);
        }
      }
    })
  );

  console.log("Finished processing deletion for all database files.");
};
