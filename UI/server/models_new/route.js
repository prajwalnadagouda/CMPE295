const mongoose = require("mongoose");
const Joi = require("joi");

const routeSchema = new mongoose.Schema({
  route_id: mongoose.Schema.Types.ObjectId,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  route_name: { type: String, required: true },
  stops: [{
    stop_name: { type: String, required: true },
    stop_order: { type: String, required: true },
    stop_lat: { type: Number, required: true },
    stop_long: { type: Number, required: true }
  }],
  assignees: [{
    datetime: { type: Date, required: true },
    shuttle_current_capacity: { type: Number, required: true },
    shuttle_id: { type: mongoose.Schema.Types.ObjectId, ref: 'shuttles', required: true }
  }],
  active: { type: Boolean, default: true },
  type: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }
});

const Route = mongoose.model("Route", routeSchema);

const validateRoute = (data) => {
  const schema = Joi.object({
    created_by: Joi.string().required().label("Created By"),
    route_name: Joi.string().required().label("Route Name"),
    stops: Joi.array().items(Joi.object({
      stop_name: Joi.string().required().label("Stop Name"),
      stop_order: Joi.string().required().label("Stop Order"),
      stop_lat: Joi.number().required().label("Stop Latitude"),
      stop_long: Joi.number().required().label("Stop Longitude")
    })).required().label("Stops"),
    assignees: Joi.array().items(Joi.object({
      datetime: Joi.date().required().label("Datetime"),
      shuttle_current_capacity: Joi.number().required().label("Shuttle Capacity"),
      shuttle_id: Joi.string().required().label("Shuttle ID")
    })).label("Assignees"),
    active: Joi.boolean().label("Active"),
    type: Joi.string().required().label("Type"),
    updated_at: Joi.date().label("Updated At"),
  });
  return schema.validate(data);
};

module.exports = { Route, validateRoute };
