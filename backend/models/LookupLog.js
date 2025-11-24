import mongoose from "mongoose";

const lookupLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["dns", "ip"],
      required: true
    },
    query: {
      type: String,
      required: true
    },
    responseTimeMs: {
      type: Number
    },
    meta: {
      type: Object
    }
  },
  { timestamps: true }
);

export default mongoose.model("LookupLog", lookupLogSchema);
