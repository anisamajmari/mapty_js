"use strict";

const containerWorkout = document.querySelector(".workouts");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputType = document.querySelector(".form__input--type");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const form = document.querySelector(".form");

class Workout {
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calculateSpeed();
  }

  calculateSpeed() {
    this.speed = this.distance / (this.duration / 60);
    console.log(this.speed);
    return this.speed;
  }
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calculatePace();
  }

  calculatePace() {
    this.pace = this.duration / this.distance;
    console.log(this.pace);
    return this.pace;
  }
}

class App {
  #map;
  #zoomLevel = 12;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getLocation();

    //Event handler
    inputType.addEventListener("change", this._toggleEvelationField);
    form.addEventListener("submit", this._newWorkout.bind(this));
  }

  _getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Cloud not get your position");
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, this.#zoomLevel);
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));

    //Render workout marker
    this.#workouts.forEach((workout) => {
      this._renderWorkoutMarker(workout);
    });
  }

  _showForm(mapEvent) {
    this.#mapEvent = mapEvent;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideFrom() {
    // prettier-ignore
    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value =""

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleEvelationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((input) => input > 0);

    e.preventDefault();

    const type = inputType.value;
    const distance = inputDistance.value;
    const duration = inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (type === "running") {
      const cadence = +inputCadence.value;
      if (
        validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        return alert("Inputs have to be positive numbers!");
      }
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevation = +inputElevation.value;

      if (
        !allPositive(distance, duration) ||
        validInputs(distance, duration, elevation)
      ) {
        return alert("Inputs have to be positive numbers!");
      }
      workout = new Cycling([lat, lng], distance, duration);
    }

    this.#workouts.push(workout);
    console.log(this.#workouts);

    this._renderWorkoutMarker(workout);
    this._renderWorkoutList(workout);

    this._hideFrom();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === "running" ? "🏃‍♀️" : "🚴"} workout`)
      .openPopup();
  }

  _renderWorkoutList(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="1234567890">
        <h2 class="workout__title">Description</h2>
        <div class="workout__details">
            <span class="workout__icon">🏃‍♂️</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">24</span>
            <span class="workout__unit">${workout.duration}</span>
        </div>
    `;

    form.insertAdjacentHTML("afterend", html);
  }
}

const app = new App();
