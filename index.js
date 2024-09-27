const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
});

// Modèle Livre
const Livre = sequelize.define('Livre', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Modèle Couleur
const Couleur = sequelize.define('Couleur', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Initialiser la base de données
const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({ alter: true }); // Mise à jour des schémas sans perte de données
        console.log('Database synchronized.');

        // Ajouter 6 couleurs par défaut si la table est vide
        const count = await Couleur.count();
        if (count === 0) {
            await Couleur.bulkCreate([
                { name: 'Rouge' },
                { name: 'Vert' },
                { name: 'Bleu' },
                { name: 'Jaune' },
                { name: 'Noir' },
                { name: 'Blanc' },
            ]);
            console.log('Default colors added.');
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

app.use(express.json());

// CRUD pour Livre (inchangé)
app.post('/livres', async (req, res) => {
    try {
        const livre = await Livre.create({ name: req.body.name });
        res.status(201).json(livre);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/livres', async (req, res) => {
    try {
        const livres = await Livre.findAll();
        res.status(200).json(livres);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//CRUD suppression de livre

app.delete('/livres/:id', async (req, res) => {
    try {
        const livre = await Livre.findByPk(req.params.id);
        if (livre) {
            await livre.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Livre not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// CRUD pour Couleur
app.post('/couleurs', async (req, res) => {
    try {
        const couleur = await Couleur.create({ name: req.body.name });
        res.status(201).json(couleur);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/couleurs', async (req, res) => {
    try {
        const couleurs = await Couleur.findAll();
        res.status(200).json(couleurs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/couleurs/:id', async (req, res) => {
    try {
        const couleur = await Couleur.findByPk(req.params.id);
        if (couleur) {
            res.status(200).json(couleur);
        } else {
            res.status(404).json({ error: 'Couleur not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/couleurs/:id', async (req, res) => {
    try {
        const couleur = await Couleur.findByPk(req.params.id);
        if (couleur) {
            couleur.name = req.body.name;
            await couleur.save();
            res.status(200).json(couleur);
        } else {
            res.status(404).json({ error: 'Couleur not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/couleurs/:id', async (req, res) => {
    try {
        const couleur = await Couleur.findByPk(req.params.id);
        if (couleur) {
            await couleur.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Couleur not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    initDb(); // Initialisation de la DB
});
