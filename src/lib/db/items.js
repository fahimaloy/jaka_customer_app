import Database from "@tauri-apps/plugin-sql";

function prepareItemForInsert(item) {
  const {
    id = null,
    item_code,
    search_name,
    name,
    arabic_name,
    description,
    arabic_description,
    available_all_locations = false,
    buying_price = null,
    selling_price = null,
    tax_percent = null,
    discount_amount = null,
    discount_percentage = null,
    is_produced = false,
    is_active = false,
    is_deleted = false,
    is_popular = false,
    is_veg = false,
    track_inventory = false,
    available_online = false,
    wac = null,
    image = null,
    created_at = null,
    updated_at = null,
    category = null,
    item_group = null,
    item_brand = null,
    kot_device = null,
    available_locations = [],
    order_categories = [],
    price = null,
    is_tax_inclusive = false,
    selectedTab = {},
    default_price = null,
    isSpecial = false,
    charge = null,
    popup_modifier_while_adding_item_to_cart = false,
    allow_selling_price_change = false,
    quantity = null,
    totalPrice = null,
    tax = null,
    special_prices = {},
    modifiers = [],
    barcode = null,
    units = [],
    slideshow = false,
    image_url = null,
    // is_favourite = false,
    // multibarcodes = [],
  } = item;

  return {
    id,
    item_code,
    search_name,
    name,
    arabic_name,
    description,
    arabic_description,
    available_all_locations: available_all_locations ? 1 : 0,
    buying_price,
    selling_price,
    tax_percent,
    discount_amount,
    discount_percentage,
    is_produced: is_produced ? 1 : 0,
    is_active: is_active ? 1 : 0,
    is_deleted: is_deleted ? 1 : 0,
    is_popular: is_popular ? 1 : 0,
    is_veg: is_veg ? 1 : 0,
    track_inventory: track_inventory ? 1 : 0,
    available_online: available_online ? 1 : 0,
    wac,
    image,
    created_at,
    updated_at,
    category,
    item_group,
    item_brand,
    kot_device,
    available_locations: JSON.stringify(available_locations),
    order_categories: JSON.stringify(order_categories),
    price,
    is_tax_inclusive: is_tax_inclusive ? 1 : 0,
    selectedTab: JSON.stringify(selectedTab),
    default_price,
    isSpecial: isSpecial ? 1 : 0,
    charge,
    popup_modifier_while_adding_item_to_cart:
      popup_modifier_while_adding_item_to_cart ? 1 : 0,
    allow_selling_price_change: allow_selling_price_change ? 1 : 0,
    quantity,
    totalPrice,
    tax,
    special_prices: JSON.stringify(special_prices),
    modifiers: JSON.stringify(modifiers),
    barcode,
    units: JSON.stringify(units),
    slideshow: slideshow ? 1 : 0,
    image_url,
    // is_favourite: is_favourite ? 1 : 0,
    // multibarcodes, // left as-is (an array of objects with a "barcode" property)
  };
}

function parseRow(row) {
  return {
    ...row,
    available_locations: JSON.parse(row.available_locations || "[]"),
    order_categories: JSON.parse(row.order_categories || "[]"),
    selectedTab: JSON.parse(row.selectedTab || "{}"),
    special_prices: JSON.parse(row.special_prices || "{}"),
    modifiers: JSON.parse(row.modifiers || "[]"),
    units: JSON.parse(row.units || "[]"),
    available_all_locations: Boolean(row.available_all_locations),
    is_produced: Boolean(row.is_produced),
    is_active: Boolean(row.is_active),
    is_deleted: Boolean(row.is_deleted),
    is_popular: Boolean(row.is_popular),
    is_veg: Boolean(row.is_veg),
    track_inventory: Boolean(row.track_inventory),
    available_online: Boolean(row.available_online),
    is_tax_inclusive: Boolean(row.is_tax_inclusive),
    isSpecial: Boolean(row.isSpecial),
    is_favourite: Boolean(row.is_favourite),
    popup_modifier_while_adding_item_to_cart: Boolean(
      row.popup_modifier_while_adding_item_to_cart
    ),
    allow_selling_price_change: Boolean(row.allow_selling_price_change),
    units: JSON.parse(row.units || "[]"),
    slideshow: Boolean(row.slideshow),
  };
}

