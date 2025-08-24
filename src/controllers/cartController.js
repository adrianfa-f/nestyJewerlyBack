import prisma from '../config/db.js';

export const getCart = async (req, res) => {
  const { cartId } = req.query;

  try {
    let cart;
    if (cartId) {
      cart = await prisma.cart.findUnique({ 
        where: { id: parseInt(cartId) } 
      });
    }

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

export const addToCart = async (req, res) => {
  const { cartId, productId, quantity } = req.body;

  try {
    const product = await prisma.product.findUnique({ 
      where: { id: parseInt(productId) } 
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let cart;
    if (cartId) {
      cart = await prisma.cart.findUnique({ where: { id: parseInt(cartId) } });
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          items: [{ productId: parseInt(productId), quantity: parseInt(quantity) }]
        }
      });
      return res.status(201).json(cart);
    }

    const items = cart.items;
    const existingItemIndex = items.findIndex(item => item.productId === parseInt(productId));

    if (existingItemIndex >= 0) {
      items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      items.push({ productId: parseInt(productId), quantity: parseInt(quantity) });
    }

    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { items }
    });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
};

export const removeFromCart = async (req, res) => {
  const { cartId, productId } = req.body;

  try {
    const cart = await prisma.cart.findUnique({ 
      where: { id: parseInt(cartId) } 
    });
    
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const items = cart.items.filter(
      item => item.productId !== parseInt(productId)
    );

    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { items }
    });

    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
};