let movies = [];
let totalPages = 1;
let currentPage = 1;
const API_URL = window.location.hostname === "127.0.0.1" ? "http://localhost:5000/?page" : "/api";

const fetchMovies = async (page = 1) => {
    try {
        const response = await fetch(`http://localhost:5000/?page=${page}`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        movies = data.movies;
        totalPages = data.totalPages;
        displayMovies(movies);

    } catch (error) {
        console.error("Error fetching movies:", error);
    }
};

document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
        fetchMovies(currentPage);
    }
    console.log("film totals", movies);

});

document.getElementById("nextPage").addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
        fetchMovies(currentPage);
    }
    console.log("film totals", movies);

});

function updatePagination() {
    document.getElementById("pageInfo").textContent = `Page ${currentPage}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
}


// ✅ Attendre que `fetchMovies()` ait fini avant de charger la page
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Chargement du DOM...");

    await fetchMovies();

    populateFilters();
    displayMovies(movies);

    // Reset filters button functionality
    const resetButton = document.getElementById("resetFilters");
    resetButton.addEventListener("click", () => {
        document.getElementById("genreFilter").value = "";
        document.getElementById("ratingFilter").value = "";
        document.getElementById("sortOption").value = "";
        applyFilters();
    });
});


function populateFilters() {
    const genreFilter = document.getElementById("genreFilter");
    const ratingFilter = document.getElementById("ratingFilter");
    const genres = new Set();
    const ratings = new Set();

    movies.forEach(movie => {
        movie.genres.split(", ").forEach(genre => genres.add(genre)); // Convertir en tableau
        ratings.add(movie.vote_average);
    });

    genres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });

    ratings.forEach(rating => {
        const option = document.createElement("option");
        option.value = rating;
        option.textContent = rating;
        ratingFilter.appendChild(option);
    });
}

function displayMovies(filteredMovies) {
    const movieContainer = document.getElementById("movieContainer");
    movieContainer.innerHTML = ""; // Reset movie container

    filteredMovies.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");

        card.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="w-full h-60 object-cover">
          <div class="p-4 text-center">
            <h2 class="text-xl font-bold text-white">${movie.title} <span class="text-gray-400">(${movie.release_date.split("-")[0]})</span></h2>
            <p class="text-yellow-400 font-semibold mt-2">⭐ Note: ${movie.vote_average.toFixed(1)}</p>
            <p class="text-gray-300">⏳ Durée: ${movie.runtime} min</p>
            <p class="text-green-400 text-sm mt-1">🎭 Genres: ${movie.genres}</p>
            <button class="mt-4 bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded font-semibold transition duration-200"
              onclick='recommendMovie(${JSON.stringify(movie)})'>
              💡 Recommander
            </button>
          </div>
        </div>
      `;

        movieContainer.appendChild(card);
    });
}

function applyFilters() {
    const genreFilter = document.getElementById("genreFilter").value;
    const ratingFilter = document.getElementById("ratingFilter").value;
    const sortOption = document.getElementById("sortOption").value;

    let filteredMovies = movies;

    // Filtrer par genre
    if (genreFilter) {
        filteredMovies = filteredMovies.filter(movie => movie.genres.includes(genreFilter));
    }

    // Filtrer par note
    if (ratingFilter) {
        filteredMovies = filteredMovies.filter(movie => movie.vote_average == ratingFilter);
    }

    // Trier par note ou durée
    if (sortOption) {
        filteredMovies.sort((a, b) => a[sortOption] - b[sortOption]);
    }

    // Afficher les films filtrés et triés
    displayMovies(filteredMovies);
}

function recommendMovie(selectedMovie) {
    const movieScore = [];
    const filteredMovies = movies.filter(movie => movie.title !== selectedMovie.title);

    for (let i = 0; i < filteredMovies.length; i++) {
        const result = scoreCalculator(filteredMovies[i], selectedMovie.vote_average, selectedMovie.genres, selectedMovie.runtime);
        movieScore.push(result);
    }

    const topThreeIndex = movieScore.map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map(item => item.index);

    const topThreeMovies = topThreeIndex.map(index => filteredMovies[index]);
    displayMovies(topThreeMovies);
}

function scoreCalculator(movie, movieRating, movieGenres, movieDuration) {
    let point = 0;
    if (movie.vote_average > 0.5 || movie.vote_average === movieRating) {
        point += 1;
    }

    if (movie.runtime < movieDuration * 1.2 && movie.runtime > movieDuration * 0.8) {
        point += 1;
    }

    for (let genre of movie.genres.split(", ")) {
        if (movieGenres.includes(genre)) {
            point += 1;
        }
    }

    return point;
}
