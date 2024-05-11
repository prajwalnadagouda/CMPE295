const express = require("express");
const router = express.Router();
const { Stop } = require("../models_new/stop");
const { Shuttle, validateShuttle } = require("../models_new/shuttle");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authToken");
const { Booking } = require("../models_new/booking");
const { Route } = require("../models_new/route");

function calculateDistance(lat1, lon1, lat2, lon2) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  lat1 = rad(lat1);
  lon1 = rad(lon1);
  lat2 = rad(lat2);
  lon2 = rad(lon2);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}

router.get("/getSearchResult", async (req, res) => {
  const src_lat = parseFloat(req.query.src_lat);
  const src_long = parseFloat(req.query.src_long);
  const dst_lat = parseFloat(req.query.dst_lat);
  const dst_long = parseFloat(req.query.dst_long);

  try {
    const uniqueStops = await Stop.aggregate([
      {
        $group: {
          _id: {
            shuttle_id: "$shuttle_id",
            stop_lat: "$stop_lat",
            stop_long: "$stop_long",
          },
        },
      },
      {
        $project: {
          _id: 0,
          shuttle_id: "$_id.shuttle_id",
          stop_lat: "$_id.stop_lat",
          stop_long: "$_id.stop_long",
          stop_address: "_id.stop_address",
        },
      },
    ]);

    const stopsWithDistances = uniqueStops.map((stop) => {
      const srcDistance = calculateDistance(
        src_lat,
        src_long,
        stop.stop_lat,
        stop.stop_long
      );
      const dstDistance = calculateDistance(
        dst_lat,
        dst_long,
        stop.stop_lat,
        stop.stop_long
      );
      return {
        ...stop,
        srcDistance,
        dstDistance,
      };
    });

    res.send(stopsWithDistances);
  } catch (error) {
    console.error("Failed to fetch unique stop combinations: ", error);
    res
      .status(500)
      .send("An error occurred while fetching unique stop combinations.");
  }
});

router.get("/mappingSequence", async (req, res) => {
  const routeId = req.body.route_id;

  if (!routeId) {
    return res.status(400).send("Route ID is required.");
  }

  try {
    const routeObjectId = mongoose.Types.ObjectId(routeId);

    const stops = await Stop.find(
      { route_id: routeObjectId },
      "stop_lat stop_long stop_address order"
    );

    if (stops.length === 0) {
      return res.status(404).send("No stops found for the given route ID.");
    }

    res.send(stops);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).send("Invalid route ID format.");
    }
    console.error("Failed to fetch stops: ", error);
    res.status(500).send("An error occurred while fetching stops.");
  }
});

router.get("/showDetails", async (req, res) => {
  const { shuttle_id, route_id, src_stop_id, dst_stop_id } = req.body;

  if (!shuttle_id || !route_id || !src_stop_id || !dst_stop_id) {
    return res
      .status(400)
      .send(
        "Shuttle ID, Route ID, Source Stop ID, and Destination Stop ID are required."
      );
  }

  try {
    const shuttleObjectId = mongoose.Types.ObjectId(shuttle_id);
    const routeObjectId = mongoose.Types.ObjectId(route_id);
    const srcStopObjectId = mongoose.Types.ObjectId(src_stop_id);
    const dstStopObjectId = mongoose.Types.ObjectId(dst_stop_id);

    const stops = await Stop.find({
      _id: { $in: [srcStopObjectId, dstStopObjectId] },
      route_id: routeObjectId,
      shuttle_id: shuttleObjectId,
    });

    if (stops.length < 2) {
      return res
        .status(404)
        .send("Could not find both source and destination stops.");
    }

    const shuttle = await Shuttle.findById(
      shuttleObjectId,
      "shuttle_name shuttle_number"
    );

    const src_time = await Stop.findById(srcStopObjectId);

    const dst_time = await Stop.findById(dstStopObjectId);

    if (!shuttle) {
      return res.status(404).send("Shuttle not found.");
    }

    res.send({
      src_time: src_time,
      dst_time: dst_time,
      shuttle_name: shuttle.shuttle_name,
      shuttle_number: shuttle.shuttle_number,
    });
  } catch (error) {
    console.error("Failed to fetch details: ", error);
    res.status(500).send("An error occurred while fetching details.");
  }
});

