import createGraph from 'ngraph.graph'
import { Point } from './Point'
import { setupStructure } from './setupStructure'
import { INF, edgeIntersect, onSegment, ccw, calcEdgeDistance } from './utils'
import { isVisible, getVisibleNodes, loadPoints, restoreOriginalPointsAndEdges, getObstructingEdge, addStartingAndEndingNodes } from '../../src/main'
import { makeConvexhull } from './convex-hull'
import { updateGraphWithDynamicJSON } from './graphHelper'


let map = null
let startMarker = null
let endMarker = null
let selectionLayer = null
let polyLayer = null
let points = null
let pointsLyr = null
let graphData = null
let foundPath = null
let pathFinder = null
let routeLayer = null
let points1 = []
let points2 = []
let pointsArr = []
let turfPolygons = []
var output = ""
var multiplier = 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000
var updatingPathMarkers = false
var allTangents = []
var startPoint = null
var endPoint = null


export function setupMap (start, end, showMap) {
  if(showMap){
    map = L.map('map', {
      minZoom: 1,
      maxZoom: 20,
      center: [0, 0],
      zoom: 2,
      crs: L.CRS.Simple
    })

    L.NumberedDivIcon = createNumberDiv()
  }

  if(start == null){
    // var start = [73.19374999403954,0.6548828072845936]
    // var end = [73.198449611664,0.691950189807585]

    // var start = [73.20313720591366,0.66888427734375]
    // var end = [73.22689209133387,0.6780517548322678]

    // var start = [73.2007812410593,0.6654785238206387]
    // var end = [73.2010742276907,0.7003906257450581]

    // var start = [73.14657642738,0.6639903635426379]
    // var end = [73.2010742276907,0.7003906257450581]


    var start = [73.19707030057907,0.6677734404802322]
    var end = [73.17901611328125,0.6834106449969113]





    var start = [73.18628847599,0.6605490743581441]
    var end = [73.169002590224,0.6689311701630487]




    var start = [73.234375,0.14453119039535522]
    var end = [73.169002590224,0.6689311701630487]
  }


  startPoint = new Point(start);
  endPoint = new Point(end);


























  // var start = [73.196550607681,0.6745385270131692]
  // var end = [73.195617198944,0.6747423607673824]

  // var start = [73.18461914360523,0.6880859322845936]
  // var end = [73.198449611664,0.691950189807585]

  if(showMap){
    startMarker = L.marker([start[1],start[0]], {
      draggable: true,
      icon: new L.NumberedDivIcon()
    }).addTo(map)

    endMarker = L.marker([end[1],end[0]], {
      draggable: true,
      icon: new L.NumberedDivIcon()
    }).addTo(map)

    startMarker.on('drag', updatePathMarkers)
    endMarker.on('drag', updatePathMarkers)
    selectionLayer = L.layerGroup([]).addTo(map)
  }
}

export function setData (data, showMap) {
  if(showMap){
    polyLayer = L.geoJson(data, {
      noClip: true,
      stroke: false,
      fillColor: '#8B99AE'
    }).addTo(map)

    map.fitBounds(polyLayer.getBounds(), {
      padding: [20, 20]
    })

    points = turf.featureCollection([])

    pointsLyr = L.layerGroup([], {
      pane: 'popupPane'
    }).addTo(map)

    turf.meta.coordEach(data, function (currentCoord) {
      points.features.push(turf.point([currentCoord[0], currentCoord[1]]))

      var layer = L.circleMarker([currentCoord[1], currentCoord[0]], {
        radius: 3,
        opacity: 0,
        fillOpacity: 0.5,
        origPoint: [currentCoord[0], currentCoord[1]]
      }).addTo(pointsLyr)
      layer.on('mouseover', highlightFeature)
      layer.on('mouseout', unhighlightFeature)

    }, true)
  }








  loadPoints(data)

  for (var i = data.features.length - 1; i >= 0; i--) {
    const edges = []
    const polygons = []
    points1 = []
    setupStructure(data.features[i], edges, points1, polygons, i)
    pointsArr.push(points1.slice(0))
  }

  // for (var i = data.geometry.coordinates.length - 1; i >= 0; i--) {
  //   const edges = []
  //   const polygons = []
  //   points1 = []
  //   setupStructure(data.geometry.coordinates[i], edges, points1, polygons, i)
  //   pointsArr.push(points1.slice(0))
  // }

  loadTurfPolygons(data)








  // var tangents = getPolygonTangents(new Point([73.14657642738,0.6639903635426379]), pointsArr[11])

  // console.log("\tvar start = ["+createNodeId2(new Point([73.14657642738,0.6639903635426379]))+"]\n\tvar end = ["+createNodeId2(tangents[1])+"]\n\n")





    console.log('starting')

  // for (var i = pointsArr.length - 1; i >= 0; i--) {
  // // for (var i = 19 - 1; i >= 0; i--) {
  //   // var i = 4;
  //   // var j = 11;

  //   // var i = 4;
  //   // var j = 9;

  //   // var i = 11;
  //   // var j = 0;

  //   for (var j = i - 1; j >= 0; j--) {
  //   // for (var j = 5; j >= 2; j--) {
  //   //   if(i == j) continue
  //     // console.log('test')
  //   // console.log('i: ' + i + ' j: ' + j)
  //     // find4Tangents(pointsArr[i], pointsArr[j], turfPolygons[i], turfPolygons[j])
  //     find4Tangents(pointsArr[i], pointsArr[j])

  //   }


  //   // find shortcuts to skip concave parts of polygons
  //   var pArr = pointsArr[i]
  //   var hull = makeConvexhull(pArr);
  //   console.log('test')
  //   var l = 0
  //   for (var k = 0; k < hull.length; k++) {
  //     var nextPoint = hull[ (k+1) % hull.length ]

  //     // find the point that matches the point in the hull
  //     while( !pArr[l].isPointEqual(hull[k])){
  //       l = (l+1) % pArr.length
  //     }
      
  //     // if the next point is different we need the line between
  //     if( !pArr[l].nextPoint.isPointEqual(nextPoint)){
  //       // if(isVisible(hull[k],nextPoint))
  //         output += ',{"fromId":"'+ createNodeId2(hull[k]) +'","toId":"'+createNodeId2(nextPoint)+'"}'
  //     }
  //   }
  // }

  // console.log(allTangents.length)
  // for (var i = allTangents.length - 1; i >= 0; i--) {
  //   console.log('test')
  //   var p1 = allTangents[i]

  //   var nodesVisible = getVisibleNodes(p1)

  //   for (var k = nodesVisible.length - 1; k >= 0; k--) {
  //     for (var j = i - 1; j >= 0; j--) {
  //       var p2 = allTangents[j]

  //       if(nodesVisible[k].x == p2.x && nodesVisible[k].y == p2.y ){
  //         output += ',{"fromId":"'+ createNodeId2(p1) +'","toId":"'+createNodeId2(p2)+'"}'
  //       }

  //       // if(isVisible(p1, p2))
  //       //   output += ',{"fromId":"'+ createNodeId2(p1) +'","toId":"'+createNodeId2(p2)+'"}'
  //     }
  //   }

  // }


  console.log(output)

}

