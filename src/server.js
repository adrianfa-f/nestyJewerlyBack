import app from './app.js';

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('🛠️ Backend de Nesty Jewelry está activo');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
