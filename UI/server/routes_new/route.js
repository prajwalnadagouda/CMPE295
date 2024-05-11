const express = require("express");
const router = express.Router();
const { Route, validateRoute } = require("../models_new/route");
const { Shuttle } = require("../models_new/shuttle");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authToken");
const { Booking } = require("../models_new/booking");
const { Stop } = require("../models_new/stop");

router.get("/view", async (req, res) => {
  try {
    const routes = await Route.find().exec();
    res.status(200).send(routes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).send("Failed to fetch routes");
  }
});

router.post("/save", async (req, res) => {
  try {
    const { error } = validateRoute(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newRoute = new Route({
      created_by: mongoose.Types.ObjectId(req.body.created_by),
      route_name: req.body.route_name,
      stops: req.body.stops,
      assignees: [],
      active: req.body.active,
      type: req.body.type,
      updated_at: req.body.updated_at,
    });

    const savedRoute = await newRoute.save();

    res.status(201).send(savedRoute);
  } catch (error) {
    console.error("Error saving route:", error);
    res.status(500).send("Failed to save route");
  }
});

router.post("/assignShuttle", async (req, res) => {
  const { routeId, shuttleId, datetime, shuttleCapacity } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(routeId) ||
    !mongoose.Types.ObjectId.isValid(shuttleId)
  ) {
    return res.status(400).send("Invalid ID.");
  }

  try {
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).send("Route not found.");
    }

    const newAssignee = {
      datetime: new Date(datetime),
      shuttle_current_capacity: shuttleCapacity,
      shuttle_id: shuttleId,
    };

    route.assignees.push(newAssignee);
    await route.save();
    res.send({ message: "Shuttle assigned successfully.", route });
  } catch (error) {
    console.error("Failed to assign shuttle:", error);
    res.status(500).send("Error assigning shuttle to route.");
  }
});

router.get("/shuttleDetails", async (req, res) => {
  let { shuttleIds } = req.query;
  try {
    if (!Array.isArray(shuttleIds)) {
      shuttleIds = [shuttleIds];
    }
    const shuttleDetails = await Shuttle.find({
      _id: { $in: shuttleIds.map((id) => mongoose.Types.ObjectId(id)) },
      active: true,
    });
    res.status(200).send(shuttleDetails);
  } catch (error) {
    console.error("Failed to fetch shuttle details:", error);
    res.status(500).send("Error fetching shuttle details");
  }
});

function haversineDistance(coords1, coords2, isMiles = false) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  const lon1 = coords1.lng;
  const lat1 = coords1.lat;
  const lon2 = coords2.lng;
  const lat2 = coords2.lat;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return isMiles ? d * 0.621371 : d;
}

router.post("/findRoutes", async (req, res) => {
  const { source, destination, maxDistance } = req.body;

  if (!source || !destination || !maxDistance) {
    return res
      .status(400)
      .send("Source, destination, and max distance are required.");
  }

  console.log("Received source:", source.lat, source.lng);
  console.log("Received destination:", destination.lat, destination.lng);
  console.log("Maximum distance allowed:", maxDistance, "miles");

  try {
    const routes = await Route.find({ "assignees.0": { $exists: true } });
    const validRoutes = [];

    routes.forEach((route) => {
      let closestToSource = { distance: Infinity, stop: null };
      let closestToDestination = { distance: Infinity, stop: null };

      route.stops.forEach((stop) => {
        const distanceFromSource = haversineDistance(
          { lat: stop.stop_lat, lng: stop.stop_long },
          source,
          true
        );
        const distanceFromDestination = haversineDistance(
          { lat: stop.stop_lat, lng: stop.stop_long },
          destination,
          true
        );
        console.log(
          `Stop Name: ${
            stop.stop_name
          }, Distance from Source: ${distanceFromSource.toFixed(
            2
          )} miles, Distance from Destination: ${distanceFromDestination.toFixed(
            2
          )} miles`
        );

        if (distanceFromSource < closestToSource.distance) {
          closestToSource = {
            distance: distanceFromSource,
            stop: stop.stop_name,
          };
        }
        if (distanceFromDestination < closestToDestination.distance) {
          closestToDestination = {
            distance: distanceFromDestination,
            stop: stop.stop_name,
          };
        }
      });

      if (
        closestToSource.distance <= maxDistance &&
        closestToDestination.distance <= maxDistance
      ) {
        validRoutes.push({
          ...route.toObject(),
          closestToSource,
          closestToDestination,
        });
      }
    });
    console.log("Valid routes within distance:", validRoutes.length);
    res.status(200).send(validRoutes);
  } catch (error) {
    console.error(
      "Error fetching routes based on source and destination:",
      error
    );
    res
      .status(500)
      .send("Failed to fetch routes based on source and destination");
  }
});

router.get("/upcomingBookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ active: true });
    console.log(bookings);
    const results = [];

    for (let booking of bookings) {
      //   const route = booking.route_id;
      const route = await Route.findById(booking.route_id);
      const shuttle = await Shuttle.findById(route.assignees[0].shuttle_id);
      const sourceStop = route.stops.filter((stop) => stop.stop_order === "S");
      const destinationStop = route.stops.filter(
        (stop) => stop.stop_order === "D"
      );

      const formattedDateTime = new Date(
        route.assignees[0].datetime
      ).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      console.log(sourceStop);
      const formattedBooking = {
        shuttleNumber: shuttle.shuttle_number,
        capacity: route.assignees[0].shuttle_current_capacity,
        vehicle: shuttle._id,
        vehicleName: shuttle.shuttle_name,
        source: sourceStop[0].stop_name,
        destination: destinationStop[0].stop_name,
        startTime: formattedDateTime,
        // endTime: "10:50 PM",
        stops: route.stops.map((stop) => stop.stop_name),
        // estimatedTime: "1 hour",
      };
      console.log(formattedBooking);

      results.push(formattedBooking);
    }

    res.json(results);
  } catch (error) {
    console.error("Failed to fetch upcoming bookings:", error);
    res.status(500).json({ message: "Error processing your request" });
  }
});

router.get("/pastBookings", authMiddleware, async (req, res) => {
  const pastData = [
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V015",
      source: "University Campus",
      destination: "Beach",
      startTime: "11:52 PM",
      endTime: "03:10 PM",
      stops: ["Museum"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V022",
      source: "Business District",
      destination: "Tourist Attraction",
      startTime: "03:53 AM",
      endTime: "01:32 PM",
      stops: ["Café", "Hotel"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V009",
      source: "Business District",
      destination: "Residential Area",
      startTime: "02:00 AM",
      endTime: "02:21 PM",
      stops: ["Restaurant", "Hotel"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V066",
      source: "University Campus",
      destination: "Residential Area",
      startTime: "11:17 PM",
      endTime: "10:46 AM",
      stops: ["Park"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V092",
      source: "Shopping Mall",
      destination: "Park",
      startTime: "02:53 AM",
      endTime: "09:42 PM",
      stops: ["Theater"],
      estimatedTime: "1 hour",
    },
  ];
  res.json(pastData);
});

module.exports = router;
