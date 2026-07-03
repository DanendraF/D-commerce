import { Product, ProductVariant } from './types';

const ODOO_URL = process.env.ODOO_URL || '';
const ODOO_DB = process.env.ODOO_DB || '';
const ODOO_USERNAME = process.env.ODOO_USERNAME || '';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '';

let cachedUid: number | null = null;

/**
 * Helper to generate random string for JSON-RPC ID
 */
const generateId = () => Math.floor(Math.random() * 1000000);

/**
 * Authenticate with Odoo to get User ID (UID)
 */
export async function authenticate(): Promise<number> {
  if (cachedUid) return cachedUid;

  const response = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'authenticate',
        args: [ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}],
      },
      id: generateId(),
    }),
    next: { revalidate: 3600 }, // Cache authentication for 1 hour if possible
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Odoo Authentication Error: ${data.error.data?.message || data.error.message}`);
  }

  if (!data.result) {
    throw new Error('Odoo Authentication failed: Invalid credentials');
  }

  cachedUid = data.result;
  return data.result;
}

/**
 * Generic function to call Odoo Models via execute_kw
 */
export async function odooCall(model: string, method: string, args: any[], kwargs: any = {}) {
  const uid = await authenticate();

  const response = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [ODOO_DB, uid, ODOO_API_KEY, model, method, args, kwargs],
      },
      id: generateId(),
    }),
    cache: 'no-store', // Disable cache for real-time data by default
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Odoo RPC Error: ${data.error.data?.message || data.error.message}`);
  }

  return data.result;
}

/**
 * Helper to convert a string to a URL-friendly slug
 */
const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Fallback images mapped by category
 */
const FALLBACK_IMAGES: Record<string, string[]> = {
  tops: ['https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg', 'https://images.pexels.com/photos/4544158/pexels-photo-4544158.jpeg', 'https://images.pexels.com/photos/1457986/pexels-photo-1457986.jpeg'],
  bottoms: ['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg'],
  outerwear: ['https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg', 'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg'],
  dresses: ['https://images.pexels.com/photos/2681252/pexels-photo-2681252.jpeg', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg'],
  accessories: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
  bags: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 'https://images.pexels.com/photos/1457986/pexels-photo-1457986.jpeg'],
  default: ['https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg']
};

/**
 * Fetch all published products from Odoo
 */
export async function getProducts(): Promise<Product[]> {
  // Domain: Only fetch products that can be sold and have a valid price (to filter out bad imports)
  const domain = [
    ['sale_ok', '=', true],
    ['list_price', '>', 0]
  ];
  
  // Define the fields we want to retrieve
  const fields = [
    'name', 
    'list_price', 
    'description_sale', 
    'categ_id', 
    'image_1920', 
    'product_variant_ids', 
    'attribute_line_ids',
    'product_tag_ids',
    'create_date'
  ];

  const records = await odooCall('product.template', 'search_read', [domain], { fields, limit: 100 });

  return records.map((record: any) => {
    // Parse Categories (Odoo returns [id, "Category Name"], e.g., "All / Tops" or "Tops")
    let categoryName = 'uncategorized';
    if (record.categ_id && record.categ_id[1]) {
      const parts = record.categ_id[1].split('/');
      categoryName = parts[parts.length - 1].trim().toLowerCase();
    }
    
    // Generate a placeholder image if not uploaded yet
    const imageArray = FALLBACK_IMAGES[categoryName] || FALLBACK_IMAGES.default;
    const fallbackImage = imageArray[record.id % imageArray.length]; // Stable random based on ID

    const imageUrl = record.image_1920 
      ? `data:image/jpeg;base64,${record.image_1920}` 
      : fallbackImage;
    
    // Convert Odoo tags (array of IDs) to dummy season strings for now 
    // (Ideally, we'd fetch the tags table, but keeping it simple for the generic interface)
    const seasons = ['Autumn', 'Winter']; // Hardcoded fallback or map if needed

    return {
      id: record.id.toString(),
      sku: `SKU-${record.id}`,
      name: record.name,
      slug: generateSlug(record.name),
      description: (typeof record.description_sale === 'string' && record.description_sale) ? record.description_sale : `${record.name} premium quality product.`,
      shortDescription: (typeof record.description_sale === 'string' && record.description_sale) ? record.description_sale.substring(0, 50) : `${record.name} premium quality`,
      price: record.list_price,
      images: [
        {
          id: `img-${record.id}`,
          url: imageUrl,
          alt: record.name,
          isPrimary: true,
          position: 0
        }
      ],
      categories: [categoryName],
      categoryIds: [record.categ_id ? record.categ_id[0].toString() : ''],
      variants: [], // To be populated fully in detail view
      options: [],
      tags: seasons, 
      isFeatured: false,
      isNew: true,
      inStock: true,
      stockQuantity: 10, // Hybrid stock: Fetch real stock later if custom field exists
      rating: 5.0,
      reviewCount: 0,
      brand: "D'commerce",
      createdAt: record.create_date || new Date().toISOString(),
      updatedAt: record.create_date || new Date().toISOString(),
      _odoo_variant_ids: record.product_variant_ids || [], // Hidden field to fetch variants later
      _odoo_attribute_line_ids: record.attribute_line_ids || [] // Hidden field to fetch attributes
    } as Product & { _odoo_variant_ids?: number[], _odoo_attribute_line_ids?: number[] };
  });
}

