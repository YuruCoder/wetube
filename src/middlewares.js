import { S3Client } from "@aws-sdk/client-s3";
import MongoStore from "connect-mongo";
import session from "express-session";
import multer from "multer";
import s3Storage from "multer-s3";

const s3Client = new S3Client({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3Avatar = s3Storage({
  s3: s3Client,
  bucket: "wetube-yurucoder",
  acl: "public-read",
  key: (req, file, cb) => {
    cb(null, `avatars/${req.session.user._id}/${Date.now().toString()}`);
  },
});

const s3Video = s3Storage({
  s3: s3Client,
  bucket: "wetube-yurucoder",
  acl: "public-read",
  key: (req, file, cb) => {
    cb(null, `videos/${req.session.user._id}/${Date.now().toString()}`);
  },
});

/**
 * Cookie: 브라우저에 데이터를 저장하는 방법 중 하나로, 브라우저의 상태를 기억하기 위해 사용됨
 * - HTTP 연결은 기본적으로 Stateless하므로 필요한 장치
 * - 저장된 데이터는 한 줄의 복잡한 string으로, session에 접속하기 위한 sid로 사용됨
 *
 * Session: 브라우저와의 연결을 기억하기 위해 필요한 일종의 DB
 * - express에서는 express-session 미들웨어가 관리해주며, req.session으로 접근 가능
 * - 기본값으로 MemoryStore 를 사용하므로 서버 재시작 시 초기화됨
 */
export const sessionMiddleware = session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false, // 수정하기 전에 Session에 데이터를 생성하지 않음
  store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
});

/**
 * res.locals 를 사용하기 위한 미들웨어
 *
 * - Pug 에서는 req.session으로 바로 데이터에 접근할 수 없음
 * - 하지만, res.locals에 저장해주면 데이터 이름을 통해 바로 사용할 수 있음
 * - 해당 미들웨어를 통해 session에 저장된 데이터를 로컬 데이터로 변환시켜줌
 */
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    req.flash("error", "Log in first.");
    return res.redirect("/");
  }
  next();
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
  next();
};

export const uploadAvatarMiddleware = multer({
  storage: s3Avatar,
  limits: {
    fileSize: 3000000,
  },
});

export const uploadVideoMiddleware = multer({
  storage: s3Video,
  limits: {
    fileSize: 100000000,
  },
});
