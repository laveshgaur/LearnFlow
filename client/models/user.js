import mongoose from "mongoose";
// user schema
const userSchema = mongoose.Schema(
    {
        name: String,

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            min: [8,"Password is too sort"]
        },
        age: {
            type: Number,
            required: true,
            min: [18, "Age should be 18+"],
            max: 65
        }
    },
    {timestamps: true}
)

export const User = mongoose.model("User",userSchema);