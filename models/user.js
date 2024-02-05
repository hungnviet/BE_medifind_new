const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    historySearch: [
        {
            name: {
                type: String,
                required: true,
            },
        }
    ],
    historyMedicine: [
        {
            name: {
                type: String,
                required: true,
            },
            date: {
                type: Number,
                required: true,
            },
            month: {
                type: Number,
                required: true,
            },
            year: {
                type: Number,
                required: true,
            }
        }
    ]
});

mongoose.model("User", userSchema);