/**
 * Fetch a single product by slug and retrieve its variants
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const allProducts = await getProducts();
  const product = allProducts.find(p => p.slug === slug);
  
  if (!product) return null;
  
  const odooVariantIds = (product as any)._odoo_variant_ids || [];
  const odooAttributeLineIds = (product as any)._odoo_attribute_line_ids || [];
  
  // 1. Fetch real product options/attributes from Odoo
  const valueMap: Record<number, any> = {};
  if (odooAttributeLineIds.length > 0) {
    try {
      const attLines = await odooCall('product.template.attribute.line', 'search_read', [[['id', 'in', odooAttributeLineIds]]], { fields: ['attribute_id', 'product_template_value_ids'] });
      
      const valIds = attLines.flatMap((l: any) => l.product_template_value_ids || []);
      
      let vals: any[] = [];
      if (valIds.length > 0) {
        vals = await odooCall('product.template.attribute.value', 'search_read', [[['id', 'in', valIds]]], { fields: ['name', 'attribute_id'] });
        vals.forEach(v => { valueMap[v.id] = v; });
      }
      
      product.options = attLines.map((line: any, i: number) => {
        const attributeName = line.attribute_id[1];
        const lineValIds = line.product_template_value_ids || [];
        return {
          id: `opt-${line.id}`,
          name: attributeName,
          displayName: attributeName,
          position: i,
          values: lineValIds.map((vid: number, j: number) => ({
            id: `val-${vid}`,
            name: valueMap[vid]?.name || `Value ${vid}`,
            label: valueMap[vid]?.name || `Value ${vid}`,
            position: j
          }))
        };
      });
    } catch (err) {
      console.error("Failed to fetch attributes from Odoo", err);
    }
  }

  // 2. Fetch extra images from Odoo attachments (paperclip / log note)
  try {
    const attachments = await odooCall('ir.attachment', 'search_read', [[
      ['res_model', '=', 'product.template'],
      ['res_id', '=', parseInt(product.id)],
      ['mimetype', 'ilike', 'image/']
    ]], { fields: ['id', 'name', 'raw'] });
    
    if (attachments && attachments.length > 0) {
      const extraImages = attachments
        .filter((att: any) => att.raw)
        .map((att: any, idx: number) => ({
          id: `extra-img-${att.id}`,
          url: `data:${att.mimetype || 'image/jpeg'};base64,${att.raw}`,
          alt: att.name || `${product.name} View ${idx + 2}`,
          isPrimary: false,
          position: idx + 1
        }));
      product.images = [...product.images, ...extraImages];
    }
  } catch (err) {
    console.error("Failed to fetch attachments from Odoo", err);
  }
  
  // 3. Fetch variant details and map to their real attributes
  if (odooVariantIds.length > 0) {
    try {
      const variantFields = ['id', 'lst_price', 'qty_available', 'product_template_attribute_value_ids'];
      const variantRecords = await odooCall('product.product', 'search_read', [[['id', 'in', odooVariantIds]]], { fields: variantFields });
      
      const mappedVariants: ProductVariant[] = variantRecords.map((vr: any, idx: number) => {
        const variantOptions: Record<string, string> = {};
        const variantValIds = vr.product_template_attribute_value_ids || [];
        
        const nameParts: string[] = [];
        variantValIds.forEach((vid: number) => {
          const vData = valueMap[vid];
          if (vData) {
            variantOptions[vData.attribute_id[1]] = vData.name;
            nameParts.push(vData.name);
          }
        });

        return {
          id: `var-${vr.id}`,
          productId: product.id,
          sku: `SKU-${product.id}-V${vr.id}`,
          name: nameParts.length > 0 ? nameParts.join(' / ') : `Variant ${idx + 1}`,
          options: variantOptions, 
          price: vr.lst_price,
          stockQuantity: vr.qty_available || 10,
          inStock: (vr.qty_available || 10) > 0,
        };
      });
      
      product.variants = mappedVariants;

    } catch (err) {
      console.error("Failed to fetch variants from Odoo", err);
    }
  }

  return product;
}

/**
 * Create a Sales Order in Odoo
 */
