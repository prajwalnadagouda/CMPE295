const mongoose = require("mongoose");
const Joi = require("joi");

const shuttleSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  shuttle_number: { type: String, required: true },
  shuttle_name: { type: String, required: true },
  vehicle_type: { type: String, required: true },
  capacity: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  active: { type: Boolean, default: true },
});

const Shuttle = mongoose.model("shuttle", shuttleSchema);

const validateShuttle = (data) => {
  const schema = Joi.object({
    shuttle_number: Joi.string().required().label("Shuttle Number"),
    shuttle_name: Joi.string().required().label("Shuttle Name"),
    vehicle_type: Joi.string().required().label("Vehicle Type"),
    capacity: Joi.number().required().label("Capacity"),
    created_by: Joi.string().required().label("Created By"),
    active: Joi.boolean().label("Active"),
  });
  return schema.validate(data);
};

module.exports = { Shuttle, validateShuttle };