function loadTurfPolygons(data){
  for (var i = 0; i < pointsArr.length; i++) {
    var aAsInt = []
    var a = pointsArr[i]

    for (var j = 0; j < a.length; j++) {
      aAsInt.push([Math.round(a[j].x * multiplier), Math.round(a[j].y * multiplier)])
    }
    aAsInt.push([Math.round(a[0].x * multiplier), Math.round(a[0].y * multiplier)]) // just to make sure last is equal to first

    turfPolygons.push(turf.polygon([aAsInt]));
  }
}

  
// determines the quadrant of a point 
// (used in compare()) 
function quad(p) 
{ 
    if (p.x >= 0 && p.y >= 0) 
        return 1; 
    if (p.x <= 0 && p.y >= 0) 
        return 2; 
    if (p.x <= 0 && p.y <= 0) 
        return 3; 
    return 4; 
} 
  
// Checks whether the line is crossing the polygon 
function orientation( a, b, c) 
{ 
    var res = (b.y-a.y)*(c.x-b.x) - 
              (c.y-b.y)*(b.x-a.x); 
  
    if (res == 0) 
        return 0; 
    if (res > 0) 
        return 1; 
    return -1; 
} 
  
function clonePoints (points) {
  return points.slice(0)
}

function sortPoints (point, clonedPoints) {
  clonedPoints.sort((a, b) => {
    var p = new Point([a.x - mid.x, 
                                a.y - mid.y]); 
    var q = new Point([b.x - mid.x, 
                                b.y - mid.y]); 
  
    var one = quad(p); 
    var two = quad(q); 
  
    if (one != two) 
        return (one < two ? -1 : 1); 
    return (p.y*q.x < q.y*p.x ? -1 : 1); 
  })
}

// function sortPoints (point, clonedPoints) {
//   clonedPoints.sort((a, b) => {
//     const angle1 = point.angleToPoint(a)
//     const angle2 = point.angleToPoint(b)
//     if (angle1 < angle2) return -1
//     if (angle1 > angle2) return 1
//     const dist1 = calcEdgeDistance(point, a)
//     const dist2 = calcEdgeDistance(point, b)
//     if (dist1 < dist2) return -1
//     if (dist1 > dist2) return 1
//     return 0
//   })
// }

function getPolygonTangents(srcPoint, pointsArr){
    // initialize using first point
    var firstPoint = pointsArr[pointsArr.length - 1]
    var angle = srcPoint.angleToPoint(firstPoint)
    var leftMostAngle = angle
    var rightMostAngle = angle
    var leftMostPoint = firstPoint
    var rightMostPoint = firstPoint
        // routeLayer.setLatLngs([srcPoint, firstPoint])

    for (var i =  pointsArr.length - 2;  i >= 0; i--) {
        // is this point more towards left than left most point?
        var angle = srcPoint.angleToPoint(pointsArr[i])
        var diff1 = rightMostAngle - angle
        diff1 = diff1 < 0 ? ((diff1 < -Math.PI) ? diff1 + Math.PI*2 : Math.PI * 3) : diff1
        // diff1 = diff1 < 0 ? diff1 + Math.PI*2 : diff1

        // is this point more towards right than right most point?
        var angle = srcPoint.angleToPoint(pointsArr[i])
        var diff2 = angle - leftMostAngle
        diff2 = diff2 < 0 ? ((diff2 < -Math.PI) ? diff2 + Math.PI*2 : Math.PI * 3) : diff2
        // diff2 = diff2 < 0 ? diff2 + Math.PI*2 : diff2

        // if(i == 56)
        //   i = i


        /* if unchartered angle */
        if(diff1 < Math.PI/2 || diff2 < Math.PI/2){
          if(diff1 < diff2){
            /* if closer to left most point */
            rightMostAngle = angle
            rightMostPoint = pointsArr[i]
          }else{
            leftMostAngle = angle
            leftMostPoint = pointsArr[i]
            // break
          }
        }
    }

    return [leftMostPoint, rightMostPoint]
}

