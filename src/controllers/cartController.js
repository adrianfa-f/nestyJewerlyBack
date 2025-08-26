import prisma from '../config/db.js';

export const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    // Buscar el carrito del usuario con sus items y productos
    let cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const product = await prisma.product.findUnique({ 
      where: { id: parseInt(productId) } 
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Buscar el carrito del usuario o crear uno si no existe
    let cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { items: true }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId,
          items: {
            create: {
              productId: parseInt(productId),
              quantity: parseInt(quantity)
            }
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      return res.status(201).json(cart);
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.items.find(item => item.productId === parseInt(productId));

    if (existingItem) {
      // Actualizar la cantidad si el producto ya existe
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity) }
      });
    } else {
      // Agregar nuevo item al carrito
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        }
      });
    }

    // Obtener el carrito actualizado con todos los items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    // Buscar el carrito del usuario
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { items: true }
    });
    
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Encontrar el item a eliminar
    const itemToRemove = cart.items.find(item => item.productId === parseInt(productId));
    
    if (!itemToRemove) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    // Eliminar el item del carrito
    await prisma.cartItem.delete({
      where: { id: itemToRemove.id }
    });

    // Obtener el carrito actualizado
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
};

export const clearCart = async (req, res) => {
  const userId = req.user.id;

  try {
    // Buscar el carrito del usuario
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Eliminar todos los items del carrito
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Devolver el carrito con items vacíos pero manteniendo la estructura
    const updatedCart = {
      ...cart,
      items: []
    };

    res.json(updatedCart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};

export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    // Buscar el carrito del usuario
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: { items: true }
    });
    
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Validar que la cantidad sea un número no negativo
    if (parseInt(quantity) < 0) {
      return res.status(400).json({ error: 'La cantidad debe ser un número no negativo' });
    }

    // Encontrar el item a actualizar
    const existingItem = cart.items.find(item => item.productId === parseInt(productId));

    if (existingItem) {
      if (parseInt(quantity) === 0) {
        // Si la cantidad es 0, eliminar el producto del carrito
        await prisma.cartItem.delete({
          where: { id: existingItem.id }
        });
      } else {
        // Actualizar la cantidad del producto
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: parseInt(quantity) }
        });
      }
    } else {
      // Si el producto no está en el carrito y la cantidad es mayor a 0, agregarlo
      if (parseInt(quantity) > 0) {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: parseInt(productId),
            quantity: parseInt(quantity)
          }
        });
      } else {
        return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
      }
    }

    // Obtener el carrito actualizado
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
};