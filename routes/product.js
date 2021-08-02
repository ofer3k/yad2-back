const express = require("express");
const router = express.Router();
const {cloudinary}=require('../utils/cloudinary')

let multer  = require('multer')
let upload = multer({ dest: 'uploads/' })

const {
    create,
    productById,
    read,
    remove,
    update,
    list,
    listRelated,
    listCategories,
    listBySearch,
    photo,
    listSearch,
    s3,
    uploadImage,
    listByFilter,
    listByFilterNoSort,
    listByUser,
    listOfProductsByUser
} = require("../controllers/product");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { json } = require("body-parser");

router.get("/product/:productId", read);
router.get("/photos",async (req,res)=>{
const {resources} =await cloudinary.search.expression('folder:Home').sort_by('public_id','desc').max_results(30).execute()
console.log(resources)
const publicIds=resources.map(file=>file.public_id)
res.send(publicIds)
});

router.post("/product/create/:userId", requireSignin, isAuth, isAdmin,create,
 
 );
router.post("/upload", async (req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        // needs to save to mongo the uploadedResponse.public_id
        const fileStr=req.body.date
        const name=req.body.name
        console.log(name)
        const uploadedResponse=await cloudinary.uploader.upload(fileStr,
            {upload_preset:'dupqdnpy',
            folder:name,
            resource_type: "auto"}
            )
        console.log(uploadedResponse)
        res.send({url:uploadedResponse.secure_url})
    } catch (error) {
        console.log(error)
        res.status(500).json({err:'error man'})
    }
});
router.post("/photo",
//  requireSignin, isAuth, isAdmin,
 (req,res)=>{
    res.send('ya')
});
router.delete(
    "/product/:productId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    remove
);
router.put(
    "/product/:productId/:userId",
    requireSignin,
    isAuth,
    isAdmin,
    update
);

router.get("/products", list);
router.get("/products/by/user/:userId", listOfProductsByUser);
router.get("/products/search", listSearch);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.post("/products/by/search", listBySearch);
router.post("/products/by/Filter", listByFilter);
router.post("/products/by/Filter/noSort", listByFilterNoSort);
router.get("/product/photo/:productId", photo);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