function getDynamicEdgesJSON(startPoint, endPoint)
{
  var dynamicEdgesJSON = ""
  // var startPoint = new Point([startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]]);
  // var endPoint = new Point([endPoint.geometry.coordinates[0], endPoint.geometry.coordinates[1]]);
  addStartingAndEndingNodes(startPoint, endPoint)


  var pointsToConnect = []
  var polygonIds = []
  pointsToConnect.push([endPoint, startPoint])
  pointsToConnect.push([startPoint, endPoint])
  polygonIds.push(-1)
  polygonIds.push(-1)
  var k = 0

  while(pointsToConnect.length != 0){
    var oldPointsToConnect = pointsToConnect.slice(0)
    var oldPolygonIds = polygonIds.slice(0)
    pointsToConnect = []
    polygonIds = []

    for (var i = oldPointsToConnect.length - 1; i >= 0; i--) {
      var srcPoint = oldPointsToConnect[i][0]
      var destPoint = oldPointsToConnect[i][1]

      var angle = srcPoint.angleToPoint(destPoint)
      var noObstructingPolygons = true

      for (var j = pointsArr.length - 1; j >= 0; j--) {
        var tangents = getPolygonTangents(oldPointsToConnect[i][0], pointsArr[j])
        var angle1 = srcPoint.angleToPoint(tangents[0])
        var angle2 = srcPoint.angleToPoint(tangents[1])

        // make all angles relative to right most angle (angle2) by making right most angle 0 (starting angle)
        var angle0 = angle - angle2
        angle1 -= angle2
        angle2 -= angle2

        if(angle2 < angle0 && angle0 < angle1){
          var obstructingEdge = getObstructingEdge(oldPointsToConnect[i][0], oldPointsToConnect[i][1], pointsArr[j])

          if(obstructingEdge != null){
            noObstructingPolygons = false
            pointsToConnect.push([oldPointsToConnect[i][0], tangents[0]])
            pointsToConnect.push([oldPointsToConnect[i][0], tangents[1]])
            break;
          }
        }
      }

      if(noObstructingPolygons)
        dynamicEdgesJSON += ',{"fromId":"'+createNodeId2(oldPointsToConnect[i][0])+'","toId":"'+createNodeId2(oldPointsToConnect[i][1])+'"}'
    }
    k++
  }

  return dynamicEdgesJSON
}

// function getDynamicEdgesJSON(startPoint, endPoint)
// {
//   var dynamicEdgesJSON = ""
//   // var nearestPoint
//   // var start = turf.point([Math.round(startPoint.geometry.coordinates[0] * multiplier), Math.round(startPoint.geometry.coordinates[1] * multiplier)]);
//   // var end = turf.point([Math.round(endPoint.geometry.coordinates[0] * multiplier), Math.round(endPoint.geometry.coordinates[1] * multiplier)]);
//   var startPoint = new Point([startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]]);
//   var endPoint = new Point([endPoint.geometry.coordinates[0], endPoint.geometry.coordinates[1]]);
//   addStartingAndEndingNodes(startPoint, endPoint)

//   var pointsToConnect = []
//   var polygonIds = []
//   pointsToConnect.push([endPoint, startPoint])
//   // pointsToConnect.push([startPoint, endPoint])
//   polygonIds.push(-1)
//   // polygonIds.push(-1)
//   var k = 0

//   while(pointsToConnect.length != 0){
//     var oldPointsToConnect = pointsToConnect.slice(0)
//     var oldPolygonIds = polygonIds.slice(0)
//     pointsToConnect = []
//     polygonIds = []
//     for (var i = oldPointsToConnect.length - 1; i >= 0; i--) {
//       // var turfPoint = turf.point([Math.round(oldPointsToConnect[i][0].x * multiplier), Math.round(oldPointsToConnect[i][0].y * multiplier)]);
//       var obstructingEdge = getObstructingEdge(oldPointsToConnect[i][0], oldPointsToConnect[i][1])
//       if(obstructingEdge == null){
//         // if(isVisible(oldPointsToConnect[i][0], oldPointsToConnect[i][1]))
//           dynamicEdgesJSON += ',{"fromId":"'+createNodeId2(oldPointsToConnect[i][0])+'","toId":"'+createNodeId2(oldPointsToConnect[i][1])+'"}'
//       }else{
//         var j = turfPolygons.length - obstructingEdge.p1.polygonID - 1
//         if(j == oldPolygonIds[i])
//           dynamicEdgesJSON += ',{"fromId":"'+createNodeId2(oldPointsToConnect[i][0])+'","toId":"'+createNodeId2(oldPointsToConnect[i][1])+'"}'
//         else{
//           var tangents = getPolygonTangents(oldPointsToConnect[i][0], pointsArr[j])
//           pointsToConnect.push([oldPointsToConnect[i][0], tangents[0]])
//           pointsToConnect.push([oldPointsToConnect[i][0], tangents[1]])
//           polygonIds.push(j)
//           polygonIds.push(j)











