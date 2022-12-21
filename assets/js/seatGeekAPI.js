
// object contianing city, state, startDate, & endDate
let data = JSON.parse(localStorage.getItem("timeLocation"));
console.log(data);		      
// pulled from chalne
let apiBase = "https://api.openweathermap.org/";
let apiKey = "83a44da7964246bbf900a3b2168f29ce";
let apiBaseWeather = apiBase + "data/2.5/forecast?";
let apiBaseLatLon = apiBase + "geo/1.0/direct?";
let apiBaseToday = apiBase + "data/2.5/weather?";
let apiLatLon = `${apiBaseLatLon}q=${data['city']},${data['state']}&limit=10&appid=${apiKey}`;
let latLong;
let weatherRes;

function getLatLon(geoJson, state) {
  for (let i=0; i<geoJson.length; i++) {
    if (geoJson[i]["state"] == state) {
      return [geoJson[i]["lat"].toFixed(2)
	      ,geoJson[i]["lon"].toFixed(2)];
    }
  }
  return console.log("State not found");
}

function pullStats(weatherEntry) {
  let entry = {date:"",
	       icon:"",
	       temp:"",
	       wind:"",
	       humidity:""
	      };
  let date = new Date(weatherEntry["dt"]*1000);
  entry["date"] = date.getFullYear()
    +'/'+('0'+(date.getMonth()+1)).slice(-2)
    +'/'+('0'+date.getDate()).slice(-2);
  entry["icon"] = weatherEntry["weather"][0]["icon"];
  entry["temp"] = weatherEntry["main"]["temp"];
  // add in line to get direction in NWSE
  entry["wind"] = weatherEntry["wind"]["speed"];
  entry["humidity"] = weatherEntry["main"]["humidity"];
  console.log(entry)
  return entry;
}


function getWeather (){
  let apiLatLon = `${apiBaseLatLon}q=${data['city']},${data['state']}&limit=10&appid=${apiKey}`;
   fetch(apiLatLon)
    .then(response => response.json())
    .then((info) =>{
      latLong = getLatLon(info,data["state"]);
      let apiWeather = `${apiBaseWeather}lat=${latLong[0]}&lon=${latLong[1]}&units=imperial&appid=${apiKey}`;
      fetch(apiWeather)
	.then(response => response.json())
	.then((info) => {
	  localStorage.setItem("weatherResponse", JSON.stringify(data["list"]));
	  console.log(info);
	  for (let i=0; i<info.length; i++) {
	    console.log(info[i]);
	    let readingTime = (info[i]["dt_txt"]).split(" ")[1];
	    if (readingTime === "12:00:00"){
	      buildForecast(pullStats(info[i]));
	    }
	  }
	  getSeatGeekData();
	  getTicketMasterData();
	});
    });
  let latLongObject = {latLon: latLong};
  data = Object.assign(data,latLongObject);

  //rewriting the data object
  localStorage.setItem("data",data)
  
  return 0;
}

//from chalenge
function buildForecast (weather) {
  console.log(weather);
  // reach into gloaal for weeather variable
  let weekForcast = $(".week-panel");
  let section = $("<section>");
  let date = $("<section>").text("DATE:");
  let icon = $("<img>");
  let temp = $("<section>");
  let wind = $("<section>");
  let humidity = $("<section>");

  date.text("Date: " + weather["date"]);
  icon.attr("src","http://openweathermap.org/img/wn/"+weather["icon"]+".png")
  temp.text("Temperature: " +weather["temp"]);
  wind.text("Wind speed: " + weather["wind"]);
  humidity.text("Humidity: " +weather["humidity"]);

  section.attr("class","box");
  section.append(date);
  section.append(icon);
  section.append(temp);
  section.append(wind);
  section.append(humidity);
  weekForcast.append(section);
  return 0;
}


function getSeatGeekData () {
  let seatGeekBase = "https://api.seatgeek.com/2/events?";
  let seatGeekClientID = "client_id=MzExMjU4NzF8MTY3MTU4MDU0NS4wMTgzOTY"
  // for location lat/lon and range
  // EX: geoip=98.213.245.205&range=12mi'
  let latLonLocation = `lat=${latLong[0]}&lon=${latLong[1]}&range=25mi`;
  let perPage = "per_page=25";
  // format for date range
  // EX: datetime_utc.gte=2012-04-01&datetime_utc.lte=2012-04-30
  let dateAPI = "datetime_utc.gte=2022-12-22&datetime_utc.lte=2022-12-30";
  let seatGeekRequest = `${seatGeekBase}${latLonLocation}&${perPage}&${dateAPI}&${seatGeekClientID}`;
  let events = {};
  //  console.log(seatGeekRequest);
  fetch(seatGeekRequest)
    .then(response => response.json())
    .then((data) => {
      console.log(data);
      for (let j=0; j<data["events"].length; j++) {
	console.log(data["events"][j]);
	buildEventTile(SGpullEventData(data["events"][j]));
      }
    });
  return 0;
}