export async function getSingleItem(criteria) {
  try {
    const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
    let query = "SELECT * FROM items WHERE ";
    const params = [];
    if (criteria.id) {
      query += "id = ?";
      params.push(criteria.id);
    } else if (criteria.item_code) {
      query += "item_code = ?";
      params.push(criteria.item_code);
    } else if (criteria.barcode) {
      query += "barcode = ?";
      params.push(criteria.barcode);
    } else {
      throw new Error(
        "No valid search criteria provided. Provide id, item_code or barcode."
      );
    }

    const result = await db.select(query, params);
    if (result.length === 0) {
      return { success: false, error: "Item not found" };
    }
    const row = result[0];
    const parsedRow = {
      ...parseRow(row),
      // multibarcodes will be added below.
    };

    // Query for all barcodes associated with this item.
    const barcodeRows = await db.select(
      "SELECT barcode FROM barcodes WHERE item_id = ?",
      [parsedRow.id]
    );
    parsedRow.multibarcodes = barcodeRows.map((r) => ({ barcode: r.barcode }));
    return { success: true, result: parsedRow };
  } catch (error) {
    console.error("getSingleItem error:", error);
    return { success: false, error };
  }
}

export async function getItemCountByCategory(payload) {
  try {
    const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
    let query = "SELECT COUNT(*) AS count FROM items";
    let params = [];
    if (payload?.selectedCategory && payload.selectedCategory !== 0) {
      query += " WHERE category = ?";
      params.push(payload.selectedCategory);
    }
    const result = await db.select(query, params);
    return result[0]?.count || 0;
  } catch (error) {
    console.error("getItemCountByCategory error:", error);
    throw error;
  }
}

export async function saveBulkItems(items, deleteAll = false) {
  // Ensure items is an array
  if (!Array.isArray(items)) {
    throw new Error("saveBulkItems expects 'items' to be an array", items);
  }

  const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
  try {
    await db.execute("BEGIN TRANSACTION");

    if (deleteAll) {
      await db.execute("DELETE FROM items");
      console.log("Deleted all items before bulk insert.");
    }

    // Build a list of value placeholders and a flat parameters array.
    let params = [];
    let valuePlaceholders = [];
    let baseIndex = 1;

    for (let i = 0; i < items.length; i++) {
      // Using a classic for loop
      const item = items[i];
      const prepared = prepareItemForInsert(item);
      // const prepared =
      const itemValues = Object.values(prepared);
      // Create a list of placeholders for this row ($1, $2, ..., etc.)
      const placeholders = itemValues.map((_, idx) => `$${baseIndex + idx}`);
      baseIndex += itemValues.length;
      valuePlaceholders.push(`(${placeholders.join(", ")})`);
      params = params.concat(itemValues);
    }

    const query = `
      INSERT INTO items (
        id, item_code, search_name, name, arabic_name, description, arabic_description,
        available_all_locations, buying_price, selling_price, tax_percent, discount_amount, discount_percentage,
        is_produced, is_active, is_deleted, is_popular, is_veg, track_inventory, available_online,
        wac, image, created_at, updated_at, category, item_group, item_brand, kot_device,
        available_locations, order_categories, price, is_tax_inclusive, selectedTab,
        default_price, isSpecial, charge, popup_modifier_while_adding_item_to_cart, allow_selling_price_change,
        quantity, totalPrice, tax, special_prices, modifiers, barcode, units, slideshow, image_url
      ) VALUES
      ${valuePlaceholders.join(",\n")}
    `;

    await db.execute(query, params);
    await db.execute("COMMIT");

    return { success: true, count: items.length, result: items };
  } catch (error) {
    await db.execute("ROLLBACK");
    console.error("saveBulkItems error:", error);
    return { success: false, error: error };
  }
}