//           // var features1 = turf.polygonTangents(turfPoint, turfPolygons[j]).features
//           // if(features1.length > 2)
//           //   alert('More than 2 tangents')

//           // var nearestPoint = turf.nearestPoint(turf.point([features1[0].geometry.coordinates[0]/multiplier, features1[0].geometry.coordinates[1]/multiplier]), points)
//           // var tangent1 = new Point([nearestPoint.geometry.coordinates[0], nearestPoint.geometry.coordinates[1]])
//           // nearestPoint = turf.nearestPoint(turf.point([features1[1].geometry.coordinates[0]/multiplier, features1[1].geometry.coordinates[1]/multiplier]), points)
//           // var tangent2 = new Point([nearestPoint.geometry.coordinates[0], nearestPoint.geometry.coordinates[1]])
//           // pointsToConnect.push([oldPointsToConnect[i][0], tangent1])
//           // pointsToConnect.push([oldPointsToConnect[i][0], tangent2])
//           // polygonIds.push(j)
//           // polygonIds.push(j)









//           if(k==0){
//             pointsToConnect.push([oldPointsToConnect[oldPointsToConnect.length-1-i][0], tangents[0]])
//             pointsToConnect.push([oldPointsToConnect[oldPointsToConnect.length-1-i][0], tangents[1]])
//             polygonIds.push(-1)
//             polygonIds.push(-1)
//           }


//           // if(k==0){
//           //   console.log("\tvar start = ["+createNodeId2(oldPointsToConnect[i][0])+"]\n\tvar end = ["+createNodeId2(tangents[0])+"]\n\n")
//           //   console.log("\tvar start = ["+createNodeId2(oldPointsToConnect[i][0])+"]\n\tvar end = ["+createNodeId2(tangents[1])+"]\n\n")
//           //   if(i==0)
//           //     return dynamicEdgesJSON;
//           // }

//         }
//       }
//     }
//     k++
//   }

//   // var nodesVisible1 = getVisibleNodes(startPoint, startPoint, endPoint)
//   // var nodesVisible2 = getVisibleNodes(endPoint)
//   // var startTangents = []
//   // var endTangents = []

//   // for (var i = 0; i < turfPolygons.length; i++) {
//   //   console.log('test');

//   //   var features1 = turf.polygonTangents(start, turfPolygons[i]).features
//   //   var features2 = turf.polygonTangents(end, turfPolygons[i]).features

//   //   var startTangent1 = new Point([features1[0].geometry.coordinates[0]/multiplier, features1[0].geometry.coordinates[1]/multiplier])
//   //   var startTangent2 = new Point([features1[1].geometry.coordinates[0]/multiplier, features1[1].geometry.coordinates[1]/multiplier])
//   //   startTangents.push(startTangent1)
//   //   startTangents.push(startTangent2)

//   //   var endTangent1 = new Point([features2[0].geometry.coordinates[0]/multiplier, features2[0].geometry.coordinates[1]/multiplier])
//   //   var endTangent2 = new Point([features2[1].geometry.coordinates[0]/multiplier, features2[1].geometry.coordinates[1]/multiplier])
//   //   endTangents.push(endTangent1)
//   //   endTangents.push(endTangent2)

//   //   if(i==11){
//   //     console.log("\tvar start = ["+createNodeId2(startPoint)+"]\n\tvar end = ["+createNodeId(turf.nearestPoint(turf.point([startTangent1.x, startTangent1.y]), points))+"]\n\n")
//   //     console.log("\tvar start = ["+createNodeId2(startPoint)+"]\n\tvar end = ["+createNodeId(turf.nearestPoint(turf.point([startTangent2.x, startTangent2.y]), points))+"]\n\n")
//   //     console.log("\tvar start = ["+createNodeId2(endPoint)+"]\n\tvar end = ["+createNodeId(turf.nearestPoint(turf.point([endTangent1.x, endTangent1.y]), points))+"]\n\n")
//   //     console.log("\tvar start = ["+createNodeId2(endPoint)+"]\n\tvar end = ["+createNodeId(turf.nearestPoint(turf.point([endTangent2.x, endTangent2.y]), points))+"]\n\n")
//   //   }

//   // }

//   // for (var j = nodesVisible1.length - 1; j >= 0; j--) {
//   //   for (var i = startTangents.length - 1; i >= 0; i--) {
//   //     if(nodesVisible1[j].x == startTangents[i].x && nodesVisible1[j].y == startTangents[i].y ){
//   //       nearestPoint = turf.nearestPoint(turf.point([startTangents[i].x, startTangents[i].y]), points)
//   //       dynamicEdgesJSON += ',{"fromId":"'+createNodeId2(startPoint)+'","toId":"'+createNodeId(nearestPoint)+'"}'
//   //     }
//   //   }
//   //   // if(nodesVisible1[j].x == startTangent2.x && nodesVisible1[j].y == startTangent2.y ){
//   //   //   nearestPoint = turf.nearestPoint(turf.point([startTangent2.x, startTangent2.y]), points)
//   //   //   dynamicEdgesJSON += ',{"fromId":"'+createNodeId2(startPoint)+'","toId":"'+createNodeId(nearestPoint)+'"}'
//   //   // }
//   // }