export async function createSalesOrder(cartItems: any[], user: any, address: any) {
  // 1. Get or create a default generic partner to satisfy Odoo's required partner_id field
  let partnerId = 1;
  try {
    const partners = await odooCall('res.partner', 'search_read', [[['name', '=', 'Website Customer']]], { limit: 1, fields: ['id'] });
    if (partners && partners.length > 0) {
      partnerId = partners[0].id;
    } else {
      partnerId = await odooCall('res.partner', 'create', [{ name: 'Website Customer' }]);
    }
  } catch (e) {
    console.error("Could not get/create default partner, using ID 1", e);
  }

  // 2. Prepare Order Lines
  const orderLines = cartItems.map(item => {
    // If we have a variantId (e.g., 'var-12'), use the numeric part. Else fallback to productId.
    let productId = parseInt(item.product.id);
    if (item.variant.id && item.variant.id.startsWith('var-')) {
      productId = parseInt(item.variant.id.replace('var-', ''));
    }

    return [0, 0, {
      product_id: productId,
      product_uom_qty: item.quantity,
      price_unit: item.variant.price,
    }];
  });

  // 3. Store actual customer details in the note field
  const customerDetails = `
Customer: ${user.firstName} ${user.lastName}
Email: ${user.email}
Phone: ${address.phone}

Shipping Address:
${address.firstName} ${address.lastName}
${address.addressLine1} ${address.addressLine2 || ''}
${address.city}, ${address.state} ${address.postalCode}
${address.country}
  `.trim();

  // 4. Create Sale Order
  const orderId = await odooCall('sale.order', 'create', [{
    partner_id: partnerId,
    order_line: orderLines,
    note: customerDetails,
    client_order_ref: `WEB-${Date.now()}`
  }]);

  // 5. Fetch the created order to get its number and total amount
  const orders = await odooCall('sale.order', 'search_read', [[['id', '=', orderId]]], { fields: ['name', 'amount_total'] });
  
  return {
    orderId,
    orderNumber: orders[0]?.name || `SO-${orderId}`,
    amount: orders[0]?.amount_total || 0,
  };
}

/**
 * Confirm a Sales Order in Odoo (marks it as Sale)
 */
export async function confirmSalesOrder(orderId: number) {
  try {
    await odooCall('sale.order', 'action_confirm', [[orderId]]);
    return true;
  } catch (error) {
    console.error('Failed to confirm sales order in Odoo:', error);
    return false;
  }
}

/**
 * Reduce stock for products in a confirmed sales order
 */
export async function reduceProductStock(orderId: number) {
  try {
    // 1. Fetch the order lines for this order
    const orderLines = await odooCall('sale.order.line', 'search_read', [[['order_id', '=', orderId]]], { fields: ['product_id', 'product_uom_qty'] });
    
    for (const line of orderLines) {
      const productId = line.product_id[0]; // [id, "Name"]
      const qtyToReduce = line.product_uom_qty;

      try {
        const product = await odooCall('product.product', 'search_read', [[['id', '=', productId]]], { fields: ['qty_available'], limit: 1 });
        if (product && product.length > 0) {
          const currentQty = product[0].qty_available || 0;
          // Direct stock modification (best-effort, might fail if strict Inventory module is active)
          await odooCall('product.product', 'write', [[productId], {
             qty_available: currentQty - qtyToReduce
          }]);
        }
      } catch (e) {
        console.error(`Failed to update stock for product ${productId}. This is normal if Inventory module is strictly configured.`, e);
      }
    }
  } catch (error) {
    console.error('Failed to reduce product stock in Odoo:', error);
  }
}
