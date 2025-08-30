// import { Database } from "@tauri-apps/plugin-sql";
import Database from "@tauri-apps/plugin-sql";

// Initialize the SQLite database connection
// let db;
// const init = async () => {
//   db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
// };
// init();
// Function to add a new order

export async function addOrder(order) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  try {
    const query = `
      INSERT INTO orders (
        table_number, online, phone, completed, rejected, refunded, cartState, token, orderStatus, ptid,
        invoice_num, charge_details, split_payment_details, shift_id, id, token_counter, notes, time, jaka_pos_version, pos_device,
        order_type, order_source, order_destination, paymentMethod, payment_method_id, paymentStatus, store_id, customer, total, is_synced,
        token_no, invoice_printed, unique_id, business_date, ordered_at, user, cashier, waiter, opened, downloaded,
        delivery_agent, refund_details, refunded_items, zatca_qrcode
      ) VALUES (
        --  1–10
        ?,    ?,    ?,    ?,    ?,      ?,       ?,       ?,         ?,         ?,
        -- 11–20
        ?,          ?,               ?,                     ?,        ?,              ?,             ?,     ?,    ?,     ?,
        -- 21–30
        ?,          ?,            ?,             ?,              ?,              ?,          ?,        ?,      ?,         ?,
        -- 31–40
        ?,         ?,            ?,           ?,             ?,      ?,       ?,      ?,         ?,        ?,
        -- 41–44
        ?,             ?,             ?,               ?
      )
    `;

    const params = [
      JSON.stringify(order?.table) ?? null,
      order?.online ? 1 : 0,
      order?.phone ? 1 : 0,
      order?.completed ? 1 : 0,
      order?.rejected ? 1 : 0,
      order?.refunded ? 1 : 0,
      JSON.stringify(order?.cartState) ?? null,
      order?.token ?? null,
      order?.orderStatus ?? null,
      order?.ptid ?? null, // 10
      order?.invoice_num ?? null,
      JSON.stringify(order?.charge_details) ?? null,
      JSON.stringify(order?.split_payment_details) ?? null,
      order?.shift_id ?? null,
      order?.id ?? null,
      order?.token_counter ?? null,
      order?.notes ?? null,
      order?.time ?? null,
      order?.jaka_pos_version ?? null,
      JSON.stringify(order?.pos_device) ?? null, // 20
      order?.order_type ?? null,
      order?.order_source ?? null,
      order?.order_destination ?? null,
      order?.paymentMethod ?? null,
      order?.payment_method_id ?? null,
      order?.paymentStatus ?? null,
      order?.store_id ?? null,
      JSON.stringify(order?.customer) ?? null,
      order?.total ?? null,
      order?.is_synced ? 1 : 0, // 30
      order?.token_no ?? null,
      order?.invoice_printed ? 1 : 0,
      order?.unique_id ?? null,
      order?.business_date ?? null,
      order?.ordered_at ?? null,
      JSON.stringify(order?.user) ?? null,
      JSON.stringify(order?.cashier) ?? null,
      JSON.stringify(order?.waiter) ?? null,
      order?.opened ? 1 : 0,
      order?.downloaded ? 1 : 0, // 40
      JSON.stringify(order?.delivery_agent) ?? null, // 41
      JSON.stringify(order?.refund_details) ?? null, // 42
      JSON.stringify(order?.refunded_items) ?? null, // 43
      order?.zatca_qrcode ?? null, // 44
    ];

    // sanity check: these should both log “44”
    console.log(`placeholders: ${(query.match(/\?/g) || []).length}`);
    console.log(`params.length: ${params.length}`);

    await db.execute(query, params);
    return { success: true, result: order };
  } catch (error) {
    console.error("addOrder error:", error);
    throw error;
  }
}

