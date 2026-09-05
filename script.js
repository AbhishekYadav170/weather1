// ========================================
// WEATHERLY WEATHER APP
// HTML + CSS + JAVASCRIPT
// ========================================


// ========================================
// API CONFIGURATION
// ========================================

// OpenWeatherMap API
const API_KEY = "YOUR_API_KEY";

const BASE_URL =
    "https://api.openweathermap.org/data/2.5";


// ========================================
// DOM ELEMENTS
// ========================================

const searchForm =
    document.getElementById("searchForm");

const cityInput =
    document.getElementById("cityInput");

const locationBtn =
    document.getElementById("locationBtn");

const themeBtn =
    document.getElementById("themeBtn");

const weatherContent =
    document.getElementById("weatherContent");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");


// ========================================
// WEATHER ICONS
// ========================================

const weatherIcons = {

    Clear: "☀️",

    Clouds: "☁️",

    Rain: "🌧️",

    Drizzle: "🌦️",

    Thunderstorm: "⛈️",

    Snow: "❄️",

    Mist: "🌫️",

    Smoke: "🌫️",

    Haze: "🌫️",

    Dust: "🌫️",

    Fog: "🌫️",

    Sand: "🌫️",

    Ash: "🌋",

    Squall: "💨",

    Tornado: "🌪️"

};


// ========================================
// INITIAL LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateDate();

        if (
            API_KEY !==
            "YOUR_API_KEY"
        ) {

            getWeather("New Delhi");

        }

    }
);


// ========================================
// SEARCH WEATHER
// ========================================

searchForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const city =
            cityInput.value.trim();

        if (!city) {

            showError(
                "Please enter a city name."
            );

            return;
        }

        getWeather(city);

    }
);


// ========================================
// GET WEATHER
// ========================================

async function getWeather(city) {

    if (
        API_KEY ===
        "YOUR_API_KEY"
    ) {

        showError(
            "Please add your OpenWeatherMap API key in script.js"
        );

        return;
    }


    showLoading();


    try {

        const weatherResponse =
            await fetch(
                `${BASE_URL}/weather?q=${encodeURIComponent(
                    city
                )}&appid=${API_KEY}&units=metric`
            );


        if (!weatherResponse.ok) {

            throw new Error(
                "City not found."
            );

        }


        const weatherData =
            await weatherResponse.json();


        const forecastResponse =
            await fetch(
                `${BASE_URL}/forecast?q=${encodeURIComponent(
                    city
                )}&appid=${API_KEY}&units=metric`
            );


        if (!forecastResponse.ok) {

            throw new Error(
                "Forecast unavailable."
            );

        }


        const forecastData =
            await forecastResponse.json();


        displayWeather(
            weatherData,
            forecastData
        );

    }

    catch (error) {

        showError(
            error.message ||
            "Something went wrong."
        );

    }

    finally {

        hideLoading();

    }

}


// ========================================
// DISPLAY WEATHER
// ========================================

function displayWeather(
    weather,
    forecast
) {

    hideError();


    // Location

    document.getElementById(
        "cityName"
    ).textContent =
        `${weather.name}, ${weather.sys.country}`;


    // Temperature

    document.getElementById(
        "temperature"
    ).textContent =
        Math.round(
            weather.main.temp
        );


    // Feels like

    document.getElementById(
        "feelsLike"
    ).textContent =
        Math.round(
            weather.main.feels_like
        );


    // Description

    document.getElementById(
        "weatherDescription"
    ).textContent =
        capitalize(
            weather.weather[0].description
        );


    // Min temperature

    document.getElementById(
        "minTemp"
    ).textContent =
        `${Math.round(
            weather.main.temp_min
        )}°C`;


    // Max temperature

    document.getElementById(
        "maxTemp"
    ).textContent =
        `${Math.round(
            weather.main.temp_max
        )}°C`;


    // Humidity

    document.getElementById(
        "humidity"
    ).textContent =
        `${weather.main.humidity}%`;


    document.getElementById(
        "humidityDetail"
    ).textContent =
        `${weather.main.humidity}%`;


    // Wind

    const wind =
        Math.round(
            weather.wind.speed * 3.6
        );


    document.getElementById(
        "windSpeed"
    ).textContent =
        `${wind} km/h`;


    document.getElementById(
        "windDetail"
    ).textContent =
        `${wind} km/h`;


    // Pressure

    document.getElementById(
        "pressure"
    ).textContent =
        `${weather.main.pressure} hPa`;


    // Visibility

    document.getElementById(
        "visibility"
    ).textContent =
        `${Math.round(
            weather.visibility / 1000
        )} km`;


    // Weather icon

    const condition =
        weather.weather[0].main;


    document.getElementById(
        "weatherIcon"
    ).textContent =
        weatherIcons[condition] ||
        "🌤️";


    // Sunrise

    document.getElementById(
        "sunrise"
    ).textContent =
        formatTime(
            weather.sys.sunrise
        );


    // Sunset

    document.getElementById(
        "sunset"
    ).textContent =
        formatTime(
            weather.sys.sunset
        );


    // 5 day forecast

    displayFiveDayForecast(
        forecast
    );


    // Hourly forecast

    displayHourlyForecast(
        forecast
    );

}


