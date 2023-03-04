// JavaScript for Solar Data Demo
// Jim Skon, Kenyon College, 2023
// Using https://github.com/chartjs/Chart.js
// https://docs.google.com/document/d/1pqFQTzzB-4UMoq2QJ0riP21jfa7wyFhNyYf97Hwgo0Y/edit
const Url="http://belize.expertlearningsystem.org/Knowledge/?SessionID=1234567890:9999";
const Sites="&Query=SolarNames()";
const Watts="&Query=SolarWatts(";
const AllWatts="&Query=SolarWatts(*)";
const siteDayWatts="&Query=SolarHistory(%SITE%,qWattsmin1,%DATE%*)";
const siteInfo="&Query=SolarInfo(%SITE%)"
const allSitesHourlyWatts="&Query=SolarHistorySummary(*,qHistoryWattsHour1,%DATE%*)";
const allSitesDailyyWatts="&Query=SolarHistorySummary(*,qHistoryWattsDay1,%DATE%*)";
const SolarWattsAverageDay="&Query=SolarWattsAverageDay(8B0C4C,%DATE%"
const SolarWattsAllDayAllSites="&Query=SolarWattsAllDayAllSites(%DATE%*)";
const oneschooldailywatts= "&Query=SolarHistorySummary(8B0C4C,qHistoryWattsDay1,2023-01-29*)"
const colors= ["#ff4000", "#40ff00", "#0040ff", "#8000ff",  "#ff00ff", "#ff0080", "#ff0000", "#3333ff", "#ffff00", "#9900cc", "#006600", "#cc4400", "#990099", "#5900b3", "#f2f2f2"]
// &Query=SolarHistory(8B0AB1,qWattsmin1,2023-02-02*)
// &Query=SolarHistory(SITE,qWattsmin1,DATE*)
console.log("Start!");
const ErrSrv = '<p style="color:red">Error reading from server';
const QueryErr = '<p style="color:red">ErQuery failed';
var siteMap = {};  // A global place to store MAC to School name map
var summaryChart = 0;
var summaryWhrChart = 0;
// Add an event listener for each item in the pull down menu
function updateSiteList() {
document.querySelectorAll('.dropdown-menu a').forEach(item => {
    item.addEventListener('click', event => {
		var element = event.target;
		var site=element.textContent;

		siteMAC = element.getAttribute("value");
		console.log("pick: "+site+" "+siteMAC);
		// Get the pulldown parent
		var pullDown = element.parentElement.parentElement;
		// Get and set the selection displayed
		var selection = pullDown.querySelectorAll(".selection")[0];
		selection.innerHTML = site;
		if (site == "All") {
			getSitesWatts();
			return;
		}
		getSiteInfo(siteMAC);

    })
})
}
// Start things off by getting site list information
getSites();

//getSitesHourlylyWatts();

function clearOutput() {
	document.querySelector('#output').innerHTML = "";

}
// Todays date in for yyyy-mm-dd
function todaysDate() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	var date = yyyy +'-'+ mm +'-'+ dd;
	return date;

}

// Get time from date
function getTime(date) {
	var time = date.substr(-8);
	time = time.substring(0,5);
	return time;
}

// Get last 6 characters of MAC
function shortMAC(MAC) {
	var short = MAC.substr(-6);
	return short;

}
// Process call to get all site names and MAC addresses
function processSites(results) {
	if (!results["success"]) {
		document.querySelector('#output').innerHTML = ErrQuery+": get sites";
		return;
	}
	//var table = siteTable(results['message']);
    //document.querySelector('#output').innerHTML = table;
    data=results['message'];
    siteDropdown(data);
    updateSiteList();  // Create dropdown list
    siteMap = data; // Save map of MAC addressed to site names
    // Get and display live watts for each active site.
    getSitesWatts();

}

// Make call to fetch all site names and MAC addresses
function getSites() {
	// Clear the previous results
    document.querySelector('#output').innerHTML = "";
    fetch(Url+Sites, {
	method: 'get'
    })
	.then (response => response.json() )
        .then (data => processSites(data))
	.catch(error => {
	    document.querySelector('#output').innerHTML = ErrSrv+": get sites";
	})

}


