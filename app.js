require('dotenv').config()
require('express-async-errors')

const express = require('express')

const app = express()

// rest of the packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const expressFileupload = require('express-fileupload')

const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// database
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/auth.route')
const userRouter = require('./routes/user.route')
const productRouter = require('./routes/product.route')
const reviewRouter = require('./routes/review.route')
const orderRouter = require('./routes/order.route')

// middleware 
const notFoundMiddleware = require('./middleware/not-found')
const errorHnadlerMiddleware = require('./middleware/error-handler')

app.set('trust proxy', 1)
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 60,
    })
)
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use(express.static('./public'))

app.use(expressFileupload())

app.get('/', (req, res) => {
    res.send('ecommercee')
})

app.get('/api/v1', (req, res) => {
    console.log(req.signedCookies)
    res.send('ecommercee')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)



app.use(notFoundMiddleware)
app.use(errorHnadlerMiddleware)

const PORT = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, console.log(`Server is listening at port ${PORT}`))
    } catch (error) {
        console.log(error)
    }
}

start()