const router = require("express").Router();
const User = require("../models/User");

// CRUD
// ユーザー情報の更新
router.put("/settings/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("ユーザー情報が更新されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("あなたは自分のアカウントの時だけ情報を更新できます。");
  }
});

// ユーザー情報の削除
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("ユーザー情報が削除されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("あなたは自分のアカウントの時だけ情報を削除できます。");
  }
});

// 全てのユーザー情報を取得（AllUser.jsxで使用）
router.get("/alluser", async (req, res) => {
  try {
    const users = await User.find().select("username desc");
    return res.status(200).json({ alluser: users });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

// ユーザー情報の取得
// router.get("/:id", async(req, res) => {
//         try {
//             const user = await User.findById(req.params.id);
//             const { password, updatedAt, ...other } = user._doc;
//             return res.status(200).json(other);
//         } catch (err) {
//             return res.status(500).json(err);
//         }
// });

// クエリでユーザー情報を取得
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ユーザーのフォロー :idはこれからフォローするユーザーのid
router.put("/:id/follow", async (req, res) => {
  // 下記のif文は自分でない場合にの意味
  if (req.body.userId !== req.params.id) {
    try {
      // ここのユーザーはフォローする相手のユーザー
      const user = await User.findById(req.params.id);
      // ↓が自分
      const currentUser = await User.findById(req.body.userId);
      //　フォローする相手ユーザーのフォロワーの中に自分がいなければ、の条件分岐
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          },
        });
        return res.status(200).json("フォローに成功しました。");
      } else {
        return res
          .status(403)
          .json("あなたはすでにこのユーザーをフォローしています");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォローできません");
  }
});

// ユーザーのフォローを外す
router.put("/:id/unfollow", async (req, res) => {
  // 下記のif文は自分でない場合にの意味
  if (req.body.userId !== req.params.id) {
    try {
      // ここのユーザーはフォローする相手のユーザー
      const user = await User.findById(req.params.id);
      // ↓が自分
      const currentUser = await User.findById(req.body.userId);
      //　フォロワーに存在したらフォローを外すことができる
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });
        return res.status(200).json("フォローを解除しました。");
      } else {
        return res.status(403).json("このユーザーはフォロー解除できません");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身をフォロー解除できません");
  }
});

// 表示アカウントのフォロー、フォロワー数の取得
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { followers, followings } = user._doc;
    return res.status(200).json({ followers, followings });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "サーバーエラーが起こっています" });
  }
});

// 必要なユーザー情報を検索して取得
router.get("/search/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // username を含むユーザーを検索し、必要なフィールドのみを選択して取得
    const user = await User.findOne({ username }).select(
      "username profilePicture"
    );

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "ユーザーが見つかりません" });
    }
  } catch (err) {
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

module.exports = router;
