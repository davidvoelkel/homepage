import './style.css';

function registerAutoComplete(inp: HTMLInputElement, streets: string[]) {
  /*the registerAutoComplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus: number;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "registerAutoComplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the registerAutoComplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < streets.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (streets[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + streets[i].substr(0, val.length) + "</strong>";
        b.innerHTML += streets[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + streets[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function(e) {
          /*insert the value for the registerAutoComplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /*close the list of autocompleted values,
          (or any other open lists of autocompleted values:*/
          closeAllLists();
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

async function fetchCommunity() {

  const street = (document.getElementById('street') as HTMLInputElement).value
  const communityResponse = await (await fetch(`https://services.elkb.info/apps/service/cfinder/communities?format=json&filter=(location=Landshut,street=${encodeURIComponent(street)})`)).json()
  var communitiesList = document.querySelector('#communities-list');
  while (communitiesList.firstChild) {
    communitiesList.removeChild(communitiesList.firstChild);
  }
  console.log(communitiesList.childNodes)
  var template = document.querySelector('#community-template');

  // Clone the new row and insert it into the table
  communityResponse.result.communities.forEach((community: { description: any; preferredEmail: any; tel: any; fax: any; links: any[]; street: any; pcode: string; locality: string; openingHours: any; }) => {
    var clone = (template as HTMLTemplateElement).content.cloneNode(true) as HTMLElement;
    var trs = clone.querySelectorAll("tr");
    trs[0].childNodes[1].textContent = community.description;
    trs[1].childNodes[1].textContent = community.preferredEmail;
    trs[2].childNodes[1].textContent = community.tel;
    trs[3].childNodes[1].textContent = community.fax;
    community.links.forEach((link) => {
      let a = document.createElement('a');
      a.textContent = link.title
      a.setAttribute('href', link.url)
      trs[4].childNodes[1].appendChild(a)
      trs[4].childNodes[1].appendChild(document.createElement('br'))
    });
    // trs[4].childNodes[1].textContent = community.;
    // links: (3) [{…}, {…}, {…}]
    trs[5].childNodes[1].textContent = community.street;
    trs[6].childNodes[1].textContent = community.pcode + ' ' + community.locality;
    trs[7].childNodes[1].textContent = community.openingHours;
    // lat: "48.535668200000"
    // long: "12.145434700000"
    // trs[0].childNodes[1].textContent = community.;
    // trs[0].childNodes[1].textContent = community.;
    communitiesList.appendChild(clone);
  });
}

async function loadBody() {
  const body = document.getElementsByTagName("body")[0]
  body.innerHTML = await (await fetch("body.html")).text();
  const streetsResponse = await (await fetch("https://services.elkb.info/apps/service/cfinder/streets?format=json&filter=(location=Landshut)")).json()
  const streets = streetsResponse.result.streets.map((street: { street: any; }) => street.street);
  let input = <HTMLInputElement>document.getElementById("street");
  const searchButton = <HTMLInputElement>document.getElementById("search-button");
  searchButton.addEventListener("click", fetchCommunity);
  registerAutoComplete(input, streets);
}



setTimeout(() => loadBody(), 1)