//   // for (var j = nodesVisible2.length - 1; j >= 0; j--) {
//   //   for (var i = endTangents.length - 1; i >= 0; i--) {
//   //     if(nodesVisible2[j].x == endTangents[i].x && nodesVisible2[j].y == endTangents[i].y ){
//   //       nearestPoint = turf.nearestPoint(turf.point([endTangents[i].x, endTangents[i].y]), points)
//   //       dynamicEdgesJSON += ',{"fromId":"'+createNodeId2(endPoint)+'","toId":"'+createNodeId(nearestPoint)+'"}'
//   //     }
//   //   }
//   //   // if(nodesVisible2[j].x == endTangent1.x && nodesVisible2[j].y == endTangent1.y ){
//   //   //   nearestPoint = turf.nearestPoint(turf.point([endTangent1.x, endTangent1.y]), points)
//   //   //   dynamicEdgesJSON += ',{"fromId":"'+createNodeId2(endPoint)+'","toId":"'+createNodeId(nearestPoint)+'"}'
//   //   // }
//   //   // if(nodesVisible2[j].x == endTangent2.x && nodesVisible2[j].y == endTangent2.y ){
//   //   //   nearestPoint = turf.nearestPoint(turf.point([endTangent2.x, endTangent2.y]), points)
//   //   //   dynamicEdgesJSON += ',{"fromId":"'+createNodeId2(endPoint)+'","toId":"'+createNodeId(nearestPoint)+'"}'
//   //   // }
//   // }

//   return dynamicEdgesJSON
// }


function getDynamicNodesJSON(startPoint, endPoint)
{
  var dynamicNodesJSON = ""
  // var startPoint = new Point([startPoint.geometry.coordinates[0], startPoint.geometry.coordinates[1]]);
  // var endPoint = new Point([endPoint.geometry.coordinates[0], endPoint.geometry.coordinates[1]]);

  dynamicNodesJSON += '{"id":"'+createNodeId2(startPoint)+'","data":{"x":'+startPoint.x+',"y":'+startPoint.y+'}},'
  dynamicNodesJSON += '{"id":"'+createNodeId2(endPoint)+'","data":{"x":'+endPoint.x+',"y":'+endPoint.y+'}},'

  // points.push(startPoint)
  // points.push(endPoint)

  return dynamicNodesJSON
}



