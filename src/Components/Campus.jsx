import { useState, useEffect, Fragment } from "react";
import stringSimilarity from "string-similarity";
import { useJsApiLoader } from "@react-google-maps/api";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";
import { Sparkles } from "lucide-react";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "16px",
  overflow: "hidden",
};

const defaultCenter = { lat: 23.41856, lng: 85.43586 };

const places = [
  { name: "Current Location", lat: null, lng: null },
  { name: "Main Gate", lat: 23.426245, lng: 85.431518 },
  { name: "Main Academic Building", lat: 23.412658, lng: 85.439797 },
  { name: "Dept. of Architecture and Planning", lat: 23.411763, lng: 85.439149 },
  { name: "R & D Building", lat: 23.413133, lng: 85.441698 },
  { name: "Golden Jubilee Auditorium/GP Birla Auditorium", lat: 23.422655, lng: 85.439043 },
  { name: "BIT Central Library", lat: 23.411957, lng: 85.439767 },
  { name: "Training & Placement Division", lat: 23.411775, lng: 85.439058 },
  { name: "State Bank of India (SBI)", lat: 23.412567, lng: 85.441891 },
  { name: "Apni Rasoi/Main Canteen/Mehak Canteen", lat: 23.412521, lng: 85.441602 },
  { name: "Urban Fresh/IC Food Truck", lat: 23.411907, lng: 85.441613 },
  { name: "IC Inner Canteen", lat: 23.411896, lng: 85.441250 },
  { name: "Hot 'N' Cold", lat: 23.411816, lng: 85.441183 },
  { name: "Book Center", lat: 23.411821, lng: 85.441041 },
  { name: "ATM (IC)", lat: 23.411820, lng: 85.441275 },
  { name: "Lecture Hall 3-4", lat: 23.411751, lng: 85.440742 },
  { name: "Production & Industrial Engineering Dept.", lat: 23.411584, lng: 85.440122 },
  { name: "Dept. of Mathematics", lat: 23.411571, lng: 85.439599 },
  { name: "Lecture Hall 1-2", lat: 23.411482, lng: 85.439620 },
  { name: "Lecture Hall Parking & Bicycle Stand", lat: 23.411480, lng: 85.439799 },
  { name: "IC Vehicle Parking", lat: 23.411932, lng: 85.441422 },
  { name: "Post Office", lat: 23.411830, lng: 85.441255 },
  { name: "BIT Laxmi Canteen", lat: 23.413608, lng: 85.436167 },
  { name: "Laxmi Canteen Saloon", lat: 23.413665, lng: 85.436110 },
  { name: "Transport Department/BIT Bus starting Point", lat: 23.411584, lng: 85.441796 },
  { name: "Nescafe", lat: 23.411379, lng: 85.441535 },
  { name: "NCC Office", lat: 23.411203, lng: 85.442235 },
  { name: "NCC Ground", lat: 23.410946, lng: 85.441480 },
  { name: "Construction Department", lat: 23.4116758, lng: 85.4412596 },
  { name: "Dept. of Pharmaceutical Sciences & Technology", lat: 23.41065, lng: 85.44084 },
  { name: "Dept. of Chemical Engineering Laboratory", lat: 23.41101, lng: 85.44052 },
  { name: "Dept. of Chemical Engineering", lat: 23.41048, lng: 85.44033 },
  { name: "Veda e Cafe", lat: 23.41022, lng: 85.44025 },
  { name: "Music Room", lat: 23.41139, lng: 85.44213 },
  { name: "Central Animal House", lat: 23.41163, lng: 85.44147 },
  { name: "Student Activity Centre", lat: 23.41113, lng: 85.44082 },
  { name: "Dept. of BioEngineering & BioTechnology", lat: 23.41010, lng: 85.44060 },
  { name: "Green House", lat: 23.41032, lng: 85.44119 },
  { name: "Bio-Tech Shed", lat: 23.40995, lng: 85.44092 },
  { name: "Dept. of Space Engg. & Rocketry", lat: 23.41059, lng: 85.44554 },
  { name: "Wind Tunnel Lab", lat: 23.40989, lng: 85.44473 },
  { name: "Cryogenic Lab", lat: 23.410149, lng: 85.445046 },
  { name: "Firing Range", lat: 23.409578, lng: 85.444993 },
  { name: "Rocket Testing Ground", lat: 23.411260, lng: 85.449234 },
  { name: "Subarnarekha Viewpoint", lat: 23.409379, lng: 85.442801 },
  { name: "UCO Bank", lat: 23.41305, lng: 85.44196 },
  { name: "Mesra Mini Port", lat: 23.407311, lng: 85.438740 },
  { name: "Water Treatment Plant", lat: 23.411077, lng: 85.439046 },
  { name: "Firebolt Racing Fabrication", lat: 23.41087, lng: 85.44015 },
  { name: "Team Srijan Manufacturing House", lat: 23.41101, lng: 85.44035 },
  { name: "Sliting Tank", lat: 23.411290, lng: 85.439402 },
  { name: "BIT Dispensary", lat: 23.41557, lng: 85.43529 },
  { name: "Dept, of Hotel Management", lat: 23.41650, lng: 85.43558 },
  { name: "MS Xerox", lat: 23.41678, lng: 85.43572 },
  { name: "Institute Guest House-II", lat: 23.41676, lng: 85.43639 },
  { name: "Red Food Truck (Hostel side)/RK Food Truck", lat: 23.416722, lng: 85.437881 },
  { name: "Cricket Oval Ground", lat: 23.425943, lng: 85.430785 },
  { name: "Hostel No. 1", lat: 23.414118, lng: 85.440033 },
  { name: "Hostel No. 2", lat: 23.413742, lng: 85.438737 },
  { name: "Hostel No. 3", lat: 23.415910, lng: 85.439479 },
  { name: "Hostel No. 4", lat: 23.415671, lng: 85.438114 },
  { name: "Hostel No. 5", lat: 23.420545, lng: 85.434468 },
  { name: "Hostel No. 6", lat: 23.422896, lng: 85.433315 },
  { name: "Hostel No. 7", lat: 23.424612, lng: 85.432220 },
  { name: "Hostel No. 8", lat: 23.416228, lng: 85.440988 },
  { name: "Hostel No. 9", lat: 23.416804, lng: 85.443520 },
  { name: "Hostel No. 10", lat: 23.419164, lng: 85.434949 },
  { name: "Hostel No. 11", lat: 23.418128, lng: 85.435841 },
  { name: "Hostel No. 12", lat: 23.418876, lng: 85.434046 },
  { name: "Hostel No. 13", lat: 23.417768, lng: 85.434427 },
  { name: "RS Hostel", lat: 23.425681, lng: 85.437586 },
  { name: "TA Hostel (TH/1 - TH/35)", lat: 23.424463, lng: 85.435594 },
  { name: "Inner Cooperative", lat: 23.412820, lng: 85.438210 },
  { name: "Outer Cooperative", lat: 23.423893, lng: 85.439626 },
  { name: "Sharma Dhaba", lat: 23.423418, lng: 85.438245 },
  { name: "Chotu Dhaba", lat: 23.419271, lng: 85.433471 },
  { name: "Pahan Dhaba", lat: 23.417718, lng: 85.434132 },
  { name: "Saka (Pahan) Mens Parlour", lat: 23.417538, lng: 85.434266 },
  { name: "ITALIAN PIZZA HUB", lat: 23.420982, lng: 85.433809 },
  { name: "Techno Area", lat: 23.423414, lng: 85.432560 },
  { name: "Gupta Sweets", lat: 23.423430, lng: 85.432612 },
  { name: "Amrit Dhara", lat: 23.423310, lng: 85.432476 },
  { name: "Technosoft Stationery Store", lat: 23.423448, lng: 85.432723 },
  { name: "Sports Complex", lat: 23.424641, lng: 85.433972 },
  { name: "Basketball Court", lat: 23.426639, lng: 85.434654 },
  { name: "Indoor Badminton Court", lat: 23.4251, lng: 85.4347 },
  { name: "Gymnasium", lat: 23.424779, lng: 85.433969 },
  { name: "Theta Point", lat: 23.420367, lng: 85.440352 },
  { name: "VIP Bunglow-II", lat: 23.416983, lng: 85.440294 },
  { name: "VIP Bunglow-I", lat: 23.417113, lng: 85.440895 },
  { name: "Old Guest House", lat: 23.416537, lng: 85.441932 },
  { name: "VC Qrtr", lat: 23.416008, lng: 85.442048 },
  { name: "BIT Club House", lat: 23.414051, lng: 85.443233 },
  { name: "Shiva Temple", lat: 23.413201, lng: 85.444941 },
  { name: "Lawn Circle", lat: 23.414828, lng: 85.439107 },
  { name: "Upper Lawn", lat: 23.413820, lng: 85.439328 },
  { name: "Lower Lawn", lat: 23.415608, lng: 85.438812 },
  { name: "Shorbagh-1", lat: 23.413152, lng: 85.440900 },
  // { name: "Type A Quarters", lat: 23.415660, lng: 85.435730 },
  // { name: "Type B Quarters", lat: 23.415940, lng: 85.436380 },
  // { name: "Type C Quarters", lat: 23.416210, lng: 85.435980 },
  // { name: "Type D Quarters", lat: 23.416460, lng: 85.436530 },
  // { name: "Staff Housing Complex", lat: 23.417060, lng: 85.435570 },
  { name: "Secondary Gate (North Side)", lat: 23.427165, lng: 85.431924 },
  { name: "Primary School", lat: 23.424789, lng: 85.441260 },
  { name: "Middle School", lat: 23.424998, lng: 85.440956 },
  { name: "High School", lat: 23.425334, lng: 85.440644 },
  { name: " BIT +2 School", lat: 23.42552, lng: 85.44013 },
  { name: "Khatal", lat: 23.425829, lng: 85.439844 }


];

