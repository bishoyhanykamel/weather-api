////////////////////////////////////////////////////////////////////
// Init setup
"use strict";
const BASE_API_URL = "http://api.weatherapi.com/v1/forecast.json";
const API_KEY = "f40f32f309994030b4d121222241701";

const START_CITY = "Cairo";
let lastSearchParam = "";

getLocationWeatherByName('cairo');

////////////////////////////////////////////////////////////////////
// Event listeners

$("#countryInput").on("keyup", function () {
  let value = $(this).val();
  if (value.length > 2 && lastSearchParam != value) {
    lastSearchParam = value;
    getLocationWeatherByName(value);
  }
});

////////////////////////////////////////////////////////////////////
// API calling

function getLocationWeatherByName(search) {
  fetch(`${BASE_API_URL}?key=${API_KEY}&q=${search}&days=3`)
    .then((response) => {
      if (response.ok) return response.json();
      else return;
    })
    .then((data) => {
        if (data === undefined) return;
      // map data
      const mappedData = mapResult(data);
      if (mappedData.locationName != $("#locationName").text) {
        const oldCards = document.querySelectorAll("[--data-added-card]");
        oldCards.forEach((card) => {
          card.remove();
        });
        // update main card
        $("#locationName").text(mappedData.locationName);
        $("#windDirection").text(mappedData.windDirection);
        $("#rainPercentage").text(mappedData.rainPercentage);
        $("#windSpeed").text(mappedData.windSpeed);
        updateMainCardWeather(mappedData.days[0]);

        // create secondary cards
        addCards(mappedData.days[1], mappedData.days[2]);
      }
    });
}

////////////////////////////////////////////////////////////////////
// UI functions

function updateMainCardWeather(data) {
  $("#date").text(data.date);
  $("#day").text(data.day);
  $("#weatherIcon").attr("src", `${data.Icon}`);
  $("#temperature").text(data.temperature);
  $("#weatherState").text(data.weatherState);
}

function addCards(...cardData) {
  for (let i = 0; i < cardData.length; i++) {
    let cardLiteral = `
    <div class="col-lg-4 d-flex" --data-added-card>
            <div class="card flex-grow-1">
              <div class="card-header text-center">
                <p class="date mb-0">${cardData[i].day}</p>
              </div>
              <div class="card-body d-flex flex-column justify-content-center align-items-md-center gap-2 text-center">
                <div class="card-text">
                <img src="${cardData[i].Icon}" class="fs-4 mb-0" alt="">
                  <p class="fs-1 m-2">${cardData[i].temperature} &deg;C</p>
                  <p class="fs-4 mb-2 color-primary">${cardData[i].weatherState}</p>
                </div>
              </div>

            </div>
          </div>`;

    document.querySelector("#cards").innerHTML += cardLiteral;
  }
}

////////////////////////////////////////////////////////////////////
// Mapping function
function mapResult(data) {
  const locationWeatherDays = [];
  for (const day of data.forecast.forecastday) {
    locationWeatherDays.push(extractDayWeather(day));
  }
  const mappedObj = {
    days: locationWeatherDays,
    locationName: data.location.name,
    windSpeed: data.current.wind_kph,
    windDirection: translateWindDirection(data.current.wind_dir),
    rainPercentage: `${Math.trunc(data.current.pressure_in)}%`,
  };
  return mappedObj;
}

////////////////////////////////////////////////////////////////////
// Helper functions
function extractDayWeather(obj) {
  const dayWeather = {};
  // map date data
  let date = new Date(obj.date).toDateString().split(" ");
  dayWeather.day = date[0];
  dayWeather.date = [date[2], date[1]].join(" ");

  // map weather details
  dayWeather.Icon = `http://${obj.day.condition.icon.substring(2)}`;
  dayWeather.temperature = obj.day.avgtemp_c;
  dayWeather.weatherState = obj.day.condition.text;

  return dayWeather;
}

function translateWindDirection(dir) {
  switch (dir) {
    case "N":
      return "North";
    case "S":
      return "South";
    case "E":
      return "East";
    case "W":
      return "West";
    case "SW":
      return "South West";
    case "SE":
      return "South East";
    case "NE":
      return "North East";
    case "NW":
      return "North West";
    default:
      return dir;
  }
}
