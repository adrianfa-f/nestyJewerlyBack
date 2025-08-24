import cloudinary from '../config/cloudinary.js';
import prisma from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Decodificar la categoría (por si tiene espacios o caracteres especiales)
    const decodedCategory = decodeURIComponent(category);
    
    const products = await prisma.product.findMany({
      where: {
        category: decodedCategory
      }
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Error al obtener productos por categoría' });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ 
      where: { id: parseInt(id) } 
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

export const createProduct = async (req, res) => {
  const { 
    name, 
    description, 
    price, 
    sku, 
    stock, 
    category, 
    status 
  } = req.body;

  try {
    // Validar campos obligatorios
    if (!name || !description || !price || !sku || !stock || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validación específica para productos destacados
    if (status === 'featured') {
      if (!req.files || !req.files['mainImage'] || !req.files['hoverImage'] || 
          !req.files['images'] || req.files['images'].length === 0) {
        return res.status(400).json({ 
          error: 'Los productos destacados requieren mainImage, hoverImage y al menos una imagen en images' 
        });
      }
    } else {
      // Validación para productos activos
      if (!req.files || !req.files['images'] || req.files['images'].length === 0) {
        return res.status(400).json({ 
          error: 'Los productos activos requieren al menos una imagen en images' 
        });
      }
    }

    let mainImageUrl = null;
    let hoverImageUrl = null;
    let additionalImagesUrls = [];

    // Procesar mainImage si se proporciona (solo para featured)
    if (req.files && req.files['mainImage']) {
      mainImageUrl = req.files['mainImage'][0].path; // URL ya generada por Multer
    }

    // Procesar hoverImage si se proporciona (solo para featured)
    if (req.files && req.files['hoverImage']) {
      hoverImageUrl = req.files['hoverImage'][0].path; // URL ya generada por Multer
    }

    // Procesar imágenes adicionales
    if (req.files && req.files['images']) {
      additionalImagesUrls = req.files['images'].map(file => file.path); // URLs ya generadas por Multer
    }

    const product = await prisma.product.create({
      data: { 
        name, 
        description, 
        price: parseFloat(price), 
        sku, 
        stock: parseInt(stock), 
        category,
        status: status || 'active',
        mainImage: mainImageUrl,
        hoverImage: hoverImageUrl,
        images: additionalImagesUrls
      },
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    price, 
    sku, 
    stock, 
    category, 
    status 
  } = req.body;

  try {
    // Obtener producto actual
    const currentProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!currentProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let mainImage = currentProduct.mainImage;
    let hoverImage = currentProduct.hoverImage;
    let images = currentProduct.images;

    // Actualizar imágenes si se proporcionan
    if (req.files && req.files['mainImage']) {
      mainImage = req.files['mainImage'][0].path; // URL ya generada por Multer
    }

    if (req.files && req.files['hoverImage']) {
      hoverImage = req.files['hoverImage'][0].path; // URL ya generada por Multer
    }

    if (req.files && req.files['images']) {
      const newImagesUrls = req.files['images'].map(file => file.path); // URLs ya generadas por Multer
      images = [...currentProduct.images, ...newImagesUrls];
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        description, 
        price: parseFloat(price), 
        sku, 
        stock: parseInt(stock), 
        category,
        status,
        mainImage,
        hoverImage,
        images
      },
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Obtener productos destacados para home
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'featured' },
      take: 8
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos destacados' });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Primero obtener el producto para tener las URLs de las imágenes
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // 2. Eliminar imágenes de Cloudinary
    const imageUrlsToDelete = [];

    // Agregar imagen principal si existe
    if (product.mainImage) {
      imageUrlsToDelete.push(product.mainImage);
    }

    // Agregar imagen hover si existe
    if (product.hoverImage) {
      imageUrlsToDelete.push(product.hoverImage);
    }

    // Agregar imágenes adicionales si existen
    if (product.images && product.images.length > 0) {
      imageUrlsToDelete.push(...product.images);
    }

    // Función para extraer el public_id de la URL de Cloudinary
    const extractPublicId = (url) => {
      // Las URLs de Cloudinary tienen el formato:
      // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<format>
      const matches = url.match(/\/upload\/[^/]+\/([^\.]+)/);
      return matches ? matches[1] : null;
    };

    // Eliminar cada imagen de Cloudinary
    const deletePromises = imageUrlsToDelete.map(async (imageUrl) => {
      try {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Imagen eliminada de Cloudinary: ${publicId}`);
        }
      } catch (error) {
        console.error('Error eliminando imagen de Cloudinary:', error);
        // No lanzamos error aquí para que la eliminación del producto continúe
      }
    });

    // Esperar a que todas las eliminaciones de imágenes se completen
    await Promise.all(deletePromises);

    // 3. Eliminar el producto de la base de datos
    await prisma.product.delete({ 
      where: { id: parseInt(id) } 
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};