// =====================================================
// WEATHERLY - PRODUCTION JAVASCRIPT
// No API key required
// Data: Open-Meteo
// =====================================================


// =====================================================
// API
// =====================================================

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const REVERSE_GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/reverse";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const AIR_API =
    "https://air-quality-api.open-meteo.com/v1/air-quality";


// =====================================================
// DOM
// =====================================================

const $ = (id) =>
    document.getElementById(id);


const searchForm =
    $("searchForm");

const cityInput =
    $("cityInput");

const searchSuggestions =
    $("searchSuggestions");

const favoritesPanel =
    $("favoritesPanel");

const favoritesList =
    $("favoritesList");

const closeFavorites =
    $("closeFavorites");

const favoritesBtn =
    $("favoritesBtn");

const refreshBtn =
    $("refreshBtn");

const unitBtn =
    $("unitBtn");

const locationBtn =
    $("locationBtn");

const themeBtn =
    $("themeBtn");

const favoriteCurrentBtn =
    $("favoriteCurrentBtn");

const loading =
    $("loading");

const weatherContent =
    $("weatherContent");

const errorMessage =
    $("errorMessage");

const hourlyForecast =
    $("hourlyForecast");

const sevenDayForecast =
    $("sevenDayForecast");


// =====================================================
// STATE
// =====================================================

let currentLocation = null;

let currentWeather = null;

let currentForecast = null;

let currentAir = null;

let searchTimer = null;

let requestCounter = 0;

let unit =
    localStorage.getItem("weatherUnit") || "C";

let favorites =
    JSON.parse(
        localStorage.getItem(
            "weatherFavorites"
        ) || "[]"
    );

let recentSearches =
    JSON.parse(
        localStorage.getItem(
            "weatherRecent"
        ) || "[]"
    );


// =====================================================
// WEATHER CODES
// =====================================================

const WEATHER_CODES = {

    0: ["☀️", "Clear Sky"],

    1: ["🌤️", "Mainly Clear"],

    2: ["🌤️", "Partly Cloudy"],

    3: ["☁️", "Overcast"],

    45: ["🌫️", "Fog"],

    48: ["🌫️", "Fog"],

    51: ["🌦️", "Light Drizzle"],

    53: ["🌦️", "Drizzle"],

    55: ["🌦️", "Heavy Drizzle"],

    56: ["🌧️", "Freezing Drizzle"],

    57: ["🌧️", "Freezing Drizzle"],

    61: ["🌧️", "Light Rain"],

    63: ["🌧️", "Rain"],

    65: ["🌧️", "Heavy Rain"],

    66: ["🌧️", "Freezing Rain"],

    67: ["🌧️", "Heavy Freezing Rain"],

    71: ["❄️", "Light Snow"],

    73: ["❄️", "Snow"],

    75: ["❄️", "Heavy Snow"],

    77: ["❄️", "Snow Grains"],

    80: ["🌦️", "Rain Showers"],

    81: ["🌦️", "Rain Showers"],

    82: ["🌧️", "Heavy Rain Showers"],

    95: ["⛈️", "Thunderstorm"],

    96: ["⛈️", "Thunderstorm"],

    99: ["⛈️", "Heavy Thunderstorm"]

};


// =====================================================
// BASIC HELPERS
// =====================================================

function getWeatherCode(code) {

    return WEATHER_CODES[code] ||
        ["🌤️", "Weather"];

}


function convertTemperature(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {

        return "--";

    }


    const celsius =
        Number(value);


    if (unit === "F") {

        return Math.round(
            (celsius * 9) / 5 + 32
        );

    }


    return Math.round(celsius);

}


function temperatureText(value) {

    return `${convertTemperature(value)}°`;

}


function getUnitSymbol() {

    return unit === "C"
        ? "°C"
        : "°F";

}


function convertWind(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "--";

    }


    const kmh =
        Number(value);


    if (unit === "F") {

        return `${Math.round(
            kmh * 0.621371
        )} mph`;

    }


    return `${Math.round(kmh)} km/h`;

}


