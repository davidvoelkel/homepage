import './style.css';
import 'core-js'
import 'whatwg-fetch'

var ES6Promise = require("es6-promise");
ES6Promise.polyfill();

console.log("start index.ts");

function locationSelected() {
  const locationInput = <HTMLInputElement>document.getElementById("location");
  locationInput.setAttribute("readonly", "readonly");

  const locationSearchButton = <HTMLInputElement>document.getElementById("location-search-button");
  locationSearchButton.setAttribute("class", "hidden");
  const locationResetButton = <HTMLInputElement>document.getElementById("location-reset-button");
  locationResetButton.setAttribute("class", "");

  const streetSearchDiv = <HTMLDivElement>document.getElementById("street-search");
  streetSearchDiv.setAttribute("class", "shown");

  let streetInput = <HTMLInputElement>document.getElementById("street");

  fetchStreets(locationInput.value)
    .then((streets) => registerAutoComplete(streetInput, streets));
}

function registerAutoComplete(inp: HTMLInputElement, suggestions: string[]) {
  /*the registerAutoComplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus: number;

  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "registerAutoComplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the registerAutoComplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < suggestions.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (suggestions[i].toUpperCase().includes(val.toUpperCase())) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = suggestions[i];
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + suggestions[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e) {
          /*insert the value for the registerAutoComplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
          (or any other open lists of autocompleted values:*/
          closeAllLists();
          locationSelected();
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
    var list = document.getElementById(this.id + "registerAutoComplete-list");
    var x = list.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x: HTMLCollectionOf<HTMLDivElement>) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x: HTMLCollectionOf<HTMLDivElement>) {
    /*a function to remove the "active" class from all registerAutoComplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt: any = undefined) {
    /*close all registerAutoComplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

async function fetchLocations(location: string) {
  const locationsResponse = await (await fetch(`https://services.elkb.info/apps/service/cfinder/locations?format=json&filter=(locSearch=${encodeURIComponent(location)})`)).json()

  return locationsResponse.result.locations?.map((location: { location: string }) => location.location);
}

async function fetchCommunity(location: string) {

  const street = (document.getElementById('street') as HTMLInputElement).value
  const communityResponse = await (await fetch(`https://services.elkb.info/apps/service/cfinder/communities?format=json&filter=(location=${encodeURIComponent(location)},street=${encodeURIComponent(street)})`)).json()
  var communitiesList = document.querySelector('#communities-list');
  while (communitiesList.firstChild) {
    communitiesList.removeChild(communitiesList.firstChild);
  }
  let dekanatsSites = {
    "2419": "57",
    "2418": "58",
    "2417": "64",
    "2422": "61",
    "2420": "62",
    "2412": "63",
    "2421": "60",
    "2415": "55",
    "2416": "56",
    "2414": "53",
    "2413": "59",
  }

  // Clone the new row and insert it into the table
  communityResponse.result.communities.forEach((community: { description: any; preferredEmail: any; tel: any; fax: any; links: any[]; street: any; pcode: string; locality: string; openingHours: any; elkbid: string;}) => {
    // @ts-ignore
    const dekantsSite = dekanatsSites[community.elkbid]
    var template = document.querySelector(dekantsSite ? '#community-template-simple' : '#community-template');
    var clone = (template as HTMLTemplateElement).content.cloneNode(true) as HTMLElement;
    var trs = clone.querySelectorAll("tr");
    console.log(community)
    if (dekantsSite) {
      let a = trs[0].getElementsByTagName("a")[0] as HTMLAnchorElement
      a.href = "https://www.segnenlassen.de/node/" + dekantsSite
      a.textContent = community.description
    } else {
      trs[0].childNodes[1].textContent = community.description;
      trs[1].childNodes[1].textContent = community.preferredEmail;
      trs[2].childNodes[1].textContent = community.tel;
      trs[3].childNodes[1].textContent = community.fax;
      if (Array.isArray(community.links)) {
        community.links.forEach((link) => {
          let a = document.createElement('a');
          a.textContent = link.url;
          a.setAttribute('href', link.url)
          trs[4].childNodes[1].appendChild(a)
          trs[4].childNodes[1].appendChild(document.createElement('br'))
        });
      } else {
        trs[4].setAttribute("style", "display:none")
      }
      trs[5].childNodes[1].textContent = community.street;
      trs[6].childNodes[1].textContent = community.pcode + ' ' + community.locality;
      trs[7].childNodes[1].textContent = community.openingHours;
    }
    communitiesList.appendChild(clone);
  });
}

async function loadBody() {
  const body = document.getElementsByTagName("body")[0]

  body.innerHTML = await (await fetch("body.html")).text();
}

async function fetchStreets(location: string) {
  const streetsResponse = await (await fetch("https://services.elkb.info/apps/service/cfinder/streets?format=json&filter=(location=" + location + ")")).json()
  console.log(streetsResponse.result)
  return streetsResponse.result.streets ?
    streetsResponse.result.streets.map((street: { street: any; }) => street.street)
        : [];
}

async function init() {
  console.log("init()");

  await loadBody();

  let locationInput = <HTMLInputElement>document.getElementById("location");

  const locationSearchButton = <HTMLInputElement>document.getElementById("location-search-button");
  locationSearchButton.addEventListener("click", async () => {
    let locations = await fetchLocations(locationInput.value);
    const errorMessage = <HTMLSpanElement>document.getElementById("error-message");
    errorMessage.setAttribute("class", "hidden");
    if (!locations || !Array.isArray(locations) || locations.length == 0) {
      errorMessage.removeAttribute("class");
    } else if (locations.length == 1) {
      locationInput.value = locations[0];
      locationSelected();
    } else if (locations.length > 1) {
      registerAutoComplete(locationInput, locations);
      locationInput.value = "";
      locationInput.focus();
      locationInput.click();
    }
  });

  locationInput.addEventListener("input", () => {
    locationSearchButton.disabled = locationInput.value?.length < 3
  });

  const searchButton = <HTMLInputElement>document.getElementById("search-button");
  searchButton.addEventListener("click", async () => await fetchCommunity(locationInput.value));
}



console.log("before setTImeout");

setTimeout(() => init(), 1)