// Finds upper tangent of two polygons 'a' and 'b' 
function find4Tangents(a, b) 
// function find4Tangents(a, b, polygon1, polygon2) 
{ 
  // var aAsInt = []
  // var bAsInt = []

  // for (var i = 0; i < a.length; i++) {
  //   aAsInt.push([Math.round(a[i].x * multiplier), Math.round(a[i].y * multiplier)])
  // }
  // aAsInt.push([Math.round(a[0].x * multiplier), Math.round(a[0].y * multiplier)]) // just to make sure last is equal to first

  // for (var i = 0; i < b.length; i++) {
  //   bAsInt.push([Math.round(b[i].x * multiplier), Math.round(b[i].y * multiplier)])
  // }
  // bAsInt.push([Math.round(b[0].x * multiplier), Math.round(b[0].y * multiplier)]) // just to make sure last is equal to first

  // var polygon1 = turf.polygon([aAsInt]);
  // var polygon2 = turf.polygon([bAsInt]);







  var tangents1 = []
  var tangents2 = []
  tangents1.push([a[0].x, a[0].y])






  var findTangentOfB = 1
  var tangentPairs = []
  var done1 = 0;
  var done2 = 0;
  var iterationsRemaining = 10

  while( iterationsRemaining > 0){
    var tangents = []
    var srcTangets = findTangentOfB ? tangents1 : tangents2
    var oldTangents = findTangentOfB ? tangents2.slice(0) : tangents1.slice(0)
    var polygon = findTangentOfB ? b : a
    var matches = 0
    var oldTangentPairs = tangentPairs.slice(0)
    tangentPairs = []

    for (var i = 0; i < srcTangets.length; i++) {
      var rawTangents = []
      var point = new Point(srcTangets[i]);
      var rawTangents = getPolygonTangents(point, polygon)
      // tangents = []

      // for (var j = 0; j < features.length; j++)
      //   rawTangents.push(features[j])

      var srcPoint = new Point(srcTangets[i])
      var p1 = rawTangents[0]
      var p2 = rawTangents[1]
      var angle1 = srcPoint.angleToPoint(p1)
      var angle2 = srcPoint.angleToPoint(p2)
      var diff = angle1 - angle2
      diff = diff < 0 ? diff + Math.PI*2 : diff

      var rightTangent = rawTangents[1]
      var leftTangent = rawTangents[0]

      if(diff > Math.PI){
        rightTangent = rawTangents[0]
        leftTangent = rawTangents[1]
      }


      if(srcTangets.length <= 2){
        tangents.push([leftTangent.x, leftTangent.y])
        tangents.push([rightTangent.x, rightTangent.y])
      }else{
        if(typeof oldTangentPairs[i] == 'undefined')
          continue;

        var oldSource = new Point([oldTangentPairs[i][1][0], oldTangentPairs[i][1][1]])
        var dist1 = calcEdgeDistance(p1, oldSource)
        var dist2 = calcEdgeDistance(p2, oldSource)

        // var angle = srcPoint.angleToPoint(oldSource)
        // var diff1 = angle1 - angle
        // var diff2 = angle2 - angle
        // diff1 = diff1 < 0 ? diff1 + Math.PI*2 : diff1
        // diff2 = diff2 < 0 ? diff2 + Math.PI*2 : diff2

        tangents.push(dist1 < dist2 ? [rawTangents[0].x, rawTangents[0].y] : [rawTangents[1].x, rawTangents[1].y])
        // if(i == 0)
        //   tangents.push(findTangentOfB ? leftTangent : leftTangent)
        // else if(i == 1)
        //   tangents.push(findTangentOfB ? leftTangent : rightTangent)
        // else if(i == 2)
        //   tangents.push(findTangentOfB ? rightTangent : leftTangent)
        // else if(i == 3)
        //   tangents.push(findTangentOfB ? rightTangent : rightTangent)
      }


      // if(srcTangets.length <= 2){
      //   tangents.push(leftTangent)
      //   tangents.push(rightTangent)
      // }else{
      //   if(i == 0)
      //     tangents.push(findTangentOfB ? leftTangent : leftTangent)
      //   else if(i == 1)
      //     tangents.push(findTangentOfB ? leftTangent : rightTangent)
      //   else if(i == 2)
      //     tangents.push(findTangentOfB ? rightTangent : leftTangent)
      //   else if(i == 3)
      //     tangents.push(findTangentOfB ? rightTangent : rightTangent)
      // }


        for (var m = 0; m < tangents.length; m++) {
        // for (var k = oldTangents.length - 1; k >= 0; k--) {
          var tangent = tangents[m]
          if(srcTangets.length > 2)
            tangent = tangents[i]
          // if(tangent[0] == oldTangents[k][0] && tangent[1] == oldTangents[k][1]){
            // if(matches < 4){
              // check for duplicates
              var isUnique = true
              for (var l = tangentPairs.length - 1; l >= 0; l--) {
                if(tangentPairs[l][0][0] == tangent[0] && tangentPairs[l][0][1] == tangent[1])
                  isUnique = false
              }

              if(isUnique){
                tangentPairs.push([tangent, srcTangets[i]])
              }
              matches++

              if(srcTangets.length > 2)
                break
            // }
          // }
        // }
        }
    }

    if(findTangentOfB){
      done2 = matches == 4 ? true : false
      tangents2 = tangents.slice(0)
    }else{
      done1 = matches == 4 ? true : false
      tangents1 = tangents.slice(0)
    }

    // if(iterationsRemaining == 7)
    //   break

    // if(matches < 4)
    //   iterationsRemaining = 10

    findTangentOfB = !findTangentOfB
    iterationsRemaining--
  }

  for (var i = 0; i < tangentPairs.length; i++) {
    // var tp1 = turf.point([tangentPairs[i][0][0],tangentPairs[i][0][1]]);
    // var tp2 = turf.point([tangentPairs[i][1][0],tangentPairs[i][1][1]]);
    // var nearestStart = turf.nearestPoint(tp1, points)
    // var nearestEnd = turf.nearestPoint(tp2, points)
    let p1 = new Point(tangentPairs[i][0])
    let p2 = new Point(tangentPairs[i][1])



    allTangents.push(p1)
    allTangents.push(p2)

    if(isVisible(p1,p2))
      output += ',{"fromId":"'+createNodeId2(p1)+'","toId":"'+createNodeId2(p2)+'"}'
    // if(i==0)
      // console.log("\tvar start = ["+createNodeId2(p1)+"]\n\tvar end = ["+createNodeId2(p2)+"]\n\n")
    // else{
    //   var isVisible = true
    //   var angle = p1.angleToPoint(p2)

    //   for (var j = turfPolygons.length - 1; j >= 0; j--) {
    //     var tpm1 = turf.point([tangentPairs[i][0][0] * multiplier,tangentPairs[i][0][1] * multiplier]);
    //     var tpm2 = turf.point([tangentPairs[i][1][0] * multiplier,tangentPairs[i][1][1] * multiplier]);
    //     if(turf.booleanPointInPolygon(tpm2, turfPolygons[i]))
    //       continue

    //     var features = turf.polygonTangents(tpm1, turfPolygons[j]).features
    //     var t1 = new Point([features[0].geometry.coordinates[0]/multiplier, features[0].geometry.coordinates[1]/multiplier])
    //     var t2 = new Point([features[1].geometry.coordinates[0]/multiplier, features[1].geometry.coordinates[1]/multiplier])
    //     var angle1 = p1.angleToPoint(t1)
    //     var angle2 = p1.angleToPoint(t2)
    //     var diff = angle1 - angle2
    //     diff = diff < 0 ? diff + Math.PI : diff

    //     // ensure angle2 is the left one
    //     if(diff > Math.PI/2){
    //       var temp = angle1
    //       angle1 = angle2
    //       angle2 = temp
    //     }

    //     var diff1 = angle1 - angle
    //     diff1 = diff1 < 0 ? diff1 + Math.PI : diff1

    //     var diff2 = angle - angle2
    //     diff2 = diff2 < 0 ? diff2 + Math.PI : diff2

    //     // angle is between angle1 and angle2
    //     if(diff1 < Math.PI/2 && diff2 < Math.PI/2){
    //       const dist = calcEdgeDistance(p1, p2)
    //       const dist1 = calcEdgeDistance(p1, t1)
    //       const dist2 = calcEdgeDistance(p1, t2)

    //       // if both tangents are closer
    //       if(dist1<dist && dist2<dist){
    //         isVisible = false
    //         break;
    //       }
    //     }
    //   }

    //   if(isVisible)
        // output += ',{"fromId":"'+createNodeId(nearestStart)+'","toId":"'+createNodeId(nearestEnd)+'"}'
    // }
  }




  // var m1 = L.marker([tangentPairs[0][0][0],tangentPairs[0][0][1], {
  //   draggable: true,
  //   icon: new L.NumberedDivIcon()
  // })

  // var m2 = L.marker(tangentPairs[0][1][0],tangentPairs[0][1][1], {
  //   draggable: true,
  //   icon: new L.NumberedDivIcon()
  // })




  // routeLayer.setLatLngs([])
  // var nearestStart = turf.nearestPoint(t1, points)
  // var nearestEnd = turf.nearestPoint(t2, points)
  // foundPath = pathFinder.find(createNodeId(nearestStart), createNodeId(nearestEnd))
  // drawPath()







  // var tangents2 = [[features[0].geometry.coordinates[0]/multiplier, features[0].geometry.coordinates[1]/multiplier], 
  //                   [features[1].geometry.coordinates[0]/multiplier, features[1].geometry.coordinates[1]/multiplier]]





  // var point = turf.point([Math.round(tangents2[0][0] * multiplier), Math.round(tangents2[0][1] * multiplier)]);
  // var features = turf.polygonTangents(point, polygon1)
  // var tangents1 = [[features[0].geometry.coordinates[0]/multiplier, features[0].geometry.coordinates[1]/multiplier], 
  //                   [features[1].geometry.coordinates[0]/multiplier, features[1].geometry.coordinates[1]/multiplier]]







  // startMarker = L.marker([ a[0].x, a[0].y], {
  //   draggable: true,
  //   icon: new L.NumberedDivIcon()
  // }).addTo(map)

  // var tangent = [ tangents.features[0].geometry.coordinates[0]/multiplier, tangents.features[0].geometry.coordinates[1]/multiplier]

  // endMarker = L.marker(tangent, {
  //   draggable: true,
  //   icon: new L.NumberedDivIcon()
  // }).addTo(map)

  // var nearestStart = turf.nearestPoint(startMarker.toGeoJSON(), points)
  // var nearestEnd = turf.nearestPoint(endMarker.toGeoJSON(), points)
  // foundPath = pathFinder.find(createNodeId(nearestStart), createNodeId(nearestEnd))
  // drawPath()


  // console.log(a[0].x + "," + a[0].y + " " + tangent[0] + "," + tangent[1])
  // console.log('')










    // // n1 -> number of points in polygon a 
    // // n2 -> number of points in polygon b 
    // var n1 = a.length, n2 = b.length; 
  
    // // To find a point inside the convex polygon(centroid), 
    // // we sum up all the coordinates and then divide  by 
    // // n(number of points). But this would be a floating-point 
    // // value. So to get rid of this we multiply points 
    // // initially with n1 and then find the centre and 
    // // then divided it by n1 again. 
    // // Similarly we do divide and multiply for n2 (i.e., 
    // // elements of b) 
  
    // // maxa and minb are used to check if polygon a 
    // // is left of b. 
    // var maxa = Number.MIN_SAFE_INTEGER; 
    // for (var i=0; i<n1; i++) 
    // { 
    //     maxa = Math.max(maxa, a[i].x); 
    //     mid.x  += a[i].x;
    //     mid.y += a[i].y; 
    //     a[i].x *= n1; 
    //     a[i].y *= n1; 
    // } 
  
    // // sorting the points in counter clockwise order 
    // // for polygon a 
    // const clonedA = clonePoints(a)
    // sortPoints(a[0], clonedA)
    // a = clonedA
  
    // for (var i=0; i<n1; i++) 
    // { 
    //     a[i].x /= n1; 
    //     a[i].y /= n1; 
    // } 
  
    // mid = new Point([0,0])
  
    // var minb = Number.MAX_SAFE_INTEGER; 
    // for (var i=0; i<n2; i++) 
    // { 
    //     mid.x += b[i].x; 
    //     mid.y += b[i].y; 
    //     minb = Math.min(minb, b[i].x); 
    //     b[i].x *= n2; 
    //     b[i].y *= n2; 
    // } 
  
    // // sorting the points in counter clockwise 
    // // order for polygon b 
    // const clonedB = clonePoints(b)
    // sortPoints(b[0], clonedB)
    // b = clonedB
  
    // for (var i=0; i<n2; i++) 
    // { 
    //     b[i].x/=n2; 
    //     b[i].y/=n2; 
    // } 
  
    // // If a is to the right of b, swap a and b 
    // // This makes sure a is left of b. 
    // if (minb < maxa) 
    // { 
    //     b = [a, a = b][0];  // swap a and b    
    //     n1 = a.length;
    //     n2 = b.length;
    // } 
  
    // // ia -> rightmost point of a 
    // var ia = 0, ib = 0; 
    // for (var i=1; i<n1; i++) 
    //     if (a[i].x > a[ia].x) 
    //         ia = i; 
  
    // // ib -> leftmost point of b 
    // for (var i=1; i<n2; i++) 
    //     if (b[i].x < b[ib].x) 
    //         ib=i; 
  
    // // finding the upper tangent 
    // var inda = ia, indb = ib; 
    // var done = 0; 
    // while (!done) 
    // { 
    //     done = 1; 
    //     // const g = createGraph()
    //     // g.addNode(createNodeId2(b[indb]), { x: b[indb].x, y: b[indb].y })
    //     // g.addNode(createNodeId2(a[inda]), { x: a[inda].x, y: a[inda].y })
    //     // g.addNode(createNodeId2(a[(inda+1)%n1]), { x: a[(inda+1)%n1].x, y: a[(inda+1)%n1].y })
    //     // g.addLink(createNodeId2(b[indb]), createNodeId2(a[inda]))
    //     // g.addLink(createNodeId2(a[inda]), createNodeId2(a[(inda+1)%n1]))
    //     // setGraph(g)
    //     // routeLayer.setLatLngs([b[indb], a[inda]])
    //     // drawPath()

    //     // routeLayer.setLatLngs([])


    //     while (orientation(b[indb], a[inda], a[(inda+1)%n1]) > 0) 
    //         inda = (inda + 1) % n1; 
  
    //     while (orientation(a[inda], b[indb], b[(n2+indb-1)%n2]) < 0) 
    //     { 
    //         indb = (n2+indb-1)%n2; 
    //         done = 0; 
    //     } 
    // } 
    // console.log(a[inda].x + "," + a[inda].y)
  
    // // cout << "upper tangent (" << a[inda].x << ","
    // //     << a[inda].y << ") (" << b[indb].x 
    // //     << "," << b[indb].y << ")\n"; 
} 

  function createNodeId2 (p) {
    return p.x + ',' + p.y
  }

