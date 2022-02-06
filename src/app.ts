import express from "express";
import morgan from "morgan";
import multer from "multer"; // adds a body object and a file or files object to the request object
import cors from "cors";
import Database from "better-sqlite3";

import deleteFile from "./utils/deleteFile";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: false })); // body parsing middleware, exposes incoming requests in req.body
app.use(cors());
app.use(morgan("dev")); // logs HTTP requests in console

const upload = multer({ dest: `postedDbs/` }); // multer configuration

app.post("/", upload.single("sqllite_file"), function (req, res) {
  try {
    // TODO need to add more error handling here
    // TODO sanitizing?
    if (!req.file) {
      // no file uploaded
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      const filePathDb = req.file.path;
      // const fileBuffer = req.file.buffer;

      // TODO open db connection -> then try catch?
      // const db = new Database(fileBuffer, { fileMustExist: true });
      const db = new Database(filePathDb);
      const sqlData = db
        .prepare(
          `
            SELECT
              BookmarkAlias.Text as highlight,
              BookmarkAlias.Annotation as annotation,
              BookmarkAlias.DateCreated as dateCreated,
              BookmarkAlias.ChapterProgress as chapterProgress,
              ContentAlias.Title as title,
              ContentAlias.Attribution as author
            FROM Bookmark as BookmarkAlias
            LEFT JOIN content as ContentAlias ON BookmarkAlias.VolumeID = ContentAlias.ContentID
            WHERE Text != ?
            ORDER BY title, chapterProgress
        `
        )
        .all("null");
      db.close();

      // delete database file
      deleteFile(filePathDb, "database");

      // const filePathCsv = `${filePathDb}.csv`;

      res.send(sqlData);

      // console.log(filePathDb);
    }
  } catch (err) {
    deleteFile(req.file.path, "database");
    // send response
    console.log(err);
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`Timezones by location application is running on port ${port}.`);
});
