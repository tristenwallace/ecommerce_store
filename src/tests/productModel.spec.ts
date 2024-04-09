import { Product, ProductModel } from '../models/product';
import { pool } from '../dbConfig/db';

const productModel = new ProductModel();

/**
 * Clears all product data from the database.
 * This helps ensure a clean state for each test run.
 */
const clearTestData = async () => {
  await pool.query('DELETE FROM products');
};

describe('Product Model', () => {
  let createdProduct: Product; // Holds the product created in beforeEach for use in tests

  beforeEach(async () => {
    await clearTestData(); // Ensure a clean state before each test

    // Create a new product to be used in subsequent tests
    createdProduct = await productModel.create(
      'Test Product',
      9.99,
      'Test Category',
    );
  });

  afterEach(async () => {
    await clearTestData(); // Clean up after each test to maintain isolation
  });

  // Tests the functionality of the create method
  describe('Create method', () => {
    it('should add a product', async () => {
      // Test product creation with specific attributes
      const result = await productModel.create(
        'Test Create Product',
        42.42,
        'Test Category',
      );

      // Verify the created product has the expected attributes
      expect(result).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number), // Expecting any number for ID
          name: 'Test Create Product',
          price: 42.42,
          category: 'Test Category',
        }),
      );
    });
  });

  // Tests the functionality of the index method
  describe('Index method', () => {
    it('should return a list of products', async () => {
      // Fetch all products
      const result = await productModel.index();
      // Expect the result to be an array (list of products)
      expect(result).toEqual(jasmine.any(Array));
    });
  });

  // Tests the functionality of the show method
  describe('Show method', () => {
    it('should return the correct product by id', async () => {
      expect(createdProduct).toBeDefined(); // Ensure a product was created successfully
      expect(createdProduct.id).toBeDefined(); // Ensure the created product has a defined ID

      // Fetch the product by its ID and verify it matches the created product
      const result = await productModel.show(createdProduct.id);
      expect(result).toEqual(
        jasmine.objectContaining({
          id: createdProduct.id,
        }),
      );
    });
  });

  // Tests the functionality of the update method
  describe('Update method', () => {
    it('should update the product', async () => {
      expect(createdProduct).toBeDefined(); // Ensure a product was created successfully
      expect(createdProduct.id).toBeDefined(); // Ensure the created product has a defined ID

      // Update the created product and verify the updated attributes
      const updatedProduct = await productModel.update(
        createdProduct.id,
        'Updated Product',
        42.42,
      );
      expect(updatedProduct).toEqual(
        jasmine.objectContaining({
          id: createdProduct.id, // The ID should remain the same
          name: 'Updated Product', // The name should be updated
        }),
      );
    });
  });

  // Tests the functionality of the delete method
  describe('Delete method', () => {
    it('should remove the product', async () => {
      expect(createdProduct).toBeDefined(); // Ensure a product was created successfully
      expect(createdProduct.id).toBeDefined(); // Ensure the created product has a defined ID

      // Delete the created product and verify it was removed
      const deletedProduct = await productModel.delete(createdProduct.id);
      expect(deletedProduct).toEqual(
        jasmine.objectContaining({
          id: createdProduct.id, // Verify the deleted product's ID
        }),
      );

      // Attempt to fetch the deleted product and confirm it no longer exists
      const result = await productModel.show(createdProduct.id);
      expect(result).toBeUndefined(); // Expect the result to be undefined for a non-existent product
    });
  });
});
