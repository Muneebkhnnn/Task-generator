import express from 'express'
import dotenv from 'dotenv' 
import { errorHandler } from './middlewares/error.middleware.js'
import taskRoutes from './routes/task.routes.js'
import healthRoutes from './routes/health.routes.js'
import cors from 'cors'

dotenv.config();
const app=express()

app.use(
    cors({
        origin: process.env.CLIENT_URL , 
        credentials: true 
    })
);


const PORT=process.env.PORT || 5000


app.use(express.json())


app.use('/api/v1', taskRoutes)
app.use('/api/v1', healthRoutes)


app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`server listening on port:${PORT}`);
});