const GOOGLE_MAPS_API_KEY = "AIzaSyB6Z9F2vwV9ioiANgiu6MpF5EFLkWhNZbQ"; // replace with ENV for security

export default function Campus() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [query, setQuery] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const placeholderPhrases = [
    "Search a place in BIT",
    "Confused, where to go in BIT?",
    "Hey! just say what you want in BIT?",
    "Try something like Guest House or Central Library",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);

  useEffect(() => {
    const currentPhrase = placeholderPhrases[placeholderIndex];

    let timeout;
    if (isDeleting) {
      timeout = setTimeout(() => {
        setTypedPlaceholder((prev) => prev.slice(0, -1));
      }, 60);
    } else {
      timeout = setTimeout(() => {
        setTypedPlaceholder((prev) =>
          currentPhrase.slice(0, prev.length + 1)
        );
      }, 110);
    }

    if (!isDeleting && typedPlaceholder === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    }

    if (isDeleting && typedPlaceholder === "") {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholderPhrases.length);
      }, 700);
    }

    return () => clearTimeout(timeout);
  }, [typedPlaceholder, isDeleting]);

  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => alert("Please enable location access.")
    );
  }, []);

  useEffect(() => {
    if (userLocation && selectedLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: selectedLocation,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") setDirections(result);
        }
      );
    }
  }, [userLocation, selectedLocation]);

  useEffect(() => {
    if (selectedPlace?.lat && selectedPlace?.lng) {
      setSelectedLocation({ lat: selectedPlace.lat, lng: selectedPlace.lng });
    } else {
      setSelectedLocation(null);
      setDirections(null);
    }
  }, [selectedPlace]);

  const handleAutoPlace = () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    const matched = places.find(
      (p) => p.name.toLowerCase() === place.name.toLowerCase()
    );
    if (matched)
      setSelectedLocation({ lat: matched.lat, lng: matched.lng });
    else alert("Place not found in BIT Campus list.");
  };

  const handleSelectSuggestion = (place) => {
    setSelectedPlace(place);
    setSelectedLocation({ lat: place.lat, lng: place.lng });
    setAiSuggestions([]);
  };

  const handleAIQuery = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setAiSuggestions([]);

    try {
      const prompt = `
You are an AI assistant for BIT Mesra campus.

Given a user query like: "${searchQuery}"

Return only a list of place names from the following official campus locations. 
Match relevant locations to the query *exactly*. Use the place names *as-is* from the list. 
Do NOT guess or include places that are not listed.

Respond ONLY with a JSON array like: ["place 1", "place 2", ...]

Campus places:
${places.map((p) => `"${p.name}"`).join(", ")}
    `;

      const geminiRes = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
        import.meta.env.VITE_GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const geminiData = await geminiRes.json();
      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiText) throw new Error("No AI response");

      // Parse AI output JSON array safely
      let aiNames = [];
      console.log("Raw AI text:", aiText);
      try {
        aiNames = JSON.parse(aiText);
      } catch (e) {
        // Fallback: try splitting manually
        aiNames = aiText
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const aiLower = aiNames.map((n) => n.toLowerCase());

      const matched = aiNames
        .map((name) => {
          const { bestMatch } = stringSimilarity.findBestMatch(
            name.toLowerCase(),
            places.map((p) => p.name.toLowerCase())
          );

          const matchScore = bestMatch.rating;
          const matchedName = bestMatch.target;

          if (matchScore > 0.7) {
            return places.find(
              (p) => p.name.toLowerCase() === matchedName
            );
          }

          return null;
        })
        .filter(Boolean);

      if (matched.length === 0) throw new Error("No matching places found.");
      setAiSuggestions(matched);
    } catch (err) {
      console.error("AI error:", err);
      alert("AI failed or no matching place found.");
    } finally {
      setIsLoading(false);
    }
  };
  if (!isLoaded) return <div className="text-center mt-12">Loading Map...</div>;
  return (
    <div className="min-h-screen px-4 py-6 bg-custom-color bg-[radial-gradient(circle_at_60%_40%,#fce8d5_0%,#fef2e3_50%,#fff8ef_100%)]">
      <div className="max-w-5xl mx-auto flex flex-col items-center space-y-3 mt-12">

        <div className="flex justify-center bg-slate-200 p-6 shadow-lg rounded-lg w-full mb-1">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "monospace" }}>BIT Campus Map</h1>
        </div>
        <div className="bg-slate-200 p-6 shadow-lg rounded-lg w-full flex flex-col space-y-3 items-center">
          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handleAutoPlace}>
              <div className="glow-border bg-gray-100 border rounded-md px-4 py-2 w-full text-sm focus:outline-none">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={typedPlaceholder}
                  className="w-full glow-border-inner px-4 py-2 text-sm focus:outline-none"
                />
              </div>
            </Autocomplete>

            <button
              onClick={handleAIQuery}
              disabled={isLoading}
              className={`absolute top-1/2 right-5 -translate-y-1/2 text-blue-500 hover:text-blue-700 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <Sparkles size={18} />
            </button>
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="w-full relative max-w-md bg-gray-100 shadow rounded-lg p-4 max-h-72 overflow-y-auto custom-scroll">
              <p className="font-semibold mb-2">AI Suggestions:</p>
              <ul className="space-y-2">
                {aiSuggestions.map((place, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleSelectSuggestion(place)}
                      className="w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-2 rounded-md"
                    >
                      {place.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dropdown */}
          <div className="w-full max-w-sm">
            <Listbox value={selectedPlace} onChange={setSelectedPlace}>
              <div className="relative">
                <div className="">
                  <Listbox.Button className="bg-gray-100 w-full cursor-pointer rounded-full py-2 pl-4 pr-10 text-left text-sm text-gray-800 shadow-sm focus:outline-none">
                    {selectedPlace ? selectedPlace.name : "Select a place"}
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <ChevronUpDownIcon className="h-4 w-4 text-gray-500" />
                    </span>
                  </Listbox.Button>
                </div>

                <Listbox.Options className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-50 max-h-64 overflow-y-auto text-sm focus:outline-none">
                  <div className="sticky top-0 bg-white border-b px-3 py-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="w-full border border-black rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder="Search place..."
                    />
                  </div>
                  {filteredPlaces.map((place, idx) => (
                    <Listbox.Option
                      key={idx}
                      value={place}
                      className={({ active }) =>
                        `cursor-pointer select-none px-4 py-2 ${active ? "bg-blue-100 text-blue-900" : "text-gray-800"}`
                      }
                    >
                      {place.name}
                    </Listbox.Option>
                  ))}
                  {filteredPlaces.length === 0 && (
                    <div className="px-4 py-2 text-gray-400">No match found</div>
                  )}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>
        {/* Map */}
        <div className="w-full">
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "500px",
              borderRadius: "16px",
              overflow: "hidden",
            }}
            center={selectedLocation || defaultCenter}
            zoom={selectedLocation ? 17 : 15}
            options={{
              fullscreenControl: true,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
            }}
          >
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
              />
            )}
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
                label={{
                  text:
                    places.find(
                      (p) =>
                        p.lat === selectedLocation.lat &&
                        p.lng === selectedLocation.lng
                    )?.name || "Selected",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#FFFFFF",
                }}
              />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>
      </div>
    </div>

  );
}