router.get("/get", async (req, res) => {
  try {
    const stops = await Stop.find({});
    res.send(stops);
  } catch (error) {
    console.error("Failed to fetch stop addresses: ", error);
    res.status(500).send("An error occurred while fetching stop addresses.");
  }
});

router.post("/addShuttle", async (req, res) => {
  console.log(req.body);
  const { error } = validateShuttle(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { shuttle_number, shuttle_name, vehicle_type, capacity, created_by } =
    req.body;

  const existingShuttle = await Shuttle.findOne({ shuttle_number });
  if (existingShuttle) {
    return res.status(400).send("A shuttle with this number already exists.");
  }

  let shuttle = new Shuttle({
    shuttle_number,
    shuttle_name,
    vehicle_type,
    capacity,
    created_by: mongoose.Types.ObjectId(created_by),
    active: true,
  });

  try {
    shuttle = await shuttle.save();
    res.send(shuttle);
  } catch (err) {
    console.error("Failed to add new shuttle: ", err);
    res.status(500).send("An error occurred while adding a new shuttle.");
  }
});

router.get("/viewShuttles", async (req, res) => {
  const { created_by } = req.query;
  try {
    const userShuttles = await Shuttle.find({
      created_by: mongoose.Types.ObjectId(created_by),
      active: true,
    });
    res.send(userShuttles);
  } catch (error) {
    console.error("Failed to fetch shuttles for user:", error);
    res.status(500).send("An error occurred while fetching user shuttles.");
  }
});

router.patch("/editShuttle/:id", async (req, res) => {
  const { id } = req.params;
  const shuttle_number = req.body["shuttle_number"];
  const existingShuttle = await Shuttle.findOne({
    shuttle_number,
    _id: { $ne: id },
  });
  if (existingShuttle) {
    return res.status(400).send("A shuttle with this number already exists.");
  }
  try {
    const updatedShuttle = await Shuttle.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedShuttle) {
      return res.status(404).send("Shuttle not found.");
    }
    res.send(updatedShuttle);
  } catch (error) {
    console.error("Failed to update shuttle: ", error);
    res.status(500).send("An error occurred while updating the shuttle.");
  }
});

router.patch("/deleteShuttle/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const shuttle = await Shuttle.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    if (!shuttle) {
      return res.status(404).send("Shuttle not found.");
    }
    res.send({ message: "Shuttle deactivated successfully", shuttle });
  } catch (error) {
    console.error("Failed to deactivate shuttle: ", error);
    res.status(500).send("An error occurred while deactivating the shuttle.");
  }
});

router.post("/booking", authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const user_id = req.user._id;
    const route_id = data._id;

    const route = await Route.findById(route_id);

    if (!route) {
      return res.status(404).json({ message: "Route not found." });
    }

    route.assignees = route.assignees.map((assignee) => ({
      ...assignee.toObject(),
      shuttle_current_capacity:
        assignee.shuttle_current_capacity > 0
          ? assignee.shuttle_current_capacity - 1
          : 0,
    }));

    await route.save();

    const sourceStop = data.stops.filter((stop) => stop.stop_order === "S");
    const destinationStop = data.stops.filter(
      (stop) => stop.stop_order === "D"
    );

    if (!sourceStop || !destinationStop) {
      return res
        .status(404)
        .json({ message: "Source or destination stop not found." });
    }

    const newBooking = new Booking({
      user_id: user_id,
      route_id: route_id,
      source_stop_id: sourceStop[0]._id,
      destination_stop_id: destinationStop[0]._id,
      created_by: user_id,
    });

    const savedBooking = await newBooking.save();
    console.log("New booking saved:", savedBooking);
    res.json(savedBooking);
  } catch (error) {
    console.error("Error processing booking:", error);
    res
      .status(500)
      .json({ message: "Error processing your request", error: error.message });
  }
});

module.exports = router;
