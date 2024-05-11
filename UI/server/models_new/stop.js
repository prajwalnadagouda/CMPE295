const mongoose = require("mongoose");
const Joi = require("joi");

const stopSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'route', required: true },
  order: { type: Number, required: true },
  stop_lat: { type: Number, required: true },
  stop_long: { type: Number, required: true },
  stop_address: { type: String, required: true },
  estimated_time: { type: Date, required: true },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  updated_at: { type: Date },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  shuttle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'shuttle', required: true }
});

const Stop = mongoose.model("stop", stopSchema);

const validateStop = (data) => {
  const schema = Joi.object({
    route_id: Joi.string().required().label("Route ID"),
    order: Joi.number().required().label("Order"),
    stop_lat: Joi.number().required().label("Stop Latitude"),
    stop_long: Joi.number().required().label("Stop Longitude"),
    stop_address: Joi.string().required().label("Stop Address"),
    estimated_time: Joi.date().required().label("Estimated Time"),
    active: Joi.boolean().label("Active"),
    created_by: Joi.string().required().label("Created By"),
    updated_by: Joi.string().label("Updated By"),
    shuttle_id: Joi.string().required().label("Shuttle ID"),
  });
  return schema.validate(data);
};

module.exports = { Stop, validateStop };
