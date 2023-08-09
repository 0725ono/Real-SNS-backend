const router = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage });
// 以下ローカルストレージへ蓄積させる方法、mongoDBへ蓄積は自分で調べる、発展的
// 画像アップロード用API
router.post("/", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("画像アップロードに成功しました！");
  } catch (err) {
    console.log(err);
  }
});

// プロフ画像の設定
const profStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/profile");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // ファイル名を一意にするためのタイムスタンプ
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname) // ファイル名を設定
    );
  },
});

// ファイルのアップロード処理を行うミドルウェアを作成
const profupload = multer({ storage: profStorage });

router.post("/profilePicture", upload.single("profilePicture"), (req, res) => {
  try {
    res.status(201).json({
      message: "プロフィール画像がアップロードされました",
      filePath: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// ここまでプロフ画像の設定

module.exports = router;