function capitalize(text) {

    if (!text) {
        return "";
    }


    return String(text)
        .split(" ")
        .map(
            word =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");

}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function formatTime(value) {

    if (!value) {
        return "--";
    }


    return new Date(value)
        .toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

}


function formatDay(date, index) {

    const d =
        new Date(`${date}T12:00:00`);


    if (index === 0) {
        return "Today";
    }


    return d.toLocaleDateString(
        [],
        {
            weekday: "short"
        }
    );

}


function formatDate(date) {

    return new Date(
        `${date}T12:00:00`
    ).toLocaleDateString(
        [],
        {
            month: "short",
            day: "numeric"
        }
    );

}


function formatWindDirection(degrees) {

    if (
        degrees === null ||
        degrees === undefined
    ) {

        return "--";

    }


    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];


    const index =
        Math.round(
            Number(degrees) / 45
        ) % 8;


    return `${directions[index]} (${Math.round(
        degrees
    )}°)`;

}


// =====================================================
// STORAGE
// =====================================================

function saveState() {

    localStorage.setItem(
        "weatherUnit",
        unit
    );


    localStorage.setItem(
        "weatherFavorites",
        JSON.stringify(favorites)
    );


    localStorage.setItem(
        "weatherRecent",
        JSON.stringify(recentSearches)
    );

}


// =====================================================
// THEME
// =====================================================

function loadTheme() {

    const theme =
        localStorage.getItem(
            "weatherTheme"
        );


    if (theme === "light") {

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


function toggleTheme() {

    const light =
        document.body.classList.toggle(
            "light-mode"
        );


    localStorage.setItem(
        "weatherTheme",
        light
            ? "light"
            : "dark"
    );


    themeBtn.textContent =
        light
            ? "☀️"
            : "🌙";

}


// =====================================================
// UNIT
// =====================================================

function updateUnitButton() {

    unitBtn.textContent =
        unit === "C"
            ? "°C"
            : "°F";

}


function toggleUnit() {

    unit =
        unit === "C"
            ? "F"
            : "C";


    saveState();

    updateUnitButton();


    if (
        currentWeather &&
        currentForecast
    ) {

        displayWeather(
            currentWeather,
            currentForecast,
            currentAir
        );

    }

}


// =====================================================
// UI STATES
// =====================================================

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


function showError(message) {

    errorMessage.textContent =
        message;

}


function hideError() {

    errorMessage.textContent =
        "";

}


// =====================================================
// DATE
// =====================================================

function updateDate() {

    $("date").textContent =
        new Intl.DateTimeFormat(
            [],
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        ).format(
            new Date()
        );

}


// =====================================================
// SEARCH LOCATIONS
// =====================================================

async function findLocations(query) {

    const text =
        query.trim();


    if (!text) {
        return [];
    }


    try {

        const response =
            await fetch(
                `${GEOCODING_API}?name=${encodeURIComponent(
                    text
                )}&count=10&language=en&format=json`
            );


        if (!response.ok) {

            throw new Error(
                "Location search failed"
            );

        }


        const data =
            await response.json();


        return (data.results || [])
            .map(item => ({

                latitude:
                    item.latitude,

                longitude:
                    item.longitude,

                name:
                    item.name,

                state:
                    item.admin1 ||
                    item.admin2 ||
                    "",

                country:
                    item.country ||
                    "",

                countryCode:
                    item.country_code ||
                    ""

            }));


    } catch (error) {

        console.error(
            "Location Search:",
            error
        );

        return [];

    }

}


// =====================================================
// SEARCH SUGGESTIONS
// =====================================================

function renderSuggestions(
    locations
) {

    searchSuggestions.innerHTML =
        "";


    if (!locations.length) {

        searchSuggestions.classList.add(
            "hidden"
        );

        return;

    }


    locations
        .slice(0, 7)
        .forEach(location => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "suggestion-item";


            button.innerHTML = `

                <span>
                    📍
                </span>

                <span class="suggestion-text">

                    <strong>
                        ${escapeHTML(
                            location.name
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            [
                                location.state,
                                location.country
                            ]
                                .filter(Boolean)
                                .join(", ")
                        )}
                    </small>

                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    searchSuggestions
                        .classList
                        .add("hidden");

                    cityInput.value =
                        location.name;

                    getWeatherFromLocation(
                        location
                    );

                }
            );


            searchSuggestions.appendChild(
                button
            );

        });


    searchSuggestions.classList.remove(
        "hidden"
    );

}


// =====================================================
// CURRENT LOCATION
// =====================================================

async function reverseGeocode(
    latitude,
    longitude
) {

    try {

        const response =
            await fetch(
                `${REVERSE_GEOCODING_API}?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
            );


        if (!response.ok) {
            return null;
        }


        const data =
            await response.json();


        const item =
            data.results?.[0];


        if (!item) {
            return null;
        }


        return {

            latitude:
                item.latitude,

            longitude:
                item.longitude,

            name:
                item.name,

            state:
                item.admin1 ||
                item.admin2 ||
                "",

            country:
                item.country ||
                ""

        };


    } catch (error) {

        console.error(
            "Reverse Geocoding:",
            error
        );

        return null;

    }

}


// =====================================================
// WEATHER API
// =====================================================

async function getWeatherData(
    latitude,
    longitude
) {

    const url =
        `${WEATHER_API}?` +

        `latitude=${latitude}` +

        `&longitude=${longitude}` +

        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility` +

        `&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m` +

        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant` +

        `&timezone=auto` +

        `&forecast_days=7`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Weather forecast could not be loaded."
        );

    }


    return response.json();

}


