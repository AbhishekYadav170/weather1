// =====================================================
// WEATHERLY - FINAL SCRIPT
// Current Weather  : OpenWeatherMap
// 7 Day Forecast   : Open-Meteo
// =====================================================


// =====================================================
// API CONFIG
// =====================================================

const API_KEY = "cc88e617d279f04efc2914ce4f185e9a";

const WEATHER_URL =
    "https://api.openweathermap.org/data/2.5/weather";

const GEO_URL =
    "https://api.openweathermap.org/geo/1.0/direct";

const OPEN_METEO_URL =
    "https://api.open-meteo.com/v1/forecast";


// =====================================================
// DOM ELEMENTS
// =====================================================

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

const hourlyForecast =
    document.getElementById("hourlyForecast");

const sevenDayForecast =
    document.getElementById("sevenDayForecast");


// =====================================================
// OPENWEATHER ICONS
// =====================================================

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


// =====================================================
// OPEN-METEO WEATHER CODES
// =====================================================

function getWeatherIcon(code) {

    // Clear
    if (code === 0) {
        return "☀️";
    }

    // Mainly clear / partly cloudy
    if (code === 1 || code === 2) {
        return "🌤️";
    }

    // Overcast
    if (code === 3) {
        return "☁️";
    }

    // Fog
    if (code === 45 || code === 48) {
        return "🌫️";
    }

    // Drizzle
    if (
        code === 51 ||
        code === 53 ||
        code === 55 ||
        code === 56 ||
        code === 57
    ) {
        return "🌦️";
    }

    // Rain
    if (
        code === 61 ||
        code === 63 ||
        code === 65 ||
        code === 66 ||
        code === 67
    ) {
        return "🌧️";
    }

    // Snow
    if (
        code === 71 ||
        code === 73 ||
        code === 75 ||
        code === 77
    ) {
        return "❄️";
    }

    // Rain showers
    if (
        code === 80 ||
        code === 81 ||
        code === 82
    ) {
        return "🌦️";
    }

    // Thunderstorm
    if (
        code === 95 ||
        code === 96 ||
        code === 99
    ) {
        return "⛈️";
    }

    return "🌤️";
}


// =====================================================
// OPEN-METEO WEATHER DESCRIPTION
// =====================================================

function getWeatherDescription(code) {

    const descriptions = {

        0: "Clear Sky",

        1: "Mainly Clear",

        2: "Partly Cloudy",

        3: "Overcast",

        45: "Foggy",

        48: "Foggy",

        51: "Light Drizzle",

        53: "Drizzle",

        55: "Heavy Drizzle",

        56: "Freezing Drizzle",

        57: "Freezing Drizzle",

        61: "Light Rain",

        63: "Rain",

        65: "Heavy Rain",

        66: "Freezing Rain",

        67: "Heavy Freezing Rain",

        71: "Light Snow",

        73: "Snow",

        75: "Heavy Snow",

        77: "Snow Grains",

        80: "Rain Showers",

        81: "Rain Showers",

        82: "Heavy Rain Showers",

        95: "Thunderstorm",

        96: "Thunderstorm",

        99: "Heavy Thunderstorm"

    };

    return descriptions[code] || "Weather";

}


// =====================================================
// APP START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateDate();

        loadSavedTheme();

        if (API_KEY !== "YOUR_API_KEY") {

            getWeather("New Delhi");

        } else {

            showError(
                "Add your OpenWeather API key in script.js to start."
            );

        }

    }
);


// =====================================================
// SEARCH FORM
// =====================================================

searchForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const place =
            cityInput.value.trim();

        if (!place) {

            showError(
                "Please enter a city, village or locality."
            );

            cityInput.focus();

            return;
        }

        await getWeather(place);

    }
);


// =====================================================
// GET WEATHER BY CITY / VILLAGE / LOCALITY
// =====================================================