export async function saveItem(item) {
  try {
    const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
    const prepared = prepareItemForInsert(item);
    // Prepare the INSERT into items (excluding multibarcodes)
    const query = `
      INSERT INTO items (
        id, item_code, search_name, name, arabic_name, description, arabic_description,
        available_all_locations, buying_price, selling_price, tax_percent, discount_amount, discount_percentage,
        is_produced, is_active, is_deleted, is_popular, is_veg, track_inventory, available_online,
        wac, image, created_at, updated_at, category, item_group, item_brand, kot_device,
        available_locations, order_categories, price, is_tax_inclusive, selectedTab,
        default_price, isSpecial, charge, popup_modifier_while_adding_item_to_cart, allow_selling_price_change,
        quantity, totalPrice, tax, special_prices, modifiers, barcode, units
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45
      )
    `;
    // Get all values except the last field (multibarcodes)
    const params = Object.values(prepared).slice(0, -1);
    await db.execute(query, params);
    // Get auto-generated ID if not provided:
    const itemId =
      prepared.id ||
      (await db.select("SELECT last_insert_rowid() as id"))[0].id;
    console.log(`saveItem: Item saved with ID: ${itemId}`);

    // Process multibarcode entries if provided
    if (
      prepared.multibarcodes &&
      Array.isArray(prepared.multibarcodes) &&
      prepared.multibarcodes.length > 0
    ) {
      await Promise.all(
        prepared.multibarcodes.map((codeObj) => {
          const code = codeObj?.barcode;
          return db.execute(
            "INSERT INTO barcodes (item_id, barcode) VALUES (?, ?)",
            [itemId, code]
          );
        })
      );
      console.log(
        `saveItem: All multibarcode entries processed for item ID: ${itemId}`
      );
    } else {
      console.log("saveItem: No multibarcode entries to process.");
    }
    return { success: true, result: item, sqliteID: itemId };
  } catch (error) {
    console.error("saveItem error:", error);
    return { success: false, error };
  }
}

export async function getItemsByQuery(queryObj, offset = 0) {
  try {
    const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
    let query = "SELECT * FROM items WHERE 1=1";
    const params = [];
    if (queryObj.text) {
      query +=
        " AND (item_code = ? OR search_name = ? OR item_code LIKE ? OR search_name LIKE ?)";
      params.push(
        queryObj.text,
        queryObj.text,
        `${queryObj.text}%`,
        `${queryObj.text}%`
      );
    }
    if (queryObj.selectedCategory && queryObj.selectedCategory != 0) {
      query += " AND category = ?";
      params.push(queryObj.selectedCategory);
    }
    query += " LIMIT ? OFFSET ?";
    params.push(queryObj.quantity, offset);
    const rows = await db.select(query, params);
    const parsedRows = rows.map((row) => ({
      ...parseRow(row),
      // multibarcodes will be added below
    }));
    // For each item, attach its multibarcode entries.
    await Promise.all(
      parsedRows.map(async (item) => {
        const barcodeRows = await db.select(
          "SELECT barcode FROM barcodes WHERE item_id = ?",
          [item.id]
        );
        item.multibarcodes = barcodeRows.map((r) => ({ barcode: r.barcode }));
      })
    );
    return { success: true, result: parsedRows, count: rows.length };
  } catch (error) {
    console.error("getItemsByQuery error:", error);
    return { success: false, error };
  }
}

