import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use(logger);
app.use(express.urlencoded({ extended: true }));

/**
 * 정의
 * Cookie: 브라우저에 데이터를 저장하는 방법 중 하나로, 브라우저의 상태를 기억하기 위해 사용됨
 * - HTTP 연결은 기본적으로 Stateless하므로 필요한 장치
 * - 저장된 데이터는 한 줄의 복잡한 string으로, session에 접속하기 위한 sid로 사용됨
 *
 * Session: 브라우저와의 연결을 기억하기 위해 필요한 일종의 DB
 * - express에서는 express-session 미들웨어가 관리해주며, req.session으로 접근 가능
 * - 기본값으로 MemoryStore 를 사용하므로 서버 재시작 시 초기화됨
 */

/**
 * 회원 인증 과정
 * 1. Request를 받은 서버는 자동으로 브라우저에 쿠키를 전송함
 * 2. 쿠키를 받은 브라우저는 Request를 보낼 때 자동으로 쿠키를 포함함
 * 3. 백엔드는 SessionDB에 접속할 수 있도록 SessionID (connect.sid) 를 쿠키에 할당함
 * 4. SessionID 할당과 동시에 SessionDB에는 해당 ID를 키로 한 DB가 생겨남
 * 5. 재접속 시 백엔드는 브라우저가 보낸 ID가 DB에 저장되어 있는지 확인 후 Response 를 결정
 */
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false, // 수정하기 전에 Session에 데이터를 생성하지 않음
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  }),
);

/**
 * res.locals 를 사용하기 위한 미들웨어
 *
 * - Pug 에서는 req.session으로 바로 데이터에 접근할 수 없음
 * - 하지만, res.locals에 저장해주면 데이터 이름을 통해 바로 사용할 수 있음
 * - 해당 미들웨어를 통해 session에 저장된 데이터를 로컬 데이터로 변환시켜줌
 */
app.use(localsMiddleware);

app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
