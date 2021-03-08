import React, { useState, useRef, useEffect } from "react";
import style from "./App.module.scss";

const App = () => {
  const [cities, setCities] = useState();
  const [popularCities, setPopularCities] = useState();
  const [popularCitiesByDeparture, setPopularCitiesByDeparture] = useState();

  const [isEmpty, setIsEmpty] = useState(true);
  const [isFocus, setIsFocus] = useState(false);
  const [focus, setFocus] = useState({ departure: false, arrival: false });
  const [message, setMessage] = useState(null);

  //Ref the 2 inputs
  const departureInput = useRef();
  const arrivalInput = useRef();

  //Fetching popular cities first
  useEffect(() => {
    const fetchPopularCities = async () => {
      const response = await fetch(
        "https://api.comparatrip.eu/cities/popular/5"
      );
      const jsonData = await response.json();
      setPopularCities(jsonData);
    };
    fetchPopularCities();
  }, []);

  //Fetch cities in terms of query params from inputs values
  const fetchCitiesFromInput = async (city) => {
    const response = await fetch(
      `https://api.comparatrip.eu/cities/autocomplete/?q=${city}`
    );
    const jsonData = await response.json();
    setCities(jsonData);
  };

  //Fetch popular cities for arrival in terms of query params from departure input value
  const fetchPopularCitiesFromDeparture = async (city) => {
    const response = await fetch(
      `https://api.comparatrip.eu/cities/popular/from/${city}/5`
    );
    const jsonData = await response.json();
    setPopularCitiesByDeparture(jsonData);
  };

  //Get value from the searchResult element OnClick
  const getValue = (cityName) => {
    if (focus.departure) {
      departureInput.current.value = cityName;
    } else if (focus.arrival) {
      arrivalInput.current.value = cityName;
    }
  };

  //Boolean to check which input is currently focus
  const whichInputIsFocus = (inputName) => {
    if (inputName === "departure") {
      setFocus({ departure: true, arrival: false });
    } else if (inputName === "arrival") {
      setFocus({ departure: false, arrival: true });
    } else {
      setFocus({ departure: false, arrival: false });
    }
  };

  //OnChange bind on inputs
  const handleChange = (e) => {
    const { value, name } = e.target;

    if (value !== "") {
      fetchCitiesFromInput(value);
      setIsEmpty(false);
      whichInputIsFocus(name);
    } else {
      setIsEmpty(true);
    }
  };

  //Determined if input is focus to set the hidden or not classname
  const handleFocus = (e) => {
    const { name } = e.target;
    whichInputIsFocus(name);
    setIsFocus(true);

    if (departureInput.current.value !== "" && name === "arrival") {
      fetchPopularCitiesFromDeparture(departureInput.current.value);
    }
  };

  //Determined if input is focus to set the hidden or not classname
  const handleNoFocus = () => {
    // Have to seTimeout, because of Focus set to false which cause hidden class and the
    // element disapear instant from the DOM, without recover value
    setTimeout(() => {
      setIsFocus(false);
    }, 100);
  };

  //At the submit of the form check if values are !== from "" on inputs and adapt message
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      departureInput.current.value === "" &&
      arrivalInput.current.value === ""
    ) {
      setMessage(
        `Veuillez saisir une gare de départ
         Veuillez saisir une gare d’arrivée`
      );
    } else if (arrivalInput.current.value === "") {
      setMessage("Veuillez saisir une gare d’arrivée");
    } else if (departureInput.current.value === "") {
      setMessage("Veuillez saisir une gare de départ");
    } else {
      setMessage(null);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        {/* nth-child(1) */}
        <div>
          <div>
            <span>Départ</span>
            <input
              name="departure"
              placeholder="Gare ou Ville"
              ref={departureInput}
              onInput={handleChange}
              onFocus={handleFocus}
              onBlur={handleNoFocus}
            />
          </div>
          <hr />
          <div>
            <span>Aller</span>
            <input
              name="arrival"
              placeholder="Gare ou Ville"
              ref={arrivalInput}
              onInput={handleChange}
              onFocus={handleFocus}
              onBlur={handleNoFocus}
            />
          </div>
        </div>

        {/* nth-child(2) */}
        <div>
          <div>
            <span>Aller</span>
            <input name="departureDate" type="date" />
          </div>
          <hr />
          <div>
            <span>+ Ajouter un retour</span>
            <input name="arrivalDate" />
          </div>
        </div>

        {/* nth-child(3) */}
        <div>
          <h4>1 adulte (26-59)</h4>
          <p>Ajouter une carte</p>
        </div>

        {/* nth-child(4) */}
        <div className={message !== null ? style.message : style.hidden}>
          {message}
        </div>

        {/* nth-child(5) */}
        <p>+ Ajouter un code de réduction</p>
        <button type="submit">Rechercher</button>
      </form>

      <div className={isFocus ? style.searchResult : style.hidden}>
        <p>{isEmpty ? <span>Populaires</span> : null}</p>
        {isEmpty
          ? popularCities?.map((popularCity, i) => (
              <div
                key={i}
                onClick={() => {
                  getValue(popularCity.unique_name);
                }}
              >
                <p>{popularCity.unique_name}</p>
                <p>{popularCity.gpuid.substring(2, 4)}</p>
              </div>
            ))
          : cities?.map((city, i) => (
              <div key={i} onClick={() => getValue(city.unique_name)}>
                <p>{city.unique_name}</p>
                <p>{city.gpuid.substring(2, 4)}</p>
              </div>
            ))}
      </div>
    </main>
  );
};

export default App;