export async function updateItem(item) {
  try {
    const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
    const prepared = prepareItemForInsert(item);
    const query = `
      UPDATE items SET
        item_code = ?,
        search_name = ?,
        name = ?,
        arabic_name = ?,
        description = ?,
        arabic_description = ?,
        available_all_locations = ?,
        buying_price = ?,
        selling_price = ?,
        tax_percent = ?,
        discount_amount = ?,
        discount_percentage = ?,
        is_produced = ?,
        is_active = ?,
        is_deleted = ?,
        is_popular = ?,
        is_veg = ?,
        track_inventory = ?,
        available_online = ?,
        wac = ?,
        image = ?,
        created_at = ?,
        updated_at = ?,
        category = ?,
        item_group = ?,
        item_brand = ?,
        kot_device = ?,
        available_locations = ?,
        order_categories = ?,
        price = ?,
        is_tax_inclusive = ?,
        selectedTab = ?,
        default_price = ?,
        isSpecial = ?,
        charge = ?,
        popup_modifier_while_adding_item_to_cart = ?,
        allow_selling_price_change = ?,
        quantity = ?,
        totalPrice = ?,
        tax = ?,
        special_prices = ?,
        modifiers = ?,
        barcode = ?,
        units = ?
      WHERE id = ?
    `;
    // Build parameter array in the same order as the columns above.
    const params = [
      prepared.item_code, // 1
      prepared.search_name, // 2
      prepared.name, // 3
      prepared.arabic_name, // 4
      prepared.description, // 5
      prepared.arabic_description, // 6
      prepared.available_all_locations, // 7
      prepared.buying_price, // 8
      prepared.selling_price, // 9
      prepared.tax_percent, // 10
      prepared.discount_amount, // 11
      prepared.discount_percentage, // 12
      prepared.is_produced, // 13
      prepared.is_active, // 14
      prepared.is_deleted, // 15
      prepared.is_popular, // 16
      prepared.is_veg, // 17
      prepared.track_inventory, // 18
      prepared.available_online, // 19
      prepared.wac, // 20
      prepared.image, // 21
      prepared.created_at, // 22
      prepared.updated_at, // 23
      prepared.category, // 24
      prepared.item_group, // 25
      prepared.item_brand, // 26
      prepared.kot_device, // 27
      prepared.available_locations, // 28
      prepared.order_categories, // 29
      prepared.price, // 30
      prepared.is_tax_inclusive, // 31
      prepared.selectedTab, // 32
      prepared.default_price, // 33
      prepared.isSpecial, // 34
      prepared.charge, // 35
      prepared.popup_modifier_while_adding_item_to_cart, // 36
      prepared.allow_selling_price_change, // 37
      prepared.quantity, // 38
      prepared.totalPrice, // 39
      prepared.tax, // 40
      prepared.special_prices, // 41
      prepared.modifiers, // 42
      prepared.barcode, // 43
      prepared.units, // 44
      item.id, // 45 – WHERE clause
    ];
    await db.execute(query, params);
    console.log(`updateItem: Updated item with id ${prepared.id}`);

    // Now update the multibarcode entries.
    if (prepared.multibarcodes && Array.isArray(prepared.multibarcodes)) {
      await db.execute("DELETE FROM barcodes WHERE item_id = ?", [prepared.id]);
      console.log(
        `updateItem: Deleted existing multibarcode entries for item ${prepared.id}`
      );
      if (prepared.multibarcodes.length > 0) {
        await Promise.all(
          prepared.multibarcodes.map((codeObj) => {
            const code = codeObj.barcode;
            return db.execute(
              "INSERT INTO barcodes (item_id, barcode) VALUES (?, ?)",
              [prepared.id, code]
            );
          })
        );
        console.log(
          `updateItem: Inserted new multibarcode entries for item ${prepared.id}`
        );
      }
    } else {
      console.log("updateItem: No multibarcode field provided for update.");
    }
    return { success: true, result: item };
  } catch (error) {
    console.error("updateItem error:", error);
    return { success: false, error };
  }
}

/**
 * Deletes an item by its ID.
 */
export async function deleteItem(id) {
  try {
    const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
    const result = await db.execute("DELETE FROM items WHERE id = ?", [id]);
    return { success: true, result };
  } catch (error) {
    console.error("deleteItem error:", error);
    return { success: false, error };
  }
}

export async function searchMultibarcode(barcode) {
  try {
    const db = await Database.load("sqlite:jaka_kiosk_sql_db.db");
    const sql = `
      SELECT items.*
      FROM items
      INNER JOIN barcodes ON items.id = barcodes.item_id
      WHERE barcodes.barcode = ?
      LIMIT 1;
    `;
    const result = await db.select(sql, [barcode]);
    if (result.length === 0) {
      console.log(`[SEARCH] No item found for barcode ${barcode}`);
      return null;
    }
    const parsedItem = parseRow(result[0]);
    const barcodeRows = await db.select(
      "SELECT barcode FROM barcodes WHERE item_id = ?",
      [parsedItem.id]
    );
    parsedItem.multibarcodes = barcodeRows.map((r) => ({ barcode: r.barcode }));
    console.log(`[SEARCH] Item found for barcode ${barcode}:`, parsedItem);
    return parsedItem;
  } catch (error) {
    console.error(`[SEARCH] Error searching for barcode ${barcode}:`, error);
    throw error;
  }
}
