const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const md5 = require('md5')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

const jwt = require("jsonwebtoken");
const secretkey = 'tiltxdhaha'

const app = express()
const jsonParser = express.json()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
open({
  filename: "./db/test.db",
  driver: sqlite3.Database
}).then((db) => {

  app.get('/people/register', async (req, res) => {
    const people = await db.all("SELECT * FROM People")
    res.json(people)
  })
  app.get('/people/login', async (req, res) => {
    const people = await db.all("SELECT * FROM People")
    res.json(people)
  })
  app.get('/profile/team', async (req, res) => {
    const people = await db.all("SELECT * FROM Team")
    res.json(people)
  })


  //.......regist......................
  const authMiddleWare = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) {
      return res.status(401).json({ message: 'tilt token' })
    }
    jwt.verify(token, secretkey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Error with verify' })
      }
      req.userEmail = decoded.userEmail
      next()
    })
  }

  app.post('/people/register', jsonParser, async (req, res) => {
    const user = { nickname, email, password } = req.body;

    const token = jwt.sign({ userEmail: user.email }, secretkey, {
      expiresIn: 20000
    })

    const result = await db.all(`SELECT * FROM People WHERE email = "${email}"`)
    if (result.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    else {
      const userAdd = async (res) => {
        await db.run(`INSERT INTO People (nickname, email, password, token) VALUES ("${nickname}", "${email}", "${md5(password)}", "${token}")`, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Ошибка при добавлении пользователя в базу данных' });
          }
          res.json({
            data: "responce"
          });
        }

        )
      }
      userAdd(res)
    }
    return res.json({ nickname, email, password, token });
  });
  // app.post('/people/exit', async (res,req) => {
  //   await db.run(`Update People set token ="${token}" where email = "${email}"`), (res) => {
  //     return res.json({message: 'Вы покинули церковь и пошли кушать свинину в мечети '})
  //   }
  // })
  //.......addTeam......................
  app.post('/profile/team', authMiddleWare, async (req, res) => {
    const row = { teamName, captain, game } = req.body;
    const resultTeamadder = await db.all(`SELECT * FROM Team WHERE teamName="${teamName}"`)
    // console.log(resultTeamadder)
    if (resultTeamadder.length > 0) {
      return res.status(400).json({ message: 'Такая Команда Существует' });
    }

    else {
      // console.log(teamName, captain, game)
      const teamAdd = async (res, req) => {
        await db.run(`INSERT INTO Team (teamName, captain, game ) VALUES ("${teamName}", "${captain}", "${game}")`, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Ошибка при добавлении пользователя в базу данных' });
          }
          res.json({
            data: "responce"
          });
        }

        )
      }
      teamAdd()
    }
    return res.json({ teamName, captain, game });

  });
  //.............................
  //...........login..................


  app.post('/people/login', jsonParser, async function (req, res) {
    const user = { nickname, email, password } = req.body;

    const userLogging = (userLog) => {

      if (userLog.password === md5(user.password)) {
        const token = jwt.sign({ email: userLog.email }, secretkey, {
          expiresIn: 20000
        })
        return res.status(200).json({
          data: {
            user: userLog,
            token
          }
        })
      }
      return res.status(403).json({
        error: "Неверный логин или пароль"
      })
    }
    db.get(`select * from People where email = "${user.email}"`, (err, data) => {
      if (err) {
        res.json({ message: "Пройдите Регистрацию" })
      }
      if (data) {
        return userLogging(data)
      }
      return res.status(409).json({
        error: "Пользователя не существует"
    })
    })
  });

  app.use((req, res, next) => {
    if (req.headers.authorization) {
      next()
    }
    return res.json({ message: 'problems' })
  });
});
//.................................









app.listen(3000, () => {
  console.log("rabotaet" + 3000)
})





// expres nodemon sqlite sqlite3 установить