function SGpullEventData(eventEntry) {
  let eventData = {title:"",
		   dateTime:"",
		   description:"",
		   picLink:"",
		   src:""};
  eventData["title"] = eventEntry["short_title"];
  eventData["dateTime"] = eventEntry["datetime_local"].split("T");
  eventData["description"] = eventEntry["title"];
  // TODO Fill in
  eventData["picLinik"] = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpngimg.com%2Fuploads%2Fbasketball%2Fbasketball_PNG102482.png&f=1&nofb=1&ipt=6eaac64b06eb398f9fa526440069a531d3e307b0391bf2664d8bda57818f2983&ipo=images";
  eventData["src"] = eventEntry["url"];
  
  return eventData;
}

function getTicketMasterData() {
  let TMBase = "https://app.ticketmaster.com/discovery/v2/events.json?";
  let TMLatLon = `latlong=${latLong[0]},${latLong[1]}`;
  let TMStartDate = data["startDate"];
  let TMEndDate = data["endDate"];
  let TMNumEvents = "size=25";
  let TMSort = "sort=distance,asc";
  let TMApiKey = "apikey=oecKLpxYpNXmLk9Tha8luRcIXq2AJS6d";
  let ticketMasterRequest = `${TMBase}&${TMLatLon}&${TMStartDate}&${TMEndDate}&${TMNumEvents}&${TMSort}&${TMApiKey}`;
  console.log(ticketMasterRequest);
  fetch(ticketMasterRequest)
    .then(response => response.json())
    .then((data) => {
      console.log(data);
      let TMEventData = data["_embedded"]["events"];
      for (let k=0;k<TMEventData.length; k++) {
	console.log(TMEventData[k]);
	buildEventTile(TMpullEventData(TMEventData[k]));
      }
    });
  
  return 0;
}

function TMpullEventData(eventEntry) {
  let eventData = {title:"",
		   dateTime:"",
		   description:"",
		   picLink:"",
		   src:""};
  eventData["title"] = eventEntry["name"];
  eventData["dateTime"] = eventEntry["dates"]["start"]["dateTime"].split("T");
  eventData["description"] = eventEntry["name"] +" "+ eventEntry["classifications"][0]["genre"]["name"];
  eventData["picLink"] = eventEntry["images"][0]["url"];
  eventData["src"] = eventEntry["url"];

  return eventData;
				 
}



// from resultshtml.js
function buildEventTile (eventResults) {
  // Need to make componets
  // Need to nest them together
  // place in DOM
  // info in eventResulst has the following
  // -Title
  // -DateTime
  // -Description
  // -Picture linlk
  // -Source of event

  // build shell
  let resultList = document.querySelector(".results");
  let container = document.createElement("section");
  container.setAttribute("class", "box results");
  let resultTile = document.createElement("article");
  resultTile.setAttribute("class","media");

  // build picture elements
  let ePicEl = document.createElement("img");
  ePicEl.setAttribute("src", eventResults["pic"]);
  let figureEl = document.createElement("figure");
  figureEl.setAttribute("class", "image is-64x64")
  let picSectionEl = document.createElement("section");
  picSectionEl.setAttribute("class","media-left");

  // build title and datetime items
  let eTitleEl = document.createElement("section");
  let dateEl = document.createElement("div");
  dateEl.textContent=eventResults["date"]
  let breakEl = document.createElement("br");
  let titleEl = document.createElement("strong")
  titleEl.textContent = eventResults["title"];
  eTitleEl.setAttribute("class", "colulmn is-fifth");
  let titleSectionEl = document.createElement("section");
  titleSectionEl.setAttribute("class", "content columns");
  let middleSection = document.createElement("section");
  middleSection.setAttribute("class", "media-content");
  let eDescEl = document.createElement("section");
  eDescEl.setAttribute("class" , "column is-four-fifths");
  eDescEl.textContent = eventResults["description"];
  let eSourceEl = document.createElement("a");
  eSourceEl.textContent = eventResults["source"];

  // build tile
  figureEl.appendChild(ePicEl);
  picSectionEl.appendChild(figureEl);
  eTitleEl.appendChild(dateEl);
  eTitleEl.insertBefore(breakEl, dateEl);
  eTitleEl.insertBefore(titleEl, breakEl);
  titleSectionEl.appendChild(eTitleEl);
  titleSectionEl.appendChild(eDescEl);
  middleSection.appendChild(titleSectionEl);
  resultTile.appendChild(middleSection);
  resultTile.insertBefore(picSectionEl, middleSection);
  resultList.appendChild(resultTile);

  return 0;
}





function main () {
  getWeather();
  console.log(weatherRes);

}

main();
