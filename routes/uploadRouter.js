const expreess = require("express");
const authenticate = require("../authenticate");
const multer = require("multer");
const cors = require("./cors");

////customizing multer for file uplods

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); //destination folder is public/images, err is null
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); //file object received here contains info about uploaded file
  },
});

const imageFileFilter = (req, file, cb) => {
  const imgTypeRegEx = new RegExp(/\.(jpg|jpeg|png|gif)$/);
  if (!file.originalname.match(imgTypeRegEx)) {
    return cb(new Error("Supported formats are .jpg .jpeg .png .gif"), false);
  }
  return cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });
/////

const uploadRouter = expreess.Router();
uploadRouter.use(expreess.json());

//only the POST method will be allwed
uploadRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //cors: preflight request
  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.status(403).send("GET operation not supported on /imageUpload");
    }
  )

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    upload.single("imageFile"), //only one image can be uploaded, after which the req object will the populated with the file
    (req, res) => {
      console.log(req.file);
      res.status(200).json(req.file);
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.status(403).send("PUT operation not supported on /imageUpload");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.status(403).send("DELETE operation not supported on /imageUpload");
    }
  );

module.exports = uploadRouter;
