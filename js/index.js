// API KEY: f40f32f309994030b4d121222241701
// example query: http://api.weatherapi.com/v1/search.json?key=f40f32f309994030b4d121222241701&q=lon
"use strict";
const BASE_API_URL = "http://api.weatherapi.com/v1/forecast.json";
const API_KEY = "f40f32f309994030b4d121222241701";

const START_CITY = "Cairo";

let lastSearchParam = "";

$("#countryInput").on("keyup", function () {
  let value = $(this).val();
  if (value.length > 2 && lastSearchParam != value) {
    lastSearchParam = value;
    getLocationWeatherByName(value);
  }
});

function getLocationWeatherByName(search) {
  fetch(`${BASE_API_URL}?key=${API_KEY}&q=${search}&days=3`)
    .then((response) => {
      if (response.ok) return response.json();
    })
    .then((data) => {
      // map data
      const mappedData = mapResult(data);
      // update ui
      $('#locationName').text(mappedData.locationName);
      $('#windDirection').text(mappedData.windDirection);
      $('#rainPercentage').text(mappedData.rainPercentage);
      $('#windSpeed').text(mappedData.windSpeed);
      console.log(mappedData.date);
      $('#date').text(mappedData.days[0].date);
      $('#day').text(mappedData.days[0].day);
      $('#weatherIcon').attr('src', `${mappedData.days[0].Icon}`);
      $('#temperature').text(mappedData.days[0].temperature);
      $('#weatherState').text(mappedData.days[0].weatherState);
    });
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
  console.log(mappedObj);
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
