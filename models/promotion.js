const mongoose = require("mongoose");
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;

const promotionSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  cost: {
    type: Currency,
    required: true,
    min: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

const promotion = mongoose.model("promotion", promotionSchema);

module.exports = promotion;
