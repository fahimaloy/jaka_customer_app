// import { Database } from "@tauri-apps/plugin-sql";
import Database from "@tauri-apps/plugin-sql";

// // Initialize the SQLite database connection
// let db;
// const init = async () => {
//   db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
// };
// init();
// Function to create a new customer
export async function createCustomer(customer) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  await db.execute("BEGIN TRANSACTION");
  try {
    const query = `
      INSERT INTO customers (
        id, address, search_name, name, phone, email, tax_reg_num, address_street,
        address_building, address_district, address_city, address_postal_code, country_code,
        language, latitude, longitude, loyalty_points
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      customer.id,
      customer.address,
      customer.search_name,
      customer.name,
      customer.phone,
      customer.email,
      customer.tax_reg_num,
      customer.address_street,
      customer.address_building,
      customer.address_district,
      customer.address_city,
      customer.address_postal_code,
      customer.country_code,
      customer.language,
      customer.latitude,
      customer.longitude,
      customer.loyalty_points,
    ];

    await db.execute(query, params);

    return { success: true, result: customer };
  } catch (error) {
    console.error("createCustomer error:", error);
    throw error;
  }
}

// Function to update an existing customer
export async function updateCustomer(customer) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  console.log("Customer Update Payload: ", customer);
  await db.execute("BEGIN TRANSACTION");
  try {
    const query = `
      UPDATE customers SET
        address = ?,
        search_name = ?,
        name = ?,
        phone = ?,
        email = ?,
        tax_reg_num = ?,
        address_street = ?,
        address_building = ?,
        address_district = ?,
        address_city = ?,
        address_postal_code = ?,
        country_code = ?,
        language = ?,
        latitude = ?,
        longitude = ?,
        loyalty_points = ?
      WHERE id = ?
    `;

    const params = [
      customer?.address || "",
      customer?.search_name || "",
      customer?.name || "",
      customer?.phone || "",
      customer?.email || "",
      customer?.tax_reg_num || "",
      customer?.address_street || "",
      customer?.address_building || "",
      customer?.address_district || "",
      customer?.address_city || "",
      customer?.address_postal_code || "",
      customer?.country_code || "",
      customer?.language || 0,
      customer?.latitude || 0,
      customer?.longitude || 0,
      customer?.loyalty_points || 0,
      customer.id,
    ];
    console.log(query, params);
    const d = await db.execute(query, params);
    console.log(d);
    await db.execute("COMMIT");
    await db.close();
    return { success: true, result: customer };
  } catch (error) {
    console.error("updateCustomer error:", error);
    throw error;
  }
}

// Function to bulk insert customers with an option to delete all existing records first
// export async function bulkCreateCustomers(customers, deleteAll = false) {
//   const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
//   await db.execute("BEGIN TRANSACTION");
//   try {
//     await db.execute("BEGIN TRANSACTION");

//     if (deleteAll) {
//       await db.execute("DELETE FROM customers");
//       console.log("Deleted all customers before bulk insert.");
//     }

//     const query = `
//       INSERT INTO customers (
//         id, address, search_name, name, phone, email, tax_reg_num, address_street,
//         address_building, address_district, address_city, address_postal_code, country_code,
//         language, latitude, longitude, loyalty_points
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     for (const customer of customers) {
//       const params = [
//         customer.id,
//         customer.address,
//         customer.search_name,
//         customer.name,
//         customer.phone,
//         customer.email,
//         customer.tax_reg_num,
//         customer.address_street,
//         customer.address_building,
//         customer.address_district,
//         customer.address_city,
//         customer.address_postal_code,
//         customer.country_code,
//         customer.language,
//         customer.latitude,
//         customer.longitude,
//         customer.loyalty_points,
//       ];
//       await db.execute(query, params);
//     }

//     await db.execute("COMMIT");

//     return { success: true, count: customers.length };
//   } catch (error) {
//     await db.execute("ROLLBACK");
//     console.error("bulkCreateCustomers error:", error);
//     throw error;
//   }
// }
export async function bulkCreateCustomers(customers, deleteAll = false) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  try {
    await db.execute("BEGIN TRANSACTION");

    if (deleteAll) {
      await db.execute("DELETE FROM customers");
      console.log("Deleted all customers before bulk insert.");
    }

    // Build the multi-row INSERT statement dynamically
    let params = [];
    let valuesPlaceholders = [];

    // For each customer, create a placeholder group and flatten its values into the params array.
    for (const customer of customers) {
      const customerValues = [
        customer.id,
        customer.address,
        customer.search_name,
        customer.name,
        customer.phone,
        customer.email,
        customer.tax_reg_num,
        customer.address_street,
        customer.address_building,
        customer.address_district,
        customer.address_city,
        customer.address_postal_code,
        customer.country_code,
        customer.language,
        customer.latitude,
        customer.longitude,
        customer.loyalty_points,
      ];
      // Create a group of placeholders like "(?, ?, ..., ?)"
      const placeholders =
        "(" + Array(customerValues.length).fill("?").join(", ") + ")";
      valuesPlaceholders.push(placeholders);
      params = params.concat(customerValues);
    }

    const query = `
      INSERT INTO customers (
        id, address, search_name, name, phone, email, tax_reg_num, address_street,
        address_building, address_district, address_city, address_postal_code, country_code,
        language, latitude, longitude, loyalty_points
      ) VALUES ${valuesPlaceholders.join(", ")}
    `;

    await db.execute(query, params);
    await db.execute("COMMIT");

    return { success: true, count: customers.length };
  } catch (error) {
    await db.execute("ROLLBACK");
    console.error("bulkCreateCustomers error:", error);
    throw error;
  }
}
// Function to retrieve a list of customers based on a search term
export async function getCustomersList(searchTerm = "", qty = 100) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  await db.execute("BEGIN TRANSACTION");
  try {
    let query = "SELECT * FROM customers";
    const params = [];

    if (searchTerm && searchTerm.trim() !== "") {
      query += " WHERE (search_name LIKE ? OR phone LIKE ?)";
      const term = `${searchTerm.trim()}%`;
      params.push(term, term);
    }

    query += " LIMIT ?";
    params.push(qty);

    const rows = await db.select(query, params);
    return { success: true, result: rows };
  } catch (error) {
    console.error("getCustomersList error:", error);
    throw error;
  }
}

// Function to retrieve a single customer by ID
export async function getSingleCustomer(id) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  await db.execute("BEGIN TRANSACTION");
  try {
    const query = "SELECT * FROM customers WHERE id = ?";
    const result = await db.select(query, [id]);

    if (result.length === 0) {
      return { success: false, error: "Customer not found" };
    }

    return { success: true, result: result[0] };
  } catch (error) {
    console.error("getSingleCustomer error:", error);
    throw error;
  }
}