// =====================================================
// AIR QUALITY
// =====================================================

async function getAirQuality(
    latitude,
    longitude
) {

    try {

        const url =
            `${AIR_API}?` +

            `latitude=${latitude}` +

            `&longitude=${longitude}` +

            `&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone` +

            `&timezone=auto`;


        const response =
            await fetch(url);


        if (!response.ok) {
            return null;
        }


        return await response.json();


    } catch (error) {

        console.warn(
            "Air quality unavailable:",
            error
        );

        return null;

    }

}


// =====================================================
// GET WEATHER
// =====================================================

async function getWeather(
    search
) {

    const query =
        search.trim();


    if (!query) {

        showError(
            "Please enter a city, village or locality."
        );

        cityInput.focus();

        return;

    }


    const id =
        ++requestCounter;


    showLoading();

    hideError();

    searchSuggestions.classList.add(
        "hidden"
    );


    try {

        const locations =
            await findLocations(
                query
            );


        if (id !== requestCounter) {
            return;
        }


        if (!locations.length) {

            throw new Error(
                `Location "${query}" was not found. Try adding the district or state name.`
            );

        }


        await getWeatherFromLocation(
            locations[0],
            id
        );


    } catch (error) {

        if (id !== requestCounter) {
            return;
        }


        console.error(
            "Weather Error:",
            error
        );


        showError(
            error.message ||
            "Unable to load weather."
        );


        hideLoading();

    }

}


// =====================================================
// WEATHER FROM LOCATION
// =====================================================

async function getWeatherFromLocation(
    location,
    parentRequestId = ++requestCounter
) {

    const id =
        parentRequestId;


    showLoading();

    hideError();


    try {

        const [
            weather,
            air
        ] =
            await Promise.all([
                getWeatherData(
                    location.latitude,
                    location.longitude
                ),

                getAirQuality(
                    location.latitude,
                    location.longitude
                )
            ]);


        if (
            id !== requestCounter
        ) {

            return;

        }


        currentLocation = {

            latitude:
                location.latitude,

            longitude:
                location.longitude,

            name:
                location.name,

            state:
                location.state || "",

            country:
                location.country || ""

        };


        currentWeather =
            weather;


        currentForecast =
            weather;


        currentAir =
            air;


        addRecent(
            currentLocation
        );


        displayWeather(
            weather,
            weather,
            air
        );


        cityInput.value =
            "";


    } catch (error) {

        if (
            id !== requestCounter
        ) {

            return;

        }


        console.error(
            error
        );


        showError(
            error.message ||
            "Unable to load weather."
        );


    } finally {

        if (
            id === requestCounter
        ) {

            hideLoading();

        }

    }

}


// =====================================================
// DISPLAY WEATHER
// =====================================================