async function getWeather(place) {

    if (API_KEY === "YOUR_API_KEY") {

        showError(
            "Please add your OpenWeatherMap API key in script.js"
        );

        return;
    }

    showLoading();

    hideError();

    try {

        // -------------------------------------------------
        // LOCATION SEARCH
        // -------------------------------------------------

        const geoResponse =
            await fetch(
                `${GEO_URL}?q=${encodeURIComponent(
                    place
                )}&limit=5&appid=${API_KEY}`
            );

        if (!geoResponse.ok) {

            throw new Error(
                "Unable to search this location."
            );
        }

        const locations =
            await geoResponse.json();

        if (
            !locations ||
            locations.length === 0
        ) {

            throw new Error(
                "Location not found. Try another city, village or locality."
            );
        }

        // First matching location
        const selectedLocation =
            locations[0];

        const latitude =
            selectedLocation.lat;

        const longitude =
            selectedLocation.lon;

        // -------------------------------------------------
        // CURRENT WEATHER
        // -------------------------------------------------

        const weatherResponse =
            await fetch(
                `${WEATHER_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );

        if (!weatherResponse.ok) {

            throw new Error(
                "Unable to load current weather."
            );
        }

        const weatherData =
            await weatherResponse.json();

        // -------------------------------------------------
        // OPEN-METEO 7 DAY FORECAST
        // -------------------------------------------------

        const forecastData =
            await getSevenDayForecast(
                latitude,
                longitude
            );

        // -------------------------------------------------
        // DISPLAY
        // -------------------------------------------------

        displayWeather(
            weatherData,
            forecastData
        );

        cityInput.value = "";

    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        showError(
            error.message ||
            "Something went wrong. Please try again."
        );

    } finally {

        hideLoading();

    }
}


// =====================================================
// GET WEATHER BY GPS
// =====================================================

async function getWeatherByCoordinates(
    latitude,
    longitude
) {

    if (API_KEY === "YOUR_API_KEY") {

        showError(
            "Please add your OpenWeatherMap API key first."
        );

        hideLoading();

        return;
    }

    try {

        // Current weather

        const weatherResponse =
            await fetch(
                `${WEATHER_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );

        if (!weatherResponse.ok) {

            throw new Error(
                "Unable to get weather for your location."
            );
        }

        const weatherData =
            await weatherResponse.json();

        // Forecast

        const forecastData =
            await getSevenDayForecast(
                latitude,
                longitude
            );

        // Display

        displayWeather(
            weatherData,
            forecastData
        );

    } catch (error) {

        console.error(
            error
        );

        showError(
            error.message ||
            "Unable to get your location weather."
        );

    } finally {

        hideLoading();

    }
}


// =====================================================
// OPEN-METEO 7 DAY FORECAST
// =====================================================

async function getSevenDayForecast(
    latitude,
    longitude
) {

    const url =
        `${OPEN_METEO_URL}?` +
        `latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
        `&hourly=temperature_2m,weather_code,precipitation_probability` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
        `&timezone=auto` +
        `&forecast_days=7`;

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            "7-day forecast could not be loaded."
        );
    }

    return await response.json();
}


// =====================================================
// DISPLAY ALL WEATHER
// =====================================================

function displayWeather(
    weather,
    forecast
) {

    hideError();

    // -------------------------------------------------
    // CITY
    // -------------------------------------------------

    const cityName =
        document.getElementById(
            "cityName"
        );

    cityName.textContent =
        `${weather.name}, ${weather.sys.country}`;


    // -------------------------------------------------
    // DATE
    // -------------------------------------------------

    updateDate();


    // -------------------------------------------------
    // TEMPERATURE
    // -------------------------------------------------

    document.getElementById(
        "temperature"
    ).textContent =
        Math.round(
            weather.main.temp
        );


    // -------------------------------------------------
    // FEELS LIKE
    // -------------------------------------------------

    document.getElementById(
        "feelsLike"
    ).textContent =
        Math.round(
            weather.main.feels_like
        );


    // -------------------------------------------------
    // DESCRIPTION
    // -------------------------------------------------

    document.getElementById(
        "weatherDescription"
    ).textContent =
        capitalize(
            weather.weather[0].description
        );


    // -------------------------------------------------
    // MIN TEMP
    // -------------------------------------------------

    document.getElementById(
        "minTemp"
    ).textContent =
        `${Math.round(
            weather.main.temp_min
        )}°C`;


    // -------------------------------------------------
    // MAX TEMP
    // -------------------------------------------------

    document.getElementById(
        "maxTemp"
    ).textContent =
        `${Math.round(
            weather.main.temp_max
        )}°C`;


    // -------------------------------------------------
    // HUMIDITY
    // -------------------------------------------------

    document.getElementById(
        "humidity"
    ).textContent =
        `${weather.main.humidity}%`;

    document.getElementById(
        "humidityDetail"
    ).textContent =
        `${weather.main.humidity}%`;


    // -------------------------------------------------
    // WIND
    // -------------------------------------------------

    const windSpeed =
        Math.round(
            weather.wind.speed * 3.6
        );

    document.getElementById(
        "windSpeed"
    ).textContent =
        `${windSpeed} km/h`;

    document.getElementById(
        "windDetail"
    ).textContent =
        `${windSpeed} km/h`;


    // -------------------------------------------------
    // PRESSURE
    // -------------------------------------------------

    document.getElementById(
        "pressure"
    ).textContent =
        `${weather.main.pressure} hPa`;


    // -------------------------------------------------
    // VISIBILITY
    // -------------------------------------------------

    const visibility =
        weather.visibility
            ? Math.round(
                weather.visibility / 1000
            )
            : 0;

    document.getElementById(
        "visibility"
    ).textContent =
        `${visibility} km`;


    // -------------------------------------------------
    // WEATHER ICON
    // -------------------------------------------------

    const condition =
        weather.weather[0].main;

    document.getElementById(
        "weatherIcon"
    ).textContent =
        weatherIcons[condition] ||
        "🌤️";


    // -------------------------------------------------
    // UV
    // -------------------------------------------------

    displayUVIndex(
        forecast
    );


    // -------------------------------------------------
    // RAIN CHANCE
    // -------------------------------------------------

    calculateRainChance(
        forecast
    );


    // -------------------------------------------------
    // SUNRISE
    // -------------------------------------------------

    if (
        weather.sys &&
        weather.sys.sunrise
    ) {

        document.getElementById(
            "sunrise"
        ).textContent =
            formatTime(
                weather.sys.sunrise
            );

    } else if (
        forecast.daily &&
        forecast.daily.sunrise
    ) {

        document.getElementById(
            "sunrise"
        ).textContent =
            formatISOTime(
                forecast.daily.sunrise[0]
            );

    }


    // -------------------------------------------------
    // SUNSET
    // -------------------------------------------------

    if (
        weather.sys &&
        weather.sys.sunset
    ) {

        document.getElementById(
            "sunset"
        ).textContent =
            formatTime(
                weather.sys.sunset
            );

    } else if (
        forecast.daily &&
        forecast.daily.sunset
    ) {

        document.getElementById(
            "sunset"
        ).textContent =
            formatISOTime(
                forecast.daily.sunset[0]
            );

    }


    // -------------------------------------------------
    // SUN POSITION
    // -------------------------------------------------

    if (
        weather.sys.sunrise &&
        weather.sys.sunset
    ) {

        updateSunPosition(
            weather.sys.sunrise,
            weather.sys.sunset
        );

    }


    // -------------------------------------------------
    // HOURLY
    // -------------------------------------------------

    displayHourlyForecast(
        forecast
    );


    // -------------------------------------------------
    // 7 DAYS
    // -------------------------------------------------

    displaySevenDayForecast(
        forecast
    );

}


// =====================================================
// HOURLY FORECAST
// =====================================================

function displayHourlyForecast(
    forecast
) {

    hourlyForecast.innerHTML = "";

    if (
        !forecast.hourly ||
        !forecast.hourly.time
    ) {

        return;
    }


    const times =
        forecast.hourly.time.slice(
            0,
            12
        );


    times.forEach(
        (timeString, index) => {

            const temperature =
                forecast.hourly
                    .temperature_2m[index];


            const weatherCode =
                forecast.hourly
                    .weather_code[index];


            const icon =
                getWeatherIcon(
                    weatherCode
                );


            const time =
                index === 0
                    ? "Now"
                    : formatISOHour(
                        timeString
                    );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "hour-card";


            if (index === 0) {

                card.classList.add(
                    "active"
                );

            }


            card.innerHTML = `

                <p>
                    ${time}
                </p>

                <span>
                    ${icon}
                </span>

                <strong>
                    ${Math.round(
                        temperature
                    )}°
                </strong>

            `;


            // Click interaction

            card.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".hour-card"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    card.classList.add(
                        "active"
                    );

                }
            );


            hourlyForecast.appendChild(
                card
            );

        }
    );

}


// =====================================================
// 7 DAY FORECAST
// =====================================================

function displaySevenDayForecast(
    forecast
) {

    sevenDayForecast.innerHTML = "";


    if (
        !forecast.daily ||
        !forecast.daily.time
    ) {

        return;
    }


    // Exactly 7 days

    const days =
        forecast.daily.time.slice(
            0,
            7
        );


    days.forEach(
        (dateString, index) => {

            const date =
                new Date(
                    `${dateString}T12:00:00`
                );


            // Day name

            const dayName =
                index === 0
                    ? "Today"
                    : date.toLocaleDateString(
                        "en-US",
                        {
                            weekday: "short"
                        }
                    );


            // Date

            const dateName =
                date.toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric"
                    }
                );


            // Weather code

            const weatherCode =
                forecast.daily
                    .weather_code[index];


            // Icon

            const icon =
                getWeatherIcon(
                    weatherCode
                );


            // Description

            const description =
                getWeatherDescription(
                    weatherCode
                );


            // Temperatures

            const maxTemp =
                Math.round(
                    forecast.daily
                        .temperature_2m_max[index]
                );


            const minTemp =
                Math.round(
                    forecast.daily
                        .temperature_2m_min[index]
                );


            // Rain

            const rainChance =
                forecast.daily
                    .precipitation_probability_max[index] ?? 0;


            // Card

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "forecast-card";


            card.innerHTML = `

                <div>

                    <strong>
                        ${dayName}
                    </strong>

                    <p>
                        ${dateName}
                    </p>

                </div>


                <span
                    class="forecast-icon"
                    title="${description}"
                >
                    ${icon}
                </span>


                <div class="forecast-temp">

                    <strong>
                        ${maxTemp}°
                    </strong>

                    <span>
                        ${minTemp}°
                    </span>

                </div>

            `;


            // Click

            card.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".forecast-card"
                        )
                        .forEach(
                            item => {

                                item.style.transform =
                                    "";

                            }
                        );


                    card.style.transform =
                        "translateX(7px)";

                }
            );


            sevenDayForecast.appendChild(
                card
            );

        }
    );

}


// =====================================================
// UV INDEX
// =====================================================

function displayUVIndex(
    forecast
) {

    const uvElement =
        document.getElementById(
            "uvIndex"
        );


    if (
        forecast.daily &&
        forecast.daily.uv_index_max &&
        forecast.daily.uv_index_max.length
    ) {

        const uv =
            forecast.daily
                .uv_index_max[0];


        uvElement.textContent =
            Math.round(uv);

    } else {

        uvElement.textContent =
            "--";

    }

}


// =====================================================
// RAIN CHANCE
// =====================================================

function calculateRainChance(
    forecast
) {

    const rainElement =
        document.getElementById(
            "rainChance"
        );


    if (
        forecast.daily &&
        forecast.daily
            .precipitation_probability_max
    ) {

        const rain =
            forecast.daily
                .precipitation_probability_max[0];


        rainElement.textContent =
            `${Math.round(
                rain ?? 0
            )}%`;

    } else {

        rainElement.textContent =
            "0%";

    }

}


// =====================================================
// CURRENT LOCATION BUTTON
// =====================================================

locationBtn.addEventListener(
    "click",
    () => {

        hideError();


        if (
            !navigator.geolocation
        ) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;
        }


        showLoading();


        navigator.geolocation.getCurrentPosition(

            position => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                getWeatherByCoordinates(
                    latitude,
                    longitude
                );

            },

            error => {

                hideLoading();


                if (
                    error.code ===
                    error.PERMISSION_DENIED
                ) {

                    showError(
                        "Location permission was denied. Please allow location access."
                    );

                } else if (
                    error.code ===
                    error.POSITION_UNAVAILABLE
                ) {

                    showError(
                        "Your location could not be determined."
                    );

                } else {

                    showError(
                        "Location request timed out."
                    );

                }

            },

            {
                enableHighAccuracy: true,

                timeout: 10000,

                maximumAge: 0

            }

        );

    }
);


// =====================================================
// THEME BUTTON
// =====================================================

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-mode"
        );


        const lightMode =
            document.body.classList.contains(
                "light-mode"
            );


        if (lightMode) {

            themeBtn.textContent =
                "☀️";

            localStorage.setItem(
                "weatherTheme",
                "light"
            );

        } else {

            themeBtn.textContent =
                "🌙";

            localStorage.setItem(
                "weatherTheme",
                "dark"
            );

        }

    }
);


// =====================================================
// LOAD THEME
// =====================================================

function loadSavedTheme() {

    const savedTheme =
        localStorage.getItem(
            "weatherTheme"
        );


    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-mode"
        );

        themeBtn.textContent =
            "☀️";

    } else {

        themeBtn.textContent =
            "🌙";

    }

}


// =====================================================
// DATE
// =====================================================

function updateDate() {

    const dateElement =
        document.getElementById(
            "date"
        );


    const now =
        new Date();


    const formatted =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );


    dateElement.textContent =
        formatted;

}


// =====================================================
// FORMAT OPENWEATHER UNIX TIME
// =====================================================

function formatTime(
    timestamp
) {

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


// =====================================================
// FORMAT OPEN-METEO TIME
// =====================================================

function formatISOTime(
    value
) {

    if (!value) {
        return "--";
    }


    const date =
        new Date(value);


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// =====================================================
// FORMAT HOURLY TIME
// =====================================================

function formatISOHour(
    value
) {

    if (!value) {
        return "--";
    }


    const date =
        new Date(value);


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// =====================================================
// CAPITALIZE
// =====================================================

function capitalize(
    text
) {

    if (!text) {
        return "";
    }


    return text
        .split(" ")
        .map(
            word =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");

}


// =====================================================
// SUN POSITION
// =====================================================

function updateSunPosition(
    sunrise,
    sunset
) {

    const now =
        Date.now() / 1000;


    const total =
        sunset - sunrise;


    const passed =
        now - sunrise;


    let percentage =
        (passed / total) * 100;


    percentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );


    const sunDot =
        document.getElementById(
            "sunDot"
        );


    if (sunDot) {

        sunDot.style.left =
            `${percentage}%`;

    }

}


// =====================================================
// SHOW LOADING
// =====================================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );


    weatherContent.classList.add(
        "hidden"
    );

}


// =====================================================
// HIDE LOADING
// =====================================================

function hideLoading() {

    loading.classList.add(
        "hidden"
    );


    weatherContent.classList.remove(
        "hidden"
    );

}


// =====================================================
// SHOW ERROR
// =====================================================

function showError(
    message
) {

    errorMessage.textContent =
        message;

}


// =====================================================
// HIDE ERROR
// =====================================================

function hideError() {

    errorMessage.textContent =
        "";

}