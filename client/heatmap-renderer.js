const heatmapPoints = new google.maps.MVCArray([]);
let offset = 0;

/**
 * Function to initiate Google Map and heatmap layer
 */
function initMap() {
  $('#refresh').prop('disabled', true);

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 37.760, lng: -122.450},
    mapTypeId: 'roadmap'
  });
  
  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapPoints,
    map: map
  });

  requestData();
}

/**
 * Function to handle AJAX request errors
 * 
 * @param {Object} request The request object
 * @param {Number} status The HTTP status code
 * @param {String} err The error message
 */
function RequestErrorHandling(request, status, err) {
  offset = 0;
  $('#refresh').prop('disabled', false);
  alert('Something went wrong while trying to load data. Please try again later.');
  console.error(err);
}

/**
 * Function to request data from server with AJAX
 */
function requestData() {
  $.ajax({
    type: 'POST',
    url: 'http://localhost:8080',
    dataType: 'json',
    data: {
      offset: offset
    },
    async: true,
    success: function(response) {
      if (response.success) {
        for(const point of response.heatmapData) {
          heatmapPoints.push(new google.maps.LatLng(point.latitude, point.longitude));
        }

        if (offset === 0) {
          heatmapPoints.clear();
        }

        if (response.end) {
          offset = 0;
          $('#refresh').prop('disabled', false);
        } else {
          offset += response.heatmapData.length;
          requestData();
        }  
      } else {
        RequestErrorHandling(null, response.status, response.error);
      }
    },
    error: RequestErrorHandling
  });
}

// Wake up my sweet
initMap();