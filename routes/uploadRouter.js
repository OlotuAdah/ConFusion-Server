const expreess = require("express");
const authenticate = require("../authenticate");
const multer = require("multer");

////customizing multer for file uplods

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); //dest.. folder is public/images, err is null
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); //file object received here contains info about uploaded file
  },
});

const imageFileFilter = (req, file, cb) => {
  const imgTypeRegEx = "/.(jpg|jpeg|png|gif)$/";
  if (!file.originalname.match(imgTypeRegEx)) {
    return cb(new Error("You can only upload image file"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });
/////

const uploadRouter = expreess.Router();
uploadRouter.use(expreess.json());

//only the POST method will be allwed
uploadRouter
  .route("/")
  .get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.status(403).send("GET operation not supported on /imageUpload");
  })

  .post(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    upload.single("imageFile"), //only one image can be uploaded, after which the req object will the populated with the file
    (req, res) => {
      res
        .status(200)
        .setHeader("Content-Type", "application/json")
        .json(req, res.file);
    }
  )
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.status(403).send("PUT operation not supported on /imageUpload");
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.status(403).send("DELETE operation not supported on /imageUpload");
    }
  );

module.exports = uploadRouter;
