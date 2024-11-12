const apiKey = '50afb67440630b290c4536995fd3efab';
const weatherInfo = document.getElementById('weather-info');
const cityInput = document.getElementById('city-input');
const suggestionsDiv = document.getElementById('suggestions');
const hourlyForecast = document.getElementById('hourly-forecast');

let map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker;

function getWeather() {
    const city = cityInput.value;
    fetchWeatherData(city);
}

function fetchWeatherData(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            getHourlyForecast(data.coord.lat, data.coord.lon);
            updateMapLocation(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            weatherInfo.innerHTML = 'Error fetching weather data';
            console.error('Error:', error);
        });
}

function displayWeather(data) {
    const weatherHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0;">${data.name}, ${data.sys.country}</h2>
            <div style="flex-shrink: 0; margin-left: auto;">
                <img class="weather-icon" src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
            </div>
        </div>
        <p>Temperature: ${data.main.temp.toFixed(1)}°C</p>
        <p>Weather: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
    weatherInfo.innerHTML = weatherHTML;
}

function getHourlyForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => console.error('Error:', error));
}

function displayHourlyForecast(hourlyData) {
    const next24Hours = hourlyData.slice(0, 8);
    hourlyForecast.innerHTML = next24Hours.map(item => `
        <div class="hourly-item">
            <p>${new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
            <p>${item.main.temp.toFixed(1)}°C</p>
            <p>${item.weather[0].description}</p>
        </div>
    `).join('');
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
                .then(response => response.json())
                .then(data => {
                    displayWeather(data);
                    getHourlyForecast(lat, lon);
                    updateMapLocation(lat, lon);
                })
                .catch(error => console.error('Error:', error));
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function updateMapLocation(lat, lon) {
    map.setView([lat, lon], 10);
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker([lat, lon]).addTo(map);
}

cityInput.addEventListener('input', () => {
    const query = cityInput.value;
    if (query.length > 2) {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const suggestions = data.map(city => `${city.name}, ${city.country}`);
                displaySuggestions(suggestions);
            })
            .catch(error => console.error('Error:', error));
    } else {
        suggestionsDiv.style.display = 'none';
    }
});

function displaySuggestions(suggestions) {
    suggestionsDiv.innerHTML = suggestions.map(city => `
        <div class="suggestion-item" onclick="selectCity('${city}')">${city}</div>
    `).join('');
    suggestionsDiv.style.display = 'block';
}

function selectCity(city) {
    cityInput.value = city;
    suggestionsDiv.style.display = 'none';
    getWeather();
}

function getWeatherForCity(city) {
    cityInput.value = city;
    getWeather();
}

