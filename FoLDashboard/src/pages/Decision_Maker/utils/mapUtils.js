/**
 * mapUtils.js
 * Utility functions for map operations and data processing
 */
// import L from "leaflet";

/**
 * Parse WKT polygon string to Leaflet coordinates
 * @param {string} wktString - The WKT polygon string
 * @returns {Array|null} Array of coordinate pairs [lat, lng] or null if invalid
 */
export const parseWKTPolygon = (wktString) => {
  try {
    // Basic validation
    if (!wktString || typeof wktString !== 'string') {
      console.error("Invalid WKT string:", wktString);
      return null;
    }
    
    // Match POLYGON format: POLYGON ((x y, x y, ...))
    const matches = wktString.match(/POLYGON\s*\(\((.*?)\)\)/i);
    
    if (!matches || matches.length < 2) {
      console.error("WKT format not recognized:", wktString.substring(0, 100));
      return null;
    }
    
    const coordsText = matches[1];
    
    // Split by commas to get each coordinate pair
    const coordPairs = coordsText.split(',').map(pair => pair.trim());
    
    // Convert each "x y" pair to [y, x] for Leaflet (Leaflet uses [lat, lng])
    const coordinates = coordPairs.map(pair => {
      const parts = pair.split(/\s+/);
      if (parts.length < 2) {
        return null;
      }
      
      const lng = parseFloat(parts[0].trim());
      const lat = parseFloat(parts[1].trim());
      
      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }
      
      return [lat, lng]; // Leaflet uses [lat, lng]
    }).filter(coord => coord !== null);
    
    if (coordinates.length < 3) {
      console.error("Not enough valid coordinates to form a polygon");
      return null;
    }
    
    return coordinates;
  } catch (error) {
    console.error("Error parsing WKT polygon:", error);
    return null;
  }
};

/**
 * Calculate district center based on geometry
 * @param {Array} geometryCoords - Array of coordinate pairs
 * @returns {Array} Coordinates of the center [lat, lng]
 */
export const calculateDistrictCenter = (geometryCoords) => {
  if (!geometryCoords || geometryCoords.length === 0) {
    return [24.7136, 46.6753]; // Default Riyadh center
  }
  
  // Calculate the center by averaging all coordinates
  const lats = geometryCoords.map(coord => coord[0]);
  const lngs = geometryCoords.map(coord => coord[1]);
  
  return [
    (Math.max(...lats) + Math.min(...lats)) / 2,
    (Math.max(...lngs) + Math.min(...lngs)) / 2
  ];
};

/**
 * Enhance district data with safety perception data
 * @param {Array} districts - Array of district objects
 * @param {Array} safetyData - Array of safety perception data
 * @returns {Array} Enhanced districts data with safety information
 */
export const enhanceDistrictData = (districts, literacyData) => {
  if (!districts || !Array.isArray(districts)) return [];
  
  return districts.map(district => {
    // Find matching safety data
    const literacyInfo = literacyData.find(
      sd => sd.name_en === district.name_en
    );
    
    const literacyScore = literacyInfo ? literacyInfo["Literacy_Rate"] : null;
    
    return {
      ...district,
      literacy: literacyScore
    };
  });
};

/**
* Function to check if a point is inside a polygon (ray-casting algorithm)
* @param {Array} point - [lat, lng]
* @param {Array} vs - Array of [lat, lng] pairs (polygon)
* @returns {boolean}
*/
function pointInPolygon(point, vs) {
 var x = point[1], y = point[0];
 var inside = false;
 for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
   var xi = vs[i][1], yi = vs[i][0];
   var xj = vs[j][1], yj = vs[j][0];
   var intersect = ((yi > y) !== (yj > y)) &&
     (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-10) + xi);
   if (intersect) inside = !inside;
 }
 return inside;
}
/**
 * Function to count facilities in selected district
 * @param {Object} selectedDistrict - The currently selected district
 * @param {Array} highlightedDistrictGeometry - Array of coordinates for the district boundary
 * @param {Array} Universities - Array of universities objects with position data
 * @param {Array} Schools - Array of schools station objects with position data
 * @param {Array} ChildhoodCenters - Array of childhoodCenters station objects with position data
 * @param {Array} Libraries - Array of childhoodCenters station objects with position data

 * @returns {Object} Counts of facilities within the district
 */
export const getDistrictFacilityCounts = (
  selectedDistrict, 
  highlightedDistrictGeometry, 
  Universities, 
  Schools, 
  ChildhoodCenters,
  Libraries
) => {
  if (!selectedDistrict || !highlightedDistrictGeometry) {
    return { schools: 0, childhoodCenters: 0, universities: 0 , libraries: 0};
  }
  
  // Create a Leaflet polygon for bounds checking
  // const bounds = L.polygon(highlightedDistrictGeometry).getBounds();
  
  // Simple point-in-bounding-box check
  const isPointInPolygon = (point) => {
    if (!point || point.length < 2) return false;
    return pointInPolygon(point, highlightedDistrictGeometry);
  };
  
  // Count facilities within the district boundary
  return {
    schools: Schools.filter(school => isPointInPolygon(school.position)).length,
    childhoodCenters: ChildhoodCenters.filter(center => isPointInPolygon(center.position)).length,
    universities: Universities.filter(university => isPointInPolygon(university.position)).length,
    libraries: Libraries.filter(library => isPointInPolygon(library.position)).length
  };
};