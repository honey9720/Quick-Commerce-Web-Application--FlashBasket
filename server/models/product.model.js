import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"]
    },
    image: {
        type: Array,
        default: []
    },
    category: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "category"
        }
    ],
    subCategory: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "subCategory"
        }
    ],
    unit: {
        type: String,
        default: ""
    },
    stock: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ""
    },
    more_details: {
        type: Object,
        default: {}
    },
    publish: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// ✅ Correct way to create weighted text index
productSchema.index(
    { name: "text", description: "text" },
    { weights: { name: 10, description: 5 } }
);

const ProductModel = mongoose.model("product", productSchema);

export default ProductModel;
