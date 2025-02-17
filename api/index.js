require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.API_KEY || "";


app.use(cors());

async function getGenres() {
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=fr-FR`);
        const data = await response.json();
        return data.genres || [];
    } catch (error) {
        console.error("Erreur lors de la récupération des genres :", error);
        return [];
    }
}

// Fonction pour récupérer les films populaires
async function fetchMovies(genresList, page) {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=fr-FR&page=${page}`);
        const data = await response.json();
        console.log(data);

        if (!data.results) {
            return [];
        }

        const moviesWithDetails = await Promise.all(
            data.results.map(async (movie) => {
                const genres = movie.genre_ids.map((genreId) => {
                    const genre = genresList.find((g) => g.id === genreId);
                    return genre ? genre.name : "Inconnu";
                }).join(", ");

                // Récupérer les détails du film
                const movieDetailsResponse = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=fr-FR`);
                const movieDetails = await movieDetailsResponse.json();
                const runtime = movieDetails.runtime ? movieDetails.runtime : "Non disponible";

                return {
                    ...movie,
                    genres,
                    runtime
                };
            })
        );

        return { movies: moviesWithDetails, totalPages: data.total_pages };
    } catch (error) {
        console.error("Erreur lors de la récupération des films :", error);
        return { movies: [], totalPages: 0 };
    }
}


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

app.get("/", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const genresList = await getGenres();
        const { movies, totalPages } = await fetchMovies(genresList, page);

        res.json({ movies, totalPages });
    } catch (error) {
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur lancé sur le port: ${port}`);
});


module.exports = app;