// Build site name dropdown menu from site data
function siteDropdown(data) {
    var dropdown = '<a class="dropdown-item" href="#" value="0">All</a>';
    for(var key in data) {
		dropdown += '<a class="dropdown-item" href="#" value="'+key+'">'+data[key]+'</a>';
    };

    document.querySelector('#searchtype').innerHTML = dropdown;

    return;
}

// Process the live watt data for all sites and build graph
function processSitesWatts(results) {
	if (!results["success"]) {
		document.querySelector('#output').innerHTML = ErrQuery+": Get all site's watts";
		return;
	}

	today = todaysDate();

	dataList = results['message'];
	wattsData = [];
	wattsLabel = [];
	dataList.forEach(function(site) {
		siteDate = site[2].split(" ")[0];
		if (parseInt(site[1])>0 && siteDate == today) {
			wattsData.push(site[1]);
			wattsLabel.push(siteMap[site[0]]);
		}
	});
	document.querySelector('#output').innerHTML = "<h1>Belize Solar Live Data</h1>";
	// Display graph
	makeLiveSummaryGraph(wattsLabel,wattsData);
	getAllSiteTodayWatts();

}

// Get watt data for all sites, then display graph
function getSitesWatts() {

    fetch(Url+AllWatts, {
	method: 'get'
    })
	.then (response => response.json() )
        .then (data => processSitesWatts(data))
	.catch(error => {
	    document.querySelector('#output').innerHTML = ErrSrv+": Get all site's watts";
	})

}

/////////////////////////////////////////NEW FUNCTION ////////////////////////////////
/*function getSitesHourlylyWatts() {

    var command= Url+allSitesDailyWatts;
    command=command.replace("%DATE%",yesterdaysDate());
    fetch(command, {
	method: 'get'
    })
	.then (response => response.json() )
        .then (data => ProcessSitesHourlyWatts(data))
	.catch(error => {
	    document.querySelector('#output3').innerHTML = ErrSrv+": Get all sites' hourly watts for today";
	})

}

function ProcessSitesHourlyWatts(results) 
{
var data = results['message'];
if (!results["success"]) {
		document.querySelector('#output3').innerHTML = QueryErr+"Get all sites hourly watts for today";
		return;
	}
	wattsLabel = ["hour1", "hour2", "hour3", "hour4", "hour5", "hour6", "hour7", "hour8", "hour9", "hour10", "hour11", "hour12", "hour13"];
	yesterday = yesterdaysDate();
	//clearCanvas();
	dataList = results['message'];
	names=[]
	wattsData = [];
	dataList.forEach(function(site) {
		siteDate = site[2].split(" ")[0];
		if (siteDate == yesterday) 
		{
			wattsData.push(site[3]);
			names.push(siteMap[site[0]]);
		}
	});
 HourlyGraph(wattsData, wattsLabel, names);
}*/

///////////////////// Graph function for hourly watts////////////////////

/*function HourlyGraph(values, labels, names )
{
// values = [[65, 59, 80, 81, 56, 55, 40], [24, 34, 54, 62, 34, 54, 23]] ;
// names = ["School1", "school2"]
// labels= ["hour1", "hour2", "hour3", "hour4"] 
//number of devices 32 
//document.querySelector('#output3').innerHTML += "<h1>Average Hourly Kilowatts Per School Yesterday</h1>";
const ctx = document.getElementById('chart3');
let series = [];
let categories = [];
for (let x = 0; x < names.length; x++)
 {
  series.push({
    name: names[x],
    data: values[x]
  });
}

var chart = new ApexCharts(ctx, {
  chart: {
    height: 380,
    width: "100%",
    type: "line"
  },
  stroke: {
    curve: 'smooth',
    width: 1.5,
  },
  markers: {
    size: 4,
  },
  legend: {
    show: true,
    position: 'top'
  },
  series: series,
  xaxis: {
    categories: labels,
    title: {
      text: "Schools"
    }
  },
  yaxis: {
    title: {
      text: "Hourly Watts"
    }
  }
});
//chart.render();
}*/


///////////////////////////////////////////////// Last Hope ///////////////////////////

