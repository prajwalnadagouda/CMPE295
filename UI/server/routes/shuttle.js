const express = require("express");
const router = express.Router();
const { Shuttle, validateShuttle } = require("../models/shuttleService");
const authMiddleware = require("../middleware/authToken");
const { Vehicle, validateVehicle } = require("../models/vehicle");

router.get("/getShuttleData", authMiddleware, async (req, res) => {
  const userId = req.user._id;

  try {
    const shuttle = await Shuttle.findOne({ userId: userId });
    let vehicleCount;
    if (shuttle) {
      vehicleCount = await Vehicle.countDocuments({
        serviceId: shuttle._id,
        active: true,
      });
    }
    console.log(vehicleCount);
    res.json({ shuttle, vehicleCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/updateShuttle", authMiddleware, async (req, res) => {
  const userId = req.user._id;

  try {
    const newDate = new Date().toISOString();
    const existingShuttle = await Shuttle.findOne({ userId: userId });
    // console.log(existingShuttle, "===");

    if (existingShuttle) {
      const { _id, __v, ...updateData } = req.body;
      updateData.userId = userId;
      req.body.lastUpdatedOn = newDate;
      req.body.userId = userId;
      console.log(updateData);
      const { error } = validateShuttle(updateData);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const updatedShuttle = await Shuttle.findOneAndUpdate(
        { userId: userId },
        req.body,
        { new: true }
      );
      res.json(updatedShuttle);
    } else {
      const newShuttleData = {
        ...req.body,
        active: true,
        userId: userId,
        createdBy: userId.toString(),
        createdAt: newDate,
        lastUpdatedOn: newDate,
      };
      console.log(newShuttleData);
      const { error } = validateShuttle(newShuttleData);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const newShuttle = await Shuttle.create(newShuttleData);
      res.status(201).json(newShuttle);
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/availableShuttles", authMiddleware, async (req, res) => {
  const data = req.body;
  res.json([
    {
      shuttle_id: 587,
      route_id: 8246,
      capacity: 123,
      src_stop_id: 56,
      dest_stop_id: 84,
      src_stop_address: "171 South San Jose",
      dest_stop_address: "190 Ryland Street",
      closest_time: "18:00",
    },
    {
      shuttle_id: 321,
      route_id: 5503,
      capacity: 87,
      src_stop_id: 12,
      dest_stop_id: 37,
      src_stop_address: "191 Ryland Mews",
      dest_stop_address: "One Washington Square",
      closest_time: "12:00",
    },
    {
      shuttle_id: 789,
      route_id: 9372,
      capacity: 150,
      src_stop_id: 42,
      dest_stop_id: 63,
      src_stop_address: "Menlo Park",
      dest_stop_address: "Paypal Park",
      closest_time: "8:00",
    },
    {
      shuttle_id: 156,
      route_id: 1234,
      capacity: 100,
      src_stop_id: 8,
      dest_stop_id: 22,
      src_stop_address: "Thomas Park",
      dest_stop_address: "33 south park",
      closest_time: "13:00",
    },
  ]);
});

router.post("/timeslots", authMiddleware, async (req, res) => {
  const data = req.body;
  timeSlots = [
    {
      src_slot_id: 56,
      dest_slot_id: 45,
      id: 1,
      time_of_departure: "16:00",
      time_of_arrival: "18:00",
      available_capacity: 50,
      capacity: 123,
      date: "23-03-2024",
      day_of_week: "Sunday",
      vehicle_type: "Bus",
      shuttle_name: "Orange Travels",
      shuttle_number: "664663",
    },
    {
      src_slot_id: 56,
      dest_slot_id: 45,
      id: 2,
      time_of_departure: "14:30",
      time_of_arrival: "17:00",
      available_capacity: 30,
      capacity: 123,
      date: "23-03-2024",
      day_of_week: "Sunday",
      vehicle_type: "Minivan",
      shuttle_name: "Green Lines",
      shuttle_number: "987654",
    },
    {
      src_slot_id: 56,
      dest_slot_id: 45,
      id: 3,
      time_of_departure: "10:00",
      time_of_arrival: "12:30",
      available_capacity: 20,
      capacity: 123,
      date: "24-03-2024",
      day_of_week: "Monday",
      vehicle_type: "SUV",
      shuttle_name: "Blue Transport",
      shuttle_number: "123456",
    },
    {
      src_slot_id: 12,
      dest_slot_id: 45,
      id: 4,
      time_of_departure: "13:00",
      time_of_arrival: "15:30",
      available_capacity: 20,
      capacity: 87,
      date: "24-03-2024",
      day_of_week: "Monday",
      vehicle_type: "Bus",
      shuttle_name: "Blue Transport",
      shuttle_number: "123456",
    },
    {
      src_slot_id: 12,
      dest_slot_id: 11,
      id: 5,
      time_of_departure: "11:00",
      time_of_arrival: "13:30",
      available_capacity: 20,
      capacity: 87,
      date: "25-03-2024",
      day_of_week: "Tuesday",
      vehicle_type: "SUV",
      shuttle_name: "Blue Transport",
      shuttle_number: "123456",
    },
  ];
  const filteredTimeSlots = timeSlots.filter(
    (slot) => slot.src_slot_id === data.src_stop_id
  );
  res.json(filteredTimeSlots);
});

router.post("/maps", authMiddleware, async (req, res) => {
  const data = req.body;
  console.log(data);
  const mapDetails = [
    {
      stop_address: "2nd & Julian, San Jose, CA",
      order: 1,
      est_time: "18:00",
      stop_lat: 37.3406668,
      stop_long: -121.892557,
    },
    {
      stop_address: "2nd & Saint John",
      order: 2,
      est_time: "18:10",
      stop_lat: 37.3385286,
      stop_long: -121.8909244,
    },
    {
      stop_address: "2nd & Santa Clara",
      order: 3,
      est_time: "18:15",
      stop_lat: 37.3370862,
      stop_long: -121.8898582,
    },
    {
      stop_address: "Santa Clara & 6th",
      order: 4,
      est_time: "18:20",
      stop_lat: 37.3384446,
      stop_long: -121.8855278,
    },
    {
      stop_address: "E San Fernando & S 7th",
      order: 5,
      est_time: "18:27",
      stop_lat: 37.3372,
      stop_long: -121.88332,
    },

    {
      stop_address: "San Jose State University",
      order: 5,
      est_time: "18:28",
      stop_lat: 37.3351874,
      stop_long: -121.8810715,
    },
  ];

  res.json(mapDetails);
});

router.post("/booking", authMiddleware, async (req, res) => {
  const data = req.body;
  console.log(data);
  res.json("success");
});

router.get("/upcomingBookings", authMiddleware, async (req, res) => {
  const upcomingData = [
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V005",
      source: "Airport",
      destination: "Mountain Resort",
      startTime: "09:14 AM",
      endTime: "10:50 PM",
      stops: ["Hotel", "Theater"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V011",
      source: "Shopping Mall",
      destination: "Beach",
      startTime: "01:56 PM",
      endTime: "10:51 PM",
      stops: ["Café"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V021",
      source: "Business District",
      destination: "Residential Area",
      startTime: "03:36 PM",
      endTime: "02:28 PM",
      stops: ["Café", "Park", "Restaurant"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V081",
      source: "Business District",
      destination: "Park",
      startTime: "11:29 AM",
      endTime: "02:08 AM",
      stops: ["Park"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V031",
      source: "Shopping Mall",
      destination: "Park",
      startTime: "03:01 AM",
      endTime: "00:05 PM",
      stops: ["Park", "Hotel"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V043",
      source: "Central Station",
      destination: "Suburb",
      startTime: "06:37 PM",
      endTime: "01:16 AM",
      stops: ["Theater"],
      estimatedTime: "1 hour",
    },
    {
      shuttleNumber: "S001",
      capacity: 20,
      vehicle: "6565945d67757f4d75e13675",
      vehicleName: "V020",
      source: "Shopping Mall",
      destination: "Tourist Attraction",
      startTime: "05:54 PM",
      endTime: "03:24 AM",
      stops: ["Park", "Theater"],
      estimatedTime: "1 hour",
    },
  ];

  res.json(upcomingData);
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

router.post("/deleteBooking", authMiddleware, async (req, res) => {
  const data = req.body;
  console.log(data);
  res.json("success");
});
module.exports = router;
