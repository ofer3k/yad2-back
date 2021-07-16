const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");



exports.productById = (req, res, next, id) => {
    Product.findById(id)
        .populate("category")
        .exec((err, product) => {
            if (err || !product) {
                return res.status(400).json({
                    error: "Product not found"
                });
            }
            req.product = product;
            next();
        });
};


exports.read = (req, res) => {
    req.product.photo = undefined;
    return res.json(req.product);
};

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
 
    form.parse(req, (err, fields, files)=>{
        const data=JSON.parse(fields.json)
        // console.log(data.fullForm)
        // console.log(data.redioButtons)
        const parsObj={...data.fullForm,
            price:parseFloat(data.fullForm.price),
            property_address_num:parseFloat(data.fullForm.property_address_num),
            property_floor:parseFloat(data.fullForm.property_floor),
            property_total_floors:parseFloat(data.fullForm.property_total_floors),
            property_total_floors:parseFloat(data.fullForm.property_total_floors),
            num_of_rooms:parseFloat(data.fullForm.num_of_rooms),
            num_of_parking:parseFloat(data.fullForm.num_of_parking),
            num_of_balcony:parseFloat(data.fullForm.num_of_balcony),
            build_mr:parseFloat(data.fullForm.build_mr),
            build_mr_total:parseFloat(data.fullForm.build_mr_total),
        }

        console.log('data',data)
        let prod={...parsObj,...data.redioButtons,...data.pics}
        let product = new Product(prod)
        product.save((err, result) => {
                    if (err) {
                        console.log(err)
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    console.log(result)
      res.json(result);

                });
    })
    //  product.aggregate([
    //     {
    //       $addFields: {
    //         rooms: {
    //           $toDouble: "$num_of_rooms"
    //         }
    //       }
    //     }
    //   ])

    // res.json(req.body);
    

    //     // 1kb = 1000
    //     // 1mb = 1000000

    //     if (files.photo) {
    //         // console.log("FILES PHOTO: ", files.photo);
    //         if (files.photo.size > 1000000) {
    //             return res.status(400).json({
    //                 error: "Image should be less than 1mb in size"
    //             });
    //         }
    //         product.photo.data = fs.readFileSync(files.photo.path);
    //         product.photo.contentType = files.photo.type;
    //     }

    //     product.save((err, result) => {
    //         if (err) {
    //             return res.status(400).json({
    //                 error: errorHandler(err)
    //             });
    //         }
    //         res.json(result);
    //     });
    // });
};

exports.remove = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Product deleted successfully"
        });
    });
};

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            });
        }
        // check for all fields
        const {
            name,
            description,
            price,
            category,
            quantity,
            shipping
        } = fields;

        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !quantity ||
            !shipping
        ) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        let product = req.product;
        product = _.extend(product, fields);

        // 1kb = 1000
        // 1mb = 1000000

        if (files.photo) {
            // console.log("FILES PHOTO: ", files.photo);
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1mb in size"
                });
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(result);
        });
    });
};

/**
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : "asc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find()
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json(products);
        });
};

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */

exports.listRelated = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find({ _id: { $ne: req.product }, category: req.product.category })
        .limit(limit)
        .populate("category", "_id name")
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json(products);
        });
};

exports.listCategories = (req, res) => {
    Product.distinct("category", {}, (err, categories) => {
        if (err) {
            return res.status(400).json({
                error: "Categories not found"
            });
        }
        res.json(categories);
    });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
 exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};