function HourlyGraph(jsons)
{
  document.querySelector('#output3').innerHTML += "<h1> Hourly Kilowatts Per School </h1>";
   const ctx= document.getElementById('chart3');
  
  CompositelineGraph= new Chart(ctx, {type: 'line', 
  data: {
  labels:["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"],
  datasets: jsons
  }, 
  options: {
      //indexAxis: 'y',
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  
  });
}
////////////////////////////////////////////////////////////////////////////////////////

function MakeJsons(names, allWatts, colors)
{
Jsons=[];
for (let i=0; i<names.length; i++)
{
let graph={label:names[i], data: allWatts[i], borderColor: colors[i]};
Jsons.push(graph);
}
return Jsons;
}


////////////////////////////////////////////////////////////////////////////////////

// Build watt output table
function wattTable(data) {
    var table = '<table class="w3-table-all w3-hoverable" border="2"><tr><th>Time</th><th>Watts</th><tr>';
	//console.log(JSON.stringify(data));
	var prev = -1
	data.forEach ( function(row) {
		var time = getTime(row[2]);
		var watts = row[3];
		if (prev != 0 || parseInt(watts) != 0) {
			table += "<tr><td>"+time+"</a>";
			table+="</td><td>"+watts+"</td></tr>";
		}
		prev = parseInt(watts);
    });
    table += "</table>";
    return table;
}

// a function that returns an array containing all watts recorded by a school during the day 
function findwatt(data) {
	var prev = -1
	let dWatts = [];
	let dMins= []
	data.forEach ( function(row) {
		var time = getTime(row[2]);
		var watts = row[3];
		if (prev != 0 || parseInt(watts) != 0) {
	        dWatts.push(parseInt(time));
			dMins.push(parseInt(watts));
		}
		prev = parseInt(watts);
    });

    return dWatts;
}

// a function that returns an array containing all minutes during which watts were recorded for a school throughout the day
function findmin(data) {
	var prev = -1
	let dWatts = [];
	let dMins= []
	data.forEach ( function(row) {
		var time = getTime(row[2]);
		var watts = row[3];
		if (prev != 0 || parseInt(watts) != 0) {
	        dWatts.push(parseInt(time));
			dMins.push(parseInt(watts));
		}
		prev = parseInt(watts);
    });

    return dMins;
}


// Sum up array, ignoreing nulls
function sumArray(a) {
	sum = 0;
	a.forEach(function(w) {
		if (w!=null) {
			sum+=parseInt(w);
		}
	});
	return sum;
}

// Build data for a graph of total watts for today
function displayAllSiteTodayWatts(data)
{
	var names = [];
	var whrs = [];
	var AllWattsToday= [];
	//console.log(JSON.stringify(siteMap));
	data.forEach(function(site) {
		var MAC = site.shift();
		var wattsList = site;
		var whr = sumArray(wattsList);

		if (whr > 0) {
			//console.log(MAC,siteMap[MAC],whr);
			names.push(siteMap[MAC]);
			whrs.push(whr);
		    AllWattsToday.push(wattsList);
		}

	});
	console.log(JSON.stringify(names),JSON.stringify(whrs));
	makeSumSummaryGraph(names,whrs);
	var graphs= MakeJsons(names, AllWattsToday, colors);
    HourlyGraph(graphs);
}

// Process All Site watts by hour for that day
function processAllSiteTodayWatts(results) {
	if (!results["success"]) {
		document.querySelector('#output').innerHTML = QueryErr+"Get all sites watts for today";
		return;
	}
	//clearCanvas();
	var data = results['message'];

	//console.log(JSON.stringify(data));
	document.querySelector('#output2').innerHTML += "<h1>Total Kilowatts today</h1>";
	displayAllSiteTodayWatts(data);
}


// Get All Site watts by hour for that day
function getAllSiteTodayWatts() {
	var command=Url+SolarWattsAllDayAllSites;
	command=command.replace("%DATE%",todaysDate());
	console.log(command);
	fetch(command, {
		method: 'get'
    	})
		.then (response => response.json() )
        	.then (data => processAllSiteTodayWatts(data))
		.catch(error => {
	    	document.querySelector('#output').innerHTML = ErrSrv+" Get all sites watts for today";
		})
}

// Process the Site watts by hour for that day
function processSiteDailyWatts(results) {
	if (!results["success"]) {
		document.querySelector('#output').innerHTML = QueryErr+" Get sites watts for today";
		return;
	   }	//clearCanvas();
	   var data = results['message'];
	//console.log(JSON.stringify(data));
	document.querySelector('#output').innerHTML += wattTable(data);
	//document.querySelector('#output3').innerHTML = "<h2>Daily Watts by the school </h2>";
	// Display graph
	 makeDailySummaryGraph(findwatt(data), findmin(data)); 

}


// Get the Site watts by minute for that day
function getSiteDailyWatts(siteMAC) {
	var MAC = shortMAC(siteMAC);
	var command=Url+siteDayWatts;

	command=command.replace("%SITE%",MAC);
	command=command.replace("%DATE%",todaysDate());
	fetch(command, {
		method: 'get'
    	})
		.then (response => response.json() )
        	.then (data => processSiteDailyWatts(data))
		.catch(error => {
	    	document.querySelector('#output').innerHTML = QueryErr+" Get sites watts for today";
		})
}

// Process and display the Site info
function processSiteInfo(results) {
	if (!results["success"]) {
		document.querySelector('#output').innerHTML = ErrSrv+"11";
		return;
	}
	var data = results['message'];
	//console.log(JSON.stringify(data));
	var output = "<h1>"+data['name']+"</h1>";
	output += "<p><b>Location:</b> <i>"+data['location']+"</i> <b>Contact:</b> <i>"+data['contactName']+"</i>";
	output += " <b>Email:</b> <i>"+data['contactEmail']+"</i> </p>";
	output += "<p><b>Panels:</b> <i>"+data['numPanels']+"</i> <b>Limiter:</b> <i>"+data['limiter']+"</i></p>";
	document.querySelector('#output').innerHTML = output;
	destroySummaryChart();
	getSiteDailyWatts(siteMAC);

}

// Get the Site info given the site MAC address
function getSiteInfo(siteMAC) {
	var MAC = shortMAC(siteMAC);
	var command=Url+siteInfo;

	command=command.replace("%SITE%",MAC);
	fetch(command, {
		method: 'get'
    	})
		.then (response => response.json() )
        	.then (data => processSiteInfo(data))
		.catch(error => {
	    	document.querySelector('#output').innerHTML = ErrSrv+"10!";
		})
}

// Remove summary chart
function destroySummaryChart() {
	summaryChart.destroy();
	summaryChart = 0;
}

// Create and display a bar graph of live data for all sites.
function makeLiveSummaryGraph(names,watts) {

  const ctx = document.getElementById('chart');

  if (summaryChart) destroySummaryChart();

  summaryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        label: 'Live Watts',
        data: watts,
        borderWidth: 1
      }]
    },
    options: {
      //indexAxis: 'y',
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}