export function clearGraphRelatedData () {
  if (routeLayer !== null) routeLayer.setLatLngs([])
  if (selectionLayer !== null) selectionLayer.clearLayers()
}

export function setupRouteLayer () {
  routeLayer = L.polyline([], {
    color: '#EB3223'
  }).addTo(map)
}

export function setPathFinder (pathGraph) {
  pathFinder = pathGraph
  return updatePathMarkers()
}

function updatePathMarkers () {
  if(updatingPathMarkers){
    updatingPathMarkers = 0
    return
  }

  updatingPathMarkers = true
  const startCreation = window.performance.now()

  if(routeLayer != null)
    routeLayer.setLatLngs([])
  restoreOriginalPointsAndEdges()

  if(routeLayer != null){
    startPoint = new Point([startMarker.toGeoJSON().geometry.coordinates[0], startMarker.toGeoJSON().geometry.coordinates[1]]);
    endPoint = new Point([endMarker.toGeoJSON().geometry.coordinates[0], endMarker.toGeoJSON().geometry.coordinates[1]]);
  }

  var dynamicNodesJSON = getDynamicNodesJSON(startPoint, endPoint)
  var dynamicEdgesJSON = getDynamicEdgesJSON(startPoint, endPoint)
  updateGraphWithDynamicJSON(dynamicNodesJSON, dynamicEdgesJSON)

  if(routeLayer != null){
    var nearestStart = turf.nearestPoint(startMarker.toGeoJSON(), points)
    var nearestEnd = turf.nearestPoint(endMarker.toGeoJSON(), points)
    nearestStart = startMarker.toGeoJSON()
    nearestEnd = endMarker.toGeoJSON()
    foundPath = pathFinder.find(createNodeId(nearestStart), createNodeId(nearestEnd))
    drawPath()
  }else{
    foundPath = pathFinder.find(createNodeId2(startPoint), createNodeId2(endPoint))
  }
  console.log("\tvar start = ["+createNodeId2(startPoint)+"]\n\tvar end = ["+createNodeId2(endPoint)+"]\n\n")

  const endCreation = window.performance.now()
  const timeTakenToCreate = parseInt(endCreation - startCreation)
  console.log('Time to find path: ', timeTakenToCreate)

  updatingPathMarkers = false

  return foundPath
}