function displayWeather(
    weather,
    forecast,
    air
) {

    const current =
        weather.current;


    const daily =
        forecast.daily;


    // LOCATION

    $("cityName").textContent =
        currentLocation
            ? `${currentLocation.name}${
                currentLocation.state
                    ? ", " + currentLocation.state
                    : ""
            }`
            : "Current Location";


    // DATE

    updateDate();


    // TEMPERATURE

    $("temperature").textContent =
        convertTemperature(
            current.temperature_2m
        );


    $("temperature")
        .nextElementSibling
        .textContent =
        getUnitSymbol();


    // FEELS LIKE

    $("feelsLike").textContent =
        `${temperatureText(
            current.apparent_temperature
        )}`;


    // DESCRIPTION

    const [
        icon,
        description
    ] =
        getWeatherCode(
            current.weather_code
        );


    $("weatherIcon").textContent =
        icon;


    $("weatherDescription")
        .textContent =
        description;


    // MIN MAX

    $("minTemp").textContent =
        temperatureText(
            daily.temperature_2m_min[0]
        );


    $("maxTemp").textContent =
        temperatureText(
            daily.temperature_2m_max[0]
        );


    // HUMIDITY

    $("humidity").textContent =
        `${Math.round(
            current.relative_humidity_2m
        )}%`;


    // WIND

    $("windSpeed").textContent =
        convertWind(
            current.wind_speed_10m
        );


    // PRESSURE

    $("pressure").textContent =
        current.pressure_msl == null
            ? "--"
            : `${Math.round(
                current.pressure_msl
            )} hPa`;


    // VISIBILITY

    if (
        current.visibility !== undefined
    ) {

        $("visibility").textContent =
            `${(
                Number(
                    current.visibility
                ) / 1000
            ).toFixed(1)} km`;

    } else {

        $("visibility").textContent =
            "--";

    }


    // UV

    $("uvIndex").textContent =
        daily.uv_index_max?.[0] == null
            ? "--"
            : Math.round(
                daily.uv_index_max[0]
            );


    // RAIN

    $("rainChance").textContent =
        daily
            .precipitation_probability_max?.[0] == null
            ? "--"
            : `${Math.round(
                daily
                    .precipitation_probability_max[0]
            )}%`;


    // WIND DIRECTION

    $("windDirection").textContent =
        formatWindDirection(
            current.wind_direction_10m
        );


    // AQI

    const aqi =
        air?.current?.us_aqi;


    if (aqi == null) {

        $("aqiValue").textContent =
            "--";

    } else {

        $("aqiValue").textContent =
            `${Math.round(aqi)} ${
                getAQILabel(aqi)
            }`;

    }


    // SUN

    $("sunrise").textContent =
        formatTime(
            daily.sunrise?.[0]
        );


    $("sunset").textContent =
        formatTime(
            daily.sunset?.[0]
        );


    updateSunPosition(
        daily.sunrise?.[0],
        daily.sunset?.[0]
    );


    // HOURLY

    displayHourlyForecast(
        forecast
    );


    // 7 DAY

    displaySevenDayForecast(
        forecast
    );


    // FAVORITE

    updateFavoriteButton();

}


// =====================================================
// AQI LABEL
// =====================================================

function getAQILabel(
    value
) {

    if (value <= 50) {
        return "Good";
    }

    if (value <= 100) {
        return "Moderate";
    }

    if (value <= 150) {
        return "Unhealthy";
    }

    if (value <= 200) {
        return "Poor";
    }

    if (value <= 300) {
        return "Very Poor";
    }

    return "Hazardous";

}


// =====================================================
// HOURLY FORECAST
// =====================================================

