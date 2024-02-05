const mongoose = require('mongoose');
const reminderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    hour: {
        type: Number,
        required: true,
    },
    minute: {
        type: Number,
        required: true,
    },
    state: {
        type: Boolean,
        required: true,
    },
    period: {
        type: Number,
        required: true,
    },
    start_date: {
        type: Number,
        required: true,
    },
    start_month: {
        type: Number,
        required: true,
    },
    start_year: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});
mongoose.model("Reminder", reminderSchema);