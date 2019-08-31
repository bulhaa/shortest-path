<template>
  <div id="app">
    <div id="map"></div>
  </div>
</template>

<script>
import { data as asiaData } from '../../test/harness/atoll'
import { dataWithEdges } from '../atoll'
import { setupMap, setData, setupRouteLayer } from './mapHelpers'
import { loadGraphFromFile, createGraphFromData } from './graphHelper'


export default {
  name: 'app',
  mounted () {
    var file = 1
    var showMap = 0

    setupMap(null, null, showMap)
    setData(asiaData, showMap)
    if(showMap)
      setupRouteLayer()
    if(file)
      this.getGraphFile()
    else
      this.createGraph()
  },
  methods: {
    createGraph: function () {
      createGraphFromData(asiaData)
    },
    getGraphFile: function () {
      var result = loadGraphFromFile(dataWithEdges)
      console.log(result)
    }
  }
}
</script>

<style>
    html, body, #app, #map {
      width: 100%;
      height: 100%;
      margin: 0px;
    }

  .leaflet-div-icon {
    background: #EB3223;
    border: 2px solid white;
    border-radius:  60%;
  }

  .leaflet-marker-icon .number{
    position: relative;
    top: 4px;
    font-size: 12px;
    width: 2 6px;
    height: 2 6px;
    text-align: center;
  }

  .leaflet-container {
    background: #13294F;
  }
</style>