function displayHourlyForecast(
    forecast
) {

    hourlyForecast.innerHTML =
        "";


    const times =
        forecast.hourly?.time || [];


    const temperatures =
        forecast.hourly?.temperature_2m || [];


    const codes =
        forecast.hourly?.weather_code || [];


    const rain =
        forecast.hourly
            ?.precipitation_probability || [];


    const now =
        new Date();


    let startIndex =
        0;


    for (
        let i = 0;
        i < times.length;
        i++
    ) {

        if (
            new Date(times[i]) >= now
        ) {

            startIndex = i;

            break;

        }

    }


    for (
        let i = startIndex;
        i < Math.min(
            startIndex + 12,
            times.length
        );
        i++
    ) {

        const [
            icon
        ] =
            getWeatherCode(
                codes[i]
            );


        const card =
            document.createElement(
                "button"
            );


        card.type =
            "button";


        card.className =
            "hour-card";


        if (i === startIndex) {

            card.classList.add(
                "active"
            );

        }


        card.innerHTML = `

            <p>
                ${
                    i === startIndex
                        ? "Now"
                        : formatTime(times[i])
                }
            </p>

            <span>
                ${icon}
            </span>

            <strong>
                ${temperatureText(
                    temperatures[i]
                )}
            </strong>

        `;


        card.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".hour-card"
                    )
                    .forEach(
                        item =>
                            item.classList
                                .remove(
                                    "active"
                                )
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

}


// =====================================================
// 7 DAY FORECAST
// =====================================================

function displaySevenDayForecast(
    forecast
) {

    sevenDayForecast.innerHTML =
        "";


    const daily =
        forecast.daily;


    if (
        !daily ||
        !daily.time
    ) {

        return;

    }


    daily.time
        .slice(0, 7)
        .forEach(
            (date, index) => {

                const [
                    icon,
                    description
                ] =
                    getWeatherCode(
                        daily.weather_code[index]
                    );


                const rain =
                    daily
                        .precipitation_probability_max[
                            index
                        ] ?? 0;


                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


                card.className =
                    "forecast-card";


                card.innerHTML = `

                    <div class="forecast-day">

                        <strong>
                            ${formatDay(
                                date,
                                index
                            )}
                        </strong>

                        <p>
                            ${formatDate(date)}
                        </p>

                    </div>


                    <div class="forecast-middle">

                        <span
                            class="forecast-icon"
                            title="${description}">
                            ${icon}
                        </span>

                        <small>
                            ${Math.round(
                                rain
                            )}% rain
                        </small>

                    </div>


                    <div class="forecast-temp">

                        <strong>
                            ${temperatureText(
                                daily
                                    .temperature_2m_max[
                                        index
                                    ]
                            )}
                        </strong>

                        <span>
                            ${temperatureText(
                                daily
                                    .temperature_2m_min[
                                        index
                                    ]
                            )}
                        </span>

                    </div>

                `;


                card.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".forecast-card"
                            )
                            .forEach(
                                item =>
                                    item.classList
                                        .remove(
                                            "selected"
                                        )
                            );


                        card.classList.add(
                            "selected"
                        );

                    }
                );


                sevenDayForecast
                    .appendChild(card);

            }
        );

}


// =====================================================
// SUN POSITION
// =====================================================

function updateSunPosition(
    sunrise,
    sunset
) {

    if (
        !sunrise ||
        !sunset
    ) {

        return;

    }


    const sunriseDate =
        new Date(sunrise)
            .getTime();


    const sunsetDate =
        new Date(sunset)
            .getTime();


    const now =
        Date.now();


    const total =
        sunsetDate -
        sunriseDate;


    if (total <= 0) {
        return;
    }


    let percentage =
        (
            (now - sunriseDate) /
            total
        ) * 100;


    percentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );


    $("sunDot").style.left =
        `${percentage}%`;

}


// =====================================================
// FAVORITES
// =====================================================

function locationKey(
    location
) {

    return `${location.latitude}|${location.longitude}`;

}


function isFavorite(
    location
) {

    if (!location) {
        return false;
    }


    return favorites.some(
        item =>
            locationKey(item) ===
            locationKey(location)
    );

}


function updateFavoriteButton() {

    if (!currentLocation) {
        return;
    }


    const active =
        isFavorite(
            currentLocation
        );


    favoriteCurrentBtn.textContent =
        active
            ? "★"
            : "☆";


    favoriteCurrentBtn.classList.toggle(
        "active",
        active
    );

}


function toggleFavorite() {

    if (!currentLocation) {
        return;
    }


    if (
        isFavorite(
            currentLocation
        )
    ) {

        favorites =
            favorites.filter(
                item =>
                    locationKey(item) !==
                    locationKey(currentLocation)
            );

    } else {

        favorites =
            [
                currentLocation,
                ...favorites
            ].slice(0, 10);

    }


    saveState();

    renderFavorites();

    updateFavoriteButton();

}