// ========================================
// HOURLY FORECAST
// ========================================

function displayHourlyForecast(
    forecast
) {

    const container =
        document.getElementById(
            "hourlyForecast"
        );


    container.innerHTML = "";


    const hours =
        forecast.list.slice(0, 8);


    hours.forEach(
        (item, index) => {

            const condition =
                item.weather[0].main;


            const icon =
                weatherIcons[condition] ||
                "🌤️";


            const time =
                index === 0
                    ? "Now"
                    : formatHour(
                        item.dt
                    );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                `hour-card ${
                    index === 0
                        ? "active"
                        : ""
                }`;


            card.innerHTML = `

                <p>${time}</p>

                <span>${icon}</span>

                <strong>
                    ${Math.round(
                        item.main.temp
                    )}°
                </strong>

            `;


            container.appendChild(
                card
            );

        }
    );

}


// ========================================
// FIVE DAY FORECAST
// ========================================

function displayFiveDayForecast(
    forecast
) {

    const container =
        document.getElementById(
            "fiveDayForecast"
        );


    container.innerHTML = "";


    const daily = {};


    forecast.list.forEach(
        (item) => {

            const date =
                new Date(
                    item.dt * 1000
                ).toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );


            if (!daily[date]) {

                daily[date] = item;

            }

        }
    );


    Object.keys(daily)
        .slice(0, 5)
        .forEach(
            (day) => {

                const item =
                    daily[day];


                const condition =
                    item.weather[0].main;


                const icon =
                    weatherIcons[condition] ||
                    "🌤️";


                const date =
                    new Date(
                        item.dt * 1000
                    ).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric"
                        }
                    );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "forecast-card";


                card.innerHTML = `

                    <div>

                        <strong>
                            ${day}
                        </strong>

                        <p>
                            ${date}
                        </p>

                    </div>


                    <span class="forecast-icon">
                        ${icon}
                    </span>


                    <div class="forecast-temp">

                        <strong>
                            ${Math.round(
                                item.main.temp_max
                            )}°
                        </strong>

                        <span>
                            ${Math.round(
                                item.main.temp_min
                            )}°
                        </span>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );

}


// ========================================
// LOCATION
// ========================================

locationBtn.addEventListener(
    "click",
    () => {

        if (
            !navigator.geolocation
        ) {

            showError(
                "Geolocation is not supported."
            );

            return;
        }


        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const lat =
                    position.coords.latitude;

                const lon =
                    position.coords.longitude;


                getWeatherByCoordinates(
                    lat,
                    lon
                );

            },

            () => {

                showError(
                    "Please allow location access."
                );

            }

        );

    }
);


// ========================================
// WEATHER BY COORDINATES
// ========================================

async function getWeatherByCoordinates(
    lat,
    lon
) {

    if (
        API_KEY ===
        "YOUR_API_KEY"
    ) {

        showError(
            "Please add your API key first."
        );

        return;
    }


    showLoading();


    try {

        const response =
            await fetch(
                `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to get your location weather."
            );

        }


        const weather =
            await response.json();


        const forecastResponse =
            await fetch(
                `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );


        const forecast =
            await forecastResponse.json();


        displayWeather(
            weather,
            forecast
        );

    }

    catch (error) {

        showError(
            error.message
        );

    }

    finally {

        hideLoading();

    }

}


// ========================================
// THEME
// ========================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-mode"
        );


        if (
            document.body.classList.contains(
                "light-mode"
            )
        ) {

            themeBtn.textContent =
                "☀️";

        }

        else {

            themeBtn.textContent =
                "🌙";

        }

    }
);


// ========================================
// DATE
// ========================================

function updateDate() {

    const now =
        new Date();


    const formatted =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
        );


    document.getElementById(
        "date"
    ).textContent =
        formatted;

}


// ========================================
// FORMAT TIME
// ========================================

function formatTime(timestamp) {

    return new Date(
        timestamp * 1000
    ).toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ========================================
// FORMAT HOUR
// ========================================

function formatHour(timestamp) {

    return new Date(
        timestamp * 1000
    ).toLocaleTimeString(
        "en-US",
        {
            hour: "numeric"
        }
    );

}


// ========================================
// CAPITALIZE
// ========================================

function capitalize(text) {

    return text
        .split(" ")
        .map(
            word =>
                word.charAt(0)
                    .toUpperCase() +
                word.slice(1)
        )
        .join(" ");

}


// ========================================
// LOADING
// ========================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

    weatherContent.classList.add(
        "hidden"
    );

}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

    weatherContent.classList.remove(
        "hidden"
    );

}


// ========================================
// ERROR
// ========================================

function showError(message) {

    errorMessage.textContent =
        message;

}


function hideError() {

    errorMessage.textContent =
        "";

}