// Function to convert Kelvin to Fahrenheit
function kelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9 / 5 + 32).toFixed(2);
}
// Function to convert meters per second to miles per hour
function metersPerSecondToMph(metersPerSecond) {
    return (metersPerSecond * 2.23694).toFixed(2);
}

document.addEventListener("DOMContentLoaded", function () {
    const APIKey = "fefa49d3cf8fe66db7ff41a6607d1b2e";
    const cityInput = document.getElementById("cityInput");
    const submitBtn = document.getElementById("submitBtn");
    const historyContainer = document.getElementById("historyContainer");
    // const dataContainer = document.getElementById("dataContainer");
    const todayContainer = document.getElementById("today");
    const fivedayContainer = document.getElementById("5day");
    let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    // const iconMap = {
    //     "01d": "https://openweathermap.org/img/w/01d.png", // clear sky day
    //     "01n": "https://openweathermap.org/img/w/01n.png", // clear sky night
    //     "02d": "https://openweathermap.org/img/w/02d.png", // few clouds day
    //     "02n": "https://openweathermap.org/img/w/02n.png", // few clouds night
    //     "03d": "https://openweathermap.org/img/w/03d.png", // scattered clouds day
    //     "03n": "https://openweathermap.org/img/w/03n.png", // scattered clouds night
    //     // Add more mappings for other weather conditions
    // };

    // Display the 10 most recent cities in the search history
    function displayCityHistory() {
        const recentCities = searchHistory.slice(-10);
        historyContainer.innerHTML = ""
        recentCities.forEach(city => {
            const historyElement = document.createElement("p");
            historyElement.innerText = city;
            historyElement.classList.add("list-group-item");
            historyElement.addEventListener("click", () => {
                fetchWeatherData(city);
            });
            historyContainer.appendChild(historyElement);
            // Add hover effect to list items
            historyElement.addEventListener("mouseover", () => {
                historyElement.classList.add("hover-effect");
            });
            historyElement.addEventListener("mouseout", () => {
                historyElement.classList.remove("hover-effect");
            });
        });
    }
    displayCityHistory()
    submitBtn.addEventListener("click", function () {
        let city = cityInput.value;
        fetchWeatherData(city);
    });

    function fetchWeatherData(city) {
        const geocodingURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;

        fetch(geocodingURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const latitude = data.coord.lat;
                const longitude = data.coord.lon;
                const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${APIKey}`;

                searchHistory.push(city);
                searchHistory = searchHistory.slice(-10);
                localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
                displayCityHistory()
                getTodaysWeather(city)
                get5dayweather(forecastURL)
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    function getTodaysWeather(city) {
        // Fetch and display today's weather information
        const todayWeatherContainer = document.createElement("div");
        const todayWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;
        todayContainer.innerHTML = '';
        fetch(todayWeatherURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(todayWeatherData => {
                const weatherIconURL = `https://openweathermap.org/img/w/${todayWeatherData.weather[0].icon}.png`;



                todayWeatherContainer.innerHTML = `
                     <div class="card">
                         <div class="card-body">
                         <h2>Today's Weather in ${city}:</h2>
                         <img src="${weatherIconURL}" alt="Weather Icon"> <!-- Display the weather icon as an image -->
                         <p>Temperature: ${kelvinToFahrenheit(todayWeatherData.main.temp)}°F</p>
                         <p>Wind Speed: ${metersPerSecondToMph(todayWeatherData.wind.speed)} mph</p>
                         <p>Humidity: ${todayWeatherData.main.humidity}%</p>
                         </div>
                     </div>
                 `;
                todayContainer.append(todayWeatherContainer); // Prepend today's weather before the 5-day forecast
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
    function get5dayweather(forecastURL) {
        fetch(forecastURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Clear the dataContainer
                fivedayContainer.innerHTML = '';

                // Filter the weather data to get every 8th item (for 5-day forecast)
                const weatherData = data.list.filter((item, index) => index % 8 === 0);

                // Display 5-day forecast
                const forecastHeader = document.createElement("h2");
                forecastHeader.textContent = "5-Day Forecast:";
                forecastHeader.classList.add("five-day-header")
                fivedayContainer.appendChild(forecastHeader); // Add the header above the forecast

                weatherData.forEach(item => {
                    const date = new Date(item.dt_txt);
                    const dateString = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

                    const dataElement = document.createElement("div");
                    dataElement.classList.add("col-md-2", "weather-container", "card", "mb-3"); // Bootstrap classes
                    const imgUrl = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`
                    dataElement.innerHTML = `
<div class="card-body card-margin">
    <p class="card-text">${dateString}</p>
    <p class="card-text"><img src="${imgUrl}" alt="Weather Icon"></p>
    <p class="card-text">Temp: ${kelvinToFahrenheit(item.main.temp)}°F</p>
    <p class="card-text">Wind: ${metersPerSecondToMph(item.wind.speed)} mph</p>
    <p class="card-text">Humidity: ${item.main.humidity}%</p>
</div>
`;

                    fivedayContainer.appendChild(dataElement);
                });
                cityInput.value = "";
            })
    }


});