const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
// 


// },
// pics: [
// 'https://res.cloudinary.com/dl5e2wsbh/image/upload/v1626018014/oferiko/gikfv4q6fpnffs8bnh3v.png',
// 'https://res.cloudinary.com/dl5e2wsbh/video/upload/v1626018027/oferiko/otm6zvqvkhzhyw6wiszr.mp4'
// ]
// }

// 
const productSchema = new mongoose.Schema(
    {
    
    description: {
            type: String,
            maxlength: 400
        },
        price: {
            type: Number,
            maxlength: 400,
            min:100000
        },
        property_type:{
            type: String
        },
        property_condition:{
            type: String
        },
        property_address_city:{
            type: String
        },
        property_address_street:{
            type: String
        },
        property_address_num:{
            type: Number
        },
        property_floor:{
            type: Number
        },
        property_total_floors:{
            type: Number
        },
        num_of_rooms:{
            type: Number
        },
        is_on_pillars:{
            type: Boolean
        },
        num_of_parking:{
            type: Number
        },
        num_of_balcony:{
            type: Number
        },
        build_mr:{
            type: Number
        },
        build_mr_total:{
            type: Number
        },
        contact_name:{
            type: String
        },
        contact_number_start:{
            type: String
        },
        contact_number:{
            type: String
        },
        mail:{
            type: String
        },
        Route:{
            type: String
        },
        entry_date:{
            type: Date
        },
        air_condition:{
            type: Boolean
        },
        shelter:{
            type: Boolean
        },
        garage:{
            type: Boolean
        },
        pandor:{
            type: Boolean
        },
        furniture:{
            type: Boolean
        },
        handicapped:{
            type: Boolean
        },
        elevator:{
            type: Boolean
        },
        tadiran:{
            type: Boolean
        },
        unit:{
            type: Boolean
        },
        renovated:{
            type: Boolean
        },
        kosher:{
            type: Boolean
        },
        boiler:{
            type: Boolean
        },
        bars:{
            type: Boolean
        },
        pics:{
            type:Array
        },
        pic1:{
            type:String
        },
        pic2:{
            type:String
        }
        ,pic3:{
            type:String
        }
        ,pic4:{
            type:String
        }
        ,pic5:{
            type:String
        }
        ,pic6:{
            type:String
        }
        ,userId:{
            type:String
        }

    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
