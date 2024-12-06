<script>
  // Asegurarnos de que el código se ejecute solo en el navegador
  if (typeof window !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      var map = L.map("map").setView([8.03499, -72.25163], 14); // Inicializar en San Juan de Colón
      var mapLink = "<a href='http://openstreetmap.org'>OpenStreetMap</a>";
      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        attribution: "Leaflet &copy; " + mapLink + ", contribution",
        maxZoom: 18,
      }).addTo(map);

      var originMarker = null;
      var destinationMarker = null;
      var routeControl = null;

      function reverseGeocode(latlng, callback) {
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
        )
          .then((response) => response.json())
          .then((data) => {
            callback(data.display_name);
          })
          .catch((error) => {
            console.error("Error en la geocodificación inversa:", error);
            alert("Error al obtener el nombre del sector.");
          });
      }

      map.on("click", function (e) {
        if (!originMarker) {
          originMarker = L.marker(e.latlng)
            .addTo(map)
            .bindPopup("Me puedes buscar aquí?")
            .openPopup();
          reverseGeocode(e.latlng, function (address) {
            document.getElementById("origin").value = address;
          });
        } else if (!destinationMarker) {
          destinationMarker = L.marker(e.latlng)
            .addTo(map)
            .bindPopup("Me puedes llevar aquí")
            .openPopup();
          reverseGeocode(e.latlng, function (address) {
            document.getElementById("destination").value = address;
          });
          if (routeControl) {
            map.removeControl(routeControl);
          }
          routeControl = L.Routing.control({
            waypoints: [originMarker.getLatLng(), e.latlng],
            createMarker: function () {
              return null;
            }, // Sin marcadores para la ruta
          })
            .on("routesfound", function (e) {
              let routes = e.routes;
              console.log(routes);
            })
            .addTo(map);
        }
      });

      function clearRoute() {
        if (routeControl) {
          map.removeControl(routeControl);
          routeControl = null;
        }
        if (originMarker) {
          map.removeLayer(originMarker);
          originMarker = null;
          document.getElementById("origin").value = "";
        }
        if (destinationMarker) {
          map.removeLayer(destinationMarker);
          destinationMarker = null;
          document.getElementById("destination").value = "";
        }
      }

      document
        .getElementById("clearButton")
        .addEventListener("click", clearRoute);
    });
  }
</script>

<div class="container overflow-hidden text-center">
  <div class="row gx-5">
    <div class="col-md-6">
      <div id="map"></div>
    </div>
    <div class="col">
      <form>
        <div class="pt-5">
          <input
            type="text"
            id="origin"
            placeholder="Búscame aquí"
            class="form-control pb-2 mb-4 text-danger border-bottom border-danger"
            style="border: none;"
            readonly
          />
        </div>
        <div>
          <input
            type="text"
            id="destination"
            placeholder="Llévame aquí"
            class="form-control pb-2 mb-4 text-danger border-bottom border-danger"
            style="border: none;"
            readonly
          />
        </div>
        <div class="container overflow-hidden text-center">
          <div class="row gx-5">
            <div class="col">
              <label for="money" class="form-label text-secondary">Moneda</label
              >
              <select
                class="form-select pb-2 mb-4 text-danger border-bottom border-danger"
                id="money"
                required
              >
                <option selected disabled></option>
                <option>Pesos</option>
                <option>Dólares</option>
              </select>
            </div>
            <div class="col">
              <label for="vueltos" class="form-label text-secondary"
                >Llevar vueltos</label
              >
              <select
                class="form-select pb-2 mb-4 text-danger border-bottom border-danger"
                id="vueltos"
                required
              >
                <option selected disabled></option>
                <option>No</option>
                <option>2$</option>
                <option>5$</option>
                <option>10$</option>
                <option>20$</option>
                <option>50%</option>
                <option>100$</option>
                <option>5000cop</option>
                <option>10000cop</option>
                <option>20000cop</option>
                <option>50000cop</option>
                <option>100000cop</option>
              </select>
            </div>
          </div>
          <div class="container overflow-hidden text-center">
            <div class="row gx-5">
              <div class="col">
                <button
                  type="button"
                  id="clearButton"
                  class="btn btn-outline-warning">Borrar Ruta</button
                >
              </div>
              <div class="col">
                <button type="button" class="btn btn-outline-warning"
                  >Solicitar viaje</button
                >
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  #map {
    width: 100%;
    height: 100vh;
  }
  .container .row {
    margin-top: 20px;
  }
</style>