// Remove whatt hour chart
function destroyWhrChart() {
	summaryChart.destroy();
	summaryChart = 0;
}

/// Create and display a line graph of all watts produced throughout the day by one school
function makeDailySummaryGraph(names,watts) {
 
  const ctx = document.getElementById('chart');
  if (summaryChart) destroySummaryChart();

  summaryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: names,
      datasets: [{
        label: 'daily Watts',
        data: watts,
        borderWidth: 1
      }]
    },
    options: {
      //indexAxis: 'y',
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}

// Remove whatt hour chart
function destroyWhrChart() {
	summaryChart.destroy();
	summaryChart = 0;
}

/////////////////////////////////////////////////////////////////////////

// Create and display a line graph of total killowatts today all sites.
function makeSumSummaryGraph(names,watts) {

  const ctx = document.getElementById('chart2');

  if (summaryWhrChart) destroyWhrChart();

  summaryWhrChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: names,
      datasets: [{
        label: 'Kilowatt hours',
        data: watts,
        borderWidth: 1
      }]
    },
    options: {
      //indexAxis: 'y',
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

///////////////////////////////////////////////////////////////////////////
// a function that returns yesterday's date
function yesterdaysDate() {
	var today = new Date();
	today.setDate(today.getDate()-1);
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	var date = yyyy +'-'+ mm +'-'+ dd;
	return date;
}
