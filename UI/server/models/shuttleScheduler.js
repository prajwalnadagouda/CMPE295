const mongoose = require("mongoose");

const shuttleSchedulerSchema = new mongoose.Schema({
  id: { type: Object, required: true },
  shuttleId: { type: Object, required: true },
  sourceLat: { type: Number, required: true },
  sourceLong: { type: Number, required: true },
  destLat: { type: Number, required: true },
  destLong: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
  active: { type: Boolean, required: true },
  createdAt: { type: String, required: true },
  createdBy: { type: String, required: true },
  lastUpdatedOn: { type: String, required: true },
});

const shuttleScheduler = mongoose.model(
  "shuttleScheduler",
  shuttleSchedulerSchema
);

module.exports = shuttleScheduler;
