// Store API integration for fetching product data, images, and variants
import type { StoreConfig } from '../types/config';

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  selectedOptions: {
    name: string;
    value: string;
  }[];
  availableForSale: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  images: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  }[];
  variants: {
    edges: {
      node: ProductVariant;
    }[];
  };
  options: {
    name: string;
    values: string[];
  }[];
}

export interface StoreApiResponse<T> {
  data: T;
  errors?: any[];
}

// Store API client
export class StoreApiClient {
  private storeConfig: StoreConfig;
  private baseUrl: string;

  constructor(storeConfig: StoreConfig) {
    this.storeConfig = storeConfig;
    // TODO: Replace with actual store API URL
    this.baseUrl = 'https://api.example.com/store'; // This needs to be the actual store API
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<StoreApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Store-Id': this.storeConfig.storeId || '',
        'X-Account-Id': this.storeConfig.accountId || '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Store API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getProduct(productId: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${productId}`);
    return response.data;
  }

  async getMultipleProducts(productIds: string[]): Promise<Product[]> {
    const response = await this.request<Product[]>('/products', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    });
    return response.data;
  }

  async getVariant(variantId: string): Promise<ProductVariant> {
    const response = await this.request<ProductVariant>(`/variants/${variantId}`);
    return response.data;
  }
}

// Utility functions for processing store data
export function extractColorsFromProducts(products: Product[]): Array<{
  name: string;
  image: string;
  variantId: string;
  variants: ProductVariant[];
}> {
  const colorMap = new Map<string, {
    name: string;
    image: string;
    variantId: string;
    variants: ProductVariant[];
  }>();

  products.forEach(product => {
    // Find the color option
    const colorOption = product.options.find(opt => 
      opt.name.toLowerCase().includes('color') || 
      opt.name.toLowerCase().includes('colour')
    );

    if (colorOption) {
      colorOption.values.forEach(colorValue => {
        // Find variants for this color
        const colorVariants = product.variants.edges
          .map(edge => edge.node)
          .filter(variant => 
            variant.selectedOptions.some(opt => 
              opt.name === colorOption.name && opt.value === colorValue
            )
          );

        if (colorVariants.length > 0) {
          // Use the first variant with an image, or the first variant
          const primaryVariant = colorVariants.find(v => v.image) || colorVariants[0];
          
          colorMap.set(colorValue, {
            name: colorValue,
            image: primaryVariant.image?.url || product.images[0]?.url || '',
            variantId: primaryVariant.id,
            variants: colorVariants,
          });
        }
      });
    }
  });

  return Array.from(colorMap.values());
}

export function extractSizesFromProducts(products: Product[]): string[] {
  const sizeSet = new Set<string>();

  products.forEach(product => {
    // Find the size option
    const sizeOption = product.options.find(opt => 
      opt.name.toLowerCase().includes('size')
    );

    if (sizeOption) {
      sizeOption.values.forEach(size => sizeSet.add(size));
    }
  });

  return Array.from(sizeSet).sort();
}

// Function to find variant by color and size
export function findVariantByColorAndSize(
  products: Product[], 
  color: string, 
  size: string
): ProductVariant | null {
  for (const product of products) {
    const variant = product.variants.edges
      .map(edge => edge.node)
      .find(variant => {
        const hasColor = variant.selectedOptions.some(opt => 
          opt.name.toLowerCase().includes('color') && opt.value === color
        );
        const hasSize = variant.selectedOptions.some(opt => 
          opt.name.toLowerCase().includes('size') && opt.value === size
        );
        return hasColor && hasSize;
      });

    if (variant) {
      return variant;
    }
  }

  return null;
}

// Mock implementation for development (replace with real API calls)
export class MockStoreApiClient extends StoreApiClient {
  async getProduct(productId: string): Promise<Product> {
    // Return mock data based on your product IDs
    return {
      id: productId,
      title: this.getProductTitle(productId),
      description: "Premium 3D sculpting leggings",
      images: [
        {
          url: this.getProductImage(productId),
          altText: this.getProductTitle(productId),
          width: 500,
          height: 750
        }
      ],
      variants: {
        edges: this.getMockVariants(productId).map(variant => ({ node: variant }))
      },
      options: [
        {
          name: "Color",
          values: [this.getColorFromProductId(productId)]
        },
        {
          name: "Size", 
          values: ["S", "M", "L"]
        }
      ]
    };
  }

  async getMultipleProducts(productIds: string[]): Promise<Product[]> {
    return Promise.all(productIds.map(id => this.getProduct(id)));
  }

  private getProductTitle(productId: string): string {
    const titleMap: Record<string, string> = {
      'product_387016fc4ea3': 'Pink 3D Sculpting Leggings',
      'product_c1f9b41da1db': 'Light Blue 3D Sculpting Leggings', 
      'product_deafce030387': 'Beige 3D Sculpting Leggings',
      'product_a4aa9410b09d': 'Black 3D Sculpting Leggings'
    };
    return titleMap[productId] || 'Premium Leggings';
  }

  private getColorFromProductId(productId: string): string {
    const colorMap: Record<string, string> = {
      'product_387016fc4ea3': 'Pink',
      'product_c1f9b41da1db': 'Light Blue',
      'product_deafce030387': 'Beige', 
      'product_a4aa9410b09d': 'Black'
    };
    return colorMap[productId] || 'Unknown';
  }

  private getProductImage(productId: string): string {
    const imageMap: Record<string, string> = {
      'product_387016fc4ea3': '/images/leggings-pink.png',
      'product_c1f9b41da1db': '/images/leggings-light-blue.png',
      'product_deafce030387': '/images/leggings-beige.png',
      'product_a4aa9410b09d': '/images/leggings-black.png'
    };
    return imageMap[productId] || '/images/leggings-black.png';
  }

  private getMockVariants(productId: string): ProductVariant[] {
    const color = this.getColorFromProductId(productId);
    const variantMap: Record<string, string[]> = {
      'product_387016fc4ea3': ['variant_bf691218089f', 'variant_47cfac171b79', 'variant_5aaa3e4e92ea'],
      'product_c1f9b41da1db': ['variant_e66866b1a7bc', 'variant_6f191a5382ce', 'variant_5d0c6abef087'],
      'product_deafce030387': ['variant_163fa285da2a', 'variant_72a06a0b8cbf', 'variant_94d62ec9dfda'],
      'product_a4aa9410b09d': ['variant_ff221bae5bd1', 'variant_445b8d0a9387', 'variant_64e4aa640f51']
    };

    const variantIds = variantMap[productId] || [];
    const sizes = ['S', 'M', 'L'];

    return variantIds.map((variantId, index) => ({
      id: variantId,
      title: `${color} - ${sizes[index]}`,
      price: '49.99',
      compareAtPrice: '89.99',
      image: {
        url: this.getProductImage(productId),
        altText: `${color} leggings - ${sizes[index]}`,
        width: 500,
        height: 750
      },
      selectedOptions: [
        { name: "Color", value: color },
        { name: "Size", value: sizes[index] }
      ],
      availableForSale: true
    }));
  }
}