// Function to update an existing order
export async function updateOrder(order) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  try {
    const query = `
      UPDATE orders SET
        table_number = ?, online = ?, phone = ?, completed = ?, rejected = ?, refunded = ?, cartState = ?,
        token = ?, orderStatus = ?, ptid = ?, invoice_num = ?, charge_details = ?, split_payment_details = ?,
        shift_id = ?, token_counter = ?, notes = ?, time = ?, jaka_pos_version = ?, pos_device = ?, order_type = ?,
        order_source = ?, order_destination = ?, paymentMethod = ?, payment_method_id = ?, paymentStatus = ?,
        store_id = ?, customer = ?, total = ?, is_synced = ?, token_no = ?, invoice_printed = ?, unique_id = ?,
        business_date = ?, ordered_at = ?, opened = ?, downloaded = ?, cashier = ?, user = ?, waiter = ?,
        delivery_agent = ?, refund_details = ?, refunded_items = ?, zatca_qrcode = ?
      WHERE id = ?
    `;

    const params = [
      JSON.stringify(order?.table) ?? null,
      order?.online ? 1 : 0,
      order?.phone ? 1 : 0,
      order?.completed ? 1 : 0,
      order?.rejected ? 1 : 0,
      order?.refunded ? 1 : 0,
      JSON.stringify(order?.cartState) ?? null,
      order?.token ?? null,
      order?.orderStatus ?? null,
      order?.ptid ?? null,
      order?.invoice_num ?? null,
      JSON.stringify(order?.charge_details) ?? null,
      JSON.stringify(order?.split_payment_details) ?? null,
      order?.shift_id ?? null,
      order?.token_counter ?? null,
      order?.notes ?? null,
      order?.time ?? null,
      order?.jaka_pos_version ?? null,
      JSON.stringify(order?.pos_device) ?? null,
      order?.order_type ?? null,
      order?.order_source ?? null,
      order?.order_destination ?? null,
      order?.paymentMethod ?? null,
      order?.payment_method_id ?? null,
      order?.paymentStatus ?? null,
      order?.store_id ?? null,
      JSON.stringify(order?.customer) ?? null,
      order?.total ?? null,
      order?.is_synced ? 1 : 0,
      order?.token_no ?? null,
      order?.invoice_printed ? 1 : 0,
      order?.unique_id ?? null,
      order?.business_date ?? null,
      order?.ordered_at ?? null,
      order?.opened ?? null,
      order?.downloaded ?? null,
      JSON.stringify(order?.cashier) ?? null,
      JSON.stringify(order?.user) ?? null,
      JSON.stringify(order?.waiter) ?? null,
      JSON.stringify(order?.delivery_agent) ?? null,
      JSON.stringify(order?.refund_details) ?? null,
      JSON.stringify(order?.refunded_items) ?? null,
      order?.zatca_qrcode ?? null,
      order?.id ?? null,
    ];

    await db.execute(query, params);
    return { success: true, result: order };
  } catch (error) {
    console.error("updateOrder error:", error);
    throw error;
  }
}

// Function to get a single order
export async function getSingleOrder(payload, by_unique_id = false) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  try {
    const query = by_unique_id
      ? "SELECT * FROM orders WHERE unique_id = ?"
      : "SELECT * FROM orders WHERE ptid = ?";
    const result = await db.select(query, [payload]);

    if (result.length === 0) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, result: result[0] };
  } catch (error) {
    console.error("getSingleOrder error:", error);
    throw error;
  }
}

// Function to delete an order by ID
export async function deleteOrder(id) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  try {
    await db.execute("DELETE FROM orders WHERE id = ?", [id]);
    return { success: true };
  } catch (error) {
    console.error("deleteOrder error:", error);
    throw error;
  }
}

