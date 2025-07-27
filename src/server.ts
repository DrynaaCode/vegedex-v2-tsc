import app from './app';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connecté à MongoDB');
    app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error('Erreur MongoDB :', err);
    process.exit(1);
  });
