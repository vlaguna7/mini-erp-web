import pool from '../db';

export class ProductService {
  static async createProduct(
    userId: number,
    name: string,
    code: string,
    category: string,
    quantityStock: number,
    priceCost: number,
    priceSale: number,
    supplierId?: number,
    minStock?: number
  ) {
    try {
      const result = await pool.query(
        `INSERT INTO products 
        (user_id, name, code, category, quantity_stock, price_cost, price_sale, supplier_id, min_stock) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
        [userId, name, code, category, quantityStock, priceCost, priceSale, supplierId || null, minStock || null]
      );

      return result.rows[0];
    } catch (error: any) {
      // ✅ Corrigido: bloco catch correto
      if (error.code === '23505') {
        throw new Error('Product code already exists for this user');
      }
      throw error;
    }
  }

  static async getProductsByUser(userId: number, limit: number = 100, offset: number = 0) {
    try {
      const result = await pool.query(
        `SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM products WHERE user_id = $1`,
        [userId]
      );

      return {
        products: result.rows,
        total: parseInt(countResult.rows[0].count),
      };
    } catch (error) {
      throw error;
    }
  }

  static async getProductById(userId: number, productId: number) {
    try {
      const result = await pool.query(
        `SELECT * FROM products WHERE id = $1 AND user_id = $2`,
        [productId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateProduct(
    userId: number,
    productId: number,
    updates: {
      name?: string;
      code?: string;
      category?: string;
      quantityStock?: number;
      priceCost?: number;
      priceSale?: number;
      minStock?: number;
    }
  ) {
    try { // ✅ Corrigido: try estava faltando
      const product = await this.getProductById(userId, productId);

      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.code !== undefined) {
        fields.push(`code = $${paramCount++}`);
        values.push(updates.code);
      }
      if (updates.category !== undefined) {
        fields.push(`category = $${paramCount++}`);
        values.push(updates.category);
      }
      if (updates.quantityStock !== undefined) {
        fields.push(`quantity_stock = $${paramCount++}`);
        values.push(updates.quantityStock);
      }
      if (updates.priceCost !== undefined) {
        fields.push(`price_cost = $${paramCount++}`);
        values.push(updates.priceCost);
      }
      if (updates.priceSale !== undefined) {
        fields.push(`price_sale = $${paramCount++}`);
        values.push(updates.priceSale);
      }
      if (updates.minStock !== undefined) {
        fields.push(`min_stock = $${paramCount++}`);
        values.push(updates.minStock);
      }

      fields.push(`updated_at = $${paramCount++}`);
      values.push(new Date());

      values.push(productId, userId);

      const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`;

      const result = await pool.query(query, values);

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new Error('Product code already exists for this user');
      }
      throw error;
    }
  }

  static async deleteProduct(userId: number, productId: number) {
    try { // ✅ Corrigido: try estava faltando
      await this.getProductById(userId, productId);

      const result = await pool.query(
        `DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id`,
        [productId, userId]
      );

      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async getLowStockProducts(userId: number) {
    try {
      const result = await pool.query(
        `SELECT * FROM products 
        WHERE user_id = $1 AND min_stock IS NOT NULL AND quantity_stock <= min_stock
        ORDER BY quantity_stock ASC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}