exports.listByFilter = (req, res) => {
    console.log(req.body)
    
    // let order = req.body.order ? req.body.order : "desc";
    // let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    // let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    // let skip = parseInt(req.body.skip);
//     let findArgs = {};
//     console.log(req.body)
//     // 
//     entery_date: null,
//     exclusively: null,
//     name: '',
//     description: '',
//     price: '',
//     categories: [],
//     category: '',
//     shipping: '',
//     quantity: '',
//     photo: '',
//     loading: false,
//     error: '',
//     createdProduct: '',
//     redirectToProfile: false,
//     formData: '',
//     property_type1: '',
//     property_type2: '',
//     property_type3: '',
//     property_condition: '',
//     property_address_city: '',
//     property_address_street: '',
//     property_address_num: null,
//     property_floor: null,
//     property_total_floors: null,
//     num_of_rooms: null,
//     min_num_of_rooms: null,
//     max_num_of_rooms: null,
//     min_num_of_floors: null,
//     max_num_of_floors: null,
//     min_price: null,
//     max_price: null,
//     min_mr: null,
//     max_mr: null,
//     is_on_pillars: null,
//     num_of_parking: null,
//     num_of_balcony: null,
//     balcony: null,
//     build_mr: null,
//     build_mr_total: null,
//     contact_name: '',
//     contact_number_start: '',
//     contact_number: '',
//     mail: '',
//     Route: null,//יש לברור בשביל הפרונט - באיזה צבע להציג את המודעה
//   -  air_condition: false,
//   -  shelter: false,
//   -  garage: false,
//   -  pandor: false,
//   -  furniture: false,
//   -  handicapped: false,
//   -  elevator: false,
//   -  tadiran: false,
//   -  unit: false,
//   -  renovated: false,
//   -  kosher: false,
//   -  boiler: false,
//  -   bars: false

    // 
    // Route: "vip"
    // air_condition: true
    // bars: false
    // boiler: true
    // build_mr: "40"
    // build_mr_total: "40"
    // contact_name: "עופר קליין"
    // contact_number: "6305081"
    // contact_number_start: "052"
    // createdAt: "2021-07-11T17:20:34.134Z"
    // description: "מקום נעים וצעיר על שפת חוף גורדון השוקק"
    // elevator: false
    // entry_date: "2021-07-11"
    // furniture: true
    // garage: false
    // handicapped: false
    // is_on_pillars: true
    // kosher: false
    // mail: "ofer3klein@gmail.com"
    // num_of_balcony: null
    // num_of_parking: null
    // num_of_rooms: null
    // pandor: false
    // pics: (2) ["https://res.cloudinary.com/dl5e2wsbh/image/upload/v1626023874/oferiko/q5b1qjxdsn1iw1mcu7lk.jpg", "https://res.cloudinary.com/dl5e2wsbh/video/upload/v1626023896/oferiko/qaqflvxm7auncmlb6wyg.mp4"]
    // price: 4000000
    // property_address_city: "תל אביב"
    // property_address_num: "94"
    // property_address_street: "בן יהודה"
    // property_condition: "New from a contractor"
    // property_floor: "2"
    // property_total_floors: "3"
    // property_type: "Private house"
    // renovated: false
    // shelter: false
    // tadiran: true
    // unit: false
    // updatedAt: "2021-07-11T17:20:34.134Z"
    // __v: 0
    // _id: "60eb2862020f19816c44a863"
    // // שדות לחיפוש
    // const parsObj1={...req.body,
    //     min_num_of_rooms:parseFloat(req.body.min_num_of_rooms),
    //     max_num_of_rooms: parseFloat(req.body.max_num_of_rooms),
    //     min_price: parseFloat(req.body.min_price),
    //     max_price: parseFloat(req.body.max_price),
    //     min_num_of_floors: parseFloat(req.body.min_num_of_floors),
    //     max_floors: parseFloat(req.body.max_floors),
    //     min_mr: parseFloat(req.body.min_mr),
    //     max_mr: parseFloat(req.body.max_mr),
    // }
let filters={}
let endFilters={}

let booleanFilters={}
    for(key in req.body){
                    if ( req.body[key] === true) {
                booleanFilters={...booleanFilters,[key]:(req.body[key]) }
                endFilters={...endFilters,[key]: {$eq: true}}
                // db.users.find({is_agent: {$eq: true}})
            }

        if(req.body[key]!==null&&req.body[key]!==undefined&&req.body[key]!==NaN&&req.body[key].length>0&&req.body[key]!==false)
        {
                filters={...filters,[key]:parseFloat(req.body[key]) }
            }   
             }
    // console.log('filters:',filters)
    if ('min_num_of_rooms' in filters   )
    {
        endFilters={...endFilters,num_of_rooms: { $gte: filters.min_num_of_rooms }}
    }
    if ('max_num_of_rooms' in filters   )
    {
        endFilters={...endFilters,num_of_rooms: { $lte: filters.max_num_of_rooms }}
    }
    if ('max_num_of_rooms' in filters && 'min_num_of_rooms' in filters )
    {
        endFilters={...endFilters,num_of_rooms: { $lte: filters.max_num_of_rooms,$gte: filters. min_num_of_rooms }}
    }
    // 
    if ('min_price' in filters   )
    {
        endFilters={...endFilters,price: { $gte: filters.min_price }}
    }
    if ('max_price' in filters   )
    {
        endFilters={...endFilters,price: { $lte: filters.max_price }}
    }
    if ('max_price' in filters && 'min_price' in filters )
    {
        endFilters={...endFilters,price: { $lte: filters.max_price,$gte: filters.min_price }}
    }
    // 
    if ('min_num_of_floors' in filters   )
    {
        endFilters={...endFilters,property_floor: { $gte: filters.min_num_of_floors }}
    }
    if ('max_num_of_floors' in filters   )
    {
        endFilters={...endFilters,property_floor: { $lte: filters.max_num_of_floors }}
    }
    if ('max_num_of_floors' in filters && 'min_num_of_floors' in filters )
    {
        endFilters={...endFilters,property_floor: { $lte: filters.max_num_of_floors,$gte: filters.min_num_of_floors }}
    }
    // 
    if ('min_mr' in filters   )
    {
        endFilters={...endFilters,build_mr_total: { $gte: filters.min_mr }}
    }
    if ('max_mr' in filters   )
    {
        endFilters={...endFilters,build_mr_total: { $lte: filters.max_mr }}
    }
    if ('max_mr' in filters && 'min_mr' in filters )
    {
        endFilters={...endFilters,build_mr_total: { $lte: filters.max_mr,$gte: filters.min_mr }}
    }
    
    // property_type: "Private house"
    //  num_of_rooms: { $gte: min_num_of_rooms } 
    //  num_of_rooms: { $lte: max_num_of_rooms } 
    //  price: { $gte: min_price } 
    // price: { $gte: max_price } 
    // property_floor:{ $gte: min_num_of_floors }
    // property_floor:{ $gte: max_num_of_floors }
    // build_mr_total:{ $gte: min_mr }
    // build_mr_total:{ $gte: max_mr }
    // entery_date:{}
    // entery_date:{ $gte : new ISODate("entry_date") }
// let args={
//     num_of_rooms: { $gte: parsObj1.min_num_of_rooms, $lte: parsObj1.max_num_of_rooms}, 
//      price: { $gte: parsObj1.min_price,$lte: parsObj1.max_price }, 
// }
// console.log(args)
// console.log(req.body)
// res.json({a:'1'})
console.log(endFilters)
    Product.find(endFilters)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req, res, next) => {
    if (req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
};

exports.listSearch = (req, res) => {
    // create query object to hold search value and category value
    const query = {};
    // assign search value to query.name
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: "i" };
        // assigne category value to query.category
        if (req.query.category && req.query.category != "All") {
            query.category = req.query.category;
        }
        // find the product based on query object with 2 properties
        // search and category
        Product.find(query, (err, products) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(products);
        }).select("-photo");
    }
};
