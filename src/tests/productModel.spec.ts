import { Product, ProductModel } from '../models/product';
import { pool } from '../dbConfig/db';

const productModel = new ProductModel();

/**
 * Function to clear all product data from the database.
 * This ensures that each test starts with a clean database state.
 */
export const clearProductTestData = async () => {
  await pool.query('DELETE FROM products');
};

/**
 * Helper function to create a product for testing purposes.
 * @returns A Promise that resolves to the created Product object.
 */
export const createProductForTest = async (): Promise<Product> => {
  return productModel.create('Test Product', 9.99, 'Test Category');
};

describe('Product Model', () => {
  let createdProduct: Product; // Variable to store the product created in beforeEach for use in tests

  beforeEach(async () => {
    await clearProductTestData(); // Clear product data before each test
    createdProduct = await createProductForTest(); // Create a new product for use in subsequent tests
  });

  afterEach(async () => {
    await clearProductTestData(); // Clean up product data after each test
  });

  // Test suite for the 'create' method of the ProductModel
  describe('Create method', () => {
    it('should add a product', async () => {
      const result = await productModel.create(
        'Test Create Product',
        42.42,
        'Test Category',
      );

      // Verify that the product has the expected attributes
      expect(result).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number),
          name: 'Test Create Product',
          price: 42.42,
          category: 'Test Category',
        }),
      );
    });
  });

  // Test suite for the 'index' method of the ProductModel
  describe('Index method', () => {
    it('should return a list of products', async () => {
      const result = await productModel.index();

      // Verify that the result is an array of products
      expect(result).toEqual(jasmine.any(Array));
    });
  });

  // Test suite for the 'show' method of the ProductModel
  describe('Show method', () => {
    it('should return the correct product by id', async () => {
      const result = await productModel.show(createdProduct.id);

      // Verify that the returned product matches the created product
      expect(result).toEqual(
        jasmine.objectContaining({ id: createdProduct.id }),
      );
    });
  });

  // Test suite for the 'update' method of the ProductModel
  describe('Update method', () => {
    it('should update the product', async () => {
      const updatedProduct = await productModel.update(
        createdProduct.id,
        'Updated Product',
        42.42,
      );

      // Verify that the product was updated with the new values
      expect(updatedProduct).toEqual(
        jasmine.objectContaining({
          id: createdProduct.id,
          name: 'Updated Product',
        }),
      );
    });
  });

  // Test suite for the 'delete' method of the ProductModel
  describe('Delete method', () => {
    it('should remove the product', async () => {
      const deletedProduct = await productModel.delete(createdProduct.id);

      // Verify that the product was deleted
      expect(deletedProduct).toEqual(
        jasmine.objectContaining({ id: createdProduct.id }),
      );

      // Verify that the product no longer exists in the database
      const result = await productModel.show(createdProduct.id);
      expect(result).toBeUndefined();
    });
  });
});