function drawPath () {
  const pathLatLngs = foundPath.map(function (node) {
    return [node.data.y, node.data.x]
  })
  routeLayer.setLatLngs(pathLatLngs)
}

function createNodeId (p) {
  return p.geometry.coordinates[0] + ',' + p.geometry.coordinates[1]
}

function unhighlightFeature () {
  selectionLayer.clearLayers()
}

export function setGraph (gd) {
  graphData = gd
}

function highlightFeature (e) {
  selectionLayer.clearLayers()

  const node = graphData.getNode(e.target._latlng.lng + ',' + e.target._latlng.lat)

  graphData.forEachLinkedNode(e.target._latlng.lng + ',' + e.target._latlng.lat, function (linkedNode, link) {
    L.polyline([[linkedNode.data.y, linkedNode.data.x], [node.data.y, node.data.x]], {
      weight: 0.5,
      opacity: 0.8,
      pane: 'shadowPane',
      interactive: false
    }).addTo(selectionLayer)
  })
}

function createNumberDiv () {
  return L.Icon.extend({
    options: {
      iconSize: new L.Point(15, 15),
      className: 'leaflet-div-icon'
    },
    createIcon: function () {
      var div = document.createElement('div')
      var numdiv = document.createElement('div')
      numdiv.setAttribute('class', 'number')
      numdiv.innerHTML = this.options['number'] || ''
      div.appendChild(numdiv)
      this._setIconStyles(div, 'icon')
      return div
    }
  })
}
