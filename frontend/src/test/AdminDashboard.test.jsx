// AdminDashboard Component Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../components/AdminDashboard';

// Mock fetch
global.fetch = vi.fn();

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    // Reset mocks
    fetch.mockClear();
    localStorage.clear();
    
    // Setup admin authentication
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminToken', 'fake-admin-token');
    localStorage.setItem('adminUser', JSON.stringify({
      name: 'Admin User',
      email: 'admin@test.com'
    }));
  });

  describe('Authentication', () => {
    it('should redirect if not authenticated', () => {
      localStorage.clear();
      
      const { container } = render(<AdminDashboard />);
      
      // Component should trigger redirect
      expect(window.location.hash).toBe('#secret-admin-login');
    });

    it('should render when authenticated', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          products: []
        })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Product Display', () => {
    it('should display products when loaded', async () => {
      const mockProducts = [
        {
          _id: '1',
          name: 'Test Product 1',
          price: 999,
          stock: 10,
          category: 'Test',
          imageUrl: '/test1.jpg'
        },
        {
          _id: '2',
          name: 'Test Product 2',
          price: 1999,
          stock: 5,
          category: 'Test',
          imageUrl: '/test2.jpg'
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          products: mockProducts
        })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument();
        expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      });
    });

    it('should display loading state', () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<AdminDashboard />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Image Upload', () => {
    it('should validate file size', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: [] })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Product/i)).toBeInTheDocument();
      });

      // Click add product button
      const addButton = screen.getByText(/Add Product/i);
      fireEvent.click(addButton);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByText(/Upload from Device/i)).toBeInTheDocument();
      });

      // Create a large file (6MB)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });

      const fileInput = screen.getByLabelText(/Upload from Device/i, { exact: false });
      
      await userEvent.upload(fileInput, largeFile);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/5MB/i)).toBeInTheDocument();
      });
    });

    it('should validate file type', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: [] })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Product/i)).toBeInTheDocument();
      });

      const addButton = screen.getByText(/Add Product/i);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Upload from Device/i)).toBeInTheDocument();
      });

      // Create invalid file type
      const invalidFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const fileInput = screen.getByLabelText(/Upload from Device/i, { exact: false });
      
      await userEvent.upload(fileInput, invalidFile);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/JPG, PNG, GIF, WEBP/i)).toBeInTheDocument();
      });
    });

    it('should show image preview after selection', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: [] })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Product/i)).toBeInTheDocument();
      });

      const addButton = screen.getByText(/Add Product/i);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Upload from Device/i)).toBeInTheDocument();
      });

      // Create valid file
      const validFile = new File(['x'.repeat(1024)], 'test.jpg', {
        type: 'image/jpeg'
      });

      const fileInput = screen.getByLabelText(/Upload from Device/i, { exact: false });
      
      await userEvent.upload(fileInput, validFile);

      // Should show preview
      await waitFor(() => {
        const preview = screen.getByAlt(/Upload preview/i);
        expect(preview).toBeInTheDocument();
      });
    });
  });

  describe('Product CRUD Operations', () => {
    it('should delete product when delete button clicked', async () => {
      const mockProducts = [{
        _id: '1',
        name: 'Test Product',
        price: 999,
        stock: 10,
        category: 'Test',
        imageUrl: '/test.jpg'
      }];

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, products: mockProducts })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, msg: 'Deleted' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, products: [] })
        });

      // Mock window.confirm
      global.confirm = vi.fn(() => true);
      global.alert = vi.fn();

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });

      // Find and click delete button
      const deleteButton = screen.getByText(/🗑️/i);
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/products/1'),
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });

    it('should open edit modal when edit button clicked', async () => {
      const mockProducts = [{
        _id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 999,
        stock: 10,
        category: 'Test',
        imageUrl: '/test.jpg'
      }];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: mockProducts })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      });

      // Find and click edit button
      const editButton = screen.getByText(/✏️/i);
      fireEvent.click(editButton);

      // Modal should open with product data
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Test Product');
        expect(nameInput).toBeInTheDocument();
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize product name input', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: [] })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Add Product/i)).toBeInTheDocument();
      });

      const addButton = screen.getByText(/Add Product/i);
      fireEvent.click(addButton);

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Product Name/i, { exact: false });
        expect(nameInput).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Product Name/i, { exact: false });
      
      // Try to enter XSS payload
      await userEvent.type(nameInput, '<script>alert("XSS")</script>');

      // Value should be sanitized or escaped
      expect(nameInput.value).not.toContain('<script>');
    });
  });

  describe('Statistics Display', () => {
    it('should calculate and display product statistics', async () => {
      const mockProducts = [
        { _id: '1', name: 'P1', price: 1000, stock: 10, category: 'Test' },
        { _id: '2', name: 'P2', price: 2000, stock: 5, category: 'Test' },
        { _id: '3', name: 'P3', price: 500, stock: 0, category: 'Test' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: mockProducts })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        // Total products: 3
        expect(screen.getByText('3')).toBeInTheDocument();
        
        // In stock: 2 (products with stock > 0)
        expect(screen.getByText('2')).toBeInTheDocument();
        
        // Out of stock: 1
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  describe('Currency Display', () => {
    it('should display prices in INR (₹)', async () => {
      const mockProducts = [{
        _id: '1',
        name: 'Test Product',
        price: 999,
        stock: 10,
        category: 'Test'
      }];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, products: mockProducts })
      });

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/₹999/i)).toBeInTheDocument();
      });
    });
  });
});
