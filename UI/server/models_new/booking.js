const mongoose = require("mongoose");
const Joi = require("joi");

const bookingSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'routes', required: true },
  source_stop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'stops', required: true },
  destination_stop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'stops', required: true },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
});

const Booking = mongoose.model("booking", bookingSchema);

const validateBooking = (data) => {
  const schema = Joi.object({
    user_id: Joi.string().required().label("User ID"),
    route_id: Joi.string().required().label("Route ID"),
    source_stop_id: Joi.string().required().label("Source Stop ID"),
    destination_stop_id: Joi.string().required().label("Destination Stop ID"),
    active: Joi.boolean().label("Active"),
    created_by: Joi.string().required().label("Created By"),
  });
  return schema.validate(data);
};

module.exports = { Booking, validateBooking };
