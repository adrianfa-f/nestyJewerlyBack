// controllers/wishlistController.js
import prisma from '../config/db.js';

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(wishlist?.items || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener wishlist' });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Verificar si el producto existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Obtener o crear wishlist del usuario
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user.id }
      });
    }

    // Verificar si el producto ya está en la wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: parseInt(productId)
        }
      }
    });

    if (existingItem) {
      return res.status(400).json({ error: 'El producto ya está en la wishlist' });
    }

    // Agregar producto a la wishlist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: parseInt(productId)
      }
    });

    // Devolver wishlist actualizada
    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedWishlist.items);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar a wishlist' });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id }
    });

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist no encontrada' });
    }

    await prisma.wishlistItem.delete({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: parseInt(productId)
        }
      }
    });

    // Devolver wishlist actualizada
    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedWishlist.items);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar de wishlist' });
  }
};

export const checkWishlist = async (req, res) => {
  try {
    const { productId } = req.query;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          where: {
            productId: parseInt(productId)
          }
        }
      }
    });

    res.json({ isInWishlist: wishlist && wishlist.items.length > 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar wishlist' });
  }
};