export async function getOrdersList(criteria = {}, qty = 50) {
  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  try {
    let query = "SELECT * FROM orders";
    const conditions = [];
    const params = [];

    // Filter by order type (trimmed)
    if (criteria.order_type && criteria.order_type.trim() !== "") {
      conditions.push("order_type = ?");
      params.push(criteria.order_type.trim());
    }

    // Filter by order destination (if provided)
    if (
      criteria.order_destination &&
      criteria.order_destination.trim() !== ""
    ) {
      conditions.push("order_destination = ?");
      params.push(criteria.order_destination.trim());
    }

    // Filter by customer phone number via JSON extraction
    if (criteria.customerPhone && criteria.customerPhone.trim() !== "") {
      conditions.push("JSON_EXTRACT(customer, '$.phone') = ?");
      params.push(criteria.customerPhone.trim());
    }

    // Filter by payment method
    if (criteria.paymentMethod && criteria.paymentMethod.trim() !== "") {
      conditions.push("paymentMethod = ?");
      params.push(criteria.paymentMethod.trim());
    }

    // Filter by order source
    if (criteria.order_source && criteria.order_source.trim() !== "") {
      conditions.push("order_source = ?");
      params.push(criteria.order_source.trim());
    }

    // Filter by synced status if defined
    if (
      typeof criteria.is_synced !== "undefined" &&
      criteria.is_synced !== null
    ) {
      conditions.push("is_synced = ?");
      params.push(criteria.is_synced ? 1 : 0);
    }

    // Filter by refunded status if defined
    if (
      typeof criteria.refunded !== "undefined" &&
      criteria.refunded !== null
    ) {
      conditions.push("refunded = ?");
      params.push(criteria.refunded ? 1 : 0);
    }

    // Filter by shift_id if provided
    if (
      typeof criteria.shift_id !== "undefined" &&
      criteria.shift_id !== null
    ) {
      conditions.push("shift_id = ?");
      params.push(criteria.shift_id);
    }

    // Filter by normal order or phone/online orders if provided.
    if (criteria.normalOrder === true) {
      conditions.push(
        "((phone = 1 AND completed = 1) OR (online = 1 AND completed = 1) OR (phone = 0 AND online = 0))"
      );
    } else if (criteria.phone_online_incompleted) {
      conditions.push(
        "(((phone = 1 AND completed = 0) OR (online = 1 AND opened = 0)) AND rejected = 0)"
      );
    } else {
      if (typeof criteria.online !== "undefined" && criteria.online !== null) {
        conditions.push("online = ?");
        params.push(criteria.online ? 1 : 0);
      }
      if (typeof criteria.phone !== "undefined" && criteria.phone !== null) {
        conditions.push("phone = ?");
        params.push(criteria.phone ? 1 : 0);
      }
      if (
        typeof criteria.completed !== "undefined" &&
        criteria.completed !== null
      ) {
        conditions.push("completed = ?");
        params.push(criteria.completed ? 1 : 0);
      }
      if (typeof criteria.opened !== "undefined" && criteria.opened !== null) {
        conditions.push("opened = ?");
        params.push(criteria.opened ? 1 : 0);
      }
      if (
        typeof criteria.downloaded !== "undefined" &&
        criteria.downloaded !== null
      ) {
        conditions.push("downloaded = ?");
        params.push(criteria.downloaded ? 1 : 0);
      }
    }

    // Search term filtering for invoice number, unique id or ptid
    if (criteria.searchTerm && criteria.searchTerm.trim() !== "") {
      const term = criteria.searchTerm.trim() + "%";
      conditions.push(
        "(invoice_num LIKE ? OR CAST(unique_id AS TEXT) LIKE ? OR ptid LIKE ?)"
      );
      params.push(term, term, term);
    }

    // Date range filtering for the time field
    if (criteria.startDate && criteria.endDate) {
      conditions.push("time BETWEEN ? AND ?");
      params.push(criteria.startDate, criteria.endDate);
    } else if (criteria.startDate) {
      conditions.push("time >= ?");
      params.push(criteria.startDate);
    } else if (criteria.endDate) {
      conditions.push("time <= ?");
      params.push(criteria.endDate);
    }

    // Append conditions if any exist
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Order by time descending and limit the number of results
    query += " ORDER BY time DESC LIMIT ?";
    params.push(qty);

    // Execute the query using the provided database handler
    const rows = await db.select(query, params);
    console.log("rows: ", rows, "query: ", query, "params: ", params);

    // Transform specific JSON string fields into objects and remove null values.
    const results = rows.map((order) => {
      order.table = order.table_no ? JSON.parse(order.table_no) : null;
      order.cartState = order.cartState ? JSON.parse(order.cartState) : null;
      order.charge_details = order.charge_details
        ? JSON.parse(order.charge_details)
        : null;
      order.customer = order.customer ? JSON.parse(order.customer) : null;
      order.user = order.user ? JSON.parse(order.user) : null;
      order.waiter = order.waiter ? JSON.parse(order.waiter) : null;
      order.cashier = order.cashier ? JSON.parse(order.cashier) : null;
      order.pos_device = order.pos_device ? JSON.parse(order.pos_device) : null;
      order.delivery_agent = order.delivery_agent
        ? JSON.parse(order.delivery_agent)
        : null;
      order.refunded_items = order.refunded_items
        ? JSON.parse(order.refunded_items)
        : null;
      order.refund_details = order.refund_details
        ? JSON.parse(order.refund_details)
        : null;

      // Remove properties with null values to clean up the object
      Object.keys(order).forEach((key) => {
        if (order[key] === null) {
          delete order[key];
        }
      });
      return order;
    });

    return { success: true, result: results };
  } catch (error) {
    console.error("getOrdersList error:", error);
    throw error;
  }
}
