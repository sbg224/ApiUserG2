import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcrypt';

const app = express();

// Utilisation de CORS pour permettre les connexions croisées
app.use(cors());

// Pour parser le corps des requêtes en JSON
app.use(express.json());

const pub = path.join(process.cwd(), "public");

// Chemin vers le fichier contenant les utilisateurs
const usersFilePath = path.join(process.cwd(), 'users.json');
const contactFilePath = path.join(process.cwd(), 'contact.json');

// Lire les données des utilisateurs depuis le fichier
const readUsersFromFile = () => {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf-8');
      return JSON.parse(data);
    }
    return []; // Retourne un tableau vide si le fichier n'existe pas
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier :', error);
    return []; // Retourner un tableau vide en cas d'erreur de lecture
  }
};

// Sauvegarder les utilisateurs dans le fichier
const saveUsersToFile = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le fichier :', error);
  }
};

const readContactFromFile = () => {
  try {
    if (fs.existsSync(contactFilePath)) {
      const data = fs.readFileSync(contactFilePath, 'utf-8');
      return JSON.parse(data);
    }
    return []; // Retourne un tableau vide si le fichier n'existe pas
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier :', error);
    return []; // Retourner un tableau vide en cas d'erreur de lecture
  }
};

const saveContactToFile = (contact) => {
  try {
    fs.writeFileSync(contactFilePath, JSON.stringify(contact, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le fichier :', error);
  }
};



// Route pour récupérer la liste des utilisateurs (facultatif)
//http://localhost:5454/users
// app.get('/users/', (req, res) => {
//   const users = readUsersFromFile();
//   res.status(200).json(users);
// });

app.get('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const users = readUsersFromFile(); // Lire les données depuis le fichier
    const user = users.find((u) => u.id === Number(id)); // Recherche de l'utilisateur

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Exemple côté serveur (Express)
//http://localhost:5454/users
app.post('/users', async (req, res) => {
  try {
    const newUser = req.body;

    // Validation des données
    if (!newUser.name || !newUser.age || !newUser.email || !newUser.password) {
      return res.status(400).json({ message: "Tous les champs (name, age, email, password) sont requis" });
    }

    const users = readUsersFromFile();  // Charger les utilisateurs existants

    // Générer un ID unique pour l'utilisateur
    const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

    // Hacher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    const userToAdd = { id: newId, ...newUser, password: hashedPassword };

    // Ajouter l'utilisateur au tableau
    users.push(userToAdd);

    // Sauvegarder les utilisateurs dans le fichier
    saveUsersToFile(users);

    res.status(201).json({
      message: "Utilisateur ajouté avec succès",
      user: userToAdd,
    });
  } catch (error) {
    // Log des erreurs côté serveur pour le débogage
    console.error("Erreur côté serveur :", error);
    res.status(500).json({ message: "Une erreur interne s'est produite" });
  }
});

// Route pour vérifier si l'utilisateur existe
  //http://localhost:5454/verify-user
app.post('/verify-user', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Lire les utilisateurs depuis le fichier
    const users = readUsersFromFile();

    // Recherche l'utilisateur par email
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.json({ exists: false });
    }

    // Vérifier le mot de passe (hashé dans la base de données)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      return res.json({ exists: true, id: user.id }); // Ajoute l'ID dans la réponse
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

app.post('/contact', async (req, res) => {

  try {
    const newMessage = req.body;

    // Validation des données
    if (!newMessage.nom || !newMessage.prenom || !newMessage.email || !newMessage.dateNaissance || !newMessage.sujet || !newMessage.message) {
      return res.status(400).json({ message: "Tous les champs (name, age, email, password) sont requis" });
    }

    const contact = readContactFromFile();  // Charger les utilisateurs existants

    // Générer un ID unique pour l'utilisateur
    const newId = contact.length > 0 ? contact[contact.length - 1].id + 1 : 1;

    const contactToAdd = { id: newId, ...newMessage };

    // Ajouter le message au tableau
    contact.push(contactToAdd);

    // Sauvegarder les messages dans le fichier
    saveContactToFile(contact);

    res.status(201).json({
      message: "Message ajouté avec succès",
      user: contactToAdd,
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

app.get('/contact', async (req, res) => {

  try {

    const result = readContactFromFile()
    return res.status(200).json(result);

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

const port = process.env.PORT || 5454;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