function renderFavorites() {

    favoritesList.innerHTML =
        "";


    if (!favorites.length) {

        favoritesList.innerHTML = `

            <div class="empty-favorites">

                No favorite locations yet.

                <br>

                Search a place and tap ☆.

            </div>

        `;

        return;

    }


    favorites.forEach(
        location => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "favorite-item";


            item.innerHTML = `

                <button
                    type="button"
                    class="favorite-open">

                    <span>
                        📍
                    </span>

                    <span>

                        <strong>
                            ${escapeHTML(
                                location.name
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                [
                                    location.state,
                                    location.country
                                ]
                                    .filter(Boolean)
                                    .join(", ")
                            )}
                        </small>

                    </span>

                </button>


                <button
                    type="button"
                    class="favorite-remove"
                    aria-label="Remove favorite">

                    ×

                </button>

            `;


            item
                .querySelector(
                    ".favorite-open"
                )
                .addEventListener(
                    "click",
                    () => {

                        favoritesPanel
                            .classList
                            .add("hidden");


                        getWeatherFromLocation(
                            location
                        );

                    }
                );


            item
                .querySelector(
                    ".favorite-remove"
                )
                .addEventListener(
                    "click",
                    () => {

                        favorites =
                            favorites.filter(
                                favorite =>
                                    locationKey(
                                        favorite
                                    ) !==
                                    locationKey(
                                        location
                                    )
                            );


                        saveState();

                        renderFavorites();

                        updateFavoriteButton();

                    }
                );


            favoritesList.appendChild(
                item
            );

        }
    );

}


// =====================================================
// RECENT SEARCH
// =====================================================

function addRecent(
    location
) {

    recentSearches =
        [
            location,
            ...recentSearches.filter(
                item =>
                    locationKey(item) !==
                    locationKey(location)
            )
        ].slice(0, 6);


    saveState();

}


// =====================================================
// EVENTS
// =====================================================

function setupEvents() {

    // SEARCH

    searchForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            getWeather(
                cityInput.value
            );

        }
    );


    // AUTOCOMPLETE

    cityInput.addEventListener(
        "input",
        () => {

            clearTimeout(
                searchTimer
            );


            const query =
                cityInput.value.trim();


            if (query.length < 2) {

                searchSuggestions
                    .classList
                    .add("hidden");

                return;

            }


            searchTimer =
                setTimeout(
                    async () => {

                        const locations =
                            await findLocations(
                                query
                            );


                        renderSuggestions(
                            locations
                        );

                    },
                    300
                );

        }
    );


    // ESCAPE

    cityInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                searchSuggestions
                    .classList
                    .add("hidden");

            }

        }
    );


    // CLICK OUTSIDE

    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    ".search-section"
                )
            ) {

                searchSuggestions
                    .classList
                    .add("hidden");

                favoritesPanel
                    .classList
                    .add("hidden");

            }

        }
    );


    // THEME

    themeBtn.addEventListener(
        "click",
        toggleTheme
    );


    // UNIT

    unitBtn.addEventListener(
        "click",
        toggleUnit
    );


    // FAVORITE CURRENT

    favoriteCurrentBtn
        .addEventListener(
            "click",
            toggleFavorite
        );


    // FAVORITES PANEL

    favoritesBtn.addEventListener(
        "click",
        () => {

            renderFavorites();

            favoritesPanel
                .classList
                .toggle("hidden");

        }
    );


    closeFavorites
        .addEventListener(
            "click",
            () => {

                favoritesPanel
                    .classList
                    .add("hidden");

            }
        );


    // REFRESH

    refreshBtn.addEventListener(
        "click",
        () => {

            if (currentLocation) {

                getWeatherFromLocation(
                    currentLocation
                );

            } else {

                getWeather(
                    cityInput.value ||
                    "New Delhi"
                );

            }

        }
    );


    // CURRENT LOCATION

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


            navigator.geolocation
                .getCurrentPosition(

                    async position => {

                        const latitude =
                            position.coords.latitude;

                        const longitude =
                            position.coords.longitude;


                        const location =
                            await reverseGeocode(
                                latitude,
                                longitude
                            );


                        await getWeatherFromLocation(

                            location || {

                                latitude,

                                longitude,

                                name:
                                    "Current Location",

                                state:
                                    "",

                                country:
                                    ""

                            }

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

                        } else {

                            showError(
                                "Unable to determine your current location."
                            );

                        }

                    },


                    {
                        enableHighAccuracy:
                            true,

                        timeout:
                            12000,

                        maximumAge:
                            300000

                    }

                );

        }
    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

function boot() {

    updateDate();

    loadTheme();

    updateUnitButton();

    renderFavorites();

    setupEvents();


    // Default weather

    getWeather(
        "New Delhi"
    );

}


document.addEventListener(
    "DOMContentLoaded",
    boot
);